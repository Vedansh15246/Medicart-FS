package com.medicart.gateway.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Aggregates /v3/api-docs from downstream services registered in Eureka
 * and merges their paths and components into one combined OpenAPI JSON
 * served by the gateway. This allows the gateway Swagger UI to display
 * endpoints from all microservices.
 */
@RestController
@RequestMapping("/v3")
public class ApiDocsAggregatorController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private ObjectMapper objectMapper;

    // services to exclude from aggregation
    private static final Set<String> EXCLUDE = Set.of("api-gateway", "eureka-server");

    @GetMapping(value = "/aggregated-api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<JsonNode>> aggregate() {
        List<String> services = discoveryClient.getServices().stream()
                .filter(s -> !EXCLUDE.contains(s))
                .collect(Collectors.toList());

        // For each service, pick first instance and call its /v3/api-docs
        return Flux.fromIterable(services)
                .flatMap(service -> {
                    List<ServiceInstance> instances = discoveryClient.getInstances(service);
                    if (instances == null || instances.isEmpty()) {
                        return Mono.empty();
                    }
                    String base = instances.get(0).getUri().toString();
                    String url = base + (base.endsWith("/") ? "" : "") + "/v3/api-docs";
                    return webClientBuilder.build()
                            .get()
                            .uri(url)
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .onErrorResume(ex -> Mono.empty())
                            .map(node -> new ServiceDoc(service, node));
                })
                .collectList()
                .map(list -> mergeDocs(list))
                .map(root -> ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(root));
    }

    private JsonNode mergeDocs(List<ServiceDoc> docs) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("openapi", "3.0.1");
        ObjectNode info = objectMapper.createObjectNode();
        info.put("title", "MediCart (aggregated)");
        info.put("version", "v1");
        root.set("info", info);

        ArrayNode servers = objectMapper.createArrayNode();
        ObjectNode server = objectMapper.createObjectNode();
        server.put("url", "http://localhost:8080");
        server.put("description", "Gateway (aggregated)");
        servers.add(server);
        root.set("servers", servers);

    ObjectNode paths = objectMapper.createObjectNode();
        ObjectNode components = objectMapper.createObjectNode();
    ArrayNode tagsArray = objectMapper.createArrayNode();
    // keep track of tags already added
    java.util.Set<String> addedTags = new java.util.HashSet<>();

        for (ServiceDoc sd : docs) {
            JsonNode node = sd.doc;
            if (node == null) continue;
            // merge paths
            JsonNode p = node.get("paths");
            if (p != null && p.isObject()) {
                p.fieldNames().forEachRemaining(field -> {
                    // deep copy the path item so we can add tags to operations
                    JsonNode pathItem = p.get(field).deepCopy();
                    if (pathItem != null && pathItem.isObject()) {
                        // for each operation inside the path (get, post, put, delete, patch, etc.)
                        pathItem.fieldNames().forEachRemaining(op -> {
                            JsonNode operationNode = pathItem.get(op);
                            if (operationNode != null && operationNode.isObject()) {
                                ObjectNode opObj = (ObjectNode) operationNode;
                                // ensure tags array contains the service/module name
                                ArrayNode tagNode;
                                if (opObj.has("tags") && opObj.get("tags").isArray()) {
                                    tagNode = (ArrayNode) opObj.get("tags");
                                } else {
                                    tagNode = objectMapper.createArrayNode();
                                    opObj.set("tags", tagNode);
                                }
                                // add service as tag if not present
                                String tagName = sd.service;
                                boolean exists = false;
                                for (JsonNode tn : tagNode) {
                                    if (tn.asText().equalsIgnoreCase(tagName)) { exists = true; break; }
                                }
                                if (!exists) tagNode.add(tagName);
                                // register tag in root tags array
                                if (!addedTags.contains(tagName)) {
                                    ObjectNode tagObj = objectMapper.createObjectNode();
                                    tagObj.put("name", tagName);
                                    tagObj.put("description", "Endpoints from service: " + tagName);
                                    tagsArray.add(tagObj);
                                    addedTags.add(tagName);
                                }
                            }
                        });
                    }
                    // if a path already exists from another service, merge operations (prefer existing)
                    if (paths.has(field) && paths.get(field).isObject()) {
                        ObjectNode existing = (ObjectNode) paths.get(field);
                        JsonNode newPathItem = pathItem;
                        newPathItem.fieldNames().forEachRemaining(op -> {
                            if (!existing.has(op)) {
                                existing.set(op, newPathItem.get(op));
                            }
                        });
                        paths.set(field, existing);
                    } else {
                        paths.set(field, pathItem);
                    }
                });
            }
            // merge components.schemas (safe-merge: if name clashes, prefer gateway)
            JsonNode comp = node.get("components");
            if (comp != null && comp.isObject()) {
                comp.fieldNames().forEachRemaining(section -> {
                    JsonNode sectionNode = comp.get(section);
                    if (sectionNode != null && sectionNode.isObject()) {
                        ObjectNode targetSection = components.with(section);
                        sectionNode.fieldNames().forEachRemaining(name -> {
                            // avoid overwrite
                            if (!targetSection.has(name)) {
                                targetSection.set(name, sectionNode.get(name));
                            }
                        });
                    } else {
                        // copy non-object sections directly if absent
                        if (!components.has(section)) {
                            components.set(section, sectionNode);
                        }
                    }
                });
            }
        }

        root.set("paths", paths);
    if (tagsArray.size() > 0) root.set("tags", tagsArray);
        if (components.size() > 0) root.set("components", components);
        else root.set("components", objectMapper.createObjectNode());

        return root;
    }

    private static class ServiceDoc {
        String service;
        JsonNode doc;

        ServiceDoc(String service, JsonNode doc) {
            this.service = service;
            this.doc = doc;
        }
    }
}

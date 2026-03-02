// This line defines the package (folder structure) for this Java file.
// Packages help organize code and avoid name conflicts.
package com.medicart.gateway.controller;

// Import statements bring in classes from other libraries so we can use them here.
// com.fasterxml.jackson.databind.*: Used for working with JSON data (reading/writing JSON objects)
import java.util.List; // Represents a JSON object or value
import java.util.Set; // Converts between Java objects and JSON
import java.util.stream.Collectors; // Represents a JSON array

import org.springframework.beans.factory.annotation.Autowired; // Represents a JSON object
import org.springframework.cloud.client.ServiceInstance; // Automatically provides (injects) objects
import org.springframework.cloud.client.discovery.DiscoveryClient; // Represents a running instance of a microservice
import org.springframework.http.MediaType; // Lets us find services registered in Eureka
import org.springframework.http.ResponseEntity; // Used to specify content type (like application/json)
import org.springframework.web.bind.annotation.GetMapping; // Used to build HTTP responses
import org.springframework.web.bind.annotation.RequestMapping; // Maps HTTP GET requests to methods
import org.springframework.web.bind.annotation.RestController; // Sets a base path for all endpoints in this class
import org.springframework.web.reactive.function.client.WebClient; // Marks this class as a REST API controller

import com.fasterxml.jackson.databind.JsonNode; // Used to make HTTP requests to other services (non-blocking)
import com.fasterxml.jackson.databind.ObjectMapper; // Represents a stream of many values over time
import com.fasterxml.jackson.databind.node.ArrayNode; // Represents a single value (or none) that may be available in the future
import com.fasterxml.jackson.databind.node.ObjectNode; // List of items

import reactor.core.publisher.Flux; // Set of unique items
import reactor.core.publisher.Mono; // Helps process collections (like filtering, mapping)

/**
 * This controller collects ("aggregates") the OpenAPI documentation (the /v3/api-docs endpoint)
 * from all the microservices registered in Eureka, combines them into one big JSON file,
 * and serves it from the gateway. This lets the Swagger UI at the gateway show all endpoints
 * from every microservice in one place.
 */
// Marks this class as a REST API controller so Spring Boot can find and use it.
@RestController
// Sets the base URL path for all endpoints in this class to start with /v3
@RequestMapping("/v3")
public class ApiDocsAggregatorController {


    // @Autowired tells Spring to automatically provide these objects (dependency injection)
    @Autowired
    private DiscoveryClient discoveryClient; // Lets us find all services registered in Eureka

    @Autowired
    private WebClient.Builder webClientBuilder; // Used to build WebClient for making HTTP requests

    @Autowired
    private ObjectMapper objectMapper; // Used to create and manipulate JSON objects

    // List of service names we do NOT want to include in the aggregation (the gateway itself and Eureka server)
    private static final Set<String> EXCLUDE = Set.of("api-gateway", "eureka-server");

    // This method handles GET requests to /v3/aggregated-api-docs and returns a combined OpenAPI JSON
    // Mono<ResponseEntity<JsonNode>> means: "eventually returns a HTTP response containing JSON"
    @GetMapping(value = "/aggregated-api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<JsonNode>> aggregate() {
        // Get a list of all service names registered in Eureka, except the excluded ones
        List<String> services = discoveryClient.getServices().stream()
                .filter(s -> !EXCLUDE.contains(s)) // Remove excluded services
                .collect(Collectors.toList()); // Turn the stream into a List

        // For each service, get its first running instance and call its /v3/api-docs endpoint
        return Flux.fromIterable(services) // Create a reactive stream from the list of services
                .flatMap(service -> {
                    // Get all running instances of this service
                    List<ServiceInstance> instances = discoveryClient.getInstances(service);
                    // If there are no instances, skip this service
                    if (instances == null || instances.isEmpty()) {
                        return Mono.empty();
                    }
                    // Get the base URL of the first instance (e.g., http://localhost:8081)
                    String base = instances.get(0).getUri().toString();
                    // Build the full URL to the /v3/api-docs endpoint of the service
                    String url = base + (base.endsWith("/") ? "" : "") + "/v3/api-docs";
                    // Use WebClient to make a GET request to that URL and get the JSON response
                    return webClientBuilder.build()
                            .get() // HTTP GET
                            .uri(url) // Set the URL
                            .retrieve() // Perform the request
                            .bodyToMono(JsonNode.class) // Convert the response body to a JsonNode (JSON object)
                            .onErrorResume(ex -> Mono.empty()) // If there's an error, skip this service
                            .map(node -> new ServiceDoc(service, node)); // Wrap the result with the service name
                })
                .collectList() // Collect all results into a List
                .map(list -> mergeDocs(list)) // Merge all the docs into one JSON object
                .map(root -> ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(root)); // Return as HTTP response
    }

    // This method takes a list of ServiceDoc (service name + its OpenAPI JSON)
    // and combines them into one big OpenAPI JSON object
    private JsonNode mergeDocs(List<ServiceDoc> docs) {

        // Create the root JSON object for the OpenAPI doc
        ObjectNode root = objectMapper.createObjectNode();
        root.put("openapi", "3.0.1"); // Set OpenAPI version
        ObjectNode info = objectMapper.createObjectNode(); // Info section
        info.put("title", "MediCart (aggregated)"); // Title for the docs
        info.put("version", "v1"); // Version
        root.set("info", info); // Add info to root

        // Add server info (where the docs are served from)
        ArrayNode servers = objectMapper.createArrayNode();
        ObjectNode server = objectMapper.createObjectNode();
        server.put("url", "http://localhost:8080"); // Gateway URL
        server.put("description", "Gateway (aggregated)"); // Description
        servers.add(server);
        root.set("servers", servers);

        // Prepare empty objects to collect all paths, components, and tags
        ObjectNode paths = objectMapper.createObjectNode(); // All API endpoints
        ObjectNode components = objectMapper.createObjectNode(); // Schemas, responses, etc.
        ArrayNode tagsArray = objectMapper.createArrayNode(); // Tags for grouping endpoints
        // Keep track of which tags we've already added
        java.util.Set<String> addedTags = new java.util.HashSet<>();


        // Loop through each service's OpenAPI doc
        for (ServiceDoc sd : docs) {
            JsonNode node = sd.doc; // The OpenAPI JSON from this service
            if (node == null) continue; // Skip if missing
            // Merge all API paths (endpoints)
            JsonNode p = node.get("paths");
            if (p != null && p.isObject()) {
                p.fieldNames().forEachRemaining(field -> {
                    // Make a deep copy so we can safely modify it
                    JsonNode pathItem = p.get(field).deepCopy();
                    if (pathItem != null && pathItem.isObject()) {
                        // For each HTTP operation (get, post, etc.) in this path
                        pathItem.fieldNames().forEachRemaining(op -> {
                            JsonNode operationNode = pathItem.get(op);
                            if (operationNode != null && operationNode.isObject()) {
                                ObjectNode opObj = (ObjectNode) operationNode;
                                // Replace tags with just the service name (for grouping in Swagger UI)
                                ArrayNode tagNode = objectMapper.createArrayNode();
                                String tagName = sd.service;
                                tagNode.add(tagName);
                                opObj.set("tags", tagNode);
                                // Add this tag to the root tags array if not already present
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
                    // If this path already exists from another service, merge operations (don't overwrite existing)
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
                        // Otherwise, just add the new path
                        paths.set(field, pathItem);
                    }
                });
            }
            // Merge components (schemas, responses, etc.)
            JsonNode comp = node.get("components");
            if (comp != null && comp.isObject()) {
                comp.fieldNames().forEachRemaining(section -> {
                    JsonNode sectionNode = comp.get(section);
                    if (sectionNode != null && sectionNode.isObject()) {
                        ObjectNode targetSection = components.with(section);
                        sectionNode.fieldNames().forEachRemaining(name -> {
                            // Only add if not already present (avoid overwriting)
                            if (!targetSection.has(name)) {
                                targetSection.set(name, sectionNode.get(name));
                            }
                        });
                    } else {
                        // If it's not an object, just copy it if missing
                        if (!components.has(section)) {
                            components.set(section, sectionNode);
                        }
                    }
                });
            }
        }


        // Add the merged paths, tags, and components to the root JSON object
        root.set("paths", paths);
        if (tagsArray.size() > 0) root.set("tags", tagsArray);
        if (components.size() > 0) root.set("components", components);
        else root.set("components", objectMapper.createObjectNode()); // If no components, add empty object

        return root; // Return the combined OpenAPI JSON
    }

    // Helper class to hold a service name and its OpenAPI JSON doc
    private static class ServiceDoc {
        String service; // The name of the service (e.g., "auth-service")
        JsonNode doc;   // The OpenAPI JSON from that service

        // Constructor to set both fields
        ServiceDoc(String service, JsonNode doc) {
            this.service = service;
            this.doc = doc;
        }
    }
}

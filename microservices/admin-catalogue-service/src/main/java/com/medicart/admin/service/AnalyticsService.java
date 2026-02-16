package com.medicart.admin.service;

import com.medicart.admin.entity.Batch;
import com.medicart.admin.repository.BatchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    private final BatchRepository batchRepository;

    public AnalyticsService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    /**
     * Estimate sales by category using batch sell-through (qtyTotal - qtyAvailable) * sellingPrice.
     */
    public List<Map<String, Object>> getSalesByCategory() {
        List<Batch> batches = batchRepository.findAll();
        log.info("Found {} batches for sales-by-category computation", batches.size());
        
        Map<String, Double> revenueByCategory = new HashMap<>();
        int batchesProcessed = 0;
        int batchesWithRevenue = 0;

        for (Batch batch : batches) {
            if (batch == null) continue;
            batchesProcessed++;
            
            String category = batch.getMedicine() != null && batch.getMedicine().getCategory() != null 
                ? batch.getMedicine().getCategory() 
                : "Uncategorized";
            
            Integer qtyTotal = batch.getQtyTotal() != null ? batch.getQtyTotal() : 0;
            Integer qtyAvailable = batch.getQtyAvailable() != null ? batch.getQtyAvailable() : 0;
            int soldQuantity = Math.max(0, qtyTotal - qtyAvailable);
            Double price = batch.getSellingPrice() != null ? batch.getSellingPrice() : 0.0;
            double revenue = soldQuantity * price;

            if (revenue > 0) {
                batchesWithRevenue++;
                log.debug("Batch {} (medicine: {}): category={}, sold={}, price={}, revenue={}", 
                    batch.getId(), 
                    batch.getMedicine() != null ? batch.getMedicine().getName() : "unknown",
                    category, soldQuantity, price, revenue);
            }

            revenueByCategory.merge(category, revenue, Double::sum);
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Map.Entry<String, Double> entry : revenueByCategory.entrySet()) {
            if (entry.getValue() > 0) { // Only include categories with actual revenue
                Map<String, Object> row = new HashMap<>();
                row.put("category", entry.getKey());
                row.put("totalRevenue", entry.getValue());
                response.add(row);
            }
        }

        response.sort(Comparator.comparingDouble(row -> -1 * ((Number) row.getOrDefault("totalRevenue", 0)).doubleValue()));
        log.info("Computed sales-by-category for {} categories (processed {} batches, {} had revenue)", 
            response.size(), batchesProcessed, batchesWithRevenue);
        
        if (response.isEmpty()) {
            log.warn("No revenue data found! Check that batches have quantity_total > qty_available and selling_price > 0");
        }
        
        return response;
    }
}

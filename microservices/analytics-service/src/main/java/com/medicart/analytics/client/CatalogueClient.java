package com.medicart.analytics.client;

import com.medicart.common.dto.MedicineDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import java.util.Map;

@FeignClient(name = "admin-catalogue-service")
public interface CatalogueClient {
    
    @GetMapping("/medicines")
    List<MedicineDTO> getAllMedicines();
    
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable Long id);
    
    @GetMapping("/api/analytics/sales-by-category")
    List<Map<String, Object>> getSalesByCategory();
}

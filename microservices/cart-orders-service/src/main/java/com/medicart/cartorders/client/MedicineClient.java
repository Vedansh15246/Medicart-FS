package com.medicart.cartorders.client;

import com.medicart.common.dto.BatchDTO;
import com.medicart.common.dto.MedicineDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@FeignClient(name = "admin-catalogue-service")
public interface MedicineClient {
    
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable("id") Long medicineId);
    
    @GetMapping("/batches/{medicineId}/available")
    List<BatchDTO> getAvailableBatches(@PathVariable("medicineId") Long medicineId);
    
    @GetMapping("/batches/{id}")
    BatchDTO getBatchById(@PathVariable("id") Long batchId);

    // ✅ NEW: Reduce batch quantity after payment succeeds
    @PutMapping("/batches/{batchId}/reduce-quantity")
    void reduceBatchQuantity(@PathVariable("batchId") Long batchId, 
                            @RequestParam("quantity") Integer quantity);
}

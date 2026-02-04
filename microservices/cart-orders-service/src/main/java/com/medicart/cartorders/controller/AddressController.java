package com.medicart.cartorders.controller;

import com.medicart.cartorders.service.AddressService;
import com.medicart.common.dto.AddressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/address")
public class AddressController {
    @Autowired
    private AddressService addressService;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AddressController.class);

    @PostMapping
    public ResponseEntity<AddressDTO> addAddress(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddressDTO addressDTO) {
        try {
            log.info("=== /api/address POST START ===");
            log.info("X-User-Id: {}", userId);
                log.info("AddressDTO received: id={}, name={}, streetAddress={}, addressLine1={}, addressLine2={}, city={}, state={}, postalCode={}, country={}, phone={}, isDefault={}",
                    addressDTO.getId(),
                    addressDTO.getName(),
                    addressDTO.getStreetAddress(),
                    addressDTO.getAddressLine1(),
                    addressDTO.getAddressLine2(),
                    addressDTO.getCity(),
                    addressDTO.getState(),
                    addressDTO.getPostalCode(),
                    addressDTO.getCountry(),
                    addressDTO.getPhone(),
                    addressDTO.getIsDefault());

            // Validate required fields
            StringBuilder validationErrors = new StringBuilder();
            if (addressDTO == null) validationErrors.append("AddressDTO is null. ");
            if (addressDTO.getName() == null || addressDTO.getName().trim().isEmpty()) validationErrors.append("name is required. ");
            if (addressDTO.getStreetAddress() == null || addressDTO.getStreetAddress().trim().isEmpty()) validationErrors.append("streetAddress is required. ");
            if (addressDTO.getCity() == null || addressDTO.getCity().trim().isEmpty()) validationErrors.append("city is required. ");
            if (addressDTO.getState() == null || addressDTO.getState().trim().isEmpty()) validationErrors.append("state is required. ");
            if (addressDTO.getPostalCode() == null || addressDTO.getPostalCode().trim().isEmpty()) validationErrors.append("postalCode is required. ");
            if (addressDTO.getPhone() == null || addressDTO.getPhone().trim().isEmpty()) validationErrors.append("phone is required. ");

            if (validationErrors.length() > 0) {
                log.warn("Validation failed: {}", validationErrors.toString());
                return ResponseEntity.badRequest().body(null);
            }

            AddressDTO newAddress = addressService.addAddress(userId, addressDTO);
            log.info("Address created successfully: id={}, userId={}", newAddress.getId(), userId);
            log.info("=== /api/address POST SUCCESS ===");
            return ResponseEntity.ok(newAddress);
        } catch (Exception e) {
            log.error("=== /api/address POST ERROR ===", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getUserAddresses(
            @RequestHeader("X-User-Id") Long userId) {
        List<AddressDTO> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressDTO> getAddressById(
            @PathVariable Long addressId,
            @RequestHeader("X-User-Id") Long userId) {
        AddressDTO address = addressService.getAddressById(addressId, userId);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long addressId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddressDTO addressDTO) {
        AddressDTO updatedAddress = addressService.updateAddress(addressId, addressDTO, userId);
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            @RequestHeader("X-User-Id") Long userId) {
        addressService.deleteAddress(addressId, userId);
        return ResponseEntity.noContent().build();
    }
}

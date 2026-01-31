package com.medicart.cartorders.controller;

import com.medicart.cartorders.service.AddressService;
import com.medicart.common.dto.AddressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressController {
    @Autowired
    private AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressDTO> addAddress(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody AddressDTO addressDTO) {
        AddressDTO newAddress = addressService.addAddress(userId, addressDTO);
        return ResponseEntity.ok(newAddress);
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

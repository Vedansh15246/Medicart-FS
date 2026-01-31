package com.medicart.cartorders.service;

import com.medicart.cartorders.entity.Address;
import com.medicart.cartorders.repository.AddressRepository;
import com.medicart.common.dto.AddressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AddressService {
    @Autowired
    private AddressRepository addressRepository;

    /**
     * Add new address for user
     */
    public AddressDTO addAddress(Long userId, AddressDTO addressDTO) {
        // If marking as default, unmark previous default
        if (addressDTO.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        Address address = Address.builder()
                .userId(userId)
                .name(addressDTO.getName())
                .phone(addressDTO.getPhone())
                .addressLine1(addressDTO.getAddressLine1())
                .addressLine2(addressDTO.getAddressLine2())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .pincode(addressDTO.getPincode())
                .label(addressDTO.getLabel())
                .isDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false)
                .build();

        address = addressRepository.save(address);
        return convertToDTO(address);
    }

    /**
     * Get user's addresses
     */
    public List<AddressDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get address by ID
     */
    public AddressDTO getAddressById(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to access this address");
        }

        return convertToDTO(address);
    }

    /**
     * Update address
     */
    public AddressDTO updateAddress(Long addressId, AddressDTO addressDTO, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        // If marking as default, unmark previous default
        if (addressDTO.getIsDefault() && !address.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        address.setName(addressDTO.getName());
        address.setPhone(addressDTO.getPhone());
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPincode(addressDTO.getPincode());
        address.setLabel(addressDTO.getLabel());
        address.setIsDefault(addressDTO.getIsDefault());

        address = addressRepository.save(address);
        return convertToDTO(address);
    }

    /**
     * Delete address
     */
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this address");
        }

        addressRepository.delete(address);
    }

    private AddressDTO convertToDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .name(address.getName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .label(address.getLabel())
                .isDefault(address.getIsDefault())
                .build();
    }
}

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
            .name(addressDTO.getName() != null ? addressDTO.getName() : "")
                .streetAddress(addressDTO.getStreetAddress())
                .addressLine1(addressDTO.getAddressLine1() != null ? addressDTO.getAddressLine1() : "")
                .addressLine2(addressDTO.getAddressLine2())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .postalCode(addressDTO.getPostalCode())
                .country(addressDTO.getCountry() != null ? addressDTO.getCountry() : "USA")
                .phone(addressDTO.getPhone())
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

        address.setStreetAddress(addressDTO.getStreetAddress());
        address.setName(addressDTO.getName() != null ? addressDTO.getName() : "");
        address.setAddressLine1(addressDTO.getAddressLine1() != null ? addressDTO.getAddressLine1() : "");
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostalCode());
        address.setCountry(addressDTO.getCountry() != null ? addressDTO.getCountry() : "USA");
        address.setPhone(addressDTO.getPhone());
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
                .streetAddress(address.getStreetAddress())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .phone(address.getPhone())
                .isDefault(address.getIsDefault())
                .build();
    }
}

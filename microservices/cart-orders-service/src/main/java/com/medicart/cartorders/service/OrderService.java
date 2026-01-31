package com.medicart.cartorders.service;

import com.medicart.cartorders.client.MedicineClient;
import com.medicart.cartorders.entity.CartItem;
import com.medicart.cartorders.entity.Order;
import com.medicart.cartorders.entity.OrderItem;
import com.medicart.cartorders.repository.CartItemRepository;
import com.medicart.cartorders.repository.OrderItemRepository;
import com.medicart.cartorders.repository.OrderRepository;
import com.medicart.common.dto.BatchDTO;
import com.medicart.common.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private MedicineClient medicineClient;

    /**
     * FIFO STOCK ALLOCATION ALGORITHM
     * 1. Get all batches for ordered medicine sorted by expiry date (earliest first)
     * 2. Allocate stock from batch with earliest expiry date
     * 3. If quantity exceeds batch availability, move to next batch
     * 4. Create order items with batch information
     * 5. Clear cart and persist order
     */
    public OrderDTO placeOrder(Long userId, Long addressId) {
        // Get user's cart
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Create order
        Double totalAmount = 0.0;
        Order order = Order.builder()
                .userId(userId)
                .addressId(addressId)
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        // Process each cart item with FIFO allocation
        for (CartItem cartItem : cartItems) {
            int remainingQuantity = cartItem.getQuantity();

            // Get available batches sorted by expiry date (FIFO)
            List<BatchDTO> availableBatches = medicineClient.getAvailableBatches(cartItem.getMedicineId());

            if (availableBatches == null || availableBatches.isEmpty()) {
                throw new RuntimeException("Medicine " + cartItem.getMedicineId() + " is out of stock");
            }

            // Allocate from batches in FIFO order (earliest expiry first)
            for (BatchDTO batch : availableBatches) {
                if (remainingQuantity <= 0) break;

                int allocatedQty = Math.min(remainingQuantity, batch.getQtyAvailable());

                // Create order item
                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .medicineId(cartItem.getMedicineId())
                        .quantity(allocatedQty)
                        .priceAtPurchase(cartItem.getPrice())
                        .batchId(batch.getId())
                        .build();

                orderItems.add(orderItem);
                totalAmount += (cartItem.getPrice() * allocatedQty);
                remainingQuantity -= allocatedQty;
            }

            // Check if all quantity was allocated
            if (remainingQuantity > 0) {
                throw new RuntimeException("Insufficient stock for medicine " + cartItem.getMedicineId() +
                        ". Requested: " + cartItem.getQuantity() + ", Available: " + 
                        (cartItem.getQuantity() - remainingQuantity));
            }
        }

        // Save order
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        return convertToDTO(order);
    }

    /**
     * Get user's orders
     */
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get order details
     */
    public OrderDTO getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this order");
        }

        return convertToDTO(order);
    }

    /**
     * Update order status
     */
    public OrderDTO updateOrderStatus(Long orderId, String status, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this order");
        }

        order.setStatus(status);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .addressId(order.getAddressId())
                .items(order.getItems() != null ? order.getItems()
                        .stream()
                        .map(item -> com.medicart.common.dto.OrderItemDTO.builder()
                                .id(item.getId())
                                .medicineId(item.getMedicineId())
                                .quantity(item.getQuantity())
                                .priceAtPurchase(item.getPriceAtPurchase())
                                .batchId(item.getBatchId())
                                .build())
                        .collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }
}

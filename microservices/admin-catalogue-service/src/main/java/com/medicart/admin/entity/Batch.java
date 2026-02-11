package com.medicart.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "batch_number", nullable = false)
    @Builder.Default
    private String batchNo = "";  

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(name = "quantity_available", nullable = false)
    @Builder.Default
    private Integer qtyAvailable = 0;

    @Column(name = "quantity_total", nullable = false)
    @Builder.Default
    private Integer qtyTotal = 0;

    @Column(name = "selling_price", nullable = false)
    @Builder.Default
    private Double sellingPrice = 0.0;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

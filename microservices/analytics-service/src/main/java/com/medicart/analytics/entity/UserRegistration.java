package com.medicart.analytics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "total_users")
    private Long totalUsers;
    
    @Column(name = "users_today")
    private Long usersToday;
    
    @Column(name = "users_this_week")
    private Long usersThisWeek;
    
    @Column(name = "users_this_month")
    private Long usersThisMonth;
    
    @Column(name = "users_this_year")
    private Long usersThisYear;
    
    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}

package com.medicart.analytics.repository;

import com.medicart.analytics.entity.UserRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRegistrationRepository extends JpaRepository<UserRegistration, Long> {
    @Query("SELECT u FROM UserRegistration u ORDER BY u.computedAt DESC LIMIT 1")
    Optional<UserRegistration> findLatest();
}

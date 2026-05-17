package com.yourorg.UsageTracking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportedServiceRepository extends JpaRepository<SupportedService, Long> {
    List<SupportedService> findAllByIsActiveTrueOrderByProviderNameAsc();
}

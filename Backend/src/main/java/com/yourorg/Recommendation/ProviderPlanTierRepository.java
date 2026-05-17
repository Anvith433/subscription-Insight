package com.yourorg.Recommendation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderPlanTierRepository extends JpaRepository<ProviderPlanTier, Long> {
    List<ProviderPlanTier> findAllByProviderNameIgnoreCaseOrderBySortOrderAsc(String providerName);
}

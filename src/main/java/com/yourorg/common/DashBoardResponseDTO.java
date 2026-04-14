package com.yourorg.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class DashBoardResponseDTO {
    // From Subscription
    private String providerName;
    private String packageName;
    private BigDecimal price;
    private String currency;
    

    // From UserSnapShot
    private int usageMinutes;
    private String billingPeriod;

   
    private String recommendationType; 
    private String reason;
}
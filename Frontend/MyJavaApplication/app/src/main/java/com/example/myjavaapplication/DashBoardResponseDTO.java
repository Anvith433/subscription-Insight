package com.example.myjavaapplication;

import com.google.gson.annotations.SerializedName;

public class DashBoardResponseDTO {
    @SerializedName("providerName")
    private String providerName;
    
    @SerializedName("packageName")
    private String packageName;
    
    @SerializedName("price")
    private double price;
    
    @SerializedName("currency")
    private String currency;
    
    @SerializedName("usageMinutes")
    private long usageMinutes;
    
    @SerializedName("billingPeriod")
    private String billingPeriod;
    
    @SerializedName("recommendationType")
    private String recommendationType;
    
    @SerializedName("reason")
    private String reason;

    public DashBoardResponseDTO() {}

    public String getProviderName() { return providerName != null ? providerName : "Unknown"; }
    public String getPackageName() { return packageName; }
    public double getPrice() { return price; }
    public String getCurrency() { return currency != null ? currency : "INR"; }
    public long getUsageMinutes() { return usageMinutes; }
    public String getBillingPeriod() { return billingPeriod; }
    public String getRecommendationType() { return recommendationType != null ? recommendationType : "PENDING"; }
    public String getReason() { return reason != null ? reason : "Analyzing..."; }

    // This ensures the BarChart sees the same minutes as the list
    public long getUsageTime() { return usageMinutes; }
}

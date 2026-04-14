package com.example.myjavaapplication;

import com.google.gson.annotations.SerializedName;

public class AppUsageInfo {
    @SerializedName("appName")
    private String appName;

    @SerializedName("usageMinutes")
    private long usageMinutes;

    public AppUsageInfo(String appName, long usageMinutes) {
        this.appName = appName;
        this.usageMinutes = usageMinutes;
    }

    public String getAppName() { return appName; }
    public long getUsageMinutes() { return usageMinutes; }
}

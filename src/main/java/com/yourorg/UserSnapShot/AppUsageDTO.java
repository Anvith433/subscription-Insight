package com.yourorg.UserSnapShot;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AppUsageDTO {
    private String packageName; // no matter what is the appName , it may vary on country and all but package name is constant 
    private String appName;
    private int usageMinutes;
}
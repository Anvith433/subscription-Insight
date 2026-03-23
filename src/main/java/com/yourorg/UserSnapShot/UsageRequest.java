package com.yourorg.UserSnapShot;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter 
@Setter
public class UsageRequest {

    private Long userId;
    private List<AppUsageDTO> apps;
}
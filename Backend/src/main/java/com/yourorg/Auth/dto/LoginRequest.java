package com.yourorg.Auth.dto;

public record LoginRequest(
        String email,
        String password
) {
}

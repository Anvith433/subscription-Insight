package com.yourorg.Auth.dto;

public record RegisterRequest(
        String username,
        String email,
        String password
) {
}

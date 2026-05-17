package com.yourorg.Auth.dto;

public record AuthResponse(
        String token,
        UserView user
) {
    public record UserView(Long id, String username, String email) {
    }
}

package com.example.quickcart.backened.dto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoveFromCartRequest {
    private String sessionId;
    private String productId;
    private Integer quantity; // Null or 0 means remove all, otherwise remove specified quantity
}
package com.example.quickcart.backened.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private String sessionId;
    private String productId;
    private int quantity;
}
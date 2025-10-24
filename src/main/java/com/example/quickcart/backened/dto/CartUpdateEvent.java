package com.example.quickcart.backened.dto;

import com.example.quickcart.backened.model.Cart;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartUpdateEvent {
    private String sessionId;
    private Cart cart;
}
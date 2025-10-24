package com.example.quickcart.backened.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document("carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    private String id; // sessionId
    private List<CartItem> items = new ArrayList<>();
    private double totalAmount = 0.0;
    private Instant lastUpdated = Instant.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItem {
        private String productId;
        private int quantity;
        private double priceAtAdd;
    }
}
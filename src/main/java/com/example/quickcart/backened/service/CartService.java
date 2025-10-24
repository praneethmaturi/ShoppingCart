package com.example.quickcart.backened.service;

import com.example.quickcart.backened.dto.AddToCartRequest;
import com.example.quickcart.backened.dto.CartUpdateEvent;
import com.example.quickcart.backened.dto.RemoveFromCartRequest;
import com.example.quickcart.backened.model.Cart;
import com.example.quickcart.backened.model.Product;
import com.example.quickcart.backened.repository.CartRepository;
import com.example.quickcart.backened.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    private static final String CART_UPDATES_TOPIC = "cart-updates";

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final KafkaTemplate<String, CartUpdateEvent> kafkaTemplate;

    public Cart addToCart(AddToCartRequest request) {
        Cart cart = findOrCreateCart(request.getSessionId());

        // Find the product to get the current price
        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

        // Check if item already exists in cart
        Optional<Cart.CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Increment quantity if item exists
            Cart.CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            log.info("Updated quantity for productId {} to {} in cart for session {}",
                    request.getProductId(), item.getQuantity(), request.getSessionId());
        } else {
            // Add new item to cart
            Cart.CartItem newItem = new Cart.CartItem(
                    request.getProductId(),
                    request.getQuantity(),
                    product.getPrice()
            );
            cart.getItems().add(newItem);
            log.info("Added new item with productId {} to cart for session {}",
                    request.getProductId(), request.getSessionId());
        }

        updateCartTotals(cart);
        return saveCartAndPublishUpdate(request.getSessionId(), cart);
    }

    public Cart removeFromCart(RemoveFromCartRequest request) {
        Cart cart = findOrCreateCart(request.getSessionId());

        Optional<Cart.CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (!existingItem.isPresent()) {
            log.warn("Item with productId {} not found in cart for session {}",
                    request.getProductId(), request.getSessionId());
            return cart;
        }

        Cart.CartItem item = existingItem.get();

        // If quantity is null or 0, remove the entire item
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            cart.getItems().remove(item);
            log.info("Removed item with productId {} from cart for session {}",
                    request.getProductId(), request.getSessionId());
        } else {
            // Decrease quantity
            int newQuantity = item.getQuantity() - request.getQuantity();
            if (newQuantity <= 0) {
                cart.getItems().remove(item);
                log.info("Removed item with productId {} from cart (quantity reached 0) for session {}",
                        request.getProductId(), request.getSessionId());
            } else {
                item.setQuantity(newQuantity);
                log.info("Decreased quantity for productId {} to {} in cart for session {}",
                        request.getProductId(), newQuantity, request.getSessionId());
            }
        }

        updateCartTotals(cart);
        return saveCartAndPublishUpdate(request.getSessionId(), cart);
    }

    public Cart getCart(String sessionId) {
        return cartRepo.findById(sessionId).orElse(new Cart());
    }

    private Cart findOrCreateCart(String sessionId) {
        return cartRepo.findById(sessionId)
                .orElseGet(() -> createEmptyCart(sessionId));
    }

    private Cart createEmptyCart(String sessionId) {
        return new Cart(sessionId, new ArrayList<>(), 0.0, Instant.now());
    }

    private void updateCartTotals(Cart cart) {
        double totalAmount = cart.getItems().stream()
                .mapToDouble(item -> item.getPriceAtAdd() * item.getQuantity())
                .sum();
        cart.setTotalAmount(totalAmount);
        cart.setLastUpdated(Instant.now());
    }

    private void publishCartUpdate(String sessionId, Cart cart) {
        CartUpdateEvent event = new CartUpdateEvent(sessionId, cart);
        kafkaTemplate.send(CART_UPDATES_TOPIC, sessionId, event);
    }

    private Cart saveCartAndPublishUpdate(String sessionId, Cart cart) {
        Cart savedCart = cartRepo.save(cart);
        publishCartUpdate(sessionId, savedCart);
        return savedCart;
    }
}

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
        Product product = getProductById(request.getProductId());

        addOrUpdateCartItem(cart, request.getProductId(), request.getQuantity(), product.getPrice(), request.getSessionId());

        updateCartTotals(cart);
        return saveCartAndPublishUpdate(request.getSessionId(), cart);
    }
    public Cart removeFromCart(RemoveFromCartRequest request) {
        Cart cart = findOrCreateCart(request.getSessionId());

        Optional<Cart.CartItem> existingItem = findCartItem(cart, request.getProductId());
        if (existingItem.isEmpty()) {
            log.warn("Item with productId {} not found in cart for session {}",
                    request.getProductId(), request.getSessionId());
            return cart;
        }

        removeOrDecreaseCartItem(cart, existingItem.get(), request.getQuantity(), request.getProductId(), request.getSessionId());

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

    private Product getProductById(String productId) {
        return productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
    }

    private Optional<Cart.CartItem> findCartItem(Cart cart, String productId) {
        return cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();
    }

    private void addOrUpdateCartItem(Cart cart, String productId, int quantityToAdd, double price, String sessionId) {
        Optional<Cart.CartItem> existingItem = findCartItem(cart, productId);

        if (existingItem.isPresent()) {
            incrementCartItemQuantity(existingItem.get(), quantityToAdd, productId, sessionId);
        } else {
            addNewCartItem(cart, productId, quantityToAdd, price, sessionId);
        }
    }

    private void incrementCartItemQuantity(Cart.CartItem item, int quantityToAdd, String productId, String sessionId) {
        item.setQuantity(item.getQuantity() + quantityToAdd);
        log.info("Updated quantity for productId {} to {} in cart for session {}",
                productId, item.getQuantity(), sessionId);
    }

    private void addNewCartItem(Cart cart, String productId, int quantity, double price, String sessionId) {
        Cart.CartItem newItem = new Cart.CartItem(productId, quantity, price);
        cart.getItems().add(newItem);
        log.info("Added new item with productId {} to cart for session {}", productId, sessionId);
    }

    private void removeOrDecreaseCartItem(Cart cart, Cart.CartItem item, Integer quantityToRemove, String productId, String sessionId) {
        if (shouldRemoveEntireItem(quantityToRemove)) {
            removeCartItem(cart, item, productId, sessionId);
            return;
        }

        int newQuantity = item.getQuantity() - quantityToRemove;
        if (newQuantity <= 0) {
            removeCartItem(cart, item, productId, sessionId);
        } else {
            decreaseCartItemQuantity(item, newQuantity, productId, sessionId);
        }
    }

    private boolean shouldRemoveEntireItem(Integer quantityToRemove) {
        return quantityToRemove == null || quantityToRemove <= 0;
    }

    private void removeCartItem(Cart cart, Cart.CartItem item, String productId, String sessionId) {
        cart.getItems().remove(item);
        log.info("Removed item with productId {} from cart for session {}", productId, sessionId);
    }

    private void decreaseCartItemQuantity(Cart.CartItem item, int newQuantity, String productId, String sessionId) {
        item.setQuantity(newQuantity);
        log.info("Decreased quantity for productId {} to {} in cart for session {}",
                productId, newQuantity, sessionId);
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
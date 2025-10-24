package com.example.quickcart.backened.Controller;

import com.example.quickcart.backened.dto.AddToCartRequest;
import com.example.quickcart.backened.dto.RemoveFromCartRequest;
import com.example.quickcart.backened.model.Cart;
import com.example.quickcart.backened.service.CartService;
import com.example.quickcart.backened.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5174")
public class CartController {
    private final CartService cartService;
    private final SseEmitterService sseService;

    @PutMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        return createOkResponse(cartService.addToCart(request));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeFromCart(@RequestBody RemoveFromCartRequest request) {
        return createOkResponse(cartService.removeFromCart(request));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<Cart> getCart(@PathVariable String sessionId) {
        return createOkResponse(cartService.getCart(sessionId));
    }

    @GetMapping("/stream/{sessionId}")
    public SseEmitter streamCartUpdates(@PathVariable String sessionId) {
        return sseService.createEmitter(sessionId);
    }

    private ResponseEntity<Cart> createOkResponse(Cart cart) {
        return ResponseEntity.ok(cart);
    }
}
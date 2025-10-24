// File: backend/src/main/java/com/example/quickcart/backened/repository/CartRepository.java

package com.example.quickcart.backened.repository;

import com.example.quickcart.backened.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
}
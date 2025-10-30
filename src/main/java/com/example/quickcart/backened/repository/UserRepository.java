// File: backend/src/main/java/com/example/quickcart/backened/repository/UserRepository.java

package com.example.quickcart.backened.repository;

import com.example.quickcart.backened.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email); // Optional: for email-based login
}
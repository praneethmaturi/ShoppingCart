package com.example.quickcart.backened.repository;

import com.example.quickcart.backened.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {}
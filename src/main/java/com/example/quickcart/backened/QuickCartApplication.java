package com.example.quickcart.backened;

import com.example.quickcart.backened.model.Product;
import com.example.quickcart.backened.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.List;

@SpringBootApplication
public class QuickCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuickCartApplication.class, args);
    }

    @Bean
    CommandLineRunner initProducts(ProductRepository productRepo, ObjectMapper objectMapper) {
        return args -> {
            long productCount = productRepo.count();
            System.out.println("📦 Found " + productCount + " products in DB");

            // Clear existing products and reload from data.json
            if (productCount > 0) {
                System.out.println("🗑️ Clearing existing products...");
                productRepo.deleteAll();
            }

            loadProductsFromJson(productRepo, objectMapper);
        };
    }

    private void loadProductsFromJson(ProductRepository productRepo, ObjectMapper objectMapper) {
        try {
            ClassPathResource resource = new ClassPathResource("data.json");
            InputStream inputStream = resource.getInputStream();

            List<Product> products = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Product>>() {}
            );

            productRepo.saveAll(products);
            System.out.println("✅ Loaded " + products.size() + " products from data.json into MongoDB");
        } catch (Exception e) {
            System.err.println("❌ Failed to load products from data.json: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
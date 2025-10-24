package com.example.quickcart.backened;
import com.example.quickcart.backened.model.Product;
import com.example.quickcart.backened.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class QuickCartApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuickCartApplication.class, args);
    }

    @Bean
    CommandLineRunner initProducts(ProductRepository productRepo) {
        return args -> {
            long productCount = productRepo.count();
            System.out.println("📦 Found " + productCount + " products in DB");

            boolean isDatabaseEmpty = productCount == 0;
            if (isDatabaseEmpty) {
                initializeSampleProducts(productRepo);
            } else {
                System.out.println("✅ Products already exist — skipping insert");
            }
        };
    }

    private void initializeSampleProducts(ProductRepository productRepo) {
        List<Product> sampleProducts = createSampleProducts();
        productRepo.saveAll(sampleProducts);
        System.out.println("✅ Sample products loaded into MongoDB");
    }

    private List<Product> createSampleProducts() {
        return List.of(
                new Product(null, "Wireless Bluetooth Headphones", 2999.0,
                        "Noise-cancelling over-ear headphones with 30hr battery", 50,
                        "https://via.placeholder.com/150/0000FF/FFFFFF?text=Headphones"),
                new Product(null, "Smart Fitness Watch", 8999.0,
                        "Tracks heart rate, sleep, GPS, and notifications", 30,
                        "https://via.placeholder.com/150/FF0000/FFFFFF?text=Watch"),
                new Product(null, "Ergonomic Laptop Stand", 1299.0,
                        "Aluminum stand with height adjustment for better posture", 100,
                        "https://via.placeholder.com/150/008000/FFFFFF?text=Stand")
        );
    }
}
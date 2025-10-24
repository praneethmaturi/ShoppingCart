package com.example.quickcart.backened.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods:*}")
    private String allowedMethods;

    @Value("${cors.api-path-pattern:/api/**}")
    private String apiPathPattern;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(apiPathPattern)
                .allowedOrigins(allowedOrigins)
                .allowedMethods(allowedMethods)
                .allowCredentials(true);
    }
}
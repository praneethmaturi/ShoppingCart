// src/services/api.js
import axios from 'axios';

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    WITH_CREDENTIALS: true, // Enable credentials to send session cookies
};

// API endpoint constants
const ENDPOINTS = {
    PRODUCTS: '/products',
    CART: '/cart',
    CART_ADD: '/cart/add',
    CART_REMOVE: '/cart/remove',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
};

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: API_CONFIG.WITH_CREDENTIALS,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Builds a URL path with dynamic segments
 * @param {string} endpoint - Base endpoint path
 * @param {string} segment - Dynamic segment to append
 * @returns {string} Complete URL path
 */
const buildEndpointPath = (endpoint, segment) => `${endpoint}/${segment}`;

/**
 * Creates DELETE request configuration with data in body
 * @param {Object} data - Request body data
 * @returns {Object} Axios config object
 */
const createDeleteConfig = (data) => ({ data });

// ============================================
// Products API
// ============================================

/**
 * Fetches all products from the API
 * @returns {Promise} Axios promise with products data
 */
export const fetchProducts = () => apiClient.get(ENDPOINTS.PRODUCTS);

// Alias for backward compatibility
export const getProducts = fetchProducts;

// ============================================
// Cart API
// ============================================

/**
 * Fetches cart data for a specific session
 * @param {string} sessionId - The session identifier
 * @returns {Promise} Axios promise with cart data
 */
export const fetchCartBySession = (sessionId) =>
    apiClient.get(buildEndpointPath(ENDPOINTS.CART, sessionId));

// Alias for backward compatibility
export const getCartBySession = fetchCartBySession;

/**
 * Adds an item to the cart or updates quantity
 * @param {Object} data - The cart item data to add
 * @returns {Promise} Axios promise with updated cart data
 */
export const addCartItem = (data) => apiClient.put(ENDPOINTS.CART_ADD, data);

// Alias for backward compatibility
export const putCartItem = addCartItem;

/**
 * Removes an item from the cart or decreases quantity
 * @param {Object} data - The cart item data to remove (sessionId, productId, quantity)
 * @returns {Promise} Axios promise with updated cart data
 */
export const removeCartItem = (data) =>
    apiClient.delete(ENDPOINTS.CART_REMOVE, createDeleteConfig(data));

// ============================================
// Authentication API
// ============================================

/**
 * Logs a user in
 * @param {Object} credentials - The user's login credentials (username, password)
 * @returns {Promise} Axios promise with login response
 */
export const loginUser = (credentials) =>
    apiClient.post(ENDPOINTS.AUTH_LOGIN, credentials);

/**
 * Registers a new user
 * @param {Object} userData - The user's registration data (username, email, password)
 * @returns {Promise} Axios promise with registration response
 */
export const registerUser = (userData) =>
    apiClient.post(ENDPOINTS.AUTH_REGISTER, userData);

export default apiClient;
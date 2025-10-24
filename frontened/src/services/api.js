import axios from 'axios';

// Configuration constants
const API_BASE_URL = 'http://localhost:8080/api';

// API endpoint constants
const ENDPOINTS = {
  PRODUCTS: '/products',
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_REMOVE: '/cart/remove',
};

// Create axios instance with base configuration
const apiClient = axios.create({ baseURL: API_BASE_URL });

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

/**
 * Fetches all products from the API
 * @returns {Promise} Axios promise with products data
 */
export const getProducts = () => apiClient.get(ENDPOINTS.PRODUCTS);

/**
 * Fetches cart data for a specific session
 * @param {string} sessionId - The session identifier
 * @returns {Promise} Axios promise with cart data
 */
export const getCartBySession = (sessionId) =>
  apiClient.get(buildEndpointPath(ENDPOINTS.CART, sessionId));

/**
 * Adds an item to the cart or updates quantity
 * @param {Object} data - The cart item data to add
 * @returns {Promise} Axios promise with updated cart data
 */
export const putCartItem = (data) => apiClient.put(ENDPOINTS.CART_ADD, data);

/**
 * Removes an item from the cart or decreases quantity
 * @param {Object} data - The cart item data to remove (sessionId, productId, quantity)
 * @returns {Promise} Axios promise with updated cart data
 */
export const deleteCartItem = (data) =>
  apiClient.delete(ENDPOINTS.CART_REMOVE, createDeleteConfig(data));
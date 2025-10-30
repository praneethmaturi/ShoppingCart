
import styles from './App.module.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { getProducts, getCartBySession, putCartItem, removeCartItem } from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Products from './components/Products';
import Cart from './components/Cart';
import Sidebar from './components/Sidebar';

// Constants
const SSE_URL = 'http://localhost:8080/api/cart/stream';
const ERROR_MESSAGES = {
    NETWORK: "Cannot connect to server. Please ensure:\n" +
        "1. Backend server is running on http://localhost:8080\n" +
        "2. MongoDB and Kafka are running (run 'docker-compose up -d')",
    INITIALIZATION: "Failed to load application data."
};

// Custom Hooks
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Initialize from localStorage
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [currentUser, setCurrentUser] = useState(() => {
        // Initialize from localStorage
        return localStorage.getItem('currentUser') || null;
    });

    const handleLogin = useCallback((username) => {
        setIsAuthenticated(true);
        setCurrentUser(username);
        // Persist to localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', username);
    }, []);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        // Clear from localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionId');
    }, []);

    return { isAuthenticated, currentUser, handleLogin, handleLogout };
};

const useProducts = (isAuthenticated) => {
    const [products, setProducts] = useState([]);

    const loadProducts = useCallback(async () => {
        const res = await getProducts();
        if (!res.data) throw new Error("No products data received");
        setProducts(res.data);
    }, []);

    return { products, loadProducts };
};

const useCart = (sessionId, isAuthenticated) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });

    const loadCart = useCallback(async () => {
        const res = await getCartBySession(sessionId);
        if (res.data) {
            setCart(res.data);
        }
    }, [sessionId]);

    const handleAddToCart = useCallback(async (productId) => {
        try {
            await putCartItem({ sessionId, productId, quantity: 1 });
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add item to cart. Please try again.");
        }
    }, [sessionId]);

    const handleIncreaseQuantity = useCallback(async (productId) => {
        try {
            await putCartItem({ sessionId, productId, quantity: 1 });
        } catch (error) {
            console.error("Error increasing quantity:", error);
            alert("Failed to update quantity");
        }
    }, [sessionId]);

    const handleDecreaseQuantity = useCallback(async (productId) => {
        try {
            await removeCartItem({ sessionId, productId, quantity: 1 });
        } catch (error) {
            console.error("Error decreasing quantity:", error);
            alert("Failed to update quantity");
        }
    }, [sessionId]);

    const handleRemoveItem = useCallback(async (productId) => {
        try {
            await removeCartItem({ sessionId, productId, quantity: null });
        } catch (error) {
            console.error("Error removing item:", error);
            alert("Failed to remove item");
        }
    }, [sessionId]);

    const cartItemsMap = useMemo(() => {
        return new Map(cart.items?.map(item => [item.productId, item]) || []);
    }, [cart.items]);

    const getProductQuantityInCart = useCallback((productId) => {
        return cartItemsMap.get(productId)?.quantity || 0;
    }, [cartItemsMap]);

    const clearCart = useCallback(() => {
        setCart({ items: [], totalAmount: 0 });
    }, []);

    const cartItemCount = useMemo(() => {
        return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    }, [cart.items]);

    // SSE connection
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log("Connecting to SSE for sessionId:", sessionId);
        const es = new EventSource(`${SSE_URL}/${sessionId}`);

        es.addEventListener('cart-update', (event) => {
            try {
                const updatedCart = JSON.parse(event.data);
                setCart(updatedCart);
                console.log("Cart updated via SSE");
            } catch (e) {
                console.error("Error parsing cart update:", e);
            }
        });

        es.onerror = (err) => {
            console.error("SSE Error:", err);
            console.log("SSE State:", es.readyState);
        };

        es.onopen = () => {
            console.log("SSE connected successfully");
        };

        return () => {
            es.close();
            console.log("SSE closed");
        };
    }, [sessionId, isAuthenticated]);

    return {
        cart,
        loadCart,
        clearCart,
        handleAddToCart,
        handleIncreaseQuantity,
        handleDecreaseQuantity,
        handleRemoveItem,
        getProductQuantityInCart,
        cartItemCount
    };
};

// Helper Functions
const createErrorMessage = (err) => {
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        return ERROR_MESSAGES.NETWORK;
    }
    if (err.response) {
        return `Server error: ${err.response.status} - ${err.response.statusText}`;
    }
    return ERROR_MESSAGES.INITIALIZATION;
};

// Header Component
const Header = ({ currentUser, onLogout, cartItemCount }) => {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.headerTitle}>
                QuickCart – Real-Time Shopping
            </Link>
            <div className={styles.headerActions}>
                <span className={styles.welcomeText}>Welcome, {currentUser}!</span>
                <Link to="/cart" className={styles.cartButton}>
                    <span className={styles.cartIcon}>🛒</span>
                    <span className={styles.cartText}>Cart</span>
                    {cartItemCount > 0 && (
                        <span className={styles.cartBadge}>{cartItemCount}</span>
                    )}
                </Link>
                <button onClick={onLogout} className={styles.logoutButton}>Logout</button>
            </div>
        </header>
    );
};

function App() {
    const [sessionId] = useState(() => {
        // Get existing sessionId from localStorage or create new one
        const existingSessionId = localStorage.getItem('sessionId');
        if (existingSessionId) {
            return existingSessionId;
        }
        const newSessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', newSessionId);
        return newSessionId;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authForm, setAuthForm] = useState('login');

    const { isAuthenticated, currentUser, handleLogin, handleLogout } = useAuth();
    const { products, loadProducts } = useProducts(isAuthenticated);
    const {
        cart,
        loadCart,
        clearCart,
        handleAddToCart,
        handleIncreaseQuantity,
        handleDecreaseQuantity,
        handleRemoveItem,
        getProductQuantityInCart,
        cartItemCount
    } = useCart(sessionId, isAuthenticated);

    const initializeApp = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            console.log("Loading products...");
            await loadProducts();
            console.log("Products loaded successfully");
            console.log("Loading cart...");
            await loadCart();
            console.log("Cart loaded successfully");
        } catch (err) {
            console.error("Initialization error:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log("Session expired or invalid, redirecting to login.");
                handleLogout();
                clearCart();
                return;
            }

            setError(createErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, loadProducts, loadCart, handleLogout, clearCart]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const onLoginSuccess = useCallback((username) => {
        handleLogin(username);
    }, [handleLogin]);

    const onLogout = useCallback(() => {
        handleLogout();
        clearCart();
    }, [handleLogout, clearCart]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading QuickCart...</p>
                <p className={styles.loadingHint}>This may take a few seconds</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                {authForm === 'login' ? (
                    <Login
                        onLogin={onLoginSuccess}
                        onSwitchToRegister={() => setAuthForm('register')}
                    />
                ) : (
                    <Register onSwitchToLogin={() => setAuthForm('login')} />
                )}
            </div>
        );
    }

    return (
        <Router>
            <div className={styles.appContainer}>
                <Header
                    currentUser={currentUser}
                    onLogout={onLogout}
                    cartItemCount={cartItemCount}
                />

                <Sidebar />

                {error && (
                    <div className={styles.errorContainer}>
                        <h3>⚠️ Error</h3>
                        <pre>{error}</pre>
                        <button onClick={initializeApp}>Retry</button>
                    </div>
                )}

                <div className={styles.mainContent}>
                    <Routes>
                        <Route path="/" element={<Home currentUser={currentUser} />} />
                        <Route
                            path="/products"
                            element={
                                <Products
                                    products={products}
                                    getProductQuantityInCart={getProductQuantityInCart}
                                    handleAddToCart={handleAddToCart}
                                    handleIncreaseQuantity={handleIncreaseQuantity}
                                    handleDecreaseQuantity={handleDecreaseQuantity}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            }
                        />
                        <Route
                            path="/products/:category"
                            element={
                                <Products
                                    products={products}
                                    getProductQuantityInCart={getProductQuantityInCart}
                                    handleAddToCart={handleAddToCart}
                                    handleIncreaseQuantity={handleIncreaseQuantity}
                                    handleDecreaseQuantity={handleDecreaseQuantity}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <Cart
                                    cart={cart}
                                    products={products}
                                    handleIncreaseQuantity={handleIncreaseQuantity}
                                    handleDecreaseQuantity={handleDecreaseQuantity}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
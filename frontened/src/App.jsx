import styles from './App.module.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, getCartBySession, putCartItem, deleteCartItem } from './services/api';

function App() {
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || crypto.randomUUID());
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
    initializeApp();
  }, [sessionId]);

  const initializeApp = async () => {
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

      let errorMessage = "Failed to load application data.";

      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please ensure:\n" +
                      "1. Backend server is running on http://localhost:8080\n" +
                      "2. MongoDB and Kafka are running (run 'docker-compose up -d')";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Connecting to SSE for sessionId:", sessionId);
    const es = new EventSource(`http://localhost:8080/api/cart/stream/${sessionId}`);

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
  }, [sessionId]);

  const loadProducts = async () => {
    const res = await getProducts();
    if (!res.data) throw new Error("No products data received");
    setProducts(res.data);
  };

  const loadCart = async () => {
    const res = await getCartBySession(sessionId);
    if (res.data) {
      setCart(res.data);
    }
  };

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
      await deleteCartItem({ sessionId, productId, quantity: 1 });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      alert("Failed to update quantity");
    }
  }, [sessionId]);

  const handleRemoveItem = useCallback(async (productId) => {
    try {
      await deleteCartItem({ sessionId, productId, quantity: null });
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading QuickCart...</p>
        <p className={styles.loadingHint}>This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ Cannot Load Application</h2>
        <pre className={styles.errorMessage}>{error}</pre>
        <div className={styles.errorActions}>
          <button className={styles.retryButton} onClick={initializeApp}>
            🔄 Retry
          </button>
          <div className={styles.troubleshooting}>
            <h3>Troubleshooting Steps:</h3>
            <ol>
              <li>Check if Docker containers are running: <code>docker-compose ps</code></li>
              <li>Start containers if needed: <code>docker-compose up -d</code></li>
              <li>Verify backend is running on port 8080</li>
              <li>Check browser console for detailed errors (F12)</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>QuickCart – Real-Time Shopping</h1>
        <div className={styles.cartTotal}>
          Cart Total: ₹{cart.totalAmount?.toFixed(2) ?? '0.00'}
          {cart.items?.length > 0 && (
            <span className={styles.cartItemCount}> ({cart.items.length} items)</span>
          )}
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.productsSection}>
          <h2>Products</h2>
          <div className={styles.productsContainer}>
            {products.map(p => {
              const quantityInCart = getProductQuantityInCart(p.id);
              return (
                <div key={p.id} className={styles.productCard}>
                  <h3 className={styles.productName}>{p.name}</h3>
                  <p className={styles.productPrice}>₹{p.price}</p>
                  {quantityInCart > 0 && (
                    <div className={styles.quantityBadge}>
                      In Cart: {quantityInCart}
                    </div>
                  )}
                  <button
                    className={styles.addToCartButton}
                    onClick={() => handleAddToCart(p.id)}
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.cartSection}>
          <h2>Your Cart</h2>
          {cart.items?.length === 0 ? (
            <p className={styles.emptyCart}>Your cart is empty</p>
          ) : (
            <div className={styles.cartItems}>
              {cart.items?.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <h4>{product?.name || 'Unknown Product'}</h4>
                      <p className={styles.cartItemPrice}>
                        ₹{item.priceAtAdd} × {item.quantity} = ₹{(item.priceAtAdd * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className={styles.cartItemActions}>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleDecreaseQuantity(item.productId)}
                        >
                          −
                        </button>
                        <span className={styles.quantityDisplay}>{item.quantity}</span>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleIncreaseQuantity(item.productId)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
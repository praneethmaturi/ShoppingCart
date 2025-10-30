import styles from './Cart.module.css';

const Cart = ({
                  cart,
                  products,
                  handleIncreaseQuantity,
                  handleDecreaseQuantity,
                  handleRemoveItem
              }) => {
    return (
        <aside className={styles.cartSection}>
            <h2>Shopping Cart</h2>
            {cart.items.length === 0 ? (
                <p className={styles.emptyCart}>Your cart is empty</p>
            ) : (
                <>
                    <div className={styles.cartItems}>
                        {cart.items.map((item) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                                <div key={item.productId} className={styles.cartItem}>
                                    <div className={styles.cartItemInfo}>
                                        <h4>{product?.name || 'Unknown Product'}</h4>
                                        <p className={styles.cartItemPrice}>
                                            ${product?.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className={styles.cartItemControls}>
                                        <button
                                            onClick={() => handleDecreaseQuantity(item.productId)}
                                            className={styles.cartControlButton}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => handleIncreaseQuantity(item.productId)}
                                            className={styles.cartControlButton}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className={styles.cartRemoveButton}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.cartTotal}>
                        <h3>Total: ${cart.totalAmount.toFixed(2)}</h3>
                    </div>
                </>
            )}
        </aside>
    );
};

export default Cart;
import { useParams } from 'react-router-dom';
import styles from './Products.module.css';

const Products = ({
                      products,
                      getProductQuantityInCart,
                      handleAddToCart,
                      handleIncreaseQuantity,
                      handleDecreaseQuantity,
                      handleRemoveItem
                  }) => {
    const { category } = useParams();

    const filteredProducts = category
        ? products.filter(p => p.category?.toLowerCase() === category.toLowerCase())
        : products;

    const displayTitle = category
        ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
        : 'All Products';

    return (
        <section className={styles.productsSection}>
            <h2>{displayTitle}</h2>
            {filteredProducts.length === 0 ? (
                <p className={styles.noProducts}>No products available in this category</p>
            ) : (
                <div className={styles.productGrid}>
                    {filteredProducts.map((product) => {
                        const quantityInCart = getProductQuantityInCart(product.id);
                        return (
                            <div key={product.id} className={styles.productCard}>
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className={styles.productImage}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <h3>{product.name}</h3>
                                <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
                                <p className={styles.productDescription}>{product.description}</p>

                                {quantityInCart > 0 ? (
                                    <div className={styles.quantityControls}>
                                        <button
                                            onClick={() => handleDecreaseQuantity(product.id)}
                                            className={styles.quantityButton}
                                        >
                                            −
                                        </button>
                                        <span className={styles.quantity}>{quantityInCart}</span>
                                        <button
                                            onClick={() => handleIncreaseQuantity(product.id)}
                                            className={styles.quantityButton}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleRemoveItem(product.id)}
                                            className={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className={styles.addToCartButton}
                                    >
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default Products;
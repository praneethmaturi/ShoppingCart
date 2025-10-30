import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.homeContainer}>
            {/* First Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>PLAN YOUR SHOPPING</h1>
                    <p className={styles.heroSubtitle}>Discover amazing products at great prices</p>
                    <Link to="/products" className={styles.shopNowButton}>
                        SHOP NOW
                    </Link>
                </div>
            </div>

            {/* Features Image Section */}
            <div className={styles.featuresImageSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>WHY SHOP WITH US</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>📦</div>
                            <h3>Fast Delivery</h3>
                            <p>Get your orders delivered quickly and safely to your doorstep</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>💳</div>
                            <h3>Secure Payment</h3>
                            <p>Shop with confidence using our secure payment gateway</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>🎁</div>
                            <h3>Great Deals</h3>
                            <p>Discover amazing deals and offers on your favorite products</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Hero Section */}
            <div className={styles.secondHeroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h2 className={styles.secondHeroTitle}>EXCLUSIVE COLLECTIONS</h2>
                    <p className={styles.heroSubtitle}>Premium quality products for every lifestyle</p>
                    <Link to="/products/electronics" className={styles.exploreButton}>
                        EXPLORE NOW
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
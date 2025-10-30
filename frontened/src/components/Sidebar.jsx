import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        { name: 'Home', icon: '🏠', path: '/' },
        { name: 'All Products', icon: '🛍️', path: '/products' },
        { name: 'Electronics', icon: '📱', path: '/products/electronics' },
        { name: 'Clothing', icon: '👕', path: '/products/clothing' },
        { name: 'Watches', icon: '⌚', path: '/products/watches' },
        { name: 'Footwear', icon: '👟', path: '/products/footwear' },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div
            className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={styles.hamburgerIcon}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
            </div>

            {isExpanded && (
                <div className={styles.sidebarContent}>
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className={`${styles.sidebarItem} ${isActive(category.path) ? styles.active : ''}`}
                            onClick={() => {
                                navigate(category.path);
                                setIsExpanded(false);
                            }}
                            title={category.name}
                        >
                            <span className={styles.icon}>{category.icon}</span>
                            <span className={styles.label}>{category.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
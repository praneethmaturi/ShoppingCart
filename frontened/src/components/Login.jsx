import React, { useState } from 'react';
import { loginUser } from '../services/api.js';
import styles from './Login.module.css';

const getErrorMessage = (err) => {
    if (err.response) {
        return err.response.data.message || `Server error: ${err.response.status}`;
    }
    if (err.request) {
        return "Network error. Please check your connection.";
    }
    return err.message || "Login failed";
};

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await loginUser({ username, password });
            console.log("Login successful:", response.data);
            onLogin(response.data.username || username);
        } catch (err) {
            console.error("Login error:", err);
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className={styles.authWrapper}>
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <h1 className={styles.brandTitle}>QuickCart</h1>
                    <p className={styles.brandSubtitle}>Your one-stop shopping destination</p>
                </div>

                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Login</h2>

                    {error && (
                        <div className={styles.errorMessage}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Username:</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password:</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Login
                        </button>
                    </form>

                    <p className={styles.switchPrompt}>
                        Don't have an account?{' '}
                        <a href="#register" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
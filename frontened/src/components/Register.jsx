import React, { useState } from 'react';
import { registerUser } from '../services/api.js';
import styles from './Login.module.css';

const getErrorMessage = (err) => {
    if (err.response) {
        return err.response.data.message || `Server error: ${err.response.status}`;
    }
    if (err.request) {
        return "Network error. Please check your connection.";
    }
    return err.message || "Registration failed";
};

const Register = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await registerUser({ username, email, password });
            console.log("Registration successful:", response.data);
            setSuccess(response.data.message || "Registration successful! Redirecting to login...");

            setUsername('');
            setEmail('');
            setPassword('');

            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className={styles.authWrapper}>
            <div className={styles.authContainer}>
                <div className={styles.authHeader}>
                    <h1 className={styles.brandTitle}>QuickCart</h1>
                    <p className={styles.brandSubtitle}>Create your account and start shopping</p>
                </div>

                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Register</h2>

                    {error && (
                        <div className={styles.errorMessage}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className={styles.successMessage}>
                            <span>✓</span> {success}
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
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email:</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
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
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Register
                        </button>
                    </form>

                    <p className={styles.switchPrompt}>
                        Already have an account?{' '}
                        <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
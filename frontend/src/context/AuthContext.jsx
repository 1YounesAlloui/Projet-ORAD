import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('me/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('login/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        const userRes = await api.get('me/');
        setUser(userRes.data);
        return userRes.data.role;
    };

    const logout = async () => {
        try {
            const refresh_token = localStorage.getItem('refresh_token');
            if (refresh_token) {
                await api.post('logout/', { refresh_token });
            }
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

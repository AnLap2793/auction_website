import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { login as loginApi, register as registerApi, getCurrentUser, logout as logoutApi } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password, recaptchaToken) => {
    try {
      const { token, user } = await loginApi(email, password, recaptchaToken);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      message.success('Login successful');
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      message.error(errorMessage);
      throw error;
    }
  };

  const register = async (name, email, password, recaptchaToken) => {
    try {
      const { token, user } = await registerApi(name, email, password, recaptchaToken);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      message.success('Registration successful');
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      message.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      message.success('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token on client side even if API fails
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
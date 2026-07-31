/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => localStorage.getItem('ki_token'));
  const [user, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('ki_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Error parsing saved user from localStorage", e);
      }
    }
    return null;
  });
  const [role, setRoleState] = useState(() => localStorage.getItem('ki_role'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('ki_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    console.log("AuthContext: Attempting login. Using Mock API:", import.meta.env.VITE_USE_MOCK === 'true');
    try {
      const res = await authApi.login(email, password);
      console.log("AuthContext: login response received:", res);
      if (res && res.token) {
        localStorage.setItem('ki_token', res.token);
        localStorage.setItem('ki_user', JSON.stringify(res.user));
        localStorage.setItem('ki_role', res.role);

        setTokenState(res.token);
        setUserState(res.user);
        setRoleState(res.role);
        setIsAuthenticated(true);
        return res;
      } else {
        throw new Error('Response tidak memiliki token');
      }
    } catch (err) {
      console.error('Login error in AuthContext', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, phoneNumber) => {
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password, role, phoneNumber);
      if (res && res.token) {
        localStorage.setItem('ki_token', res.token);
        localStorage.setItem('ki_user', JSON.stringify(res.user));
        localStorage.setItem('ki_role', res.role);

        setTokenState(res.token);
        setUserState(res.user);
        setRoleState(res.role);
        setIsAuthenticated(true);
        return res;
      } else {
        throw new Error('Response tidak memiliki token setelah registrasi');
      }
    } catch (err) {
      console.error('Register error in AuthContext', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ki_token');
    localStorage.removeItem('ki_user');
    localStorage.removeItem('ki_role');

    setTokenState(null);
    setUserState(null);
    setRoleState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

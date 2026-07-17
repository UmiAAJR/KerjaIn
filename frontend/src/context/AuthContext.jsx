import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, clientApi, workerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ki_auth_token');
    const savedRole = localStorage.getItem('ki_auth_role');
    
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
      setIsAuthenticated(true);
      
      // Load user details depending on role
      if (savedRole === 'admin') {
        setUser({ name: 'Admin KerjaIn', email: 'admin@kerjain.com' });
        setLoading(false);
      } else if (savedRole === 'worker') {
        // Extract workerId from token e.g., worker-token-worker-1
        const workerId = savedToken.replace('worker-token-', '');
        workerApi.getProfile(workerId)
          .then(profile => {
            setUser(profile);
            setLoading(false);
          })
          .catch(() => {
            logout();
            setLoading(false);
          });
      } else {
        clientApi.getProfile()
          .then(profile => {
            setUser(profile);
            setLoading(false);
          })
          .catch(() => {
            logout();
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setRole(res.role);
      setUser(res.user);
      setIsAuthenticated(true);
      
      localStorage.setItem('ki_auth_token', res.token);
      localStorage.setItem('ki_auth_role', res.role);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password, role);
      setToken(res.token);
      setRole(res.role);
      setUser(res.user);
      setIsAuthenticated(true);
      
      localStorage.setItem('ki_auth_token', res.token);
      localStorage.setItem('ki_auth_role', res.role);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ki_auth_token');
    localStorage.removeItem('ki_auth_role');
  };

  const refreshProfile = async () => {
    if (!role) return;
    if (role === 'client') {
      const profile = await clientApi.getProfile();
      setUser(profile);
    } else if (role === 'worker') {
      const profile = await workerApi.getProfile(user.id);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isAuthenticated, loading, login, register, logout, refreshProfile }}>
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

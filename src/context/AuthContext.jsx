
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('inventoryUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication - in a real app, this would be an API call
    const users = [
      {
        id: 1,
        email: 'manager@mochkris.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager'
      },
      {
        id: 2,
        email: 'owner@mochkris.com',
        password: 'owner123',
        name: 'Owner User',
        role: 'owner'
      }
    ];

    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      localStorage.setItem('inventoryUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    localStorage.removeItem('inventoryUser');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isManager: user?.role === 'manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
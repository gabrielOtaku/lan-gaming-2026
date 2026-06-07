import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };
    checkAuth();
  }, [apiUrl]);

  const logout = async () => {
    // Appel backend pour détruire la session
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axios.js";
import { getApiMessage, getErrorMessage, isApiSuccess } from "../utils/helpers.js";

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = async () => {
    try {
      const response = await apiClient.get("/users/current-user");
      if (isApiSuccess(response)) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiClient.post("/users/login", credentials);
      if (isApiSuccess(response)) {
        setUser(response.data.user);
        return { success: true, data: response.data.user };
      }
      return { success: false, message: getApiMessage(response, "Login failed") };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const register = async (formData) => {
    try {
      const response = await apiClient.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await apiClient.post("/users/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, checkUserStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};


import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setApiToken } from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cine_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("cine_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("cine_token");
    if (savedToken) {
      setApiToken(savedToken);
      setToken(savedToken);
    }
    // attempt verify (if backend provides /api/auth/verify)
    (async () => {
      try {
        if (savedToken) {
          const res = await api.get("/api/auth/verify");
          if (res?.data?.user) {
            setUser(res.data.user);
            if (res.data.token) {
              localStorage.setItem("cine_token", res.data.token);
              setApiToken(res.data.token);
              setToken(res.data.token);
            }
          } else {
            // fallback to stored user
            const saved = localStorage.getItem("cine_user");
            if (saved) setUser(JSON.parse(saved));
          }
        }
      } catch (err) {
        const saved = localStorage.getItem("cine_user");
        if (saved) setUser(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistAuth = (tok, userObj) => {
    if (tok) {
      localStorage.setItem("cine_token", tok);
      setToken(tok);
      setApiToken(tok);
    }
    if (userObj) {
      localStorage.setItem("cine_user", JSON.stringify(userObj));
      setUser(userObj);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("cine_token");
    localStorage.removeItem("cine_user");
    setToken(null);
    setUser(null);
    setApiToken(null);
  };

  const login = async (credentials) => {
    try {
      const res = await api.post("/api/auth/login", credentials);
      if (res?.data?.token) {
        persistAuth(res.data.token, res.data.user || null);
        return { success: true, user: res.data.user || null };
      }
      return { success: false, error: "Invalid login response" };
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Login failed";
      return { success: false, error: errMsg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.post("/api/auth/signup", userData);
      // if backend returns token+user, persist
      if (res?.data?.token) {
        persistAuth(res.data.token, res.data.user || null);
        return { success: true, user: res.data.user || null };
      }
      return { success: true, message: res.data?.message || "Signup successful" };
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Signup failed";
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout").catch(() => {});
    } catch (err) {
      // ignore
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};


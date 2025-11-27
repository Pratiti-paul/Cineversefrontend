// import React, { createContext, useContext, useEffect, useState } from "react";

// const API_URL = import.meta.env.VITE_API_URL;
// console.log("🔗 API_URL is:", API_URL);

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); 
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const persistAuth = (tok, userObj) => {
//     if (tok) {
//       localStorage.setItem("cine_token", tok);
//       setToken(tok);
//     }
//     if (userObj) {
//       localStorage.setItem("cine_user", JSON.stringify(userObj));
//       setUser(userObj);
//     }
//   };

//   const clearAuth = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("cine_token");
//     localStorage.removeItem("cine_user");
//   };

//   const checkAuth = async () => {
//     if (!API_URL) {
//       console.warn("Auth check skipped: VITE_API_URL is not set");
//       const savedToken = localStorage.getItem("cine_token");
//       const savedUser = localStorage.getItem("cine_user");
//       if (savedToken && savedUser) {
//         setToken(savedToken);
//         setUser(JSON.parse(savedUser));
//       }
//       setLoading(false);
//       return;
//     }

//     try {
//       const savedToken = localStorage.getItem("cine_token");
//       const savedUser = localStorage.getItem("cine_user");
//       if (savedToken && savedUser) {
//         setToken(savedToken);
//         setUser(JSON.parse(savedUser));
//       }

//       if (!savedToken) {
//         setLoading(false);
//         return;
//       }

//       const res = await fetch(`${API_URL}/api/auth/verify`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${savedToken}`,
//         },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.user) {
//           persistAuth(data.token || savedToken, data.user);
//         } else {
//           setUser(JSON.parse(savedUser));
//         }
//       } else {
//         console.info("verify failed, clearing auth:", res.status);
//         clearAuth();
//       }
//     } catch (err) {
//       console.error("Auth check failed:", err);
//       clearAuth();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (credentials) => {
//     if (!API_URL) return { success: false, error: "API_URL not configured" };
//     try {
//       const res = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         return { success: false, error: data.message || "Login failed" };
//       }

//       persistAuth(data.token, data.user || { email: credentials.email });
//       return { success: true, user: data.user || null };
//     } catch (err) {
//       console.error("Login error:", err);
//       return { success: false, error: err.message || "Network error" };
//     }
//   };

//   const signup = async (userData) => {
//     if (!API_URL) return { success: false, error: "API_URL not configured" };
//     try {
//       const res = await fetch(`${API_URL}/api/auth/signup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         return { success: false, error: data.message || "Signup failed" };
//       }
//       return { success: true, message: data.message || "Signup successful" };
//     } catch (err) {
//       console.error("Signup error:", err);
//       return { success: false, error: err.message || "Network error" };
//     }
//   };

//   const logout = async () => {
//     if (API_URL) {
//       try {
//         await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
//       } catch (err) {
//         console.warn("Logout request failed:", err);
//       }
//     }
//     clearAuth();
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     signup,
//     logout,
//     checkAuth,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };



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


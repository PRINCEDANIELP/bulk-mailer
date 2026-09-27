import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bm_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("bm_user"));

  const login = (newToken, newUsername) => {
    localStorage.setItem("bm_token", newToken);
    localStorage.setItem("bm_user", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    localStorage.removeItem("bm_token");
    localStorage.removeItem("bm_user");
    setToken(null);
    setUsername(null);
  };

  const value = useMemo(
    () => ({ token, username, isAuthenticated: !!token, login, logout }),
    [token, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

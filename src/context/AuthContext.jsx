import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      setUser(
        payload && payload.sub && payload.role === "admin"
          ? { email: payload.sub, role: payload.role }
          : null
      );
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    const payload = parseJwt(data.access_token);
    if (!payload || payload.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }
    setToken(data.access_token);
    setTokenState(data.access_token);
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

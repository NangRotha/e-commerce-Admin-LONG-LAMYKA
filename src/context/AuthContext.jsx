import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  // Profile extras loaded from settings (avatar, display name)
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileName, setProfileName] = useState("");

  const loadProfile = useCallback(() => {
    api
      .getSettings()
      .then((s) => {
        if (s.profile_avatar) setProfileAvatar(s.profile_avatar);
        if (s.admin_name) setProfileName(s.admin_name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.sub && payload.role === "admin") {
        setUser({ email: payload.sub, role: payload.role, id: payload.id || payload.sub });
        loadProfile();
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
      setProfileAvatar("");
      setProfileName("");
    }
  }, [token, loadProfile]);

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

  // Called from Profile page after uploading a new avatar or changing name
  const refreshProfile = () => loadProfile();

  return (
    <AuthContext.Provider value={{ user, token, login, logout, profileAvatar, profileName, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

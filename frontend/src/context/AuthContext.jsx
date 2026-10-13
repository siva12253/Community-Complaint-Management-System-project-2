import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));

  useEffect(() => {
    function clearExpiredSession() {
      setUser(null);
    }
    window.addEventListener("auth:expired", clearExpiredSession);
    return () => window.removeEventListener("auth:expired", clearExpiredSession);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;
    api.get("/auth/profile/")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const { data } = await api.post("/auth/token/", credentials);
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    const profile = await api.get("/auth/profile/");
    setUser(profile.data);
    return profile.data;
  }

  async function register(values) {
    await api.post("/auth/register/", values);
    return login({ username: values.username, password: values.password });
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser: setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

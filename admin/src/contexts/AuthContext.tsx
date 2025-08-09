import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminUser } from "@/types";
import api from "@/utils/api";

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted admin session using API utils
    const token = api.utils.getAdminAuthToken();
    const stored = api.utils.getAdminUser();

    if (token && stored && stored.role === "admin") {
      const displayName =
        stored.fullName ||
        stored.name ||
        `${stored.firstName || ""} ${stored.lastName || ""}`.trim();
      const adminUser: AdminUser = {
        id: stored.id || stored._id,
        email: stored.email,
        name: displayName,
        role: "admin",
        token,
      };
      setUser(adminUser);
    } else {
      api.auth.logout();
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res: any = await api.auth.login({ email, password });
      if (
        !res ||
        !res.success ||
        !res.data ||
        !res.data.user ||
        !res.data.token
      )
        return false;

      const { user: u, token } = res.data;
      if (u.role !== "admin") {
        // Not an admin; clear any stored data
        api.auth.logout();
        return false;
      }

      const displayName =
        u.fullName ||
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.email;
      const adminUser: AdminUser = {
        id: u.id || u._id,
        email: u.email,
        name: displayName,
        role: "admin",
        token,
      };
      setUser(adminUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

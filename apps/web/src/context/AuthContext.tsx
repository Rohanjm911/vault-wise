import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserSettings } from "../types";
import { api } from "../services/apiClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const profile = await api.get<User>("/auth/me");
      setUser(profile);
      localStorage.setItem("vaultwise_user", JSON.stringify(profile));
      document.documentElement.classList.remove("dark");
    } catch {
      setUser(null);
      localStorage.removeItem("vaultwise_token");
      localStorage.removeItem("vaultwise_user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const token = localStorage.getItem("vaultwise_token");
    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener("vaultwise_auth_expired", handleAuthExpired);
    return () =>
      window.removeEventListener("vaultwise_auth_expired", handleAuthExpired);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("vaultwise_token", response.access_token);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setIsLoading(true);
    try {
      await api.post<User>("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("vaultwise_token");
    localStorage.removeItem("vaultwise_user");
    setUser(null);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = await api.put<UserSettings>("/settings", newSettings);
    if (user) {
      const updatedUser = { ...user, settings: updated };
      setUser(updatedUser);
      localStorage.setItem("vaultwise_user", JSON.stringify(updatedUser));
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateSettings,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { MOCK_USER } from "@/lib/mock-data";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  demoMode: boolean;
  enableDemoMode: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem("demoMode") === "true");
  const [sessionUser, setSessionUser] = useState<any>(null);

  const { data: realUser, isLoading: isRealUserLoading, error, refetch } = useGetMe({
    query: { enabled: !demoMode, retry: false }
  });

  useEffect(() => {
    if (realUser) setSessionUser(realUser);
  }, [realUser]);

  const enableDemoMode = () => {
    localStorage.setItem("demoMode", "true");
    setDemoMode(true);
    window.location.href = "/";
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setSessionUser(data);
    localStorage.removeItem("demoMode");
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setSessionUser(data);
    localStorage.removeItem("demoMode");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setSessionUser(null);
    localStorage.removeItem("demoMode");
    setDemoMode(false);
    window.location.href = "/login";
  };

  const user = demoMode ? MOCK_USER : sessionUser || realUser || null;
  const isLoading = demoMode ? false : isRealUserLoading;

  return (
    <AuthContext.Provider value={{ user, isLoading, demoMode, enableDemoMode, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

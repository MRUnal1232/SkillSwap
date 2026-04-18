import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<unknown>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const res = await api.post<{ user: User }>("/auth/login", {
      email,
      password,
    });
    setUser(res.data.user);
    return res.data;
  };

  const register: AuthContextValue["register"] = async (
    name,
    email,
    password
  ) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

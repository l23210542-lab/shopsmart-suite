import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "customer" | "seller" | "admin";
export type User = { id?: number; name: string; email: string; role: Role };

type Ctx = {
  user: User | null;
  /** Sesión explícita (p. ej. tras validar credenciales en el servidor). */
  setUser: (user: User | null) => void;
  /** Modo sin MariaDB: guarda sesión solo en el cliente. */
  login: (email: string, role?: Role) => void;
  register: (name: string, email: string, role?: Role) => void;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "picommerce.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const setSessionUser: Ctx["setUser"] = (next) => {
    setUser(next);
  };

  const login: Ctx["login"] = (email, role = "customer") => {
    setUser({ name: email.split("@")[0] || "Usuario", email, role });
  };
  const register: Ctx["register"] = (name, email, role = "customer") => {
    setUser({ name, email, role });
  };
  const logout = () => setUser(null);

  return (
    <AuthCtx.Provider value={{ user, setUser: setSessionUser, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

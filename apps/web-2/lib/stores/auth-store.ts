"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "EMPLOYEE";

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, role: Role) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (user, token, role) =>
        set({ user, token, role, isAuthenticated: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
    }),
    { name: "auth-storage" }
  )
);

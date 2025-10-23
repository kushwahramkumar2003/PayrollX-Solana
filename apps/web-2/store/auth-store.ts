import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ORG_ADMIN" | "EMPLOYEE";
  organizationId?: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, isAuthenticated: false });
      },
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;

        // SUPER_ADMIN has access to everything
        if (user.role === "SUPER_ADMIN") return true;

        // Check specific role
        return user.role === role;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


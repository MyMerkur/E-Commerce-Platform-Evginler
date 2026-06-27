import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: ({ user, isAuthenticated }) => set({ user, isAuthenticated }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}))

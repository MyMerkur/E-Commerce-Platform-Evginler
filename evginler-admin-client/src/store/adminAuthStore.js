import { create } from 'zustand'

export const useAdminAuthStore = create((set) => ({
  admin: null,
  isAuthenticated: false,
  setAuth: ({ admin, isAuthenticated }) => set({ admin, isAuthenticated }),
  clearAuth: () => set({ admin: null, isAuthenticated: false }),
}))

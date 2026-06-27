import { create } from 'zustand'

const getCartItems = (cart) => (Array.isArray(cart) ? cart : cart?.cart || [])

export const useCartStore = create((set, get) => ({
  cart: [],
  cartId: null,
  setCart: (payload) =>
    set({
      cart: getCartItems(payload),
      cartId: payload?.cartId || get().cartId,
    }),
  clearCart: () => set({ cart: [], cartId: null }),
  getItemCount: () => get().cart.reduce((total, item) => total + Number(item.quantity || 0), 0),
  getSubtotal: () =>
    get().cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
}))

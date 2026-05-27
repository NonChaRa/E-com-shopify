import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set) => ({
      cart: [],

      addToCart: (product, selectedSize, variantId) =>
        set((state) => {
          const existingItem = state.cart.find(
                (item) => item.variantId === variantId
          );

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.variantId === variantId
                  ? { ...item, quantity: (item.quantity || 1) + 1 }
                  : item
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...product,
                selectedSize,
                variantId, // required for Shopify checkout
                quantity: 1,
                cartId: crypto.randomUUID(),
              }
            ],
          };
        }),

      updateQuantity: (cartId, delta) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.cartId === cartId) {
              const isPreorder = item.stock <= 0 && item.available;
              const newQty = (item.quantity || 1) + delta;
              if (isPreorder && newQty > 5) return item; // CartSidebar disables + at 5, safety guard

              return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
          })
        })),

      removeFromCart: (cartId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.cartId !== cartId)
        })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: 'nail-cart-storage' }
  )
);
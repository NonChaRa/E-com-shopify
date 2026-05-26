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
                variantId: variantId, // REQUIRED for Shopify checkout
                quantity: 1,
                cartId: crypto.randomUUID(), // Use variantId as the unique cart key
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
              // Silently cap pre-order items at 5 — the CartSidebar
              // disables the + button at qty >= 5, so this is a safety guard only.
              if (isPreorder && newQty > 5) return item;

              return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
          })
        })),

      removeFromCart: (cartId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.cartId !== cartId)
        })),

      clearCart: () => {
        set({ cart: [] });
        localStorage.removeItem('nail-cart-storage');
      },
    }),
    { name: 'nail-cart-storage' }
  )
);
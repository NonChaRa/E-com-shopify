// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '../store/useCart';

// Reset the Zustand store and localStorage before every test so tests are isolated
beforeEach(() => {
  useCart.setState({ cart: [] });
  localStorage.clear();
});

// ─── helpers ────────────────────────────────────────────────────────────────

const makeProduct = (overrides = {}) => ({
  id: 'gid://shopify/Product/1',
  name: 'TEST SET',
  price: '699',
  image_url: 'https://cdn.shopify.com/test.jpg',
  ...overrides,
});

const makeVariant = (overrides = {}) => ({
  id: 'variant-1',
  title: 'S',
  stock: 5,
  available: true,
  ...overrides,
});

// ─── addToCart ───────────────────────────────────────────────────────────────

describe('addToCart', () => {
  it('adds a new item to an empty cart', () => {
    const { addToCart } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');

    const { cart } = useCart.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('TEST SET');
    expect(cart[0].selectedSize).toBe('S');
    expect(cart[0].variantId).toBe('variant-1');
    expect(cart[0].quantity).toBe(1);
  });

  it('increments quantity when the same variantId is added again', () => {
    const { addToCart } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    addToCart(makeProduct(), 'S', 'variant-1');

    const { cart } = useCart.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('adds separate entries for different variants of the same product', () => {
    const product = makeProduct();
    const { addToCart } = useCart.getState();
    addToCart(product, 'S', 'variant-1');
    addToCart(product, 'M', 'variant-2');

    const { cart } = useCart.getState();
    expect(cart).toHaveLength(2);
  });

  it('assigns a unique cartId to every item', () => {
    const product = makeProduct();
    const { addToCart } = useCart.getState();
    addToCart(product, 'S', 'variant-1');
    addToCart(product, 'M', 'variant-2');

    const { cart } = useCart.getState();
    expect(cart[0].cartId).toBeDefined();
    expect(cart[1].cartId).toBeDefined();
    expect(cart[0].cartId).not.toBe(cart[1].cartId);
  });
});

// ─── removeFromCart ──────────────────────────────────────────────────────────

describe('removeFromCart', () => {
  it('removes the correct item by cartId', () => {
    const { addToCart, removeFromCart } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    addToCart(makeProduct(), 'M', 'variant-2');

    const cartIdToRemove = useCart.getState().cart[0].cartId;
    removeFromCart(cartIdToRemove);

    const { cart } = useCart.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].variantId).toBe('variant-2');
  });

  it('does nothing when cartId does not exist', () => {
    const { addToCart, removeFromCart } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    removeFromCart('nonexistent-id');

    expect(useCart.getState().cart).toHaveLength(1);
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────

describe('updateQuantity', () => {
  it('increments quantity by 1', () => {
    const { addToCart, updateQuantity } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    const { cartId } = useCart.getState().cart[0];

    updateQuantity(cartId, +1);
    expect(useCart.getState().cart[0].quantity).toBe(2);
  });

  it('decrements quantity by 1', () => {
    const { addToCart, updateQuantity } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    const { cartId } = useCart.getState().cart[0];

    updateQuantity(cartId, +1); // qty → 2
    updateQuantity(cartId, -1); // qty → 1
    expect(useCart.getState().cart[0].quantity).toBe(1);
  });

  it('floors quantity at 1 — never goes below 1', () => {
    const { addToCart, updateQuantity } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    const { cartId } = useCart.getState().cart[0];

    updateQuantity(cartId, -1); // attempt to go to 0
    expect(useCart.getState().cart[0].quantity).toBe(1);
  });

  it('caps pre-order items at quantity 5', () => {
    // Pre-order: stock <= 0 && available === true
    const preorderProduct = makeProduct({ stock: 0, available: true });
    const { addToCart, updateQuantity } = useCart.getState();
    addToCart(preorderProduct, 'S', 'variant-1');
    const { cartId } = useCart.getState().cart[0];

    // Bump qty to 5 — should succeed
    for (let i = 0; i < 4; i++) updateQuantity(cartId, +1);
    expect(useCart.getState().cart[0].quantity).toBe(5);

    // Attempt to go to 6 — should be blocked
    updateQuantity(cartId, +1);
    expect(useCart.getState().cart[0].quantity).toBe(5);
  });
});

// ─── clearCart ───────────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('empties the cart', () => {
    const { addToCart, clearCart } = useCart.getState();
    addToCart(makeProduct(), 'S', 'variant-1');
    addToCart(makeProduct(), 'M', 'variant-2');
    expect(useCart.getState().cart).toHaveLength(2);

    clearCart();
    expect(useCart.getState().cart).toHaveLength(0);
  });

  it('does not crash when the cart is already empty', () => {
    expect(() => useCart.getState().clearCart()).not.toThrow();
  });
});

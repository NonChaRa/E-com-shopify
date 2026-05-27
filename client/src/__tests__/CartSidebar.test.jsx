// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartSidebar from '../components/CartSidebar';
import { CurrencyProvider } from '../store/CurrencyContext';
import { ToastProvider } from '../store/ToastContext';

const Wrapper = ({ children }) => (
  <ToastProvider>
    <CurrencyProvider>{children}</CurrencyProvider>
  </ToastProvider>
);

const makeCart = (overrides = {}) => [
  {
    cartId: 'cart-item-1',
    variantId: 'v1',
    name: 'DARK ANGEL',
    price: 699,
    quantity: 2,
    selectedSize: 'M',
    stock: 10,
    available: true,
    ...overrides,
  },
];

const renderSidebar = (cart, handlers = {}) =>
  render(
    <Wrapper>
      <CartSidebar
        isOpen={true}
        onClose={vi.fn()}
        cart={cart}
        user={null}
        onRemove={handlers.onRemove ?? vi.fn()}
        updateQuantity={handlers.updateQuantity ?? vi.fn()}
        onOpenCart={vi.fn()}
      />
    </Wrapper>
  );

describe('CartSidebar — subtotal calculation', () => {
  it('calculates subtotal as price × quantity', () => {
    renderSidebar(makeCart()); // 699 × 2 = 1,398
    const totals = screen.getAllByText(/1[,.]?398/);
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('shows 0 subtotal for an empty cart', () => {
    renderSidebar([]);
    // formatPrice(0) in THB → '฿0'
    expect(screen.getByText('฿0')).toBeInTheDocument();
  });
});

describe('CartSidebar — quantity controls', () => {
  it('calls updateQuantity with +1 when increase button is clicked', () => {
    const updateQuantity = vi.fn();
    renderSidebar(makeCart(), { updateQuantity });

    fireEvent.click(screen.getByText('+'));
    expect(updateQuantity).toHaveBeenCalledWith('cart-item-1', +1);
  });

  it('calls updateQuantity with -1 when decrease button is clicked', () => {
    const updateQuantity = vi.fn();
    renderSidebar(makeCart(), { updateQuantity });

    fireEvent.click(screen.getByText('−'));
    expect(updateQuantity).toHaveBeenCalledWith('cart-item-1', -1);
  });

  it('calls onRemove with the correct cartId when remove button is clicked', () => {
    const onRemove = vi.fn();
    renderSidebar(makeCart(), { onRemove });

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith('cart-item-1');
  });
});

describe('CartSidebar — rendering', () => {
  it('displays the product name and selected size', () => {
    renderSidebar(makeCart());
    expect(screen.getByText('DARK ANGEL')).toBeInTheDocument();
    // CartSidebar renders size as: <p className="item-variant">Size: {item.selectedSize}</p>
    expect(screen.getByText('Size: M')).toBeInTheDocument();
  });

  it('renders an empty-cart message when cart is empty', () => {
    renderSidebar([]);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });
});

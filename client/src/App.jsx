import React, { useState, useEffect, useCallback, lazy, Suspense, startTransition } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles/Global.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Login from './components/Login';
import Register from './components/Register';
import LoyaltyPopup from './components/LoyaltyPopup';
import PageIntro from './components/PageIntro';
import PageTransition from './components/PageTransition';

// Eagerly loaded — these are on the critical render path
import Home from './pages/Home';
import ProductPage from './components/ProductPage';
import NotFound from './pages/NotFound';

// Lazily loaded — split into separate chunks, fetched only when navigated to
const AllProducts = lazy(() => import('./pages/AllProducts'));
const Contact     = lazy(() => import('./pages/Contact'));
const About       = lazy(() => import('./pages/About'));
const PolicyPage  = lazy(() => import('./pages/PolicyPage'));
const ValuePage   = lazy(() => import('./pages/Values'));
const Account     = lazy(() => import('./components/Account'));
const SizingGuide = lazy(() => import('./pages/SizingGuide'));
import { useCart } from './store/useCart';
import { CurrencyProvider } from './store/CurrencyContext';
import { ToastProvider } from './store/ToastContext';
import { supabase } from './supabaseClient';
import { fetchAllGlobalProducts, fetchProductsByCollection } from './components/lib/shopify';
import { createLogger } from './utils/logger';

const log = createLogger('App');

// LayoutWrapper must live inside <Router> to use useLocation + useNavigate
const LayoutWrapper = ({ children, cartCount, onOpenCart, onOpenLogin, onLogout, user }) => {
  const location  = useLocation();
  const navigate  = useNavigate();

  // Only the home page gets a transparent (hero-overlay) navbar.
  // Every other route — including any future pages and the 404 — starts solid.
  const forceSolid = location.pathname !== '/';

  // Wraps the App-level logout so we can navigate after cleanup completes.
  const handleLogoutWithNav = useCallback(async () => {
    await onLogout();
    navigate('/');
  }, [onLogout, navigate]);

  return (
    <div className="app-wrapper">
      <PageTransition />
      <Navbar
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenLogin={onOpenLogin}
        onLogout={handleLogoutWithNav}
        user={user}
        forceSolid={forceSolid}
      />
      <main key={location.pathname} className="studio-editorial-fade">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeAuthModal, setActiveAuthModal] = useState(null);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introShown'));

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [user, setUser]           = useState(null);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  // Restore session on page load via onAuthStateChange (fires INITIAL_SESSION on mount,
  // SIGNED_IN on login, SIGNED_OUT on logout; TOKEN_REFRESHED skipped to avoid extra fetches)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          return;
        }

        if (event === 'TOKEN_REFRESHED') return;

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('shopify_customer_id')
            .eq('id', session.user.id)
            .single();

          setUser({
            ...session.user,
            shopify_id: profile?.shopify_customer_id || null,
          });
        } catch {
          setUser(session.user); // profile row missing on brand-new signup
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Invalidate local cart if the Shopify cart was already checked out
  useEffect(() => {
    const checkCartStatus = async () => {
      const savedCartId = localStorage.getItem('shopify_cart_id');
      if (!savedCartId) return;

      try {
        const query    = `query checkCart($id: ID!) { cart(id: $id) { id } }`;
        const endpoint = `https://${import.meta.env.VITE_SHOPIFY_DOMAIN}/api/2024-04/graphql.json`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify({ query, variables: { id: savedCartId } }),
        });

        const resJson = await response.json();

        if (resJson?.data?.cart === null) {
          clearCart();
          localStorage.removeItem('shopify_cart_id');
          localStorage.removeItem('shopify_checkout_url');
        }
      } catch (err) {
        log.error('Cart status check error', { error: err, action: 'checkCartStatus' });
      }
    };

    checkCartStatus();
  }, [clearCart]);

  // Sign out + local cleanup; LayoutWrapper navigates to "/" after this resolves
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      log.error('Sign out error', { error, action: 'handleLogout' });
      return;
    }
    clearCart();
    localStorage.removeItem('shopify_cart_id');
    localStorage.removeItem('shopify_checkout_url');
    // setUser(null) is handled by onAuthStateChange SIGNED_OUT
  };

  const fetchByCollection = useCallback(async (handle) => {
    setLoading(true);
    try {
      const collectionData = await fetchProductsByCollection(handle);
      // startTransition marks the product-grid update as non-urgent so React
      // won't block user interactions (clicks, input) while re-rendering cards.
      startTransition(() => setProducts(collectionData));
    } catch (err) {
      log.error('Collection fetch error', { error: err, action: 'fetchByCollection', data: { handle } });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const catalogData = await fetchAllGlobalProducts();
      startTransition(() => setProducts(catalogData));
    } catch (err) {
      log.error('Product catalog fetch error', { error: err, action: 'fetchProducts' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', '1');
    setShowIntro(false);
  };

  return (
    <ToastProvider>
    <CurrencyProvider>
      {showIntro && <PageIntro onComplete={handleIntroComplete} />}
      <Router>
        <LayoutWrapper
          user={user}
          onOpenLogin={() => setActiveAuthModal('login')}
          onLogout={handleLogout}
          cartCount={cart.length}
          onOpenCart={() => setIsCartOpen(true)}
        >
          <Suspense fallback={<div className="page-loading-fallback" aria-label="Loading…" />}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  allProducts={products}
                  loading={loading}
                  fetchByCollection={fetchByCollection}
                  fetchAllProducts={fetchProducts}
                  addToCart={addToCart}
                />
              }
            />
            <Route
              path="/shop"
              element={
                <AllProducts
                  allProducts={products}
                  loading={loading}
                  fetchByCollection={fetchByCollection}
                  fetchAllProducts={fetchProducts}
                />
              }
            />
            <Route
              path="/account"
              element={<Account user={user} />}
            />
            <Route
              path="/product/:id"
              element={
                <ProductPage
                  allProducts={products}
                  addToCart={addToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              }
            />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/about"        element={<About />} />
            <Route path="/sizing-guide" element={<SizingGuide />} />
            <Route path="/policy/:policyType" element={<PolicyPage />} />
            <Route path="/values"  element={<ValuePage />} />

            {/* 404 catch-all — must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </LayoutWrapper>

        <LoyaltyPopup onOpenAuth={(type) => setActiveAuthModal(type)} />

        <Login
          isOpen={activeAuthModal === 'login'}
          onClose={() => setActiveAuthModal(null)}
          onOpenRegister={() => setActiveAuthModal('register')}
          onLoginSuccess={(userData) => {
            setUser(userData);
            setActiveAuthModal(null);
          }}
        />

        <Register
          isOpen={activeAuthModal === 'register'}
          onClose={() => setActiveAuthModal(null)}
        />

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          user={user}
          onRemove={removeFromCart}
          updateQuantity={updateQuantity}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </Router>
    </CurrencyProvider>
    </ToastProvider>
  );
}

export default App;

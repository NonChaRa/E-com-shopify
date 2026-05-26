import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles/Global.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import LoyaltyPopup from './components/LoyaltyPopup';

// Pages
import Home from './pages/Home';
import ProductPage from './components/ProductPage';
import AllProducts from './pages/AllProducts';
import Contact from './pages/Contact';
import About from './pages/About';
import PolicyPage from './pages/PolicyPage';
import ValuePage from './pages/Values';
import NotFound from './pages/NotFound';

// Logic & API Connections
import { useCart } from './store/useCart';
import { CurrencyProvider } from './store/CurrencyContext';
import { ToastProvider } from './store/ToastContext';
import { supabase } from './supabaseClient';
import { fetchAllGlobalProducts, fetchProductsByCollection } from './components/lib/shopify';

// ---------------------------------------------------------------------------
// LayoutWrapper
// Must live inside <Router> so it can use useLocation + useNavigate.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeAuthModal, setActiveAuthModal] = useState(null);

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [user, setUser]           = useState(null);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

  // -------------------------------------------------------------------------
  // AUTH — restore session on every page load
  //
  // Supabase persists the session in localStorage automatically.
  // onAuthStateChange fires "INITIAL_SESSION" on mount (restoring that data),
  // "SIGNED_IN" on fresh login, and "SIGNED_OUT" on logout.
  // We skip TOKEN_REFRESHED to avoid a redundant profiles fetch every hour.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          // Token silently refreshed — session is valid, no UI change needed.
          return;
        }

        // INITIAL_SESSION (page refresh) or SIGNED_IN (fresh login):
        // enrich the Supabase user with the Shopify customer ID from our profiles table.
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
          // Profile row missing (e.g. brand-new signup) — still sign the user in.
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // CART — invalidate local cart if the Shopify cart was already checked out
  // -------------------------------------------------------------------------
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
          console.log('Successful checkout detected. Resetting client cart layout...');
          clearCart();
          localStorage.removeItem('shopify_cart_id');
          localStorage.removeItem('shopify_checkout_url');
        }
      } catch (err) {
        console.error('Error verifying headless cart retention state:', err);
      }
    };

    checkCartStatus();
  }, [clearCart]);

  // -------------------------------------------------------------------------
  // LOGOUT — Supabase sign-out + local cleanup.
  // Navigation back to "/" is handled by LayoutWrapper after this resolves.
  // -------------------------------------------------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
      return;
    }
    clearCart();
    localStorage.removeItem('shopify_cart_id');
    localStorage.removeItem('shopify_checkout_url');
    // setUser(null) is handled by the onAuthStateChange SIGNED_OUT event above.
  };

  // -------------------------------------------------------------------------
  // PRODUCT CATALOG
  // -------------------------------------------------------------------------
  const fetchByCollection = useCallback(async (handle) => {
    setLoading(true);
    try {
      const collectionData = await fetchProductsByCollection(handle);
      setProducts(collectionData);
    } catch (err) {
      console.error('Error fetching collection catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const catalogData = await fetchAllGlobalProducts();
      setProducts(catalogData);
    } catch (err) {
      console.error('Global catalog fetch exception:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <ToastProvider>
    <CurrencyProvider>
      <Router>
        <LayoutWrapper
          user={user}
          onOpenLogin={() => setActiveAuthModal('login')}
          onLogout={handleLogout}
          cartCount={cart.length}
          onOpenCart={() => setIsCartOpen(true)}
        >
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/about"   element={<About />} />
            <Route path="/policy/:policyType" element={<PolicyPage />} />
            <Route path="/values"  element={<ValuePage />} />

            {/* ----------------------------------------------------------------
                404 — catch-all: must be the last route
                ---------------------------------------------------------------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>

        {/* Global Modals & Sidebar */}
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

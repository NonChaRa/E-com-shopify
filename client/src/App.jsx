import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/Global.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';

// Pages
import Home from './pages/Home';
import ProductPage from './components/ProductPage';
import AllProducts from './pages/AllProducts';
import Contact from './pages/Contact';
import About from './pages/About';
import PolicyPage from './pages/PolicyPage';
import ValuePage from './pages/Values'

// Logic & API Connections
import { useCart } from './store/useCart';
import { supabase } from './supabaseClient';
import { fetchAllGlobalProducts, fetchProductsByCollection } from './components/lib/shopify';

// Helper component to handle Navbar styling based on Route
const LayoutWrapper = ({ children, cartCount, onOpenCart, onOpenLogin, onLogout, user }) => {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product');
  const isSolidPage =
      location.pathname.startsWith('/product') ||
      location.pathname === '/contact' ||
      location.pathname === '/account' ||
      location.pathname === '/shop' ||
      location.pathname === '/policy/privacy' ||
      location.pathname === '/policy/shipping' ||
      location.pathname === '/policy/refund' ||
      location.pathname === '/values' ||
      location.pathname === '/about';

  return (
    <div className="app-wrapper">
      <Navbar
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        user={user}
        forceSolid={isProductPage || isSolidPage}
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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();

 // --- AUTO-CLEAR CART AFTER SUCCESSFUL CHECKOUT ---
   useEffect(() => {
     const checkCartStatus = async () => {
       const savedCartId = localStorage.getItem('shopify_cart_id');
       if (!savedCartId) return;

       try {
         const query = `query checkCart($id: ID!) { cart(id: $id) { id } }`;
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

         // If data.cart returns null, Shopify has cleared the cart following a successful purchase!
         if (resJson && resJson.data && resJson.data.cart === null) {
           console.log("Successful checkout detected. Resetting client cart layout...");
           clearCart();
           localStorage.removeItem('shopify_cart_id');
           localStorage.removeItem('shopify_checkout_url');
         }
       } catch (err) {
         console.error("Error verifying headless cart retention state:", err);
       }
     };

     checkCartStatus();
   }, [clearCart]);

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    } else {
      clearCart();
      setUser(null);
      localStorage.removeItem('shopify_cart_id');
      localStorage.removeItem('shopify_checkout_url');
      window.location.href = "/";
    }
  };

  // --- live SHOP DATA ACTIONS (Using clean wrappers) ---
  const fetchByCollection = useCallback(async (handle) => {
    setLoading(true);
    try {
      const collectionData = await fetchProductsByCollection(handle);
      setProducts(collectionData);
    } catch (err) {
      console.error("Error fetching collection catalog:", err);
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
      console.error("Global catalog fetch exception:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial catalog mount execution
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Router>
      <LayoutWrapper
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
      >
        <Routes>
          <Route
            path="/"
            element = {
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
            element = {
              <ProductPage
                allProducts={products}
                addToCart={addToCart}
                onOpenCart={() => setIsCartOpen(true)}
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/policy/:policyType" element={<PolicyPage />} />
          <Route path="/values" element={<ValuePage />} />
        </Routes>
      </LayoutWrapper>

      {/* Global Modals & Sidebar System Overlays */}
      <Login
         isOpen={isLoginOpen}
         onClose={() => setIsLoginOpen(false)}
         onLoginSuccess={(u) => setUser(u)}
         onOpenRegister={() => {
             setIsLoginOpen(false);
             setIsRegisterOpen(true);
         }}
      />

      <Register
         isOpen={isRegisterOpen}
         onClose={() => setIsRegisterOpen(false)}
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
  );
}

export default App;
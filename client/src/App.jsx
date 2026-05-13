import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/Global.css';


// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Account from './components/Account';

// Pages
import Home from './pages/Home';
import ProductPage from './components/ProductPage';
import AllProducts from './pages/AllProducts';
import Contact from './pages/Contact';
import About from './pages/About';
import Callback from './pages/Callback';

// Logic
import { useCart } from './store/useCart';
import { supabase } from './supabaseClient';
import { shopifyFetch } from './components/lib/shopify';
import { GET_PRODUCTS_QUERY, GET_COLLECTION_PRODUCTS  } from './components/lib/queries';

// Helper component to handle Navbar styling based on Route
const LayoutWrapper = ({ children, cartCount, onOpenCart, onOpenLogin, onLogout, user }) => {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product');
  const isSolidPage =
      location.pathname.startsWith('/product') ||
      location.pathname === '/contact' ||
      location.pathname === '/account' ||
      location.pathname === '/about';

  return (
    <div className="app-wrapper">
      <Navbar
        cartCount={cartCount}
        onOpenCart={onOpenCart} // <--- MAKE SURE THIS LINE EXISTS
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        user={user}
        forceSolid={isProductPage}
        forceSolid={isSolidPage}
      />
      {children}
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
  const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
      } else {
        // 1. CLEAR THE CART UPON LOGOUT
        clearCart();

        // 2. Clear user state
        setUser(null);

        // 3. Clear any Shopify specific IDs if you stored them
        localStorage.removeItem('shopify_cart_id');
        localStorage.removeItem('shopify_checkout_url');

        // 4. Redirect home to reset the view
        window.location.href = "/";
      }
  };
  const handleLoginSuccess = (token) => {
    localStorage.setItem('shopify_customer_token', token);
    setUser({ loggedIn: true });
  };
  useEffect(() => {
    const token = localStorage.getItem('shopify_customer_token');
    if (token) {
      setUser({ loggedIn: true });
      // TODO: Fetch real name/email from Shopify here later
    }
  }, []);
  const fetchByCollection = async (handle) => {
    setLoading(true);
    try {
      const response = await shopifyFetch(GET_COLLECTION_PRODUCTS, { handle });

      // If Shopify returns null for this handle, don't update the state
      if (!response?.data?.collection) {
        console.warn(`Shopify could not find collection: ${handle}. Check handle & Sales Channel publishing.`);
        return;
      }

      const formatted = response.data.collection.products.edges.map(edge => ({
        id: edge.node.id,
        name: edge.node.title,
        price: edge.node.priceRange.minVariantPrice.amount,
        image_url: edge.node.images.edges[0]?.node.url,
        variants: edge.node.variants.edges.map(v => ({
          id: v.node.id,
          title: v.node.title,
          available: v.node.availableForSale
        }))
      }));

      setProducts(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- IDENTITY LOGIC ---
  useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session) {
          // Here we ensure the user object has the shopify data we fetched during login
          setUser(session.user);
        }
      });

      return () => subscription.unsubscribe();
    }, []);

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await shopifyFetch(GET_PRODUCTS_QUERY, { first: 20 });
      if (response?.data?.products) {
        const formatted = response.data.products.edges.map(({ node }) => ({
          id: node.id,
          name: node.title,
          description: node.description,
          price: node.priceRange.minVariantPrice.amount,
          image_url: node.images.edges[0]?.node.url,
          images: node.images.edges.map(img => img.node.url),
          variants: node.variants.edges.map(v => ({
            id: v.node.id,
            title: v.node.title,
            available: v.node.availableForSale,
            stock: v.node.quantityAvailable || 0
          }))
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.error("Shopify Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const SSOHandler = () => {
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('return_to');
      if (returnTo) {
        window.location.href = returnTo;
      }
    }, []);
    return <div className="loading-screen">Authenticating with Astéri Studio...</div>;
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <Router>
      <LayoutWrapper
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout} // Pass this down
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
                fetchAllProducts={fetchProducts} // Using your initial fetch function
                addToCart={addToCart}
              />
            }
          />
          <Route
            path="/shop"
            element={<AllProducts allProducts={products} loading={loading} />}
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
          <Route path="/about" element={<About />} />
          <Route path="/callback" element={<Callback onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/customer_authentication/sso_hint" element={<SSOHandler />} />
        </Routes>
      </LayoutWrapper>

      {/* Global Overlays */}
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
        user={user} // Pass user to allow sync during checkout
        onRemove={removeFromCart}
        updateQuantity={updateQuantity}
        onOpenCart={() => setIsCartOpen(true)}
      />

    </Router>
  );
}

export default App;
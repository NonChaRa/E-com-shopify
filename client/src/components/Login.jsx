import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { shopifyFetch, CUSTOMER_TOKEN_CREATE_MUTATION } from './lib/shopify';
import './Auth.css';

const Login = ({ isOpen, onClose, onLoginSuccess, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // STEP 1: Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    try {
      // STEP 2: Fetch the Shopify ID from your Profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shopify_customer_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // STEP 3: Get a Shopify Access Token (Optional but recommended)
      // This token lets the user access their Shopify-specific data
      const shopifyResponse = await shopifyFetch(CUSTOMER_TOKEN_CREATE_MUTATION, {
        input: {
          email: email,
          password: password
        }
      });

      const tokenData = shopifyResponse?.data?.customerAccessTokenCreate?.customerAccessToken;
      const shopifyErrors = shopifyResponse?.data?.customerAccessTokenCreate?.customerUserErrors;

      if (shopifyErrors && shopifyErrors.length > 0) {
        console.warn("Shopify Token Sync Warning:", shopifyErrors[0].message);
      }

      // STEP 4: Send the combined user object back to your App state
      onLoginSuccess({
        ...authData.user,
        shopify_id: profile?.shopify_customer_id,
        shopify_token: tokenData?.accessToken || null
      });

      onClose();
    } catch (err) {
      console.error("Login Bridge Error:", err);
      // Even if Shopify fails, the user is still logged into Supabase
      onLoginSuccess(authData.user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>✕</button>

        <div className="auth-header">
          <h2>WELCOME BACK</h2>
          <span className="auth-subtitle">ASTÉRI Studio Login</span>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>EMAIL</label>
            <input
              className="auth-input"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : 'LOG IN ➜'}
          </button>
        </form>

        <p className="auth-toggle-text">
          NEW TO THE STUDIO?
          <span className="toggle-link" onClick={onOpenRegister}>JOIN HERE</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
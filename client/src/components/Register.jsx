import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { shopifyFetch, CUSTOMER_CREATE_MUTATION } from './lib/shopify';
import './Auth.css';

const Register = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validation Logic
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!privacyConsent) {
      alert("Please agree to the privacy policy to continue.");
      return;
    }

    setLoading(true);

    // 2. Create Supabase Auth Account
    // This handles the user's login credentials
    const { data: sbData, error: sbError } = await supabase.auth.signUp({
      email,
      password
    });

    if (sbError) {
      alert(`Supabase Error: ${sbError.message}`);
      setLoading(false);
      return;
    }

    try {
      // 3. Create Shopify Customer (The Bridge)
      // This ensures the user exists in your Shopify Admin for orders/marketing
      const shopifyResponse = await shopifyFetch(CUSTOMER_CREATE_MUTATION, {
        input: {
          email: email,
          password: password,
          acceptsMarketing: privacyConsent
        }
      });

      const shopifyId = shopifyResponse?.data?.customerCreate?.customer?.id;
      const shopifyErrors = shopifyResponse?.data?.customerCreate?.customerUserErrors;

      if (shopifyErrors && shopifyErrors.length > 0) {
        console.warn("Shopify Sync Warning:", shopifyErrors[0].message);
        // Note: We don't stop the whole process if Shopify fails,
        // but we log it so you can fix the record manually if needed.
      }

      // 4. Insert into the 'profiles' bridge table
      // This links the Supabase UUID with the Shopify GID
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: sbData.user.id,
          email: email,
          shopify_customer_id: shopifyId || null,
          consent_given: true
        }
      ]);

      if (profileError) {
        throw new Error(`Profile Table Error: ${profileError.message}`);
      }

      alert("Registration successful! Please check your email for a confirmation link.");
      onClose();
    } catch (err) {
      console.error("Bridge Error:", err.message);
      alert("Account created, but there was an issue syncing with our studio database. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>✕</button>

        <div className="auth-header">
          <h2>JOIN THE STUDIO</h2>
          <span className="auth-subtitle">✿ ASTÉRI Studio Registration</span>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
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
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>CONFIRM PASSWORD</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="privacy"
              required
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            <label htmlFor="privacy">
              I agree to the storing of my personal information for order processing.
            </label>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
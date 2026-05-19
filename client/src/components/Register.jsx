import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { shopifyFetch } from './lib/shopify';
import { CUSTOMER_CREATE_MUTATION } from './lib/queries';
import './Auth.css';

const Register = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!privacyConsent) {
      alert("Please agree to the privacy policy to continue.");
      return;
    }

    setLoading(true);

    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password
      });

      if (sbError) throw sbError;
      if (!sbData?.user) throw new Error("Authentication failed to generate user workspace.");

      let shopifyId = null;

      try {
        // Mirror the Profile Identity to Shopify
        const shopifyResponse = await shopifyFetch(CUSTOMER_CREATE_MUTATION, {
          input: {
            email: email,
            password: password,
            acceptsMarketing: privacyConsent
          }
        });

        const shopifyErrors = shopifyResponse?.data?.customerCreate?.customerUserErrors;

        if (shopifyErrors && shopifyErrors.length > 0) {
          console.warn("Shopify Customer Sync Exception:", shopifyErrors[0].message);
        } else {
          shopifyId = shopifyResponse?.data?.customerCreate?.customer?.id || null;
        }
      } catch (shopErr) {
        console.error("Shopify Connection Bridge Offline:", shopErr.message);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: sbData.user.id,
            email: email,
            shopify_customer_id: shopifyId,
            consent_given: true
          }
        ]);

      if (profileError) throw profileError;

      alert("Registration successful! If required by your settings, please check your email for a confirmation link.");

      // Reset input states on success
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPrivacyConsent(false);
      onClose();

    } catch (err) {
      console.error("Critical Studio Registration Failure:", err.message);
      alert(`Registration Error: ${err.message}`);
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
              value={email}
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
              value={password}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="privacy"
              required
              checked={privacyConsent}
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
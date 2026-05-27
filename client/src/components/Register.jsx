import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { shopifyFetch } from './lib/shopify';
import { CUSTOMER_CREATE_MUTATION } from './lib/queries';
import useRateLimit from '../hooks/useRateLimit';
import './Auth.css';

const Register = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('register', 30);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!privacyConsent) {
      setError('Please agree to the privacy policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({ email, password });

      if (sbError) throw sbError;
      if (!sbData?.user) throw new Error('Registration failed. Please try again.');

      let shopifyId = null;
      try {
        const shopifyResponse = await shopifyFetch(CUSTOMER_CREATE_MUTATION, {
          input: { email, password, acceptsMarketing: privacyConsent },
        });
        const shopifyErrors = shopifyResponse?.data?.customerCreate?.customerUserErrors;
        if (!shopifyErrors?.length) {
          shopifyId = shopifyResponse?.data?.customerCreate?.customer?.id || null;
        }
      } catch (shopErr) {
        console.error('Shopify sync error:', shopErr.message);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: sbData.user.id,
          email,
          shopify_customer_id: shopifyId,
          consent_given: true,
        }]);

      if (profileError) throw profileError;

      recordSubmission();
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPrivacyConsent(false);
    } catch (err) {
      console.error('Registration error:', err.message);
      setError(err.message);
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
        </div>

        {success ? (
          <div className="auth-success-state">
            <p className="auth-success-msg">Account created! Check your email to confirm your address.</p>
            <button className="auth-submit-btn" onClick={onClose}>CLOSE</button>
          </div>
        ) : (
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
                placeholder="min. 8 characters"
                required
                minLength={8}
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

            {error && <p className="auth-error-msg">{error}</p>}

            <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
              {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;

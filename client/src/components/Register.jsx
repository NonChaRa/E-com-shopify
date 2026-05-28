import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { shopifyFetch } from './lib/shopify';
import { CUSTOMER_CREATE_MUTATION } from './lib/queries';
import useRateLimit from '../hooks/useRateLimit';
import heroImg from '../assets/Loyalty-bg.avif';
import './Auth.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.18 + i * 0.09, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const Register = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('register', 30);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!privacyConsent) { setError('Please agree to the privacy policy to continue.'); return; }
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
        if (!shopifyErrors?.length) shopifyId = shopifyResponse?.data?.customerCreate?.customer?.id || null;
      } catch (shopErr) {
        console.error('Shopify sync error:', shopErr.message);
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: sbData.user.id, email, shopify_customer_id: shopifyId, consent_given: true }]);
      if (profileError) throw profileError;
      recordSubmission();
      setSuccess(true);
      setEmail(''); setPassword(''); setConfirmPassword(''); setPrivacyConsent(false);
    } catch (err) {
      console.error('Registration error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="auth-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="auth-modal-positioner">
            <motion.div
              className="auth-split-modal auth-split-modal--register"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* ── LEFT: Form ── */}
              <div className="auth-form-side">
                <button className="close-modal" onClick={onClose} aria-label="Close">✕</button>

                <p className="auth-brand-mark">
                  <span className="auth-brand-dot" />
                  ASTÉRI 2K STUDIO
                </p>

                <div className="auth-header">
                  <h2>JOIN THE STUDIO</h2>
                  <span className="auth-subtitle">Create your account to get started</span>
                </div>

                {success ? (
                  <motion.div
                    className="auth-success-state"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="auth-success-msg">
                      Account created! Check your email to confirm your address.
                    </p>
                    <button className="auth-submit-btn" onClick={onClose}>CLOSE</button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRegister} className="auth-form">
                    <motion.div className="input-group" custom={0} variants={fieldVariants} initial="hidden" animate="visible">
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
                    </motion.div>

                    <motion.div className="input-group" custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                      <label>PASSWORD</label>
                      <div className="auth-input-wrapper">
                        <input
                          className="auth-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="min. 8 characters"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div className="input-group" custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                      <label>CONFIRM PASSWORD</label>
                      <div className="auth-input-wrapper">
                        <input
                          className="auth-input"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div className="checkbox-group" custom={3} variants={fieldVariants} initial="hidden" animate="visible">
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
                    </motion.div>

                    {error && (
                      <motion.p
                        className="auth-error-msg"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                      <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
                        {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'CREATE ACCOUNT'}
                      </button>
                    </motion.div>
                  </form>
                )}
              </div>

              {/* ── RIGHT: Hero image ── */}
              <div className="auth-hero-side">
                <img src={heroImg} alt="ASTÉRI studio" className="auth-hero-img" />
                <div className="auth-hero-overlay">
                  <div className="auth-hero-content">
                    <p className="auth-hero-eyebrow">MADE TO ORDER ✦ LIMITED EDITION</p>
                    <h3 className="auth-hero-title">Join the studio. Your nails, your story.</h3>
                    <p className="auth-hero-desc">Members get early access to new collections and exclusive studio drops.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Register;

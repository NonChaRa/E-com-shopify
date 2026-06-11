import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { shopifyFetch } from './lib/shopify';
import { CUSTOMER_CREATE_MUTATION } from './lib/queries';
import useRateLimit from '../hooks/useRateLimit';
import heroImg from '../assets/Loyalty-bg.avif';
import { createLogger } from '../utils/logger';
import './Auth.css';

const log = createLogger('Register');

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] } },
  exit:    { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] } },
};

const fieldVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: 0.18 + i * 0.09, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const Register = ({ isOpen, onClose, onOpenLogin }) => {
  const [step, setStep]               = useState('form'); // 'form' | 'verify' | 'done'
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [privacyConsent, setPrivacyConsent]   = useState(false);
  const [otp, setOtp]                 = useState('');
  const [pendingUser, setPendingUser] = useState(null); // { id, email }
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('register', 30);

  const resetAll = () => {
    setStep('form');
    setEmail(''); setPassword(''); setConfirmPassword('');
    setOtp(''); setPendingUser(null); setError('');
    setPrivacyConsent(false);
  };

  const handleClose = () => { resetAll(); onClose(); };

  // ── STEP 1: sign up ──────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword)  { setError('Passwords do not match.'); return; }
    if (!privacyConsent)               { setError('Please agree to the privacy policy to continue.'); return; }
    setLoading(true);
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({ email, password });
      if (sbError) throw sbError;
      if (!sbData?.user) throw new Error('Registration failed. Please try again.');

      recordSubmission();
      setPendingUser({ id: sbData.user.id, email });

      // If Supabase auto-confirms (no email confirmation enabled in dashboard),
      // session is returned immediately — skip OTP step and finish setup now.
      if (sbData.session) {
        await finishSetup(sbData.user.id, email);
        setStep('done');
      } else {
        // Email confirmation required — show OTP entry step
        setStep('verify');
      }
    } catch (err) {
      log.error('Registration failed', { error: err, action: 'handleRegister' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: verify OTP ───────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length < 6) { setError('Please enter the 6-digit code from your email.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingUser.email,
        token: otp.trim(),
        type: 'signup',
      });
      if (verifyError) throw verifyError;
      await finishSetup(pendingUser.id, pendingUser.email);
      setStep('done');
    } catch (err) {
      log.error('OTP verification failed', { error: err, action: 'handleVerify' });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: pendingUser.email });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Shared: create profile + Shopify customer ────────────────
  const finishSetup = async (userId, userEmail) => {
    let shopifyId = null;
    try {
      const res = await shopifyFetch(CUSTOMER_CREATE_MUTATION, {
        input: { email: userEmail, password, acceptsMarketing: privacyConsent },
      });
      const errs = res?.data?.customerCreate?.customerUserErrors;
      if (!errs?.length) shopifyId = res?.data?.customerCreate?.customer?.id || null;
    } catch (shopErr) {
      log.warn('Shopify customer sync failed (non-fatal)', { error: shopErr, action: 'shopifySync' });
    }
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{ id: userId, email: userEmail, shopify_customer_id: shopifyId, consent_given: true }]);
    if (profileError) throw profileError;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="auth-backdrop" variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit" onClick={handleClose} />

          <div className="auth-modal-positioner">
            <motion.div className="auth-split-modal auth-split-modal--register"
              variants={modalVariants} initial="hidden" animate="visible" exit="exit">

              {/* ── LEFT: Form ── */}
              <div className="auth-form-side">
                <button className="close-modal" onClick={handleClose} aria-label="Close">✕</button>

                <p className="auth-brand-mark">
                  <span className="auth-brand-dot" />
                  ASTÉRI 2K STUDIO
                </p>

                {/* ── DONE ── */}
                {step === 'done' && (
                  <motion.div className="auth-success-state"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                      <h2>YOU'RE IN</h2>
                    </div>
                    <p className="auth-success-msg">
                      Welcome to ASTÉRI 2K Studio. Your account is ready.
                    </p>
                    <button className="auth-submit-btn" onClick={handleClose}>START SHOPPING ➜</button>
                  </motion.div>
                )}

                {/* ── STEP 2: OTP verify ── */}
                {step === 'verify' && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <div className="auth-header">
                      <h2>CHECK EMAIL</h2>
                      <span className="auth-subtitle">
                        We sent a 6-digit code to <strong>{pendingUser?.email}</strong>
                      </span>
                    </div>

                    <form onSubmit={handleVerify} className="auth-form">
                      <div className="input-group">
                        <label>CONFIRMATION CODE</label>
                        <input
                          className="auth-input auth-otp-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="000000"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          autoFocus
                        />
                      </div>

                      {error && (
                        <motion.p className="auth-error-msg"
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          {error}
                        </motion.p>
                      )}

                      <button className="auth-submit-btn" type="submit" disabled={loading}>
                        {loading ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}
                      </button>
                    </form>

                    <p className="auth-toggle-text" style={{ marginTop: 16 }}>
                      DIDN'T RECEIVE IT?{' '}
                      <span className="toggle-link" onClick={handleResend} role="button" tabIndex={0}>
                        RESEND CODE
                      </span>
                    </p>
                    <p className="auth-toggle-text">
                      <span className="toggle-link" onClick={() => { setStep('form'); setOtp(''); setError(''); }} role="button" tabIndex={0}>
                        ← BACK
                      </span>
                    </p>
                  </motion.div>
                )}

                {/* ── STEP 1: Registration form ── */}
                {step === 'form' && (
                  <>
                    <div className="auth-header">
                      <h2>JOIN THE STUDIO</h2>
                      <span className="auth-subtitle">Create your account to get started</span>
                    </div>

                    <form onSubmit={handleRegister} className="auth-form">
                      <motion.div className="input-group" custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                        <label>EMAIL</label>
                        <input className="auth-input" type="email" placeholder="your@email.com"
                          required autoComplete="email" value={email}
                          onChange={(e) => setEmail(e.target.value)} />
                      </motion.div>

                      <motion.div className="input-group" custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                        <label>PASSWORD</label>
                        <div className="auth-input-wrapper">
                          <input className="auth-input" type={showPassword ? 'text' : 'password'}
                            placeholder="min. 8 characters" required minLength={8}
                            autoComplete="new-password" value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div className="input-group" custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                        <label>CONFIRM PASSWORD</label>
                        <div className="auth-input-wrapper">
                          <input className="auth-input" type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••" required autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} />
                          <button type="button" className="password-toggle"
                            onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div className="checkbox-group" custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                        <input type="checkbox" id="privacy" required
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)} />
                        <label htmlFor="privacy">
                          I agree to the storing of my personal information for order processing.
                        </label>
                      </motion.div>

                      {error && (
                        <motion.p className="auth-error-msg"
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          {error}
                        </motion.p>
                      )}

                      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                        <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
                          {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'CREATE ACCOUNT'}
                        </button>
                      </motion.div>
                    </form>

                    <motion.p className="auth-toggle-text" custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                      ALREADY HAVE AN ACCOUNT?{' '}
                      <span className="toggle-link" onClick={() => { handleClose(); onOpenLogin?.(); }} role="button" tabIndex={0}>
                        SIGN IN
                      </span>
                    </motion.p>
                  </>
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

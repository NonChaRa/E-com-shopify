import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import useRateLimit from '../hooks/useRateLimit';
import { useToast } from '../store/ToastContext';
import heroImg from '../assets/Blue-flower-bg.avif';
import './Auth.css';

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

const Login = ({ isOpen, onClose, onLoginSuccess, onOpenRegister }) => {
  const [view, setView]               = useState('login'); // 'login' | 'forgot'
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [forgotSent, setForgotSent]   = useState(false);
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('login', 5);
  const { showToast } = useToast();

  const resetAll = () => {
    setView('login'); setEmail(''); setPassword('');
    setError(''); setForgotSent(false);
  };

  const handleClose = () => { resetAll(); onClose(); };

  // ── Sign in ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const { data: profile } = await supabase
        .from('profiles')
        .select('shopify_customer_id')
        .eq('id', authData.user.id)
        .single();
      onLoginSuccess({ ...authData.user, shopify_id: profile?.shopify_customer_id || null });
      showToast('Welcome back! ✦', 'success');
      handleClose();
    } catch (err) {
      recordSubmission();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ──────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setForgotSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="auth-backdrop" variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit" onClick={handleClose} />

          <div className="auth-modal-positioner">
            <motion.div className="auth-split-modal" variants={modalVariants}
              initial="hidden" animate="visible" exit="exit">

              {/* ── LEFT: Form ── */}
              <div className="auth-form-side">
                <button className="close-modal" onClick={handleClose} aria-label="Close">✕</button>

                <p className="auth-brand-mark">
                  <span className="auth-brand-dot" />
                  ASTÉRI 2K STUDIO
                </p>

                {/* ── FORGOT PASSWORD VIEW ── */}
                {view === 'forgot' && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="auth-header">
                      <h2>RESET PASSWORD</h2>
                      <span className="auth-subtitle">
                        {forgotSent
                          ? 'Check your inbox for the reset link.'
                          : "Enter your email and we'll send a reset link."}
                      </span>
                    </div>

                    {forgotSent ? (
                      <div className="auth-success-state">
                        <p className="auth-success-msg">
                          A password reset link has been sent to <strong>{email}</strong>.
                          Click the link in the email to set a new password.
                        </p>
                        <button className="auth-submit-btn" onClick={() => { setView('login'); setForgotSent(false); }}>
                          BACK TO SIGN IN
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgot} className="auth-form">
                        <div className="input-group">
                          <label>EMAIL</label>
                          <input className="auth-input" type="email" placeholder="your@email.com"
                            required autoComplete="email" value={email}
                            onChange={(e) => setEmail(e.target.value)} autoFocus />
                        </div>

                        {error && (
                          <motion.p className="auth-error-msg"
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            {error}
                          </motion.p>
                        )}

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                          {loading ? 'SENDING...' : 'SEND RESET LINK ➜'}
                        </button>
                      </form>
                    )}

                    {!forgotSent && (
                      <p className="auth-toggle-text" style={{ marginTop: 16 }}>
                        <span className="toggle-link" onClick={() => { setView('login'); setError(''); }} role="button" tabIndex={0}>
                          ← BACK TO SIGN IN
                        </span>
                      </p>
                    )}
                  </motion.div>
                )}

                {/* ── LOGIN VIEW ── */}
                {view === 'login' && (
                  <>
                    <div className="auth-header">
                      <h2>WELCOME BACK</h2>
                      <span className="auth-subtitle">Sign in to your studio account</span>
                    </div>

                    <form onSubmit={handleLogin} className="auth-form">
                      <motion.div className="input-group" custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                        <label>EMAIL</label>
                        <input className="auth-input" type="email" placeholder="your@email.com"
                          required autoComplete="email" value={email}
                          onChange={(e) => setEmail(e.target.value)} />
                      </motion.div>

                      <motion.div className="input-group" custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                        <div className="auth-field-row">
                          <label>PASSWORD</label>
                          <span className="auth-forgot-link" onClick={() => { setView('forgot'); setError(''); }}
                            role="button" tabIndex={0}>
                            FORGOT PASSWORD?
                          </span>
                        </div>
                        <div className="auth-input-wrapper">
                          <input className="auth-input" type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••" required autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </motion.div>

                      {error && (
                        <motion.p className="auth-error-msg"
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          {error}
                        </motion.p>
                      )}

                      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                        <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
                          {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'LOG IN ➜'}
                        </button>
                      </motion.div>
                    </form>

                    <motion.p className="auth-toggle-text" custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                      NEW TO THE STUDIO?{' '}
                      <span className="toggle-link" onClick={() => { handleClose(); onOpenRegister?.(); }} role="button" tabIndex={0}>
                        JOIN HERE
                      </span>
                    </motion.p>
                  </>
                )}
              </div>

              {/* ── RIGHT: Hero image ── */}
              <div className="auth-hero-side">
                <img src={heroImg} alt="ASTÉRI nail art" className="auth-hero-img" />
                <div className="auth-hero-overlay">
                  <div className="auth-hero-content">
                    <p className="auth-hero-eyebrow">HANDMADE ✦ PRESS-ON NAILS</p>
                    <h3 className="auth-hero-title">Crafted for your hands. Ready to wear.</h3>
                    <p className="auth-hero-desc">Each set handpainted in Bangkok. Made to order. Ships worldwide in 3–4 days.</p>
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

export default Login;

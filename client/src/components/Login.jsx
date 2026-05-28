import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import useRateLimit from '../hooks/useRateLimit';
import heroImg from '../assets/Blue-flower-bg.avif';
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

const Login = ({ isOpen, onClose, onLoginSuccess, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('login', 5);

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
      onClose();
    } catch (err) {
      recordSubmission();
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
              className="auth-split-modal"
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
                  <h2>WELCOME BACK</h2>
                  <span className="auth-subtitle">Sign in to your studio account</span>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
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
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
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

                  <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                    <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
                      {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'LOG IN ➜'}
                    </button>
                  </motion.div>
                </form>

                <motion.p
                  className="auth-toggle-text"
                  custom={3}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  NEW TO THE STUDIO?{' '}
                  <span className="toggle-link" onClick={onOpenRegister} role="button" tabIndex={0}>
                    JOIN HERE
                  </span>
                </motion.p>
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

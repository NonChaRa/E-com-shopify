import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import useRateLimit from '../hooks/useRateLimit';
import './Auth.css';

const Login = ({ isOpen, onClose, onLoginSuccess, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('login', 5);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('shopify_customer_id')
        .eq('id', authData.user.id)
        .single();

      onLoginSuccess({
        ...authData.user,
        shopify_id: profile?.shopify_customer_id || null,
      });

      onClose();
    } catch (err) {
      recordSubmission();
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
          <h2>WELCOME BACK</h2>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error-msg">{error}</p>}

          <button className="auth-submit-btn" type="submit" disabled={loading || !canSubmit}>
            {loading ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'LOG IN ➜'}
          </button>
        </form>

        <p className="auth-toggle-text">
          NEW TO THE STUDIO?{' '}
          <span className="toggle-link" onClick={onOpenRegister}>JOIN HERE</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

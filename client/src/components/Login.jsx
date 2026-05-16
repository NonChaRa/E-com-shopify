import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Login = ({ isOpen, onClose, onLoginSuccess, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // STEP 1: Authenticate directly with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // STEP 2: Grab the matching profile row to get the shopify_customer_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shopify_customer_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.warn("Profile mapping row not found during login setup:", profileError.message);
      }

      // STEP 3: Pass the clean user session data straight up to App state
      onLoginSuccess({
        ...authData.user,
        shopify_id: profile?.shopify_customer_id || null
      });

      onClose();
    } catch (err) {
      console.error("Login Authentication Failure:", err.message);
      alert(err.message);
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

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : 'LOG IN ➜'}
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
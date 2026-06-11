import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady]               = useState(false);
  const [tokenError, setTokenError]     = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type      = params.get('type');

    if (tokenHash && type === 'recovery') {
      // PKCE flow — exchange token_hash for a session.
      // Add a 100ms delay so App.jsx's onAuthStateChange listener
      // finishes its INITIAL_SESSION pass before we write the new session,
      // avoiding the localStorage lock race.
      const timer = setTimeout(async () => {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (verifyError) {
          setTokenError(
            'This reset link has expired or already been used. Please request a new one.'
          );
        } else {
          setReady(true);
        }
      }, 150);
      return () => clearTimeout(timer);
    }

    // Legacy implicit flow — listen for PASSWORD_RECOVERY event from hash fragment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Also handle page refresh with an existing recovery session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword)  { setError('Passwords do not match.'); return; }
    setLoading(true);

    // Retry once after 300ms if the first attempt hits the lock race.
    const tryUpdate = async () => {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError?.message?.includes('lock')) {
        await new Promise(r => setTimeout(r, 300));
        return supabase.auth.updateUser({ password });
      }
      return { error: updateError };
    };

    try {
      const { error: updateError } = await tryUpdate();
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        <p className="rp-brand">
          <span className="rp-brand-dot" />
          ASTÉRI 2K STUDIO
        </p>

        {done ? (
          <>
            <h1 className="rp-title">PASSWORD UPDATED</h1>
            <p className="rp-subtitle">Your password has been changed. Redirecting you home…</p>
          </>

        ) : tokenError ? (
          <>
            <h1 className="rp-title">LINK EXPIRED</h1>
            <p className="rp-subtitle">{tokenError}</p>
            <button className="rp-submit" onClick={() => navigate('/')}>
              RETURN HOME
            </button>
          </>

        ) : !ready ? (
          <>
            <h1 className="rp-title">CHECKING LINK…</h1>
            <p className="rp-subtitle">
              Verifying your reset link. If nothing happens,{' '}
              <span className="rp-link" onClick={() => navigate('/')} role="button" tabIndex={0}>
                return home
              </span>{' '}
              and request a new one.
            </p>
          </>

        ) : (
          <>
            <h1 className="rp-title">NEW PASSWORD</h1>
            <p className="rp-subtitle">Choose a strong password for your account.</p>

            <form onSubmit={handleReset} className="rp-form">
              <div className="rp-field">
                <label className="rp-label">NEW PASSWORD</label>
                <div className="rp-input-wrap">
                  <input
                    className="rp-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button type="button" className="rp-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="rp-field">
                <label className="rp-label">CONFIRM PASSWORD</label>
                <div className="rp-input-wrap">
                  <input
                    className="rp-input"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className="rp-eye"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="rp-error">{error}</p>}

              <button className="rp-submit" type="submit" disabled={loading}>
                {loading ? 'UPDATING…' : 'SET NEW PASSWORD ➜'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
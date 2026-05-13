import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Callback = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // 1. Validate State from sessionStorage
    const savedState = sessionStorage.getItem('shopify_auth_state');

    if (code && state === savedState) {
      handleTokenExchange(code);
    } else if (state && state !== savedState) {
      console.error("Security alert: State mismatch.");
    }
  }, [searchParams]);

  const handleTokenExchange = async (code) => {
    const codeVerifier = sessionStorage.getItem('shopify_code_verifier');

    // Use your custom branded domain from .env
    const accountDomain = import.meta.env.VITE_SHOPIFY_ACCOUNT_DOMAIN;
    const tokenUrl = `https://${accountDomain}/auth/oauth/token`;

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: import.meta.env.VITE_SHOPIFY_CLIENT_ID,
          redirect_uri: import.meta.env.VITE_SHOPIFY_REDIRECT_URI,
          code: code,
          code_verifier: codeVerifier,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        // Store the token for API calls (session-based)
        sessionStorage.setItem('shopify_access_token', data.access_token);

        if (onLoginSuccess) {
          onLoginSuccess(data.access_token);
        }

        // Cleanup security credentials
        sessionStorage.removeItem('shopify_code_verifier');
        sessionStorage.removeItem('shopify_auth_state');

        navigate('/account');
      } else {
        console.error("Token exchange failed:", data);
      }
    } catch (err) {
      console.error("Network error during exchange:", err);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2 style={{ letterSpacing: '1px' }}>VERIFYING SESSION...</h2>
      <p>Returning to the studio.</p>
    </div>
  );
};

export default Callback;
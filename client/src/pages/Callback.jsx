import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      handleTokenExchange(code);
    }
  }, [searchParams]);

  const handleTokenExchange = async (code) => {
      const codeVerifier = localStorage.getItem('shopify_code_verifier');
    try {
      const response = await fetch(`https://shopify.com/authentication/87903484066/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: import.meta.env.VITE_SHOPIFY_CLIENT_ID,
          redirect_uri: import.meta.env.VITE_SHOPIFY_REDIRECT_URI,
          code: code,
          code_verifier: codeVerifier, // Send the verifier here!
        }),
      });

      const data = await response.json();
      console.log("Token Data:", data);

      if (data.access_token) {
        // 1. Tell the App component we are logged in
        onLoginSuccess(data.access_token);

        // 2. ONLY THEN navigate away
        navigate('/account');
      }
    } catch (err) {
      console.error("Exchange failed:", err);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h2>Syncing with Astéri Studio...</h2>
      <p>Hold on, we're retrieving your profile.</p>
    </div>
  );
};

export default Callback;
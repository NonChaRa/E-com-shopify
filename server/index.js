const express = require('express');
const cors    = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ── Supabase (service-role key — server-only, never sent to browser) ───────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // use service role, not anon key
);

// ── CORS — allow only the production origin and local dev ──────────────────
const ALLOWED_ORIGINS = [
  'https://asteri2kstudio.com',
  'https://www.asteri2kstudio.com',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server calls (no origin header) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ── Admin auth middleware ──────────────────────────────────────────────────
// Verifies the Supabase JWT from the client and checks the email is in the
// ADMIN_EMAILS env var (comma-separated list set in your hosting dashboard).
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid or expired session' });

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email.toLowerCase())) {
      return res.status(403).json({ error: 'Forbidden: admin access only' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// ── Routes ────────────────────────────────────────────────────────────────

// Public read — product list (no auth needed, products are public)
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, image_url, description')  // explicit columns, never *
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });  // never leak err.message in prod
  }
});

// Admin-only: create product
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, price, image_url, description } = req.body;

    if (!name || !price || !image_url) {
      return res.status(400).json({ error: 'name, price, and image_url are required' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'price must be a positive number' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price: parsedPrice, image_url, description: description || '' }])
      .select('id, name, price, image_url, description');

    if (error) return res.status(400).json({ error: 'Failed to create product' });
    res.status(201).json(data[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only: delete product
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/test', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

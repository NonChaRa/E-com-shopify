const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js'); // Use Supabase client
require('dotenv').config();

const app = express();

// 1. Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 2. Enable CORS (Must be before routes)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// --- THE MISSING GET ROUTE ---
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new nail set (Create)
app.post('/api/products', async (req, res) => {
  try {
    // We pull name, price, and image_url from the React request
    const { name, price, image_url, description } = req.body;

    console.log("Attempting to save:", { name, price, image_url });

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name,
          price: parseFloat(price), // Converts "2000" string to a number
          image_url: image_url,
          description: description || '',
          // We leave category_id out for now so it doesn't crash
          // Or you can hardcode it to a valid ID from your categories table:
          // category_id: 1
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json(error);
    }

    res.json(data[0]);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a product (Delete)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/test', (req, res) => {
  res.send("Server is alive! 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
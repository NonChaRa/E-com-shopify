import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const AdminPanel = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Classic' });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('product-images') // Make sure this bucket exists in Supabase!
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // 3. Send data to your Node server
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image_url: imageUrl }),
      });

      if (response.ok) {
        alert("New nail set live! 💅");
        onRefresh(); // Refresh the grid in App.jsx
        setFormData({ name: '', price: '', category: 'Classic' });
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', maxWidth: '500px', margin: '40px auto' }}>
      <h2 style={{ fontStyle: 'italic' }}>Manage Inventory</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Product Name" required
          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

        <input type="number" placeholder="Price (THB)" required
          value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />

        <input type="file" accept="image/*" required
          onChange={e => setFile(e.target.files[0])} />

        <button className="buy-button" type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Add Nail Set +'}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
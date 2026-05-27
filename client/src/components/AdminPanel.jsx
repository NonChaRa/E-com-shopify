import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const AdminPanel = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Classic' });
  const [file, setFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatusMsg('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image_url: urlData.publicUrl }),
      });

      if (!response.ok) throw new Error('Failed to save product.');

      setStatusMsg('New nail set is live!');
      onRefresh();
      setFormData({ name: '', price: '', category: 'Classic' });
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error uploading product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', maxWidth: '500px', margin: '40px auto' }}>
      <h2 style={{ fontStyle: 'italic' }}>Manage Inventory</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Product Name"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price (THB)"
          required
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          required
          onChange={e => setFile(e.target.files[0])}
        />
        <button className="buy-button" type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Add Nail Set +'}
        </button>
      </form>
      {statusMsg && <p style={{ color: 'green', marginTop: '12px' }}>{statusMsg}</p>}
      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
    </div>
  );
};

export default AdminPanel;

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './InquiryModal.css';
import { supabase } from '../supabaseClient';

const InquiryModal = ({ product, size, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('preorder_inquiries').insert([{
      customer_email: email,
      product_name: product.name,
      requested_size: size,
      status: 'pending'
    }]);

    if (!error) {
      alert("Inquiry sent successfully!");
      onClose();
    } else {
      console.error("Supabase error:", error.message);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Using Portal ensures the modal stays on top of all editorial layers
  return ReactDOM.createPortal(
    <div className="inquiry-portal-overlay" onClick={onClose}>
      <div className="inquiry-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>×</button>

        <div className="modal-header-minimal">
          <h2 className="pdp-name-title">Custom Size Inquiry</h2>
          <p className="pdp-description-content">
            The size <strong>{size}</strong> for <strong>{product.name}</strong> is currently unavailable.
            Leave your email and we'll notify you about restocks or custom orders.
          </p>
        </div>

        <form className="inquiry-form-clean" onSubmit={handleSubmit}>
          <div className="minimal-input-group">
            <label className="section-label">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="submit" className="add-to-cart-primary" disabled={loading}>
              {loading ? 'SENDING...' : 'REQUEST RESTOCK'}
            </button>
            <button type="button" className="pdp-global-back" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default InquiryModal;
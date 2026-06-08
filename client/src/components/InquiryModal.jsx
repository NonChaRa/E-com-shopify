import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { useToast } from '../store/ToastContext';
import useRateLimit from '../hooks/useRateLimit';
import { createLogger } from '../utils/logger';
import './InquiryModal.css';

const log = createLogger('InquiryModal');

const InquiryModal = ({ product, size, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { canSubmit, recordSubmission } = useRateLimit('inquiry', 30);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    const { error } = await supabase.from('preorder_inquiries').insert([{
      customer_email: email,
      product_name: product.name,
      requested_size: size,
      status: 'pending',
    }]);

    setLoading(false);

    if (error) {
      log.error('Inquiry submission failed', { error, action: 'handleSubmit', data: { product: product.name, size } });
      showToast('Something went wrong. Please try again.', 'error');
    } else {
      recordSubmission();
      showToast("Inquiry sent. We'll be in touch!", 'success');
      onClose();
    }
  };

  return createPortal(
    <div className="inquiry-portal-overlay" onClick={onClose}>
      <div className="inquiry-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose}>×</button>

        <div className="modal-header-minimal">
          <h2 className="pdp-name-title">Custom Size Inquiry</h2>
          <p className="pdp-description-content">
            The size <strong>{size}</strong> for <strong>{product.name}</strong> is currently
            unavailable. Leave your email and we'll notify you about restocks or custom orders.
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
              disabled={loading || !canSubmit}
            />
          </div>

          <div className="modal-footer-actions">
            <button type="submit" className="add-to-cart-primary" disabled={loading || !canSubmit}>
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

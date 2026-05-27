import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useRateLimit from '../hooks/useRateLimit';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('contact', 60);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setStatusMsg('');

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          message: formData.message,
        }]);

      if (error) throw error;

      recordSubmission();
      setStatusMsg('THANK YOU. YOUR INQUIRY HAS BEEN TRANSMITTED TO THE STUDIO. ✿');
      setFormData({ name: '', surname: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatusMsg('TRANSMISSION FAILURE. PLEASE RETRY OR REACH OUT VIA SOCIAL CHANNELS.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
      <header className="contact-header">
        <h1>Contact</h1>
        <p className="contact-subtitle">
          We will be happy to help you with your inquiries, the services and products you receive.
        </p>
      </header>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row-dual">
          <div className="input-group">
            <label>NAME</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>
          <div className="input-group">
            <label>SURNAME</label>
            <input
              type="text"
              name="surname"
              required
              value={formData.surname}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="input-group">
          <label>EMAIL *</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={handleInputChange}
            disabled={submitting}
          />
        </div>

        <div className="input-group">
          <label>MESSAGE</label>
          <textarea
            name="message"
            placeholder="Your message"
            rows="6"
            required
            value={formData.message}
            onChange={handleInputChange}
            disabled={submitting}
          />
        </div>

        <button type="submit" className="contact-send-btn" disabled={submitting || !canSubmit}>
          {submitting ? 'TRANSMITTING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'SEND MESSAGE'}
        </button>

        {statusMsg && <p className="contact-status-alert-text">{statusMsg}</p>}
      </form>
    </div>
  );
};

export default Contact;

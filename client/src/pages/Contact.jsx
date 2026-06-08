import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useRateLimit from '../hooks/useRateLimit';
import { animate, stagger } from 'animejs';
import { createLogger } from '../utils/logger';
import './Contact.css';

const log = createLogger('Contact');

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('contact', 60);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    animate(['.contact-eyebrow', '.contact-h1', '.contact-rule', '.contact-subtitle'], {
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(110, { start: 60 }),
      easing: 'easeOutExpo',
    });
    animate('.contact-form-col', {
      translateY: [28, 0],
      opacity: [0, 1],
      duration: 720,
      delay: 300,
      easing: 'easeOutExpo',
    });
    animate('.contact-info-col', {
      translateX: [20, 0],
      opacity: [0, 1],
      duration: 720,
      delay: 420,
      easing: 'easeOutExpo',
    });
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
    setStatusType('');

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
      setStatusType('success');
      setStatusMsg('Thank you. Your inquiry has been transmitted to the studio.');
      setFormData({ name: '', surname: '', email: '', message: '' });
    } catch (err) {
      log.error('Contact form submission failed', { error: err, action: 'handleSubmit' });
      setStatusType('error');
      setStatusMsg('Transmission failed. Please retry or reach out via social channels.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      {/* ── HEADER ── */}
      <header className="contact-header">
        <div className="contact-header-inner">
          <span className="contact-eyebrow">STUDIO INQUIRIES</span>
          <h1 className="contact-h1">Contact</h1>
          <div className="contact-rule" aria-hidden="true" />
          <p className="contact-subtitle">
            We're happy to help with inquiries about services, custom orders, and collaborations.
          </p>
        </div>
      </header>

      {/* ── SPLIT LAYOUT ── */}
      <div className="contact-body">

        {/* LEFT — Form */}
        <div className="contact-form-col">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-row-dual">
              <div className="contact-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>
              <div className="contact-field">
                <label>Surname</label>
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

            <div className="contact-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <div className="contact-field">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Tell us about your inquiry…"
                rows="6"
                required
                value={formData.message}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            {statusMsg && (
              <p className={`contact-status ${statusType === 'success' ? 'contact-status--ok' : 'contact-status--err'}`}>
                {statusMsg}
              </p>
            )}

            <button type="submit" className="contact-send-btn" disabled={submitting || !canSubmit}>
              {submitting ? 'Transmitting…' : !canSubmit ? `Wait ${secondsLeft}s` : 'Send Message ➜'}
            </button>
          </form>
        </div>

        {/* RIGHT — Studio Info */}
        <aside className="contact-info-col">
          <div className="contact-info-card">
            <span className="contact-info-eyebrow">FIND US</span>
            <div className="contact-info-rule" aria-hidden="true" />

            <dl className="contact-info-list">
              <dt>Studio</dt>
              <dd>ASTÉRI2K Studio<br />Bangkok, Thailand</dd>

              <dt>Email</dt>
              <dd>
                <a href="mailto:hello@asteri2k.com">asteri2kstudio@gmail.com</a>
              </dd>

              <dt>Instagram</dt>
              <dd>
                <a href="https://instagram.com/asteri2k" target="_blank" rel="noopener noreferrer">
                  @_etoilesartnail_
                </a>
              </dd>

              <dt>Response time</dt>
              <dd>Within 1–2 business days</dd>

              <dt>Orders</dt>
              <dd>Made to order · Ships worldwide<br />3–4 day production</dd>
            </dl>

            <div className="contact-info-note">
              <span className="contact-info-note-rule" aria-hidden="true" />
              <p>For urgent custom requests, DM us on Instagram for the fastest response.</p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Contact;

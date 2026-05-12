import React, { useState, useEffect } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    contactMethod: [],
    email: '',
    message: ''
  });
  useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message Sent:", formData);
    alert("Thank you! Your inquiry has been sent to Astéri Studio.");
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
              required
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>SURNAME</label>
            <input
              type="text"
              required
              onChange={(e) => setFormData({...formData, surname: e.target.value})}
            />
          </div>
        </div>

        <div className="input-group method-group">
          <label>HOW WOULD YOU LIKE US TO CONTACT YOU?</label>
          <div className="checkbox-row">
            {['EMAIL', 'TELEPHONE', 'SMS'].map((method) => (
              <label key={method} className="custom-checkbox">
                <input type="checkbox" name="contactMethod" value={method} />
                <span className="checkbox-label">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>EMAIL *</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="input-group">
          <label>MESSAGE</label>
          <textarea
            placeholder="Your message"
            rows="6"
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          ></textarea>
        </div>

        <button type="submit" className="contact-send-btn">
          SEND MESSAGE
        </button>
      </form>
    </div>
  );
};

export default Contact;
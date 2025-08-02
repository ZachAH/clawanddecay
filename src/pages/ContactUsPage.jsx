import React, { useState } from 'react';
import './ContactUsPage.css';

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    })
      .then(() => setSubmitted(true))
      .catch(() => alert('Oops! Something went wrong.'));
  };

  if (submitted) {
    return (
      <div className="contact-thanks">
        <h2>Thanks for reaching out!</h2>
        <p>We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <section className="contact-page">
      <h1>Contact Us</h1>
      <form
        name="contact"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        netlify
      >
        {/* Hidden input to identify the form */}
        <input type="hidden" name="form-name" value="contact" />

        {/* Honeypot for spam */}
        <p className="hidden" style={{ display: 'none' }}>
          <label>
            Don’t fill this out if you’re human: <input name="bot-field" />
          </label>
        </p>

        <label>
          Name
          <input type="text" name="name" required />
        </label>

        <label>
          Email
          <input type="email" name="email" required />
        </label>

        <label>
          Message
          <textarea name="message" rows="5" required />
        </label>

        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ContactPage;

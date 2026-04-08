import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import './ContactUsPage.css';

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const data = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    })
      .then(() => setSubmitted(true))
      .catch(() => setError('Something went wrong. Please try again.'));
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Thanks for Reaching Out — Claw &amp; Decay</title>
          <meta name="description" content="Thanks for contacting Claw & Decay. We'll be in touch soon." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <section
          className="contact-thanks"
          role="status"
          aria-live="polite"
        >
          <h2>Thanks for reaching out!</h2>
          <p>We will get back to you shortly.</p>
        </section>
      </>
    );
  }

  return (
    <section className="contact-page" aria-labelledby="contact-heading">
      <Helmet>
        <title>Contact Us — Claw &amp; Decay</title>
        <meta
          name="description"
          content="Get in touch with Claw & Decay for collaborations, custom designs, order help, or just to say what's up. Alternative streetwear made with care."
        />
        <link rel="canonical" href="https://clawanddecay.com/contact-us" />
        <meta property="og:title" content="Contact — Claw & Decay" />
        <meta property="og:description" content="Reach out about collaborations, custom designs, or order support." />
        <meta property="og:url" content="https://clawanddecay.com/contact-us" />
      </Helmet>

      <h1 id="contact-heading">Contact Us</h1>

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        netlify="true"
        noValidate
      >
        {/* Hidden input to identify the form */}
        <input type="hidden" name="form-name" value="contact" />

        {/* Honeypot for spam */}
        <p className="hidden" style={{ display: 'none' }}>
          <label>
            Don’t fill this out if you’re human:
            <input name="bot-field" tabIndex="-1" autoComplete="off" />
          </label>
        </p>

        <label htmlFor="contact-name">
          Name
          <input
            id="contact-name"
            type="text"
            name="name"
            required
            aria-required="true"
            autoComplete="name"
          />
        </label>

        <label htmlFor="contact-email">
          Email
          <input
            id="contact-email"
            type="email"
            name="email"
            required
            aria-required="true"
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label htmlFor="contact-message">
          Message
          <textarea
            id="contact-message"
            name="message"
            rows="5"
            required
            aria-required="true"
          />
        </label>

        {error && (
          <p role="alert" style={{ color: '#ff7a7a', marginTop: '0.5rem' }}>
            {error}
          </p>
        )}

        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ContactPage;

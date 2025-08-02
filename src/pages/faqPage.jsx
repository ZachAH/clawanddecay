// src/pages/FaqPage.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

const faqs = [
  {
    question: 'How do I care for my Claw & Decay apparel?',
    answer: `Turn garments inside out before washing. Machine wash cold with like colors. 
             Use mild detergent. Do not bleach. Tumble dry low or hang to dry for best longevity. 
             Iron inside out on low if needed — avoid ironing directly over prints.`,
  },
  {
    question: 'What are your shipping times?',
    answer: `Claw & Decay is currently run by a one-person team. Some items ship directly from our warehouse in Milwaukee, Wisconsin, and others are fulfilled by trusted partners elsewhere in the United States. 
             Because everything is handled in small batches, processing typically takes 2–5 business days. 
             Domestic shipping usually arrives within 3–7 business days after processing. 
             International shipping windows vary by destination and customs, typically 10–21 business days.`,
  },
  {
    question: 'Do you offer returns or exchanges?',
    answer: `Because drops are limited and made in small batches, we generally do not offer returns 
             unless the item is defective. If something arrives damaged or wrong, contact us within 
             7 days with photos and order details and we'll make it right. Exchanges may be possible 
             depending on availability.`,
  },
  {
    question: 'How do I know what size to get?',
    answer: `Each product has its own size guide on the product detail page. We recommend comparing 
             your favorite tee measurements to the provided chart. If you're between sizes, size up.`,
  },
  {
    question: 'Are the drops limited?',
    answer: `Yes. Most releases are limited edition and produced in small quantities. Once a drop is 
             sold out, it may not return — so if you see something you love, don’t sleep on it.`,
  },
  {
    question: 'Can I request custom designs or collaborate?',
    answer: `Absolutely. Collaboration with artists and community input is core to Claw & Decay. 
             Reach out via the Contact page with your idea or proposal and we'll see what we can do.`,
  },
  {
    question: 'What payment methods do you accept?',
    answer: `We accept all major credit/debit cards via our checkout provider. Depending on integrations, 
             we may also support digital wallets (e.g., Apple Pay / Google Pay) if available.`,
  },
  {
    question: 'How can I track my order?',
    answer: `Once your order ships, you'll receive a shipping confirmation with tracking information 
             via email. If you haven’t received it, check your spam folder or contact us with your order number.`,
  },
  {
    question: 'Do you ship internationally?',
    answer: `Yes, we ship worldwide. International customers are responsible for any customs/duties 
             imposed by their country. Delivery windows vary based on destination.`,
  },
  {
    question: 'Is my data safe?',
    answer: `We take privacy seriously. We only collect necessary information for order fulfillment 
             and communication. We do not sell your data. For full details, refer to our Privacy Policy.`,
  },
];

function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="app-main-content">
      <Helmet>
        <title>FAQ — Claw & Decay</title>
        <meta
          name="description"
          content="Frequently asked questions about Claw & Decay: shipping, care, returns, drops, and collaborations."
        />
      </Helmet>

      <h2>FAQS</h2>
      <div className="glow-card">
        <div className="faq-container">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <button
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                className="faq-question"
                onClick={() => toggle(i)}
                type="button"
              >
                <span>{f.question}</span>
                <span className="chevron">{openIndex === i ? '▴' : '▾'}</span>
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`faq-answer ${openIndex === i ? 'open' : ''}`}
                style={{
                  maxHeight: openIndex === i ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <p>{f.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;

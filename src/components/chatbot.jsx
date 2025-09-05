// src/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; 

// Define your Q&A data with keywords and a user-friendly title
const faqData = [
  {
    title: 'Product Care',
    keywords: ['care', 'laundry', 'wash', 'apparel', 'instructions'],
    answer: `Turn garments inside out before washing. Machine wash cold with like colors. Use mild detergent. Do not bleach. Tumble dry low or hang to dry for best longevity. Iron inside out on low if needed — avoid ironing directly over prints.`,
  },
  {
    title: 'Shipping Times',
    keywords: ['shipping', 'delivery', 'times', 'processing', 'ships', 'arrives', 'international'],
    answer: `Processing typically takes 2–5 business days. Domestic shipping usually arrives within 3–7 business days after processing. International shipping windows vary, typically 10–21 business days.`,
  },
  {
    title: 'Returns & Exchanges',
    keywords: ['return', 'returns', 'exchange', 'policy', 'defective', 'damaged'],
    answer: `Because drops are limited and made in small batches, we generally do not offer returns unless the item is defective. If something arrives damaged, contact us within 7 days. Exchanges may be possible depending on availability.`,
  },
  {
    title: 'Sizing',
    keywords: ['size', 'sizing', 'fit', 'measurements', 'guide'],
    answer: `Each product has its own size guide on the product detail page. We recommend comparing your favorite tee measurements to the provided chart. If you're between sizes, size up.`,
  },
  {
    title: 'Limited Drops',
    keywords: ['limited', 'drops', 'edition', 'sold out', 're-stock'],
    answer: `Yes, most releases are limited edition and produced in small quantities. Once a drop is sold out, it may not return.`,
  },
  {
    title: 'Custom Designs',
    keywords: ['custom', 'designs', 'collaborate', 'artist'],
    answer: `Absolutely! Collaboration with artists and community input is core to Claw & Decay. Reach out via the Contact page with your idea.`,
  },
  {
    title: 'Payment Methods',
    keywords: ['payment', 'methods', 'cards', 'apple pay', 'google pay'],
    answer: `We accept all major credit/debit cards via our checkout provider. We may also support digital wallets (e.g., Apple Pay / Google Pay).`,
  },
  {
    title: 'Order Tracking',
    keywords: ['track', 'tracking', 'order', 'status'],
    answer: `Once your order ships, you'll receive a shipping confirmation with tracking information via email. Check your spam folder or contact us with your order number if you haven't received it.`,
  },
  {
    title: 'International Shipping',
    keywords: ['international', 'ship internationally', 'customs', 'duties', 'worldwide'],
    answer: `Unfortunately, we only ship inside of the US as of right now`,
  },
  {
    title: 'Data Privacy',
    keywords: ['data', 'privacy', 'safe', 'secure'],
    answer: `We take privacy seriously. We only collect necessary information for order fulfillment and communication. We do not sell your data. For full details, refer to our Privacy Policy.`,
  },
  {
    title: 'Change/Cancel Order',
    keywords: ['change order', 'cancel order', 'modify order', 'change address', 'typo'],
    answer: `Please contact us immediately if you need to change or cancel your order. We'll do our best to help, but we can't guarantee changes after an order has been processed for shipping.`,
  },
  {
    title: 'Materials & Sustainability',
    keywords: ['material', 'fabric', 'cotton', 'polyester', 'sustain', 'sustainable', 'ethical', 'ethically sourced'],
    answer: `Our apparel is made from high-quality materials, with details listed on each product page. We are committed to ethical production and work with partners who share our values.`,
  },
  {
    title: 'Discounts',
    keywords: ['discount', 'coupon', 'promo', 'promotion', 'sale', 'code'],
    answer: `We announce all discounts and promotions via social media. Follow us on instagram @clawanddecayclth and tiktok @clawnddecayclthing`,
  },
  {
    title: 'Gift Cards',
    keywords: ['gift card', 'gift certificate', 'voucher'],
    answer: `Currently, we do not offer gift cards, but it is a feature we plan to add in the future!`,
  },
  {
    title: 'Website Issues',
    keywords: ['website', 'glitch', 'error', 'broken', 'problem'],
    answer: `We're sorry you're having trouble with our website. Please try clearing your cache or using a different browser. If the problem persists, contact us with details and a screenshot if possible.`,
  },
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showTopicButtons, setShowTopicButtons] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setMessages([]);
      setShowTopicButtons(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Determine the bot's response and whether a match was found
    const lowerCaseInput = inputValue.toLowerCase();

    // Only match greetings as whole words
    const isGreeting = /\b(hello|hi|hey)\b/.test(lowerCaseInput);
    
    let botResponseText = "I'm sorry, I don't understand. Can you try rephrasing? Or, you can click one of the topics below:";
    let matchFound = false;
    
    if (isGreeting) {
      botResponseText = "Hello! How can I help you with your clothing needs today?";
      matchFound = true;
    } else {
      for (const faq of faqData) {
        if (faq.keywords.some(keyword => lowerCaseInput.includes(keyword))) {
          botResponseText = faq.answer;
          matchFound = true;
          break;
        }
      }
    }

    // Update the state with both the user's message and the bot's response in one go
    setMessages(prevMessages => {
      const newUserMessage = { text: inputValue, sender: 'user' };
      const newBotMessage = { text: botResponseText, sender: 'bot' };
      return [...prevMessages, newUserMessage, newBotMessage];
    });

    // Update the visibility of topic buttons
    setShowTopicButtons(!matchFound);

    // Clear the input field
    setInputValue('');
  };

  const handleTopicClick = (topic) => {
    const faq = faqData.find(f => f.title === topic);
    const botResponseText = faq ? faq.answer : "Sorry, something went wrong.";

    setMessages(prevMessages => {
        const newUserMessage = { text: topic, sender: 'user' };
        const newBotMessage = { text: botResponseText, sender: 'bot' };
        return [...prevMessages, newUserMessage, newBotMessage];
    });

    setShowTopicButtons(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle-btn" onClick={toggleChatbot}>
        <span role="img" aria-label="chat-icon">💬</span>
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Claw & Decay Assistant</h3>
            <button className="close-btn" onClick={toggleChatbot}>x</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showTopicButtons && (
            <div className="topic-buttons">
              {faqData.map((faq, index) => (
                <button
                  key={index}
                  className="topic-btn"
                  onClick={() => handleTopicClick(faq.title)}>
                  {faq.title}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
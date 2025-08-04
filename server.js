// server.js
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';

dotenv.config();

const app = express();

// In production, restrict origin: e.g. cors({ origin: 'https://yourdomain.com' })
app.use(cors());
app.use(express.json());

// For webhook raw body
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // TODO: fulfill the order (e.g., write to DB, send email, decrement inventory)
      console.log('Checkout session completed:', session.id);
    }

    res.sendStatus(200);
  }
);

// Use regular JSON parsing for other endpoints
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Example in-memory product catalog (replace with real DB lookup)
const PRODUCT_CATALOG = {
  'prod_tee_black': { name: 'Claw and Decay Tee (Black)', unit_amount: 2499 }, // $24.99
  'prod_hoodie': { name: 'Claw and Decay Hoodie', unit_amount: 4999 }, // $49.99
  // ... add more
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Build line items securely from server-side catalog
    const line_items = items.map((item) => {
      // Expect item to have an id that maps to your catalog and quantity
      const catalogEntry = PRODUCT_CATALOG[item.id];
      if (!catalogEntry) {
        throw new Error(`Invalid product id: ${item.id}`);
      }
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: catalogEntry.name,
          },
          unit_amount: catalogEntry.unit_amount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.FRONTEND_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL}/cancel`,
      metadata: {
        // optional: attach your own order tracking ID or user info
        order_id: crypto.randomUUID(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));

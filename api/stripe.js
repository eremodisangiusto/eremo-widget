// ============================================================
// Eremo di San Giusto — api/stripe.js
// Crea Stripe Checkout Session per camere ed esperienze
// ============================================================

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  // CORS — deve essere il primissimo cosa che facciamo
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age',       '86400');

  // Risposta immediata alla preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const {
    type, tariffa, payNow,
    bookingRef, descrizione, importo,
    firstName, lastName, email, metadata,
  } = req.body;

  try {
    const baseUrl = 'https://eremo-bookings.vercel.app';
    const successUrl = `${baseUrl}/payment-success?ref=${bookingRef}&type=${type}`;
    const cancelUrl  = `${baseUrl}/payment-cancel?ref=${bookingRef}`;

    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: descrizione || 'Eremo di San Giusto',
          description: type === 'camera'
            ? (tariffa === 'non_rimborsabile'
                ? 'Tariffa non rimborsabile — addebito immediato'
                : "Tariffa standard — autorizzazione carta, addebito all'arrivo. Cancellazione gratuita entro 14 giorni.")
            : 'Pagamento anticipato esperienza',
        },
        unit_amount: Math.round(Number(importo) * 100),
      },
      quantity: 1,
    }];

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      client_reference_id: bookingRef,
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: 'payment',
      payment_intent_data: {
        capture_method: (type === 'camera' && tariffa === 'standard') ? 'manual' : 'automatic',
        description: `Eremo di San Giusto — ${descrizione}`,
        metadata: {
          bookingRef:  bookingRef || '',
          type:        type || '',
          firstName:   firstName || '',
          lastName:    lastName || '',
          email:       email || '',
          tariffa:     tariffa || '',
          payNow:      String(payNow || true),
          ...(metadata || {}),
        },
      },
      metadata: {
        bookingRef: bookingRef || '',
        type:       type || '',
        email:      email || '',
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      success:   true,
      sessionId: session.id,
      url:       session.url,
    });

  } catch (err) {
    console.error('[stripe.js] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

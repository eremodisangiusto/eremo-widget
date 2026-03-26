// ============================================================
// Eremo di San Giusto — api/checkout.js
// Endpoint GET/POST che crea la Stripe Checkout Session
// e redirige direttamente — nessuna chiamata cross-origin
// Il widget fa window.location.href = ESJ_PROXY + "/api/checkout?..."
// ============================================================

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  // CORS per sicurezza
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Leggi i parametri sia da GET (query string) che da POST (body)
  const p = req.method === 'POST' ? req.body : req.query;

  const {
    type        = 'esperienza',
    tariffa     = 'standard',
    ref         = '',
    desc        = '',
    importo     = '0',
    firstName   = '',
    lastName    = '',
    email       = '',
  } = p;

  const importoNum = parseFloat(importo) || 0;

  // Validazione minima
  if (!ref || importoNum <= 0) {
    return res.status(400).send('Parametri mancanti: ref e importo sono obbligatori.');
  }

  try {
    const stripe   = Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl  = 'https://eremo-bookings.vercel.app';
    const descrizione = decodeURIComponent(desc) || 'Eremo di San Giusto';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      client_reference_id: ref,
      success_url: `${baseUrl}/payment-success?ref=${ref}&type=${type}`,
      cancel_url:  `${baseUrl}/payment-cancel?ref=${ref}`,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: descrizione,
            description: type === 'camera' && tariffa === 'standard'
              ? "Tariffa standard — autorizzazione carta, addebito all'arrivo. Cancellazione gratuita entro 14 giorni."
              : type === 'camera' && tariffa === 'non_rimborsabile'
              ? 'Tariffa non rimborsabile — addebito immediato.'
              : 'Pagamento anticipato esperienza — Eremo di San Giusto',
          },
          unit_amount: Math.round(importoNum * 100),
        },
        quantity: 1,
      }],
      payment_intent_data: {
        capture_method: (type === 'camera' && tariffa === 'standard') ? 'manual' : 'automatic',
        description: `Eremo di San Giusto — ${descrizione}`,
        metadata: {
          bookingRef: ref,
          type,
          tariffa,
          firstName,
          lastName,
          email,
        },
      },
      metadata: {
        bookingRef: ref,
        type,
        email,
      },
    });

    // Redirect diretto a Stripe Checkout — nessun CORS
    return res.redirect(303, session.url);

  } catch (err) {
    console.error('[checkout.js] Stripe error:', err.message);
    return res.status(500).send(`Errore Stripe: ${err.message}`);
  }
};

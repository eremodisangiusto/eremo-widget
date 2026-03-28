// ============================================================
// Eremo di San Giusto — api/checkout.js
// Crea Stripe Checkout Session via REST API diretta (no npm stripe)
// Redirect immediato — zero CORS
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Leggi parametri da GET query string
  const p = req.query || {};
  const type      = p.type      || 'esperienza';
  const tariffa   = p.tariffa   || 'standard';
  const ref       = p.ref       || '';
  const desc      = decodeURIComponent(p.desc || '') || 'Eremo di San Giusto';
  const importo   = parseFloat(p.importo) || 0;
  const firstName = p.firstName || '';
  const lastName  = p.lastName  || '';
  const email     = p.email     || '';

  if (!ref || importo <= 0) {
    return res.status(400).send('Parametri mancanti: ref e importo sono obbligatori.');
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    return res.status(500).send('STRIPE_SECRET_KEY non configurata.');
  }

  const baseUrl    = 'https://eremo-bookings.vercel.app';
  const successUrl = `${baseUrl}/payment-success?ref=${encodeURIComponent(ref)}&type=${type}`;
  const cancelUrl  = `${baseUrl}/payment-cancel?ref=${encodeURIComponent(ref)}`;

  const isHold = type === 'camera' && tariffa === 'standard';

  const descrizioneTariffa = type === 'camera' && tariffa === 'non_rimborsabile'
    ? 'Tariffa non rimborsabile — addebito immediato'
    : type === 'camera'
    ? "Tariffa standard — solo autorizzazione carta, addebito all'arrivo. Cancellazione gratuita 14 giorni."
    : 'Pagamento anticipato esperienza — Eremo di San Giusto';

  // Chiama Stripe API direttamente via fetch (no npm)
  try {
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    params.append('client_reference_id', ref);
    if (email) params.append('customer_email', email);
    params.append('line_items[0][price_data][currency]', 'eur');
    params.append('line_items[0][price_data][product_data][name]', desc);
    params.append('line_items[0][price_data][product_data][description]', descrizioneTariffa);
    params.append('line_items[0][price_data][unit_amount]', String(Math.round(importo * 100)));
    params.append('line_items[0][quantity]', '1');
    params.append('payment_intent_data[capture_method]', isHold ? 'manual' : 'automatic');
    params.append('payment_intent_data[description]', `Eremo di San Giusto — ${desc}`);
    params.append('payment_intent_data[metadata][bookingRef]', ref);
    params.append('payment_intent_data[metadata][type]', type);
    params.append('payment_intent_data[metadata][tariffa]', tariffa);
    params.append('payment_intent_data[metadata][firstName]', firstName);
    params.append('payment_intent_data[metadata][lastName]', lastName);
    params.append('payment_intent_data[metadata][email]', email);
    params.append('metadata[bookingRef]', ref);
    params.append('metadata[type]', type);
    params.append('metadata[email]', email);

    const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeResp.json();

    if (!stripeResp.ok || !session.url) {
      console.error('[checkout] Stripe error:', session.error || session);
      return res.status(500).send(`Errore Stripe: ${session.error?.message || 'risposta non valida'}`);
    }

    // Redirect diretto a Stripe Checkout
    return res.redirect(303, session.url);

  } catch (err) {
    console.error('[checkout] Fetch error:', err.message);
    return res.status(500).send(`Errore interno: ${err.message}`);
  }
}

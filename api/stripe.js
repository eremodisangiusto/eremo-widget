// ============================================================
// Eremo di San Giusto — api/stripe.js
// Crea Stripe Checkout Session per camere ed esperienze
//
// Env vars richieste:
//   STRIPE_SECRET_KEY  = sk_live_...
//   VERCEL_URL         = eremo-bookings.vercel.app (auto)
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    type,           // 'camera' | 'esperienza' | 'pacchetto'
    tariffa,        // 'standard' | 'non_rimborsabile'  (solo per camera)
    payNow,         // true | false  (solo per esperienza)
    // Dati prenotazione
    bookingRef,     // ref Airtable o Beds24
    descrizione,    // es. "Liquid Gold – 5 apr 2026 – 3 persone"
    importo,        // importo in euro (es. 105)
    // Dati ospite
    firstName,
    lastName,
    email,
    // Metadata per il webhook
    metadata,
  } = req.body;

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://eremo-bookings.vercel.app';

    const successUrl = `${baseUrl}/payment-success?ref=${bookingRef}&type=${type}`;
    const cancelUrl  = `${baseUrl}/payment-cancel?ref=${bookingRef}`;

    // ── Costruisci la riga prodotto ──────────────────────────
    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: descrizione || 'Eremo di San Giusto',
          description: type === 'camera'
            ? (tariffa === 'non_rimborsabile'
                ? 'Tariffa non rimborsabile — addebito immediato'
                : 'Tariffa standard — autorizzazione carta, addebito all\'arrivo. Cancellazione gratuita entro 14 giorni.')
            : (payNow
                ? 'Pagamento anticipato esperienza'
                : null),
          images: ['https://eremo-bookings.vercel.app/logo.png'],
        },
        unit_amount: Math.round(importo * 100), // in centesimi
      },
      quantity: 1,
    }];

    // ── Parametri specifici per tipo ─────────────────────────
    let sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      client_reference_id: bookingRef,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingRef:  bookingRef || '',
        type:        type || '',
        firstName:   firstName || '',
        lastName:    lastName || '',
        email:       email || '',
        tariffa:     tariffa || '',
        payNow:      String(payNow || false),
        ...(metadata || {}),
      },
    };

    if (type === 'camera' && tariffa === 'standard') {
      // Tariffa standard: autorizza la carta ma non addebitare subito
      sessionParams.mode = 'payment';
      sessionParams.payment_intent_data = {
        capture_method: 'manual', // hold — cattura manuale all'arrivo
        description: `Camera Eremo di San Giusto — ${descrizione}`,
        metadata: sessionParams.metadata,
      };
    } else {
      // Addebito immediato: camera non rimborsabile, esperienze paga ora, pacchetti
      sessionParams.mode = 'payment';
      sessionParams.payment_intent_data = {
        capture_method: 'automatic',
        description: `Eremo di San Giusto — ${descrizione}`,
        metadata: sessionParams.metadata,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      success:   true,
      sessionId: session.id,
      url:       session.url, // redirect l'utente qui
    });

  } catch (err) {
    console.error('[stripe.js] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

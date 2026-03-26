// ============================================================
// Eremo di San Giusto — api/stripe-webhook.js
// Riceve eventi Stripe e aggiorna lo stato delle prenotazioni
// ============================================================

import Stripe from 'stripe';

const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_BASE  = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const TABLE_PRENOTAZIONI = 'Prenotazioni';

// ── Helper: aggiorna stato prenotazione Airtable per bookingRef ─

async function aggiornaStatoAirtable(bookingRef, stato) {
  // Cerca il record per Booking ref
  const formula = encodeURIComponent(`{Booking ref}="${bookingRef}"`);
  const url = `${AIRTABLE_API}/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_PRENOTAZIONI)}?filterByFormula=${formula}`;

  const searchResp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` },
  });
  const searchData = await searchResp.json();
  const record = searchData.records?.[0];
  if (!record) {
    console.error('[webhook] Record non trovato per bookingRef:', bookingRef);
    return false;
  }

  // Aggiorna lo stato
  const patchResp = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_PRENOTAZIONI)}/${record.id}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: { 'Stato prenotazione': stato } }),
    }
  );
  return patchResp.ok;
}

// ── Helper: invia email di conferma via Resend ───────────────────

async function inviaEmailConferma(metadata, importo, tipo) {
  try {
    const notifyUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/notify`
      : 'https://eremo-bookings.vercel.app/api/notify';

    await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:       tipo === 'camera' ? 'room_confirmed' : 'experience_confirmed',
        bookingId:  metadata.bookingRef,
        firstName:  metadata.firstName,
        lastName:   metadata.lastName,
        email:      metadata.email,
        notes:      `Pagamento confermato via Stripe — €${(importo / 100).toFixed(2)}`,
      }),
    });
  } catch (e) {
    console.error('[webhook] Email error:', e.message);
  }
}

// ── Handler principale ────────────────────────────────────────────

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe  = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig     = req.headers['stripe-signature'];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  // Leggi il body raw per la verifica firma Stripe
  let event;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[webhook] Firma non valida:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const pi       = event.data.object; // PaymentIntent o Session
  const metadata = pi.metadata || {};
  const bookingRef = metadata.bookingRef;
  const tipo       = metadata.type; // 'camera' | 'esperienza' | 'pacchetto'

  console.log('[webhook] Evento:', event.type, '| Ref:', bookingRef, '| Tipo:', tipo);

  try {
    switch (event.type) {

      // ── Pagamento riuscito ────────────────────────────────────
      case 'payment_intent.succeeded': {
        if (bookingRef && (tipo === 'esperienza' || tipo === 'pacchetto')) {
          await aggiornaStatoAirtable(bookingRef, 'Confermata');
          await inviaEmailConferma(metadata, pi.amount_received, tipo);
        }
        // Per le camere standard (hold), il pagamento viene catturato all'arrivo
        // — non aggiorniamo lo stato qui, lo fa payment_intent.amount_capturable_updated
        if (tipo === 'camera' && metadata.tariffa === 'non_rimborsabile') {
          // Camera non rimborsabile: pagamento avvenuto
          await inviaEmailConferma(metadata, pi.amount_received, tipo);
        }
        break;
      }

      // ── Carta autorizzata (hold) per camera standard ──────────
      case 'payment_intent.amount_capturable_updated': {
        if (tipo === 'camera' && metadata.tariffa === 'standard') {
          // Carta autorizzata — la camera è garantita
          await inviaEmailConferma(metadata, pi.amount_capturable, tipo);
          console.log('[webhook] Camera standard — carta autorizzata, hold attivo');
        }
        break;
      }

      // ── Pagamento fallito ─────────────────────────────────────
      case 'payment_intent.payment_failed': {
        if (bookingRef && (tipo === 'esperienza' || tipo === 'pacchetto')) {
          await aggiornaStatoAirtable(bookingRef, 'Cancellata');
          // Non liberiamo i posti automaticamente qui —
          // meglio farlo manualmente per evitare race conditions
          console.log('[webhook] Pagamento fallito — prenotazione annullata:', bookingRef);
        }
        break;
      }

      // ── Rimborso emesso ───────────────────────────────────────
      case 'charge.refunded': {
        if (bookingRef) {
          await aggiornaStatoAirtable(bookingRef, 'Rimborsata');
          console.log('[webhook] Rimborso emesso per:', bookingRef);
        }
        break;
      }

      default:
        console.log('[webhook] Evento non gestito:', event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('[webhook] Errore gestione evento:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// Disabilita il bodyParser di Next.js — Stripe richiede il body raw
export default handler;
export const config = { api: { bodyParser: false } };

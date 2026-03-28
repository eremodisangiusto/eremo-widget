// ============================================================
// Eremo di San Giusto — api/reviews.js
// Importa review Booking.com via Beds24 API V2
// Analizza con Claude AI → salva su Airtable Guestbook
//
// Env vars richieste:
//   BEDS24_LONG_LIFE_TOKEN = il long life token V2
//   AIRTABLE_KB_BASE_ID    = app... (base "Eremo KB")
//   AIRTABLE_TOKEN         = pat6xQf9...
//   ANTHROPIC_API_KEY      = sk-ant-...
// ============================================================

const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_KB    = process.env.AIRTABLE_KB_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BEDS24_TOKEN   = process.env.BEDS24_LONG_LIFE_TOKEN;

// ── Beds24 V2: leggi review Booking.com ──────────────────────
async function getBookingReviews(fromDate = '2020-01-01') {
  // Entrambi i parametri sono obbligatori: propertyId e from
  const url = `https://beds24.com/api/v2/channels/booking/reviews?propertyId=221499&from=${fromDate}`;
  const resp = await fetch(url, { headers: { 'token': BEDS24_TOKEN } });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Beds24 reviews error ${resp.status}: ${text}`);
  try { return JSON.parse(text); } catch(e) { throw new Error(`JSON parse error: ${text.substring(0,200)}`); }
}

// ── Airtable: controlla se review già importata ──────────────
async function reviewGiaImportata(reviewId) {
  const formula = encodeURIComponent(`{Booking Review ID}="${reviewId}"`);
  const resp = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_KB}/Guestbook?filterByFormula=${formula}&maxRecords=1`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` } }
  );
  const data = await resp.json();
  return (data.records || []).length > 0;
}

// ── Airtable: salva review nel Guestbook ─────────────────────
async function salvaReview(fields) {
  const resp = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_KB}/Guestbook`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }] }),
    }
  );
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(`Airtable save error: ${JSON.stringify(err)}`);
  }
  return await resp.json();
}

// ── Claude AI: analizza review ed estrae tag ─────────────────
async function analizzaReview(review) {
  const contenuto = [
    review.content?.headline,
    review.content?.positive,
    review.content?.negative,
  ].filter(Boolean).join(' | ');

  if (!contenuto) return { tags: [], consigli: '' };

  const prompt = `Analizza questa review di un ospite di un agriturismo in Puglia (Eremo di San Giusto, Ostuni) e restituisci SOLO un JSON con:
- "tags": array di tag applicabili tra: ["romantico", "famiglie", "natura", "culturale", "gourmet", "economico", "caldo", "relax", "avventura", "tranquillo", "vista", "piscina"]
- "consigli": eventuali consigli su posti o ristoranti menzionati (stringa breve, max 100 caratteri, vuota se nessuno)

Review: "${contenuto}"

Rispondi SOLO con JSON valido, nessun testo prima o dopo.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await resp.json();
    const txt = data.content?.[0]?.text || '{}';
    const clean = txt.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return { tags: [], consigli: '' };
  }
}

// ── HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, numReviews = 20 } = req.method === 'POST' ? req.body : req.query;

  // ── ACTION: import — importa review da Booking.com ──────────
  if (!action || action === 'import') {
    try {
      const fromDate = req.body?.fromDate || req.query?.fromDate || '2020-01-01';

      // 1. Leggi review da Booking.com via Beds24
      const rawData = await getBookingReviews(fromDate);
      // Struttura risposta: { success, data: [...reviews] }
      const reviews = rawData?.data || [];

      if (reviews.length === 0) {
        return res.status(200).json({
          success: true,
          importate: 0,
          saltate: 0,
          message: 'Nessuna review trovata su Booking.com',
        });
      }

      let importate = 0;
      let saltate   = 0;
      const errori  = [];

      // 3. Processa ogni review
      for (const review of reviews) {
        try {
          const reviewId = review.review_id || review.id;
          if (!reviewId) { saltate++; continue; }

          // Salta se già importata
          const esiste = await reviewGiaImportata(String(reviewId));
          if (esiste) { saltate++; continue; }

          // Analizza con Claude per tag e consigli
          const analisi = await analizzaReview(review);

          // Costruisci testo review completo
          const parti = [];
          if (review.content?.headline) parti.push(`**${review.content.headline}**`);
          if (review.content?.positive) parti.push(`✓ ${review.content.positive}`);
          if (review.content?.negative) parti.push(`✗ ${review.content.negative}`);
          const testoReview = parti.join('\n') || '(nessun testo)';

          // Voto: Booking usa scala 1-10, convertiamo in 1-5
          const votoRaw    = review.scoring?.review_score;
          const voto       = votoRaw ? Math.round((votoRaw / 10) * 5) : null;

          // Data soggiorno
          const dataRaw    = review.created_timestamp || review.created_at;
          const data       = dataRaw ? dataRaw.split(' ')[0] : null;

          // Nome ospite
          const nome       = review.reviewer?.name || 'Ospite Booking.com';
          const paese      = review.reviewer?.country_code?.toUpperCase() || '';
          const nomeCompleto = paese ? `${nome} (${paese})` : nome;

          // Salva su Airtable
          await salvaReview({
            'Nome ospite':          nomeCompleto,
            'Data soggiorno':       data || null,
            'Review':               testoReview,
            'Consigli':             analisi.consigli || '',
            'Luoghi consigliati':   '',
            'Voto':                 voto,
            'Tag':                  analisi.tags || [],
            'Pubblicata':           true,   // auto-pubblica review da Booking.com
            'Booking Review ID':    String(reviewId),
            'Fonte':                'Booking.com',
            'Punteggio originale':  votoRaw ? `${votoRaw}/10` : '',
          });

          importate++;

          // Piccola pausa per non sovraccaricare Airtable
          await new Promise(r => setTimeout(r, 200));

        } catch (e) {
          errori.push({ id: review.review_id, error: e.message });
          console.error('[reviews] Errore su review:', review.review_id, e.message);
        }
      }

      return res.status(200).json({
        success:   true,
        totale:    reviews.length,
        importate,
        saltate,
        errori:    errori.length > 0 ? errori : undefined,
        message:   `Importate ${importate} nuove review, saltate ${saltate} (già presenti)`,
      });

    } catch (err) {
      console.error('[reviews] Errore importazione:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── ACTION: status — verifica connessione Beds24 ─────────────
  if (action === 'status') {
    try {
      const resp = await fetch('https://beds24.com/api/v2/authentication/token', {
        headers: { 'token': BEDS24_TOKEN }
      });
      const ok = resp.ok || resp.status === 200;
      return res.status(200).json({ success: true, message: 'Connessione Beds24 OK', tokenOk: !!BEDS24_TOKEN });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Azione non valida. Usa: import | status' });
}

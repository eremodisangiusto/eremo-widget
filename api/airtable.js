// ============================================================
// Eremo di San Giusto — api/airtable.js v2.0
// Gestione disponibilità e prenotazioni esperienze via Airtable
//
// Tabelle Airtable:
//   - Slots:         Slot id, Esperienza, Data, Orario,
//                    Posti totali, Posti prenotati, Posti disponibili (formula),
//                    Stato, Note interne
//   - Prenotazioni:  Booking ref, Slot ID, Esperienza, Data, Orario,
//                    Nome, Cognome, Email, Telefono, Partecipanti,
//                    Tipo prezzo, Totale €, Stato prenotazione,
//                    Note ospite, Creata il
//
// Env vars richieste:
//   AIRTABLE_BASE_ID  = apps5JGXCcVxRw4EH
//   AIRTABLE_TOKEN    = pat6xQf9xWzDG8Y79.ae7cd300...
// ============================================================

const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_BASE  = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

const TABLE_SLOTS        = 'Slots';
const TABLE_PRENOTAZIONI = 'Prenotazioni';

// ── Prezzi per esperienza e tipo ─────────────────────────────

const PREZZI = {
  'liquid-gold':        { Standard: 35, Privato: 50, Bambino: 10 },
  'stargazing':         { Standard: 35, Privato: 45, Bambino: 15 },
  'sunset-serenade':    { Standard: 60, Coppia: 130 },
  'cooking-class':      { Standard: 35, Privato: 50, Bambino: 18 },
  'massaggi':           { Rilassante: 70, Tonificante: 70, 'Deep tissue': 80 },
  'trekking':           { 'Corto 5km': 25, 'Lungo 10km': 35 },
  'ciuchino-birichino': { Junior: 15, Verde: 25, Blu: 30, 'Rosso/Nero': 35 },
  'carriages':          { Standard: 35, Privato: 50 },
};

// ── Helper: chiamata Airtable REST API ───────────────────────

async function atFetch(method, table, { id, query, body } = {}) {
  let url = `${AIRTABLE_API}/${AIRTABLE_BASE}/${encodeURIComponent(table)}`;
  if (id) url += `/${id}`;
  if (query) url += `?${query}`;

  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type':  'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const resp = await fetch(url, opts);
  const data = await resp.json();
  if (!resp.ok) {
    const msg = data?.error?.message || data?.error?.type || `Airtable HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

// ── Helper: genera codice prenotazione univoco ────────────────

function genRef() {
  const d   = new Date();
  const yy  = String(d.getFullYear()).slice(-2);
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const dd  = String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ESG-${yy}${mm}${dd}-${rnd}`;
}

// ── Helper: normalizza data in YYYY-MM-DD ─────────────────────

function normalizeDate(dateStr) {
  if (!dateStr) return dateStr;
  // Se già YYYY-MM-DD, lascia stare
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Converte da DD/MM/YYYY o DD-MM-YYYY
  const m = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  // Prova con Date.parse come fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
  return dateStr;
}

// ── Handler principale ────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const {
    action, esperienza, data: rawData, orario,
    partecipanti, firstName, lastName, email,
    phone, tipoPrezzo, noteOspite,
  } = req.body;

  const data = normalizeDate(rawData);

  try {

    // ════════════════════════════════════════════════════════
    // ACTION: check_availability
    // Legge gli slot aperti per esperienza + data
    // ════════════════════════════════════════════════════════
    if (action === 'check_availability') {
      if (!esperienza || !data) {
        return res.status(400).json({ error: 'esperienza e data sono obbligatori' });
      }

      const formula = encodeURIComponent(
        `AND({Esperienza}="${esperienza}",IS_SAME({Data},"${data}","day"),{Stato}="Aperto",{Posti disponibili}>0)`
      );
      const result = await atFetch('GET', TABLE_SLOTS, {
        query: `filterByFormula=${formula}&sort[0][field]=Orario&sort[0][direction]=asc`,
      });

      const records = result.records || [];

      if (records.length === 0) {
        // Cerca date alternative nelle prossime 4 settimane
        const dataObj  = new Date(data);
        const dataFine = new Date(dataObj);
        dataFine.setDate(dataFine.getDate() + 28);
        const fAlt = encodeURIComponent(
          `AND({Esperienza}="${esperienza}",IS_AFTER({Data},"${data}"),IS_BEFORE({Data},"${dataFine.toISOString().split('T')[0]}"),{Stato}="Aperto",{Posti disponibili}>0)`
        );
        const altResult = await atFetch('GET', TABLE_SLOTS, {
          query: `filterByFormula=${fAlt}&sort[0][field]=Data&sort[0][direction]=asc&maxRecords=3`,
        });
        const altDates = [...new Set((altResult.records || []).map(r => r.fields['Data']))];

        return res.status(200).json({
          available:    false,
          esperienza,
          data,
          message:      `Nessuno slot disponibile per ${data}.`,
          alternative:  altDates,
          slots:        [],
        });
      }

      const slots = records.map(r => ({
        slotRecordId: r.id,
        orario:       r.fields['Orario']            || '',
        postiLiberi:  r.fields['Posti disponibili'] || 0,
        postiTotali:  r.fields['Posti totali']      || 0,
      }));

      return res.status(200).json({
        available: true,
        esperienza,
        data,
        slots,
      });
    }

    // ════════════════════════════════════════════════════════
    // ACTION: create_booking
    // Crea prenotazione, aggiorna slot, invia email
    // ════════════════════════════════════════════════════════
    if (action === 'create_booking') {
      const required = { esperienza, data, orario, partecipanti, firstName, lastName, email };
      const missing  = Object.keys(required).filter(k => !required[k]);
      if (missing.length > 0) {
        return res.status(400).json({ error: `Campi mancanti: ${missing.join(', ')}` });
      }

      const numPax = Math.max(1, Number(partecipanti) || 1);

      // 1. Trova lo slot
      const formula = encodeURIComponent(
        `AND({Esperienza}="${esperienza}",IS_SAME({Data},"${data}","day"),{Orario}="${orario}",{Stato}="Aperto")`
      );
      const slotResult = await atFetch('GET', TABLE_SLOTS, { query: `filterByFormula=${formula}` });
      const slot = slotResult.records?.[0];

      if (!slot) {
        return res.status(200).json({
          success: false,
          error:   `Slot ${orario} del ${data} per ${esperienza} non trovato o non disponibile.`,
        });
      }

      // 2. Verifica posti
      const postiLiberi    = Number(slot.fields['Posti disponibili']) || 0;
      const postiPrenotati = Number(slot.fields['Posti prenotati'])   || 0;

      if (postiLiberi < numPax) {
        return res.status(200).json({
          success: false,
          error:   `Posti insufficienti per questo slot. Disponibili: ${postiLiberi}, richiesti: ${numPax}.`,
        });
      }

      // 3. Calcola prezzo
      const tipo           = tipoPrezzo || 'Standard';
      const prezzoUnit     = PREZZI[esperienza]?.[tipo] ?? 35;
      const totale         = tipo === 'Coppia' ? 130 : prezzoUnit * numPax;
      const bookingRef     = genRef();

      // 4. Crea record in Prenotazioni
      await atFetch('POST', TABLE_PRENOTAZIONI, {
        body: {
          records: [{
            fields: {
              'Booking ref':        bookingRef,
              'Slot ID':            slot.id,
              'Esperienza':         esperienza,
              'Data':               data,
              'Orario':             orario,
              'Nome':               firstName,
              'Cognome':            lastName,
              'Email':              email,
              'Telefono':           phone     || '',
              'Partecipanti':       numPax,
              'Tipo prezzo':        tipo,
              'Totale €':           totale,
              'Stato prenotazione': 'In attesa',
              'Note ospite':        noteOspite || '',
            },
          }],
        },
      });

      // 5. Aggiorna posti prenotati nello Slot
      await atFetch('PATCH', TABLE_SLOTS, {
        id:   slot.id,
        body: { fields: { 'Posti prenotati': postiPrenotati + numPax } },
      });

      // 6. Email automatica via Resend (non bloccante)
      try {
        const notifyUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api/notify`
          : 'https://eremo-bookings.vercel.app/api/notify';

        await fetch(notifyUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type:       'experience_request',
            experience: esperienza,
            date:       data,
            guests:     numPax,
            firstName,
            lastName,
            email,
            phone:      phone || '',
            notes:      `Tipo: ${tipo} | Totale: €${totale} | Ref: ${bookingRef}${noteOspite ? '\n' + noteOspite : ''}`,
            bookingId:  bookingRef,
          }),
        });
      } catch (emailErr) {
        // Email fallita — prenotazione già salvata su Airtable, non bloccare
        console.error('Notify email error:', emailErr.message);
      }

      return res.status(200).json({
        success:      true,
        bookingRef,
        esperienza,
        data,
        orario,
        partecipanti: numPax,
        tipoPrezzo:   tipo,
        totale,
        guest: { firstName, lastName, email, phone: phone || '' },
        message: `Prenotazione confermata! Codice: ${bookingRef}. Riceverai conferma via email a ${email}.`,
      });
    }

    // ════════════════════════════════════════════════════════
    // ACTION: update_booking_status
    // Aggiorna stato prenotazione (uso interno / dashboard)
    // ════════════════════════════════════════════════════════
    if (action === 'update_status') {
      const { bookingRecordId, stato } = req.body;
      if (!bookingRecordId || !stato) {
        return res.status(400).json({ error: 'bookingRecordId e stato sono obbligatori' });
      }
      await atFetch('PATCH', TABLE_PRENOTAZIONI, {
        id:   bookingRecordId,
        body: { fields: { 'Stato prenotazione': stato } },
      });
      return res.status(200).json({ success: true, stato });
    }

    return res.status(400).json({
      error: 'Azione non valida. Azioni disponibili: check_availability, create_booking, update_status',
    });

  } catch (err) {
    console.error('[airtable.js] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

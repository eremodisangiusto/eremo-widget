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
        `AND({Esperienza}="${esperienza}",DATESTR({Data})="${data}",{Stato}="Aperto",{Posti disponibili}>0)`
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
        const dataFineStr = dataFine.toISOString().split('T')[0];
        const fAlt = encodeURIComponent(
          `AND({Esperienza}="${esperienza}",DATESTR({Data})>"${data}",DATESTR({Data})<"${dataFineStr}",{Stato}="Aperto",{Posti disponibili}>0)`
        );
        const altResult = await atFetch('GET', TABLE_SLOTS, {
          query: `filterByFormula=${fAlt}&sort[0][field]=Data&sort[0][direction]=asc&maxRecords=3`,
        });
        const altDates = [...new Set((altResult.records || []).map(r => {
          const d = r.fields['Data'];
          return d ? new Date(d).toISOString().split('T')[0] : null;
        }).filter(Boolean))];

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
        `AND({Esperienza}="${esperienza}",DATESTR({Data})="${data}",{Orario}="${orario}",{Stato}="Aperto")`
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

    // ════════════════════════════════════════════════════════
    // ACTION: get_next_dates
    // Cerca le prossime date disponibili per un'esperienza
    // a partire da una data di riferimento (max 5 date, 90gg)
    // ════════════════════════════════════════════════════════
    if (action === 'get_next_dates') {
      const { esperienza, da_data, partecipanti } = req.body;
      if (!esperienza || !da_data) {
        return res.status(400).json({ error: 'esperienza e da_data sono obbligatori' });
      }

      const numPax     = Math.max(1, Number(partecipanti) || 1);
      const dataDa     = normalizeDate(da_data);
      const dataFineObj = new Date(dataDa);
      dataFineObj.setDate(dataFineObj.getDate() + 90);
      const dataFine   = dataFineObj.toISOString().split('T')[0];

      const formula = encodeURIComponent(
        `AND({Esperienza}="${esperienza}",DATESTR({Data})>"${dataDa}",DATESTR({Data})<"${dataFine}",{Stato}="Aperto",{Posti disponibili}>=${numPax})`
      );
      const result = await atFetch('GET', TABLE_SLOTS, {
        query: `filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=asc&sort[1][field]=Orario&sort[1][direction]=asc`,
      });

      const records = result.records || [];

      if (records.length === 0) {
        return res.status(200).json({
          found: false, esperienza, da_data: dataDa, partecipanti: numPax,
          message: `Nessuna disponibilità nei prossimi 90 giorni per ${esperienza} con ${numPax} partecipanti.`,
          dates: [],
        });
      }

      // Raggruppa per data normalizzata — max 5 date distinte
      const dateMap = {};
      for (const r of records) {
        const rawD = r.fields['Data'];
        if (!rawD) continue;
        // Airtable può restituire la data come "2026-04-05" o come timestamp
        const d = rawD.includes('T') ? rawD.split('T')[0] : rawD.substring(0, 10);
        if (!dateMap[d]) {
          if (Object.keys(dateMap).length >= 5) break;
          dateMap[d] = [];
        }
        dateMap[d].push({
          orario:      r.fields['Orario']            || '',
          postiLiberi: r.fields['Posti disponibili'] || 0,
        });
      }

      const dates = Object.entries(dateMap).map(([data, slots]) => ({ data, slots }));

      return res.status(200).json({
        found: true, esperienza, da_data: dataDa, partecipanti: numPax, dates,
      });
    }

    return res.status(400).json({
      error: 'Azione non valida. Azioni disponibili: check_availability, create_booking, get_next_dates, update_status',
    });

  } catch (err) {
    console.error('[airtable.js] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

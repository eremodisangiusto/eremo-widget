// ============================================================
// Eremo di San Giusto — api/staff.js
// Backoffice staff: autenticazione PIN + query profilate
//
// Env vars richieste:
//   AIRTABLE_KB_BASE_ID  = appmD2j2K3YBDnrC9
//   AIRTABLE_TOKEN       = pat6xQf9...
//   BEDS24_LONG_LIFE_TOKEN
//   ANTHROPIC_API_KEY
// ============================================================

const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_KB    = process.env.AIRTABLE_KB_BASE_ID;
const AIRTABLE_EXP   = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BEDS24_TOKEN   = process.env.BEDS24_LONG_LIFE_TOKEN;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;

// ── Helper Airtable KB ───────────────────────────────────────
async function atKB(method, table, { id, query, body } = {}) {
  let url = `${AIRTABLE_API}/${AIRTABLE_KB}/${encodeURIComponent(table)}`;
  if (id) url += `/${id}`;
  if (query) url += `?${query}`;
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || `Airtable ${resp.status}`);
  return data;
}

// ── Helper Airtable Esperienze ───────────────────────────────
async function atExp(method, table, { id, query, body } = {}) {
  let url = `${AIRTABLE_API}/${AIRTABLE_EXP}/${encodeURIComponent(table)}`;
  if (id) url += `/${id}`;
  if (query) url += `?${query}`;
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || `Airtable ${resp.status}`);
  return data;
}

// ── Helper: Beds24 API V2 bookings ──────────────────────────
// Date format: YYYYMMDD (no dashes) — propertyId non serve, il token identifica la property
async function getBeds24Bookings(params = {}) {
  const qs = new URLSearchParams({ ...params }).toString();
  const resp = await fetch(`https://beds24.com/api/v2/bookings?${qs}`, {
    headers: { 'token': BEDS24_TOKEN }
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Beds24 ${resp.status}: ${text.substring(0, 200)}`);
  return JSON.parse(text);
}

// ── Helper: formatta data in YYYY-MM-DD (formato Beds24 V2) ──
function toB24Date(dateStr) {
  return dateStr; // già in YYYY-MM-DD da toISOString()
}

// ── Autentica PIN da Airtable Staff ─────────────────────────
async function autenticaPIN(pin) {
  const formula = encodeURIComponent(`AND({PIN}="${pin}",{Attivo}=TRUE())`);
  const result = await atKB('GET', 'Staff', { query: `filterByFormula=${formula}&maxRecords=1` });
  const record = result.records?.[0];
  if (!record) return null;
  return {
    id:      record.id,
    nome:    record.fields['Nome']     || '',
    ruolo:   record.fields['Ruolo']    || '',
    email:   record.fields['Email']    || '',
    telefono: record.fields['Telefono'] || '',
  };
}

// ── QUERY PULIZIE: arrivi e partenze ─────────────────────────
async function queryPulizie(giorni = 7) {
  const oggi = new Date();
  const fine = new Date(oggi);
  fine.setDate(fine.getDate() + giorni);
  const da  = toB24Date(oggi.toISOString().split('T')[0]);
  const a   = toB24Date(fine.toISOString().split('T')[0]);

  const [arrivi, partenze] = await Promise.all([
    getBeds24Bookings({ arrivalFrom: da, arrivalTo: a,  includeInfoItems: true }),
    getBeds24Bookings({ departureFrom: da, departureTo: a,  includeInfoItems: true }),
  ]);

  const formatBooking = (b) => ({
    id:        b.id,
    checkin:   b.arrival,
    checkout:  b.departure,
    ospiti:    (b.numAdult || 1) + (b.numChild || 0),
    nome:      `${b.guestFirstName || ''} ${b.guestLastName || ''}`.trim() || 'Ospite',
    stanza:    b.roomId || '',
    note:      b.guestNotes || '',
  });

  return {
    periodo: { da: oggi.toISOString().split('T')[0], a: fine.toISOString().split('T')[0] },
    arrivi:   (arrivi.data   || []).map(formatBooking),
    partenze: (partenze.data || []).map(formatBooking),
  };
}

// ── QUERY ACCOGLIENZA: arrivi con dettagli ───────────────────
async function queryAccoglienza(giorni = 3) {
  const oggi = new Date();
  const fine = new Date(oggi);
  fine.setDate(fine.getDate() + giorni);
  const da = toB24Date(oggi.toISOString().split('T')[0]);
  const a  = toB24Date(fine.toISOString().split('T')[0]);

  const result = await getBeds24Bookings({ arrivalFrom: da, arrivalTo: a,  includeInfoItems: true });

  return (result.data || []).map(b => ({
    id:           b.id,
    checkin:      b.arrival,
    checkout:     b.departure,
    ospiti:       (b.numAdult || 1) + (b.numChild || 0),
    nome:         `${b.guestFirstName || ''} ${b.guestLastName || ''}`.trim() || 'Ospite',
    email:        b.guestEmail    || '',
    telefono:     b.guestPhone    || b.guestMobile || '',
    paese:        b.guestCountry  || '',
    note:         b.guestNotes    || '',
    orarioArrivo: b.infoItems?.find(i => i.code === 'ETA')?.text || 'non specificato',
    stanza:       b.roomId || '',
  }));
}

// ── QUERY GUIDE: esperienze prenotate ────────────────────────
async function queryEsperienze(giorni = 7, nomeguida = null) {
  const oggi = new Date();
  const fine = new Date(oggi);
  fine.setDate(fine.getDate() + giorni);
  const da = oggi.toISOString().split('T')[0];
  const a  = fine.toISOString().split('T')[0];

  const formula = encodeURIComponent(
    `AND(DATESTR({Data})>="${da}",DATESTR({Data})<="${a}",{Stato prenotazione}="In attesa")`
  );
  const result = await atExp('GET', 'Prenotazioni', {
    query: `filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=asc&sort[1][field]=Orario&sort[1][direction]=asc`,
  });

  return (result.records || []).map(r => ({
    ref:          r.fields['Booking ref']        || '',
    esperienza:   r.fields['Esperienza']         || '',
    data:         r.fields['Data']               || '',
    orario:       r.fields['Orario']             || '',
    partecipanti: r.fields['Partecipanti']       || 0,
    nome:         `${r.fields['Nome'] || ''} ${r.fields['Cognome'] || ''}`.trim(),
    email:        r.fields['Email']              || '',
    telefono:     r.fields['Telefono']           || '',
    tipo:         r.fields['Prezzo']             || '',
    totale:       r.fields['Totale €']           || 0,
    note:         r.fields['Note Ospiti']        || '',
    stato:        r.fields['Stato prenotazione'] || '',
  }));
}

// ── TIMBRATURA: registra entrata/uscita ──────────────────────
async function timbra(staffInfo, tipo, note = '') {
  const ora  = new Date();
  const data = ora.toISOString().split('T')[0];
  const oraStr = ora.toTimeString().slice(0,5);

  if (tipo === 'entrata') {
    // Crea nuovo record presenze
    await atKB('POST', 'Presenze', {
      body: {
        records: [{
          fields: {
            'Nome':       staffInfo.nome,
            'Ruolo':      staffInfo.ruolo,
            'Data':       data,
            'Ora entrata': oraStr,
            'Note':       note,
          }
        }]
      }
    });
    return { success: true, tipo: 'entrata', ora: oraStr, data };
  }

  if (tipo === 'uscita') {
    // Trova record di oggi senza uscita
    const formula = encodeURIComponent(
      `AND({Nome}="${staffInfo.nome}",DATESTR({Data})="${data}",{Ora uscita}="")`
    );
    const existing = await atKB('GET', 'Presenze', {
      query: `filterByFormula=${formula}&maxRecords=1&sort[0][field]=Ora entrata&sort[0][direction]=desc`
    });
    const record = existing.records?.[0];
    if (!record) return { success: false, error: 'Nessuna entrata registrata oggi' };

    // Calcola ore totali
    const entrata = record.fields['Ora entrata'] || '00:00';
    const [hE, mE] = entrata.split(':').map(Number);
    const [hU, mU] = oraStr.split(':').map(Number);
    const minTotali = (hU * 60 + mU) - (hE * 60 + mE);
    const oreTotali = Math.round((minTotali / 60) * 100) / 100;

    await atKB('PATCH', 'Presenze', {
      id:   record.id,
      body: { fields: { 'Ora uscita': oraStr, 'Ore totali': oreTotali, 'Note': note } }
    });
    return { success: true, tipo: 'uscita', ora: oraStr, data, oreTotali, entrata };
  }

  return { success: false, error: 'Tipo non valido: usa entrata o uscita' };
}

// ── PRESENZE: storico mese corrente ─────────────────────────
async function queryPresenze(nome, giorni = 30) {
  const da = new Date();
  da.setDate(da.getDate() - giorni);
  const daStr = da.toISOString().split('T')[0];
  const formula = encodeURIComponent(
    `AND({Nome}="${nome}",DATESTR({Data})>="${daStr}")`
  );
  const result = await atKB('GET', 'Presenze', {
    query: `filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=desc`
  });
  const records = result.records || [];
  const oreTotali = records.reduce((acc, r) => acc + (r.fields['Ore totali'] || 0), 0);
  return {
    records: records.map(r => ({
      data:      r.fields['Data']        || '',
      entrata:   r.fields['Ora entrata'] || '',
      uscita:    r.fields['Ora uscita']  || '—',
      ore:       r.fields['Ore totali']  || 0,
      note:      r.fields['Note']        || '',
    })),
    oreTotali: Math.round(oreTotali * 100) / 100,
    giorni: records.length,
  };
}

// ── CLAUDE: sintetizza risposta profilata ────────────────────
async function claudeRisposta(staffInfo, domanda, dati) {
  const ruoloPrompt = {
    pulizie: `Sei Sofia, assistente backoffice dell'Eremo di San Giusto per il personale pulizie.
Parla con ${staffInfo.nome} in modo diretto e pratico.
Hai accesso a: prenotazioni (arrivi/partenze), registro presenze (timbratura), report.
Formato risposte: usa elenchi chiari con date e orari ben evidenziati.
Per la timbratura: quando ${staffInfo.nome} dice "sono arrivata/o" → registra entrata. Quando dice "sto uscendo/ho finito" → registra uscita e mostra le ore fatte.
Per i report pulizie: indica chiaramente quali camere vanno pulite, quando, e quante persone arrivano/partono.`,

    accoglienza: `Sei Sofia, assistente backoffice dell'Eremo di San Giusto per il personale di accoglienza.
Parla con ${staffInfo.nome} in modo professionale e cordiale.
Hai accesso a: prenotazioni in arrivo con dettagli ospiti, orari check-in, note speciali, numero telefono ospiti.
Formato risposte: mostra nome ospite, data/ora arrivo, numero ospiti, telefono, eventuali note o richieste speciali.
Per le indicazioni stradali: l'Eremo è a Monte Morrone, 2km da Ostuni centro, coordinate 40.7285, 17.5810.`,

    guida: `Sei Sofia, assistente backoffice dell'Eremo di San Giusto per le guide esperienze.
Parla con ${staffInfo.nome} in modo diretto e informativo.
Hai accesso a: prenotazioni esperienze con partecipanti, riferimenti ospiti, note speciali, orari.
Formato risposte: raggruppa per giorno ed esperienza. Mostra chiaramente: esperienza, data, orario, N partecipanti, nome ospite, telefono, note.`,

    gestore: `Sei Sofia, assistente backoffice completo dell'Eremo di San Giusto per il gestore Tommaso.
Hai accesso a tutte le informazioni: prenotazioni, esperienze, presenze staff, report.
Formato risposte: completo e dettagliato con tutti i dati disponibili.`,
  };

  const systemPrompt = (ruoloPrompt[staffInfo.ruolo] || ruoloPrompt.gestore)
    + `\n\nDATA OGGI: ${new Date().toISOString().split('T')[0]}`
    + `\n\nDATI DISPONIBILI:\n${JSON.stringify(dati, null, 2)}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: domanda }],
    }),
  });
  const data = await resp.json();
  return data.content?.[0]?.text || 'Mi dispiace, riprova.';
}

// ── HANDLER PRINCIPALE ───────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { action, pin, domanda, tipo, note, staffId, nome } = req.body;

  try {

    // ── LOGIN: verifica PIN ──────────────────────────────────
    if (action === 'login') {
      if (!pin) return res.status(400).json({ error: 'PIN obbligatorio' });
      const staff = await autenticaPIN(pin);
      if (!staff) return res.status(401).json({ error: 'PIN non valido o account disattivato' });
      return res.status(200).json({ success: true, staff });
    }

    // ── CHAT: risposta profilata per ruolo ───────────────────
    if (action === 'chat') {
      if (!pin || !domanda) return res.status(400).json({ error: 'pin e domanda obbligatori' });
      const staff = await autenticaPIN(pin);
      if (!staff) return res.status(401).json({ error: 'PIN non valido' });

      let dati = {};

      // Carica dati in base al ruolo
      if (staff.ruolo === 'pulizie') {
        dati = await queryPulizie(7);
        // Aggiungi presenze recenti
        const presenze = await queryPresenze(staff.nome, 7);
        dati.presenze = presenze;
      } else if (staff.ruolo === 'accoglienza') {
        dati.arrivi = await queryAccoglienza(3);
      } else if (staff.ruolo === 'guida') {
        dati.esperienze = await queryEsperienze(7);
      } else if (staff.ruolo === 'gestore') {
        const [pulizie, accoglienza, esperienze] = await Promise.all([
          queryPulizie(7),
          queryAccoglienza(3),
          queryEsperienze(7),
        ]);
        dati = { pulizie, accoglienza, esperienze };
      }

      const risposta = await claudeRisposta(staff, domanda, dati);
      return res.status(200).json({ success: true, risposta, staff: { nome: staff.nome, ruolo: staff.ruolo } });
    }

    // ── TIMBRATURA: entrata/uscita ───────────────────────────
    if (action === 'timbra') {
      if (!pin || !tipo) return res.status(400).json({ error: 'pin e tipo (entrata|uscita) obbligatori' });
      const staff = await autenticaPIN(pin);
      if (!staff) return res.status(401).json({ error: 'PIN non valido' });
      if (staff.ruolo !== 'pulizie' && staff.ruolo !== 'gestore') {
        return res.status(403).json({ error: 'Timbratura disponibile solo per il personale pulizie' });
      }
      const result = await timbra(staff, tipo, note || '');
      return res.status(200).json({ ...result, nome: staff.nome });
    }

    // ── PRESENZE: storico ────────────────────────────────────
    if (action === 'presenze') {
      if (!pin) return res.status(400).json({ error: 'pin obbligatorio' });
      const staff = await autenticaPIN(pin);
      if (!staff) return res.status(401).json({ error: 'PIN non valido' });
      const giorni = req.body.giorni || 30;
      const result = await queryPresenze(staff.nome, giorni);
      return res.status(200).json({ success: true, ...result, nome: staff.nome });
    }

    // ── DATI GREZZI: per report email ────────────────────────
    if (action === 'get_data') {
      if (!pin) return res.status(400).json({ error: 'pin obbligatorio' });
      const staff = await autenticaPIN(pin);
      if (!staff) return res.status(401).json({ error: 'PIN non valido' });

      const tipo_data = req.body.tipo_data || 'pulizie';
      const giorni = req.body.giorni || 7;

      if (tipo_data === 'pulizie')      return res.status(200).json(await queryPulizie(giorni));
      if (tipo_data === 'accoglienza')  return res.status(200).json({ arrivi: await queryAccoglienza(giorni) });
      if (tipo_data === 'esperienze')   return res.status(200).json({ esperienze: await queryEsperienze(giorni) });
      return res.status(400).json({ error: 'tipo_data non valido' });
    }

    return res.status(400).json({ error: `Azione non valida: ${action}` });

  } catch (err) {
    console.error('[staff.js]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

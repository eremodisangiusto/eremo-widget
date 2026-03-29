// ============================================================
// Eremo di San Giusto — api/staff-notify.js
// Report email per staff: arrivi, partenze, pulizie, esperienze
// Chiamato manualmente da Sofia o automaticamente ogni mattina
// ============================================================

const RESEND_KEY     = process.env.RESEND_API_KEY;
const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_KB    = process.env.AIRTABLE_KB_BASE_ID;
const AIRTABLE_EXP   = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BEDS24_TOKEN   = process.env.BEDS24_LONG_LIFE_TOKEN;

const FROM_EMAIL  = 'sofia@contact.eremodisangiusto.it';
const GESTORE_EMAIL = 'info@eremodisangiusto.it';

// ── Helper stile email ───────────────────────────────────────
const headerHtml = `
  <div style="background:#2c2218;padding:16px 24px;border-radius:12px 12px 0 0;">
    <div style="font-family:'Georgia',serif;font-size:1.2rem;color:#c8a97e;font-weight:600;">🫒 Eremo di San Giusto</div>
    <div style="font-size:0.72rem;color:rgba(200,169,126,0.7);letter-spacing:0.1em;text-transform:uppercase;margin-top:2px;">Sofia · Backoffice Staff</div>
  </div>`;

const footerHtml = `
  <div style="background:#f2ece2;padding:10px 24px;border-radius:0 0 12px 12px;font-size:0.72rem;color:#8a7560;text-align:center;">
    Report generato automaticamente da Sofia · Eremo di San Giusto
  </div>`;

function wrapEmail(titolo, contenuto) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:'Arial',sans-serif;border-radius:12px;overflow:hidden;border:1px solid #ece4d8;">
      ${headerHtml}
      <div style="background:#faf7f2;padding:24px;">
        <h2 style="font-family:'Georgia',serif;color:#2c2218;margin:0 0 16px;font-size:1.3rem;">${titolo}</h2>
        ${contenuto}
      </div>
      ${footerHtml}
    </div>`;
}

function row(label, value) {
  return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f2ece2;font-size:0.84rem;">
    <span style="color:#5a4a38;">${label}</span>
    <span style="color:#2c2218;font-weight:500;">${value || '—'}</span>
  </div>`;
}

function bookingCard(b, tipo = 'arrivo') {
  const colore = tipo === 'arrivo' ? '#3b6d11' : '#a32d2d';
  const label  = tipo === 'arrivo' ? 'CHECK-IN' : 'CHECK-OUT';
  return `
    <div style="background:#fff;border:1px solid #ece4d8;border-radius:10px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-weight:600;color:#2c2218;font-size:0.9rem;">${b.nome || 'Ospite'}</span>
        <span style="background:${colore}22;color:${colore};font-size:0.68rem;padding:2px 8px;border-radius:20px;font-weight:500;">${label}</span>
      </div>
      ${row('Data', b.checkin || b.arrival)}
      ${row('Ospiti', `${b.ospiti || b.numAdult || 1} persone`)}
      ${b.telefono ? row('Telefono', b.telefono) : ''}
      ${b.orarioArrivo && b.orarioArrivo !== 'non specificato' ? row('Ora arrivo', b.orarioArrivo) : ''}
      ${b.note ? `<div style="margin-top:8px;background:#faeeda;border-radius:6px;padding:8px 10px;font-size:0.76rem;color:#633806;">Note: ${b.note}</div>` : ''}
    </div>`;
}

function esperienzaCard(e) {
  return `
    <div style="background:#fff;border:1px solid #ece4d8;border-radius:10px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-weight:600;color:#2c2218;font-size:0.88rem;">${e.esperienza}</span>
        <span style="background:#e6f1fb;color:#0c447c;font-size:0.68rem;padding:2px 8px;border-radius:20px;">${e.data} · ${e.orario}</span>
      </div>
      ${row('Partecipanti', `${e.partecipanti} persone`)}
      ${row('Ospite', e.nome)}
      ${e.telefono ? row('Telefono', e.telefono) : ''}
      ${row('Tipo', e.tipo)}
      ${row('Totale', `€${e.totale}`)}
      ${row('Rif.', e.ref)}
      ${e.note ? `<div style="margin-top:8px;background:#faeeda;border-radius:6px;padding:8px 10px;font-size:0.76rem;color:#633806;">Note: ${e.note}</div>` : ''}
    </div>`;
}

// ── Invia email via Resend ───────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      Array.isArray(to) ? to : [to],
      bcc:     [GESTORE_EMAIL],
      subject,
      html,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }
  return await resp.json();
}

// ── Fetch Beds24 prenotazioni ────────────────────────────────
// Date format: YYYYMMDD — propertyId non serve in V2, il token identifica la property
function toB24Date(dateStr) { return dateStr.replace(/-/g, ''); }

async function getBeds24(params) {
  const qs = new URLSearchParams({ ...params }).toString();
  const resp = await fetch(`https://beds24.com/api/v2/bookings?${qs}`, {
    headers: { 'token': BEDS24_TOKEN }
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Beds24 ${resp.status}: ${text.substring(0,200)}`);
  const d = JSON.parse(text);
  return d.data || [];
}

// ── Fetch Airtable prenotazioni esperienze ───────────────────
async function getEsperienze(da, a) {
  const formula = encodeURIComponent(
    `AND(DATESTR({Data})>="${da}",DATESTR({Data})<="${a}",{Stato prenotazione}="In attesa")`
  );
  const resp = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_EXP}/Prenotazioni?filterByFormula=${formula}&sort[0][field]=Data&sort[0][direction]=asc`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` } }
  );
  const data = await resp.json();
  return (data.records || []).map(r => ({
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
  }));
}

// ── Fetch staff attivo ───────────────────────────────────────
async function getStaffByRuolo(ruolo) {
  const formula = encodeURIComponent(`AND({Ruolo}="${ruolo}",{Attivo}=TRUE())`);
  const resp = await fetch(
    `${AIRTABLE_API}/${AIRTABLE_KB}/Staff?filterByFormula=${formula}`,
    { headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` } }
  );
  const data = await resp.json();
  return (data.records || []).map(r => ({
    nome:  r.fields['Nome']  || '',
    email: r.fields['Email'] || '',
  }));
}

// ── REPORT: PULIZIE ──────────────────────────────────────────
async function reportPulizie(giorni = 1) {
  const oggi = new Date();
  const fine = new Date(oggi);
  fine.setDate(fine.getDate() + giorni);
  const da    = toB24Date(oggi.toISOString().split('T')[0]);
  const a     = toB24Date(fine.toISOString().split('T')[0]);
  const daFmt = oggi.toISOString().split('T')[0];

  const [arrivi, partenze, staff] = await Promise.all([
    getBeds24({ arrivalFrom: da, arrivalTo: a, status: 1, includeInfoItems: true }),
    getBeds24({ departureFrom: da, departureTo: a, status: 1, includeInfoItems: true }),
    getStaffByRuolo('pulizie'),
  ]);

  const titoloPeriodo = giorni === 1 ? 'oggi' : `prossimi ${giorni} giorni`;

  const html = wrapEmail(
    `Pulizie — ${titoloPeriodo}`,
    `<p style="color:#5a4a38;font-size:0.85rem;margin-bottom:16px;">
      ${partenze.length} partenze · ${arrivi.length} arrivi previsti
    </p>
    ${partenze.length ? `<h3 style="color:#a32d2d;font-size:0.85rem;margin:0 0 8px;">Camere da liberare (partenze)</h3>${partenze.map(b => bookingCard({...b, checkin: b.departure, ospiti: b.numAdult + (b.numChild||0), nome: `${b.guestFirstName||''} ${b.guestLastName||''}`.trim()}, 'partenza')).join('')}` : '<p style="color:#5a4a38;font-size:0.84rem;">Nessuna partenza nel periodo.</p>'}
    ${arrivi.length ? `<h3 style="color:#3b6d11;font-size:0.85rem;margin:16px 0 8px;">Camere da preparare (arrivi)</h3>${arrivi.map(b => bookingCard({...b, checkin: b.arrival, ospiti: b.numAdult + (b.numChild||0), nome: `${b.guestFirstName||''} ${b.guestLastName||''}`.trim(), orarioArrivo: b.infoItems?.find(i=>i.code==='ETA')?.text})).join('')}` : ''}`
  );

  const emails = staff.map(s => s.email).filter(Boolean);
  if (emails.length === 0) throw new Error('Nessun membro del personale pulizie attivo');

  await sendEmail({
    to: emails,
    subject: `🧹 Pulizie Eremo — ${titoloPeriodo} (${daFmt})`,
    html,
  });

  return { inviato: true, destinatari: emails, arrivi: arrivi.length, partenze: partenze.length };
}

// ── REPORT: ACCOGLIENZA ──────────────────────────────────────
async function reportAccoglienza(giorni = 1) {
  const oggi = new Date();
  const fine = new Date(oggi);
  fine.setDate(fine.getDate() + giorni);
  const da    = toB24Date(oggi.toISOString().split('T')[0]);
  const a     = toB24Date(fine.toISOString().split('T')[0]);
  const daFmt = oggi.toISOString().split('T')[0];

  const [arrivi, staff] = await Promise.all([
    getBeds24({ arrivalFrom: da, arrivalTo: a, status: 1, includeInfoItems: true }),
    getStaffByRuolo('accoglienza'),
  ]);

  const html = wrapEmail(
    `Arrivi — prossimi ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}`,
    `<p style="color:#5a4a38;font-size:0.85rem;margin-bottom:16px;">${arrivi.length} arrivi previsti</p>
    ${arrivi.length
      ? arrivi.map(b => bookingCard({
          checkin: b.arrival,
          nome: `${b.guestFirstName||''} ${b.guestLastName||''}`.trim(),
          ospiti: b.numAdult + (b.numChild||0),
          telefono: b.guestPhone || b.guestMobile,
          orarioArrivo: b.infoItems?.find(i=>i.code==='ETA')?.text,
          note: b.infoItems?.find(i=>i.code==='GUESTMESSAGE')?.text,
        })).join('')
      : '<p style="color:#5a4a38;font-size:0.84rem;">Nessun arrivo nel periodo.</p>'
    }`
  );

  const emails = staff.map(s => s.email).filter(Boolean);
  if (emails.length === 0) throw new Error('Nessun membro accoglienza attivo');

  await sendEmail({
    to: emails,
    subject: `🏡 Arrivi Eremo — ${daFmt}`,
    html,
  });

  return { inviato: true, destinatari: emails, arrivi: arrivi.length };
}

// ── REPORT: ESPERIENZE ───────────────────────────────────────
async function reportEsperienze(giorni = 7) {
  const oggi = new Date().toISOString().split('T')[0];
  const fine = new Date();
  fine.setDate(fine.getDate() + giorni);
  const a = fine.toISOString().split('T')[0];

  const [esperienze, staff] = await Promise.all([
    getEsperienze(oggi, a),
    getStaffByRuolo('guida'),
  ]);

  const html = wrapEmail(
    `Esperienze — prossimi ${giorni} giorni`,
    `<p style="color:#5a4a38;font-size:0.85rem;margin-bottom:16px;">${esperienze.length} prenotazioni</p>
    ${esperienze.length
      ? esperienze.map(e => esperienzaCard(e)).join('')
      : '<p style="color:#5a4a38;font-size:0.84rem;">Nessuna esperienza prenotata nel periodo.</p>'
    }`
  );

  const emails = staff.map(s => s.email).filter(Boolean);
  if (emails.length === 0) throw new Error('Nessuna guida attiva');

  await sendEmail({
    to: emails,
    subject: `⭐ Esperienze Eremo — prossimi ${giorni} giorni`,
    html,
  });

  return { inviato: true, destinatari: emails, esperienze: esperienze.length };
}

// ── REPORT: GIORNALIERO COMPLETO (gestore) ───────────────────
async function reportGiornaliero() {
  const oggi    = new Date().toISOString().split('T')[0];
  const fine7   = new Date(); fine7.setDate(fine7.getDate() + 7);
  const a7      = fine7.toISOString().split('T')[0];
  const daB24   = toB24Date(oggi);
  const a1      = new Date(); a1.setDate(a1.getDate() + 1);
  const a1B24   = toB24Date(a1.toISOString().split('T')[0]);

  const [arriviOggi, partenzaOggi, esperienze7] = await Promise.all([
    getBeds24({ arrivalFrom: daB24, arrivalTo: a1B24, status: 1, includeInfoItems: true }),
    getBeds24({ departureFrom: daB24, departureTo: a1B24, status: 1 }),
    getEsperienze(oggi, a7),
  ]);

  const html = wrapEmail(
    `Report giornaliero — ${oggi}`,
    `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#fff;border:1px solid #ece4d8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:1.8rem;color:#3b6d11;font-weight:600;">${arriviOggi.length}</div>
        <div style="font-size:0.72rem;color:#5a4a38;">Arrivi oggi</div>
      </div>
      <div style="background:#fff;border:1px solid #ece4d8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:1.8rem;color:#a32d2d;font-weight:600;">${partenzaOggi.length}</div>
        <div style="font-size:0.72rem;color:#5a4a38;">Partenze oggi</div>
      </div>
      <div style="background:#fff;border:1px solid #ece4d8;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:1.8rem;color:#185fa5;font-weight:600;">${esperienze7.length}</div>
        <div style="font-size:0.72rem;color:#5a4a38;">Esperienze 7gg</div>
      </div>
    </div>
    ${arriviOggi.length ? `<h3 style="color:#3b6d11;font-size:0.85rem;margin:0 0 8px;">Arrivi oggi</h3>${arriviOggi.map(b => bookingCard({checkin: b.arrival, nome: `${b.guestFirstName||''} ${b.guestLastName||''}`.trim(), ospiti: b.numAdult+(b.numChild||0), telefono: b.guestPhone||b.guestMobile, orarioArrivo: b.infoItems?.find(i=>i.code==='ETA')?.text})).join('')}` : ''}
    ${partenzaOggi.length ? `<h3 style="color:#a32d2d;font-size:0.85rem;margin:16px 0 8px;">Partenze oggi</h3>${partenzaOggi.map(b => bookingCard({checkin: b.departure, nome: `${b.guestFirstName||''} ${b.guestLastName||''}`.trim(), ospiti: b.numAdult+(b.numChild||0)}, 'partenza')).join('')}` : ''}
    ${esperienze7.length ? `<h3 style="color:#185fa5;font-size:0.85rem;margin:16px 0 8px;">Prossime esperienze (7 giorni)</h3>${esperienze7.slice(0,5).map(e => esperienzaCard(e)).join('')}${esperienze7.length > 5 ? `<p style="font-size:0.78rem;color:#8a7560;">...e altre ${esperienze7.length-5} esperienze</p>` : ''}` : ''}`
  );

  await sendEmail({
    to: [GESTORE_EMAIL],
    subject: `📋 Report giornaliero Eremo — ${oggi}`,
    html,
  });

  return { inviato: true, arrivi: arriviOggi.length, partenze: partenzaOggi.length, esperienze: esperienze7.length };
}

// ── HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { tipo, giorni } = req.method === 'POST' ? req.body : req.query;

  try {
    if (!tipo) return res.status(400).json({ error: 'tipo obbligatorio: pulizie|accoglienza|esperienze|giornaliero' });

    let result;
    if (tipo === 'pulizie')      result = await reportPulizie(Number(giorni) || 1);
    else if (tipo === 'accoglienza') result = await reportAccoglienza(Number(giorni) || 1);
    else if (tipo === 'esperienze')  result = await reportEsperienze(Number(giorni) || 7);
    else if (tipo === 'giornaliero') result = await reportGiornaliero();
    else return res.status(400).json({ error: `tipo non valido: ${tipo}` });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[staff-notify.js]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

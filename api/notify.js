// ============================================================
// Eremo di San Giusto — api/notify.js
// Invia email di conferma via Resend
// Dominio verificato: contact.eremodisangiusto.it
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const {
    type,        // 'room_confirmed' | 'experience_confirmed' | 'room_pending'
    bookingId,
    firstName,
    lastName,
    email,
    notes,
  } = req.body;

  if (!email) return res.status(400).json({ error: 'Email mancante' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY non configurata' });

  // ── Costruisci il contenuto email in base al tipo ─────────
  let subject, html;

  const firma = `
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ece4d8;font-family:'Georgia',serif;font-size:13px;color:#8a7560;">
      <strong style="color:#2c2218;">Eremo di San Giusto</strong><br>
      Monte Morrone · Ostuni, Puglia<br>
      <a href="https://www.eremodisangiusto.it" style="color:#8a6030;">www.eremodisangiusto.it</a> ·
      <a href="mailto:info@eremodisangiusto.it" style="color:#8a6030;">info@eremodisangiusto.it</a>
    </div>
  `;

  const header = `
    <div style="background:linear-gradient(135deg,#2c2218,#3a2e22);padding:24px 32px;border-radius:12px 12px 0 0;">
      <div style="font-family:'Georgia',serif;font-size:22px;color:#c8a97e;letter-spacing:0.04em;">🫒 Eremo di San Giusto</div>
      <div style="font-family:'Arial',sans-serif;font-size:11px;color:#8a7060;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">Ostuni · Puglia</div>
    </div>
  `;

  if (type === 'room_confirmed' || type === 'room_pending') {
    const isPending = type === 'room_pending';
    subject = isPending
      ? `Carta autorizzata — Prenotazione ${bookingId} · Eremo di San Giusto`
      : `Prenotazione confermata ${bookingId} · Eremo di San Giusto`;

    html = `
      <div style="max-width:560px;margin:0 auto;background:#faf7f2;border-radius:12px;overflow:hidden;font-family:'Arial',sans-serif;">
        ${header}
        <div style="padding:32px;">
          <p style="font-size:16px;color:#2c2218;">Caro/a ${firstName},</p>
          ${isPending
            ? `<p style="color:#5a4a38;line-height:1.7;">La tua carta è stata autorizzata con successo. <strong>La camera è garantita</strong> — l'addebito avverrà all'arrivo.</p>`
            : `<p style="color:#5a4a38;line-height:1.7;">La tua prenotazione è <strong>confermata</strong>. Ti aspettiamo all'Eremo di San Giusto!</p>`
          }
          <div style="background:#fff;border-radius:10px;border:1px solid #ece4d8;padding:20px;margin:20px 0;">
            <div style="font-size:12px;color:#8a7560;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Dettagli prenotazione</div>
            <div style="font-size:14px;color:#2c2218;"><strong>Codice:</strong> ${bookingId}</div>
            ${notes ? `<div style="font-size:13px;color:#5a4a38;margin-top:8px;">${notes}</div>` : ''}
          </div>
          <div style="background:#f5ede0;border-radius:8px;padding:16px;font-size:13px;color:#5a4a38;line-height:1.6;">
            📍 <strong>Come raggiungerci:</strong> Monte Morrone, Ostuni (BR) — 2 km dal centro storico.<br>
            🕐 <strong>Check-in:</strong> dalle 15:00 &nbsp;|&nbsp; <strong>Check-out:</strong> entro le 10:30
          </div>
          ${firma}
        </div>
      </div>
    `;

  } else if (type === 'experience_confirmed') {
    subject = `Esperienza confermata ${bookingId} · Eremo di San Giusto`;

    html = `
      <div style="max-width:560px;margin:0 auto;background:#faf7f2;border-radius:12px;overflow:hidden;font-family:'Arial',sans-serif;">
        ${header}
        <div style="padding:32px;">
          <p style="font-size:16px;color:#2c2218;">Caro/a ${firstName},</p>
          <p style="color:#5a4a38;line-height:1.7;">La tua esperienza è <strong>confermata</strong>. Non vediamo l'ora di accoglierti! 🫒</p>
          <div style="background:#fff;border-radius:10px;border:1px solid #ece4d8;padding:20px;margin:20px 0;">
            <div style="font-size:12px;color:#8a7560;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Dettagli prenotazione</div>
            <div style="font-size:14px;color:#2c2218;"><strong>Codice:</strong> ${bookingId}</div>
            ${notes ? `<div style="font-size:13px;color:#5a4a38;margin-top:8px;">${notes}</div>` : ''}
          </div>
          <div style="background:#f5ede0;border-radius:8px;padding:16px;font-size:13px;color:#5a4a38;line-height:1.6;">
            📍 <strong>Punto di ritrovo:</strong> Eremo di San Giusto, Monte Morrone, Ostuni<br>
            ℹ️ Per qualsiasi necessità: <a href="mailto:info@eremodisangiusto.it" style="color:#8a6030;">info@eremodisangiusto.it</a>
          </div>
          <div style="margin-top:16px;background:#fff8f0;border-left:3px solid #c8a97e;padding:12px 16px;font-size:13px;color:#5a4a38;border-radius:0 8px 8px 0;">
            <strong>Politica di cancellazione:</strong> gratuita fino a 48h prima · 50% rimborso tra 24h e 48h · nessun rimborso entro 24h.
          </div>
          ${firma}
        </div>
      </div>
    `;

  } else {
    return res.status(400).json({ error: `Tipo email non riconosciuto: ${type}` });
  }

  // ── Invia via Resend ──────────────────────────────────────
  try {
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Sofia · Eremo di San Giusto <sofia@contact.eremodisangiusto.it>',
        to:      [email],
        bcc:     ['info@eremodisangiusto.it'], // copia interna per ogni prenotazione
        subject,
        html,
      }),
    });

    const data = await resendResp.json();

    if (!resendResp.ok) {
      console.error('[notify] Resend error:', data);
      return res.status(500).json({ error: data.message || 'Errore Resend' });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('[notify] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

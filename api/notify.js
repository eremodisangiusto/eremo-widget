export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const OWNER_EMAIL = 'info@eremodisangiusto.it';

  try {
    const { type, experience, date, guests, firstName, lastName, email, phone, notes, bookingId } = req.body;

    if (type === 'experience_request') {
      // Email to owner
      const ownerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; background: #f9f5f0; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1c1814, #2a211a); padding: 30px; text-align: center;">
      <h1 style="color: #c8a97e; font-family: Georgia, serif; font-weight: 300; font-size: 24px; margin: 0; letter-spacing: 2px;">EREMO DI SAN GIUSTO</h1>
      <p style="color: #8a7a68; font-size: 12px; margin: 8px 0 0; letter-spacing: 3px; text-transform: uppercase;">Nuova Richiesta Esperienza</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #5a4a3a; font-size: 15px; line-height: 1.6;">Hai ricevuto una nuova richiesta di prenotazione esperienza tramite il widget IA Sofia.</p>
      
      <div style="background: #f9f5f0; border-left: 4px solid #c8a97e; padding: 20px; border-radius: 4px; margin: 24px 0;">
        <h2 style="color: #1c1814; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Dettagli Esperienza</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px; width: 140px;">Esperienza</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px; font-weight: bold;">${experience}</td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Data</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${date}</td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Partecipanti</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${guests} persone</td></tr>
          ${notes ? `<tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Note</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${notes}</td></tr>` : ''}
        </table>
      </div>

      <div style="background: #f9f5f0; border-left: 4px solid #c8a97e; padding: 20px; border-radius: 4px; margin: 24px 0;">
        <h2 style="color: #1c1814; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Dati Ospite</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px; width: 140px;">Nome</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Email</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;"><a href="mailto:${email}" style="color: #c8a97e;">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Telefono</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;"><a href="tel:${phone}" style="color: #c8a97e;">${phone}</a></td></tr>
        </table>
      </div>

      <div style="background: #fff8e7; border: 1px solid #c8a97e; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="color: #8a5e2e; font-size: 14px; margin: 0;">⚠️ <strong>Azione richiesta:</strong> Accedi a Bókun e completa la prenotazione manualmente per ${firstName} ${lastName}.</p>
      </div>
    </div>
    <div style="background: #1c1814; padding: 20px; text-align: center;">
      <p style="color: #8a7a68; font-size: 12px; margin: 0;">Eremo di San Giusto · Monte Morrone, Ostuni, Puglia</p>
    </div>
  </div>
</body>
</html>`;

      // Email to guest
      const guestHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; background: #f9f5f0; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1c1814, #2a211a); padding: 30px; text-align: center;">
      <h1 style="color: #c8a97e; font-family: Georgia, serif; font-weight: 300; font-size: 24px; margin: 0; letter-spacing: 2px;">EREMO DI SAN GIUSTO</h1>
      <p style="color: #8a7a68; font-size: 12px; margin: 8px 0 0; letter-spacing: 3px; text-transform: uppercase;">Richiesta Ricevuta</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #5a4a3a; font-size: 16px; line-height: 1.7;">Gentile <strong>${firstName}</strong>,</p>
      <p style="color: #5a4a3a; font-size: 15px; line-height: 1.7;">Grazie per il tuo interesse nell'esperienza <strong>${experience}</strong> all'Eremo di San Giusto. Abbiamo ricevuto la tua richiesta e ti contatteremo entro breve per confermare la prenotazione.</p>

      <div style="background: #f9f5f0; border-left: 4px solid #c8a97e; padding: 20px; border-radius: 4px; margin: 24px 0;">
        <h2 style="color: #1c1814; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Riepilogo Richiesta</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px; width: 140px;">Esperienza</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px; font-weight: bold;">${experience}</td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Data richiesta</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${date}</td></tr>
          <tr><td style="padding: 6px 0; color: #8a7a68; font-size: 14px;">Partecipanti</td><td style="padding: 6px 0; color: #1c1814; font-size: 14px;">${guests} persone</td></tr>
        </table>
      </div>

      <p style="color: #5a4a3a; font-size: 15px; line-height: 1.7;">Per qualsiasi informazione puoi contattarci direttamente a <a href="mailto:${OWNER_EMAIL}" style="color: #c8a97e;">${OWNER_EMAIL}</a>.</p>
      <p style="color: #5a4a3a; font-size: 15px; line-height: 1.7; font-style: italic;">Ti aspettiamo tra gli ulivi millenari dell'Eremo! 🫒</p>
    </div>
    <div style="background: #1c1814; padding: 20px; text-align: center;">
      <p style="color: #8a7a68; font-size: 12px; margin: 0;">Eremo di San Giusto · Monte Morrone, Ostuni, Puglia</p>
      <p style="color: #8a7a68; font-size: 12px; margin: 4px 0 0;"><a href="https://www.eremodisangiusto.it" style="color: #c8a97e;">www.eremodisangiusto.it</a></p>
    </div>
  </div>
</body>
</html>`;

      // Send both emails
      const [ownerRes, guestRes] = await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Sofia - Eremo di San Giusto <onboarding@resend.dev>',
            to: [OWNER_EMAIL],
            reply_to: email,
            subject: `Nuova richiesta: ${experience} — ${firstName} ${lastName} (${date})`,
            html: ownerHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Sofia - Eremo di San Giusto <onboarding@resend.dev>',
            to: [email],
            reply_to: OWNER_EMAIL,
            subject: `Richiesta ricevuta: ${experience} — ${date}`,
            html: guestHtml,
          }),
        }),
      ]);

      const ownerData  = await ownerRes.json();
      const guestData  = await guestRes.json();

      return res.status(200).json({
        success: true,
        ownerEmail:  ownerData?.id  || ownerData,
        guestEmail:  guestData?.id  || guestData,
      });
    }

    return res.status(400).json({ error: 'Tipo non valido' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// api/experiences.js — Proxy per Bókun: disponibilità e prenotazione esperienze
import crypto from 'crypto';

// Genera firma HMAC per Bókun API
function bokunSignature(apiKey, secretKey, date) {
  const message = date + apiKey;
  return crypto.createHmac('sha1', secretKey).update(message).digest('base64');
}

function bokunHeaders(apiKey, secretKey) {
  const date = new Date().toISOString();
  const signature = bokunSignature(apiKey, secretKey, date);
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'X-Bokun-Date': date,
    'X-Bokun-AccessKey': apiKey,
    'X-Bokun-Signature': signature,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey    = process.env.BOKUN_ACCESS_KEY;
  const secretKey = process.env.BOKUN_SECRET_KEY;

  try {
    const { action, productId, date, participants, sessionId, firstName, lastName, email, phone, notes } = req.body;

    if (action === 'check_availability') {
      // Cerca disponibilità per una specifica esperienza e data
      const url = `https://api.bokun.io/activity.json/${productId}/availabilities?start=${date}&end=${date}&includeSoldOut=false`;
      const response = await fetch(url, { headers: bokunHeaders(apiKey, secretKey) });
      const data = await response.json();
      return res.status(200).json({ productId, date, availabilities: data });

    } else if (action === 'create_booking') {
      // Crea prenotazione esperienza su Bókun
      const bookingPayload = {
        activityId: parseInt(productId),
        sessionId: sessionId,
        startDate: date,
        participants: participants || [{ priceCategoryId: null, count: 1 }],
        customer: {
          firstName,
          lastName,
          email,
          phoneNumber: phone || '',
        },
        notes: notes || 'Prenotazione da Widget IA Eremo di San Giusto',
        paymentType: 'MANUAL',
      };

      const response = await fetch('https://api.bokun.io/booking.json/activity-booking', {
        method: 'POST',
        headers: bokunHeaders(apiKey, secretKey),
        body: JSON.stringify(bookingPayload),
      });
      const data = await response.json();

      return res.status(200).json({
        success: true,
        bookingId: data?.confirmationCode || data?.id || ('BKN-' + Date.now()),
        productId, date,
        guest: { firstName, lastName, email },
        raw: data,
      });

    } else {
      return res.status(400).json({ error: 'Azione non valida. Usa: check_availability o create_booking' });
    }

  } catch (error) {
    console.error('Bokun proxy error:', error);
    return res.status(500).json({ error: 'Errore API Bókun' });
  }
}

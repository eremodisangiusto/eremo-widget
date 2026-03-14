import crypto from 'crypto';

function bokunDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function bokunHeaders(apiKey, secretKey, method, path) {
  const date = bokunDate();
  const message = date + apiKey + method.toUpperCase() + path;
  const signature = crypto.createHmac('sha1', secretKey).update(message).digest('base64');
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'X-Bokun-Date': date,
    'X-Bokun-AccessKey': apiKey,
    'X-Bokun-Signature': signature,
  };
}

function fixYear(dateStr) {
  if (!dateStr) return dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d = new Date(dateStr);
  while (d < today) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
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
    const { action, productId, date, guests, firstName, lastName, email, phone, notes } = req.body;

    const fixedDate = fixYear(date);
    const guestCount = Number(guests) || 2;

    // CHECK AVAILABILITY
    if (action === 'availability' || action === 'check_availability') {
      const path = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false`;
      const url = `https://api.bokun.io${path}`;
      const response = await fetch(url, {
        headers: bokunHeaders(apiKey, secretKey, 'GET', path)
      });
      const data = await response.json();

      const avail = Array.isArray(data) ? data : [];
      const available = avail.length > 0;
      const session = avail[0];

      return res.status(200).json({
        available,
        productId,
        date: fixedDate,
        guests: guestCount,
        sessionId: session?.id || null,
        startTime: session?.startTime || null,
        availableSeats: session?.availableSeats || 0,
        rawCount: avail.length,
        bokunRaw: data,
      });
    }

    // CREATE BOOKING
    if (action === 'book' || action === 'create_booking') {
      // Step 1: get session ID
      let sessionId = null;
      try {
        const availPath = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false`;
        const availResp = await fetch(`https://api.bokun.io${availPath}`, {
          headers: bokunHeaders(apiKey, secretKey, 'GET', availPath)
        });
        const availData = await availResp.json();
        if (Array.isArray(availData) && availData.length > 0) {
          sessionId = availData[0].id;
        }
      } catch (e) {
        console.log('Could not fetch session:', e.message);
      }

      if (!sessionId) {
        return res.status(200).json({
          success: false,
          error: 'Nessuna sessione disponibile per questa data',
          productId,
          date: fixedDate,
        });
      }

      // Step 2: create booking
      const bookingPayload = {
        activityId: parseInt(productId),
        sessionId: sessionId,
        startDate: fixedDate,
        participants: [{ count: guestCount }],
        customer: {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phoneNumber: phone || '',
        },
        notes: notes || 'Prenotazione da Widget IA Eremo di San Giusto',
        paymentType: 'MANUAL',
      };

      const bookPath = '/booking.json/activity-booking';
      const response = await fetch(`https://api.bokun.io${bookPath}`, {
        method: 'POST',
        headers: bokunHeaders(apiKey, secretKey, 'POST', bookPath),
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      return res.status(200).json({
        success: true,
        bookingId: data?.confirmationCode || data?.id || ('BKN-' + Date.now()),
        productId,
        date: fixedDate,
        guests: guestCount,
        guest: { firstName, lastName, email, phone },
        bokunResponse: data,
      });
    }

    return res.status(400).json({ error: 'Azione non valida. Usa: availability o book' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

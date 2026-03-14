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

async function bokunFetch(method, path, apiKey, secretKey, body) {
  const url = `https://api.bokun.io${path}`;
  const opts = { method, headers: bokunHeaders(apiKey, secretKey, method, path) };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  const text = await resp.text();
  try {
    return { ok: resp.ok, status: resp.status, data: JSON.parse(text) };
  } catch(e) {
    return { ok: resp.ok, status: resp.status, data: null, raw: text };
  }
}

function fixYear(dateStr) {
  if (!dateStr) return dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d = new Date(dateStr);
  while (d < today) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

    // ── CHECK AVAILABILITY ──────────────────────────────────────────────────
    if (action === 'availability' || action === 'check_availability') {
      const path = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false&currency=EUR`;
      const result = await bokunFetch('GET', path, apiKey, secretKey);

      if (!result.ok || !result.data) {
        return res.status(200).json({
          available: false, productId, date: fixedDate, guests: guestCount,
          sessionId: null, error: result.raw || 'Errore Bokun', httpStatus: result.status,
        });
      }

      const avail = Array.isArray(result.data) ? result.data : [];
      const session = avail[0];

      return res.status(200).json({
        available: avail.length > 0,
        productId, date: fixedDate, guests: guestCount,
        sessionId: session?.id || null,
        startTimeId: session?.startTimeId || null,
        defaultRateId: session?.defaultRateId || null,
        startTime: session?.startTime || null,
        availableSeats: session?.availabilityCount || 0,
        rawCount: avail.length,
      });
    }

    // ── CREATE BOOKING via shopping cart ────────────────────────────────────
    if (action === 'book' || action === 'create_booking') {

      // Step 1: get availability for startTimeId and rateId
      const availPath = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false&currency=EUR`;
      const availResult = await bokunFetch('GET', availPath, apiKey, secretKey);

      let startTimeId = null;
      let defaultRateId = null;

      if (availResult.ok && Array.isArray(availResult.data) && availResult.data.length > 0) {
        const session = availResult.data[0];
        startTimeId = session?.startTimeId || null;
        defaultRateId = session?.defaultRateId || null;
      }

      // Step 2: generate session UUID and add activity to cart
      const sessionId = generateUUID();
      const addPath = `/shopping-cart.json/session/${sessionId}/activity?currency=EUR&lang=EN`;
      const addPayload = {
       activityId: parseInt(productId),
       date: fixedDate,
        pricingCategoryBookings: [{ pricingCategoryId: 1134529, count: guestCount }],
      };
      
      const addResult = await bokunFetch('POST', addPath, apiKey, secretKey, addPayload);

      if (!addResult.ok) {
        return res.status(200).json({
          success: false,
          step: 'add-to-cart',
          error: addResult.raw || JSON.stringify(addResult.data),
          httpStatus: addResult.status,
          sessionId,
          payload: addPayload,
        });
      }

      // Step 3: checkout
      const checkoutPath = `/checkout.json/session/${sessionId}?currency=EUR&lang=EN`;
      const checkoutPayload = {
        customer: {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phoneNumber: phone || '',
        },
        paymentMethod: 'SEND_INVOICE',
        sendCustomerNotification: true,
        externalBookingReference: `EREMO-${Date.now()}`,
        notes: notes || 'Prenotazione da Widget IA Eremo di San Giusto',
      };

      const checkoutResult = await bokunFetch('POST', checkoutPath, apiKey, secretKey, checkoutPayload);

      const bookingId = checkoutResult.data?.confirmationCode
        || checkoutResult.data?.booking?.confirmationCode
        || checkoutResult.data?.id
        || ('BKN-' + Date.now());

      return res.status(200).json({
        success: checkoutResult.ok,
        bookingId,
        productId, date: fixedDate, guests: guestCount,
        guest: { firstName, lastName, email, phone },
        httpStatus: checkoutResult.status,
        bokunResponse: checkoutResult.data || checkoutResult.raw,
      });
    }

    return res.status(400).json({ error: 'Azione non valida. Usa: availability o book' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

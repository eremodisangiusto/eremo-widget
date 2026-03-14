import crypto from 'crypto';

function bokunDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function bokunHeaders(apiKey, secretKey, method, path) {
  const date = bokunDate();
  const sig = crypto.createHmac('sha1', secretKey).update(date + apiKey + method.toUpperCase() + path).digest('base64');
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'X-Bokun-Date': date,
    'X-Bokun-AccessKey': apiKey,
    'X-Bokun-Signature': sig,
  };
}

async function bfetch(method, path, apiKey, secretKey, body) {
  const opts = { method, headers: bokunHeaders(apiKey, secretKey, method, path) };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(`https://api.bokun.io${path}`, opts);
  const text = await resp.text();
  let data = null;
  try { data = JSON.parse(text); } catch(e) {}
  return { ok: resp.ok, status: resp.status, data, raw: text };
}

function fixYear(dateStr) {
  if (!dateStr) return dateStr;
  const today = new Date(); today.setHours(0,0,0,0);
  let d = new Date(dateStr);
  while (d < today) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c==='x' ? r : (r&0x3|0x8);
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
    const fixedDate  = fixYear(date);
    const guestCount = Math.max(1, Number(guests) || 2);

    async function getAvailability() {
      const path = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false&currency=EUR`;
      const r = await bfetch('GET', path, apiKey, secretKey);
      const sessions = Array.isArray(r.data) ? r.data : [];
      const session  = sessions[0] || null;
      return {
        ok: r.ok,
        available: sessions.length > 0,
        sessions,
        session,
        startTimeId:   session?.startTimeId   ? parseInt(session.startTimeId)   : null,
        defaultRateId: session?.defaultRateId ? parseInt(session.defaultRateId) : null,
        startTime:     session?.startTime || null,
      };
    }

    if (action === 'availability' || action === 'check_availability') {
      const avail = await getAvailability();
      return res.status(200).json({
        available:      avail.available,
        productId,
        date:           fixedDate,
        guests:         guestCount,
        startTimeId:    avail.startTimeId,
        startTime:      avail.startTime,
        availableSeats: avail.session?.availabilityCount || 0,
        rawCount:       avail.sessions.length,
      });
    }

    if (action === 'book' || action === 'create_booking') {

      const avail = await getAvailability();
      if (!avail.available) {
        return res.status(200).json({
          success: false,
          error: 'Nessuna disponibilita per questa data',
          productId, date: fixedDate,
        });
      }

      const sessionId = uuid();
      const cartPath  = `/shopping-cart.json/session/${sessionId}/activity?currency=EUR&lang=EN`;

      // Try with startTimeId first, then without if it fails
      async function tryAddToCart(includeStartTimeId) {
        const body = {
          activityId:              parseInt(productId),
          date:                    fixedDate,
          pricingCategoryBookings: [{ pricingCategoryId: 1134529, count: guestCount }],
        };
        if (includeStartTimeId && avail.startTimeId) body.startTimeId  = avail.startTimeId;
        if (avail.defaultRateId)                     body.rateId       = avail.defaultRateId;
        return await bfetch('POST', cartPath, apiKey, secretKey, body);
      }

      let addResult = await tryAddToCart(true);
      if (!addResult.ok && avail.startTimeId) {
        // Retry without startTimeId
        addResult = await tryAddToCart(false);
      }

      if (!addResult.ok) {
        return res.status(200).json({
          success: false, step: 'add-to-cart',
          error: addResult.data || addResult.raw,
          httpStatus: addResult.status,
        });
      }

      const checkoutPath = `/checkout.json/session/${sessionId}?currency=EUR&lang=EN`;
      const checkoutBody = {
        customer: {
          firstName:   firstName || '',
          lastName:    lastName  || '',
          email:       email     || '',
          phoneNumber: phone     || '',
        },
        paymentMethod:            'SEND_INVOICE',
        sendCustomerNotification: true,
        externalBookingReference: `EREMO-${Date.now()}`,
        notes: notes || 'Prenotazione da Widget IA Eremo di San Giusto',
      };

      const checkoutResult = await bfetch('POST', checkoutPath, apiKey, secretKey, checkoutBody);

      const bookingId = checkoutResult.data?.confirmationCode
        || checkoutResult.data?.booking?.confirmationCode
        || checkoutResult.data?.id
        || ('BKN-' + Date.now());

      // If Bokun checkout failed, send email notification as fallback
      if (!checkoutResult.ok) {
        try {
          await fetch('https://eremo-bookings.vercel.app/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'experience_request',
              experience: `Prodotto Bokun ID ${productId}`,
              date: fixedDate, guests: guestCount,
              firstName, lastName, email, phone, notes,
            }),
          });
        } catch(e) {}
        return res.status(200).json({
          success: true,
          bookingId: 'EMAIL-' + Date.now(),
          method: 'email_fallback',
          productId, date: fixedDate, guests: guestCount,
          guest: { firstName, lastName, email, phone },
        });
      }

      return res.status(200).json({
        success:       true,
        bookingId,
        productId,
        date:          fixedDate,
        guests:        guestCount,
        guest:         { firstName, lastName, email, phone },
        bokunResponse: checkoutResult.data || checkoutResult.raw,
      });
    }

    return res.status(400).json({ error: 'Azione non valida. Usa: availability o book' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

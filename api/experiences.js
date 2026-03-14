export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, productId, date, guests, firstName, lastName, email, phone, notes } = req.body;

    const guestCount = Number(guests) || 2;

    // Fix date year if in the past
    function fixYear(dateStr) {
      if (!dateStr) return dateStr;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let d = new Date(dateStr);
      while (d < today) d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    }

    const fixedDate = fixYear(date);

    async function wfetch(method, path, body) {
      const url = `https://widgets.bokun.io${path}`;
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (body) opts.body = JSON.stringify(body);
      const r = await fetch(url, opts);
      const text = await r.text();
      try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
      catch(e) { return { ok: r.ok, status: r.status, data: null, raw: text }; }
    }

    // ── CHECK AVAILABILITY ──────────────────────────────────────────────────
    if (action === 'availability' || action === 'check_availability') {
      // Create a session first
      const sessionRes = await wfetch('GET', `/booking/experience/create-session?productId=${productId}&currency=EUR`);
      const sessionId = sessionRes.data?.sessionId || null;

      if (!sessionId) {
        // Try availability without session
        const availRes = await wfetch('GET', `/${productId}?availabilityRequired=1&currency=EUR`);
        return res.status(200).json({
          available: availRes.ok,
          productId, date: fixedDate, guests: guestCount,
          sessionId: null,
          debug: availRes.data || availRes.raw,
        });
      }

      const availRes = await wfetch('GET', `/${productId}?availabilityRequired=1&currency=EUR&sessionId=${sessionId}`);

      return res.status(200).json({
        available: availRes.ok && !availRes.data?.error,
        productId, date: fixedDate, guests: guestCount,
        sessionId,
        debug: availRes.data || availRes.raw,
      });
    }

    // ── CREATE BOOKING ──────────────────────────────────────────────────────
    if (action === 'book' || action === 'create_booking') {

      // Step 1: get availability to find startTimeId
      const availPath = `/activity.json/${productId}/availabilities?start=${fixedDate}&end=${fixedDate}&includeSoldOut=false`;
      const availUrl = `https://api.bokun.io${availPath}`;

      // Use HMAC for api.bokun.io
      const crypto = await import('crypto');
      function bokunDate() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
      }

      const apiKey = process.env.BOKUN_ACCESS_KEY;
      const secretKey = process.env.BOKUN_SECRET_KEY;
      const bdate = bokunDate();
      const sig = crypto.default.createHmac('sha1', secretKey).update(bdate + apiKey + 'GET' + availPath).digest('base64');

      const availResp = await fetch(availUrl, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Bokun-Date': bdate,
          'X-Bokun-AccessKey': apiKey,
          'X-Bokun-Signature': sig,
        }
      });

      const availText = await availResp.text();
      let availData;
      try { availData = JSON.parse(availText); } catch(e) { availData = null; }

      const sessions = Array.isArray(availData) ? availData : [];
      const session = sessions[0];
      const startTimeId = session?.startTimeId || null;

      // Step 2: create session on widgets.bokun.io
      const sessionRes = await fetch(`https://widgets.bokun.io/online-sales/f6aa2b9b-2ab7-4ded-a773-a54e8178e2c6/create-session?currency=EUR`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const sessionText = await sessionRes.text();
      let sessionData;
      try { sessionData = JSON.parse(sessionText); } catch(e) { sessionData = null; }
      const sessionId = sessionData?.sessionId || sessionData?.id || null;

      if (!sessionId) {
        return res.status(200).json({
          success: false,
          error: 'Non riesco a creare sessione Bokun',
          sessionDebug: sessionData || sessionText,
          availDebug: availData || availText,
        });
      }

      const BASE = `https://widgets.bokun.io`;
      const SQ = `currency=EUR&sessionId=${sessionId}`;

      // Step 3: add to cart
      const cartPayload = {
        activityId: parseInt(productId),
        date: fixedDate,
        startTimeId: startTimeId,
        pricingCategoryBookings: [{ pricingCategoryId: 1134529, count: guestCount }],
      };

      const addRes = await fetch(`${BASE}/-1?${SQ}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartPayload),
      });
      const addText = await addRes.text();
      let addData;
      try { addData = JSON.parse(addText); } catch(e) { addData = null; }

      if (!addRes.ok) {
        return res.status(200).json({
          success: false,
          error: 'Errore add to cart',
          cartDebug: addData || addText,
        });
      }

      // Step 4: checkout
      const checkoutPayload = {
        customer: {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phoneNumber: phone || '',
        },
        paymentType: 'SEND_INVOICE',
        sendConfirmationEmail: true,
        notes: notes || 'Prenotazione da Widget IA Eremo di San Giusto',
      };

      const checkoutRes = await fetch(`${BASE}/3?${SQ}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });
      const checkoutText = await checkoutRes.text();
      let checkoutData;
      try { checkoutData = JSON.parse(checkoutText); } catch(e) { checkoutData = null; }

      const bookingId = checkoutData?.confirmationCode
        || checkoutData?.booking?.confirmationCode
        || checkoutData?.id
        || ('BKN-' + Date.now());

      return res.status(200).json({
        success: checkoutRes.ok,
        bookingId,
        productId, date: fixedDate, guests: guestCount,
        guest: { firstName, lastName, email, phone },
        httpStatus: checkoutRes.status,
        bokunResponse: checkoutData || checkoutText,
      });
    }

    return res.status(400).json({ error: 'Azione non valida. Usa: availability o book' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

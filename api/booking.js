export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { checkin, checkout, guests, firstName, lastName, email, phone, notes } = req.body;

    const ROOM_ID = 469679;

    const payload = {
      authentication: {
        apiKey: process.env.BEDS24_API_KEY,
        propKey: process.env.BEDS24_PROP_KEY,
        propId: process.env.BEDS24_PROP_ID,
      },
      data: [{
        propId: Number(process.env.BEDS24_PROP_ID),
        roomId: ROOM_ID,
        unitId: ROOM_ID,
        firstNight: checkin.replace(/-/g, ''),
        lastNight: checkout.replace(/-/g, ''),
        numAdult: Number(guests),
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone || '',
        guestNotes: notes || '',
        status: 'request',
        referer: 'Widget IA Sito Web',
      }]
    };

    const response = await fetch('https://api.beds24.com/json/setBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const bookingId = data?.[0]?.bookId || data?.bookId || ('ESG-' + Date.now());

    return res.status(200).json({
      success: true,
      bookingId,
      beds24Response: data,
      roomId: ROOM_ID,
      checkin, checkout, guests,
      guest: { firstName, lastName, email, phone },
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

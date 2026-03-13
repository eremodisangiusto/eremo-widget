export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { checkin, checkout, guests, firstName, lastName, email, phone, notes } = req.body;

    const formatDate = (d) => d.replace(/-/g, '');

    // Step 1: get price from Beds24
    let totalPrice = 0;
    try {
      const availResp = await fetch('https://api.beds24.com/json/getAvailabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: formatDate(checkin),
          checkOut: formatDate(checkout),
          propId: process.env.BEDS24_PROP_ID,
          roomId: '469679',
          numAdult: String(guests || 2),
          numChild: '0',
          ignoreHidden: true,
        }),
      });
      const availData = await availResp.json();
      totalPrice = Number(availData?.['469679']?.price) || 0;
    } catch (e) {
      console.log('Could not fetch price:', e.message);
    }

    // Step 2: create booking
    const payload = {
      authentication: {
        apiKey: process.env.BEDS24_API_KEY,
        propKey: process.env.BEDS24_PROP_KEY,
      },
      roomId: '469679',
      status: '1',
      firstNight: checkin,
      lastNight: checkout,
      numAdult: String(guests || 2),
      numChild: '0',
      price: totalPrice ? String(totalPrice) : '',
      currency: 'EUR',
      guestFirstName: firstName || '',
      guestName: lastName || '',
      guestEmail: email || '',
      guestPhone: phone || '',
      guestComments: notes || '',
      referer: 'Widget IA Sito Web',
    };

    const response = await fetch('https://api.beds24.com/json/setBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const bookingId = data?.bookId || data?.[0]?.bookId || ('ESG-' + Date.now());

    return res.status(200).json({
      success: true,
      bookingId,
      totalPrice,
      checkin,
      checkout,
      guests,
      guest: { firstName, lastName, email, phone },
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

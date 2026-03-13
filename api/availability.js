export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { checkin, checkout, guests } = req.body;

    const formatDate = (d) => d.replace(/-/g, '');

    const payload = {
      checkIn: formatDate(checkin),
      checkOut: formatDate(checkout),
      propId: process.env.BEDS24_PROP_ID,
      roomId: '469679',
      numAdult: String(guests || 2),
      numChild: '0',
      ignoreHidden: true,
    };

    const response = await fetch('https://api.beds24.com/json/getAvailabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Beds24 returns { "469679": { roomsavail: 1, price: <TOTAL>, ... }, ... }
    const roomData = data['469679'];
    const roomsAvail = roomData ? Number(roomData.roomsavail) : 0;
    const available = roomsAvail > 0;

    // price from Beds24 is the TOTAL for the whole stay, not per night
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000);
    const totalPrice = Number(roomData?.price) || 0;
    const pricePerNight = nights > 0 ? Math.round(totalPrice / nights) : totalPrice;

    return res.status(200).json({
      available,
      checkin,
      checkout,
      guests,
      rooms: available ? [{
        roomId: '469679',
        name: 'Eremo di San Giusto',
        description: 'Tenuta esclusiva con trulli e lamie storiche, piscina privata, oliveto biologico. Ideale per coppie, famiglie e gruppi fino a 10 persone.',
        maxGuests: 10,
        pricePerNight,
        totalPrice,
        nights,
        currency: roomData?.currency || 'EUR',
      }] : [],
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

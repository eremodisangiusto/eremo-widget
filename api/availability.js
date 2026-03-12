export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { checkin, checkout, guests } = req.body;

    // Convert YYYY-MM-DD to YYYYMMDD for Beds24
    const formatDate = (d) => d.replace(/-/g, '');

    // Use getAvailabilities - no authentication needed, just propId
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

    // Check if room is available
    // Beds24 returns empty array or rooms with availability info
    const rooms = Array.isArray(data) ? data : [];
    const available = rooms.length > 0 && rooms.some(r => r.roomId == 469679);

    return res.status(200).json({
      available,
      beds24Response: data,
      checkin,
      checkout,
      guests,
      rooms: available ? [{
        roomId: '469679',
        name: 'Eremo di San Giusto',
        description: 'Tenuta esclusiva con trulli e lamie storiche, piscina privata, oliveto biologico. Ideale per coppie, famiglie e gruppi fino a 10 persone.',
        maxGuests: 10,
        pricePerNight: rooms[0]?.price || 180,
        totalPrice: (rooms[0]?.price || 180) * Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000),
      }] : [],
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

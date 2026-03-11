// api/availability.js — Verifica disponibilità camere su Beds24
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { checkin, checkout, guests } = req.body;

    const payload = {
      authentication: {
        apiKey: process.env.BEDS24_API_KEY,
        propKey: process.env.BEDS24_PROP_KEY,
      },
      data: [{
        propId: process.env.BEDS24_PROP_ID,
        firstNight: checkin.replace(/-/g, ''),
        lastNight:  checkout.replace(/-/g, ''),
      }]
    };

    const response = await fetch('https://api.beds24.com/json/getAvailabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);

    // Definizione camere — aggiorna i roomId con i tuoi ID reali di Beds24
    const rooms = [
      { roomId: 'trullo_principale', name: 'Trullo Principale', maxGuests: 2, pricePerNight: 180, description: 'Il trullo storico con volta in pietra, vasca idromassaggio privata, vista sugli ulivi.' },
      { roomId: 'suite_lamia',       name: 'Suite Lamia',       maxGuests: 3, pricePerNight: 220, description: 'Spazio autentico con terrazza panoramica sul paesaggio pugliese.' },
      { roomId: 'dimora_del_gelso',  name: 'Dimora del Gelso',  maxGuests: 4, pricePerNight: 280, description: 'La dimora più spaziosa, cucina privata, ideale per famiglie.' },
    ];

    const available = rooms
      .filter(r => r.maxGuests >= parseInt(guests))
      .map(r => ({
        ...r,
        totalPrice: r.pricePerNight * nights,
        currency: 'EUR',
        nights,
      }));

    return res.status(200).json({ available, checkin, checkout, nights, guests, bedsRaw: data });
  } catch (error) {
    console.error('Availability error:', error);
    return res.status(500).json({ error: 'Errore verifica disponibilità' });
  }
}

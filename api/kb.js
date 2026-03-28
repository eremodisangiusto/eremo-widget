// ============================================================
// Eremo di San Giusto — api/kb.js
// Knowledge Base: meteo OpenWeather + luoghi Airtable + guestbook
//
// Env vars richieste:
//   OPENWEATHER_API_KEY  = ...
//   AIRTABLE_KB_BASE_ID  = app... (base "Eremo KB")
//   AIRTABLE_TOKEN       = pat6xQf9...
// ============================================================

const AIRTABLE_API   = 'https://api.airtable.com/v0';
const AIRTABLE_KB    = process.env.AIRTABLE_KB_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const OW_KEY         = process.env.OPENWEATHER_API_KEY;
const EREMO_LAT      = 40.7285;
const EREMO_LON      = 17.5810;

// ── Helper Airtable ──────────────────────────────────────────
async function atFetch(method, table, { id, query, body } = {}) {
  let url = `${AIRTABLE_API}/${AIRTABLE_KB}/${encodeURIComponent(table)}`;
  if (id) url += `/${id}`;
  if (query) url += `?${query}`;
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || `Airtable HTTP ${resp.status}`);
  return data;
}

// ── Helper: meteo attuale da OpenWeather ─────────────────────
async function getMeteo() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${EREMO_LAT}&lon=${EREMO_LON}&appid=${OW_KEY}&units=metric&lang=it`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`OpenWeather HTTP ${resp.status}`);
  const d = await resp.json();
  return {
    temp:        Math.round(d.main.temp),
    feels_like:  Math.round(d.main.feels_like),
    descrizione: d.weather[0].description,
    icona:       d.weather[0].icon,
    codice:      d.weather[0].id,        // 2xx=tempesta, 3xx=pioggerella, 5xx=pioggia, 6xx=neve, 7xx=nebbia, 800=sereno, 8xx=nuvole
    vento:       Math.round(d.wind.speed * 3.6), // km/h
    umidita:     d.main.humidity,
    sunrise:     d.sys.sunrise,
    sunset:      d.sys.sunset,
  };
}

// ── Helper: previsioni 5 giorni ──────────────────────────────
async function getPrevisioni() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${EREMO_LAT}&lon=${EREMO_LON}&appid=${OW_KEY}&units=metric&lang=it&cnt=24`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`OpenWeather forecast HTTP ${resp.status}`);
  const d = await resp.json();
  // Raggruppa per giorno (primo slot per giorno)
  const giorni = {};
  for (const item of d.list) {
    const data = item.dt_txt.split(' ')[0];
    if (!giorni[data] && Object.keys(giorni).length < 4) {
      giorni[data] = {
        data,
        temp_max: Math.round(item.main.temp_max),
        temp_min: Math.round(item.main.temp_min),
        descrizione: item.weather[0].description,
        codice: item.weather[0].id,
      };
    }
  }
  return Object.values(giorni);
}

// ── Helper: determina tag meteo correnti ─────────────────────
function tagsMeteo(meteo) {
  const tags = [];
  const c = meteo.codice;
  if (c >= 200 && c < 300) tags.push('pioggia', 'temporale');
  else if (c >= 300 && c < 400) tags.push('pioggia');
  else if (c >= 500 && c < 600) tags.push('pioggia');
  else if (c >= 600 && c < 700) tags.push('pioggia');
  else if (c >= 700 && c < 800) tags.push('nebbia');
  else if (c === 800) tags.push('caldo', 'sole');
  else if (c > 800) tags.push('nuvoloso');
  if (meteo.temp >= 28) tags.push('caldo');
  if (meteo.temp <= 15) tags.push('fresco');
  return tags;
}

// ── Helper: link Google Maps ─────────────────────────────────
function mapsLink(indirizzo) {
  if (!indirizzo) return null;
  return `https://www.google.com/maps/dir/?api=1&origin=${EREMO_LAT},${EREMO_LON}&destination=${encodeURIComponent(indirizzo)}&travelmode=driving`;
}

// ── HANDLER ──────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.body;

  try {

    // ═══════════════════════════════════════════════════════
    // ACTION: get_meteo
    // Meteo attuale + previsioni 4 giorni
    // ═══════════════════════════════════════════════════════
    if (action === 'get_meteo') {
      const [meteo, previsioni] = await Promise.all([getMeteo(), getPrevisioni()]);
      return res.status(200).json({ meteo, previsioni, tags: tagsMeteo(meteo) });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: get_luoghi
    // Restituisce luoghi filtrati per categoria e/o tag meteo
    // ═══════════════════════════════════════════════════════
    if (action === 'get_luoghi') {
      const { categoria, tags, limit = 5 } = req.body;

      const filters = ['{Approvato}=TRUE()'];
      if (categoria) filters.push(`{Categoria}="${categoria}"`);
      if (tags && tags.length > 0) {
        const tagFilters = tags.map(t => `FIND("${t}",ARRAYJOIN({Tag},","))>0`);
        filters.push(`OR(${tagFilters.join(',')})`);
      }

      const formula = encodeURIComponent(`AND(${filters.join(',')})`);
      const result = await atFetch('GET', 'Luoghi', {
        query: `filterByFormula=${formula}&sort[0][field]=Distanza km&sort[0][direction]=asc&maxRecords=${limit}`,
      });

      const luoghi = (result.records || []).map(r => ({
        id:          r.id,
        nome:        r.fields['Nome'] || '',
        categoria:   r.fields['Categoria'] || '',
        descrizione: r.fields['Descrizione'] || '',
        indirizzo:   r.fields['Indirizzo'] || '',
        distanza:    r.fields['Distanza km'] || null,
        tags:        r.fields['Tag'] || [],
        stagione:    r.fields['Stagione'] || [],
        orari:       r.fields['Orari'] || '',
        prezzo:      r.fields['Prezzo medio'] || '',
        mapsUrl:     r.fields['Maps URL'] || mapsLink(r.fields['Indirizzo']),
        aggiuntoDa:  r.fields['Aggiunto da'] || 'gestore',
      }));

      return res.status(200).json({ luoghi });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: cerca_consigli
    // Meteo attuale + luoghi contestuali
    // Usato da Sofia per rispondere a "cosa fare oggi?"
    // ═══════════════════════════════════════════════════════
    if (action === 'cerca_consigli') {
      const { categoria, limit = 4 } = req.body;

      const [meteo, previsioni] = await Promise.all([getMeteo(), getPrevisioni()]);
      const tagsAttuali = tagsMeteo(meteo);

      // Costruisce filtro: luoghi approvati, con tag compatibili col meteo attuale
      const filters = ['{Approvato}=TRUE()'];
      if (categoria) filters.push(`{Categoria}="${categoria}"`);

      // Se piove, filtra per luoghi adatti alla pioggia; se bello, tutti
      const isPioggia = tagsAttuali.includes('pioggia') || tagsAttuali.includes('temporale');
      if (isPioggia) {
        filters.push(`FIND("pioggia",ARRAYJOIN({Tag},","))>0`);
      }

      const formula = encodeURIComponent(`AND(${filters.join(',')})`);
      const result = await atFetch('GET', 'Luoghi', {
        query: `filterByFormula=${formula}&sort[0][field]=Distanza km&sort[0][direction]=asc&maxRecords=${limit}`,
      });

      const luoghi = (result.records || []).map(r => ({
        nome:        r.fields['Nome'] || '',
        categoria:   r.fields['Categoria'] || '',
        descrizione: r.fields['Descrizione'] || '',
        distanza:    r.fields['Distanza km'] || null,
        orari:       r.fields['Orari'] || '',
        prezzo:      r.fields['Prezzo medio'] || '',
        mapsUrl:     r.fields['Maps URL'] || mapsLink(r.fields['Indirizzo']),
      }));

      return res.status(200).json({ meteo, previsioni, tagsMeteo: tagsAttuali, luoghi });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: save_guestbook
    // Salva review ospite su Airtable (non pubblica di default)
    // ═══════════════════════════════════════════════════════
    if (action === 'save_guestbook') {
      const { nome, dataSoggiorno, review, consigli, luoghiConsigliati, voto, tags } = req.body;

      if (!nome || !review) {
        return res.status(400).json({ error: 'nome e review sono obbligatori' });
      }

      await atFetch('POST', 'Guestbook', {
        body: {
          records: [{
            fields: {
              'Nome ospite':        nome,
              'Data soggiorno':     dataSoggiorno || null,
              'Review':             review,
              'Consigli':           consigli || '',
              'Luoghi consigliati': luoghiConsigliati || '',
              'Voto':               voto ? Number(voto) : null,
              'Tag':                tags || [],
              'Pubblicata':         false,
            },
          }],
        },
      });

      return res.status(200).json({ success: true });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: get_guestbook
    // Legge review pubblicate (per Sofia e per la card)
    // ═══════════════════════════════════════════════════════
    if (action === 'get_guestbook') {
      const { limit = 10 } = req.body;

      const formula = encodeURIComponent('{Pubblicata}=TRUE()');
      const result = await atFetch('GET', 'Guestbook', {
        query: `filterByFormula=${formula}&sort[0][field]=Data invio&sort[0][direction]=desc&maxRecords=${limit}`,
      });

      const reviews = (result.records || []).map(r => ({
        nome:             r.fields['Nome ospite'] || 'Ospite',
        dataSoggiorno:    r.fields['Data soggiorno'] || null,
        review:           r.fields['Review'] || '',
        consigli:         r.fields['Consigli'] || '',
        luoghiConsigliati: r.fields['Luoghi consigliati'] || '',
        voto:             r.fields['Voto'] || null,
        tags:             r.fields['Tag'] || [],
      }));

      return res.status(200).json({ reviews });
    }

    // ═══════════════════════════════════════════════════════
    // ACTION: save_luogo
    // Ospite o gestore aggiunge un luogo alla KB
    // ═══════════════════════════════════════════════════════
    if (action === 'save_luogo') {
      const { nome, categoria, descrizione, indirizzo, distanza, tags, orari, prezzo, aggiuntoDa } = req.body;

      if (!nome || !categoria) {
        return res.status(400).json({ error: 'nome e categoria sono obbligatori' });
      }

      const fields = {
        'Nome':        nome,
        'Categoria':   categoria,
        'Descrizione': descrizione || '',
        'Indirizzo':   indirizzo || '',
        'Tag':         tags || [],
        'Orari':       orari || '',
        'Prezzo medio': prezzo || null,
        'Aggiunto da': aggiuntoDa || 'ospite',
        'Approvato':   aggiuntoDa === 'gestore', // auto-approva solo dal gestore
      };

      if (distanza) fields['Distanza km'] = Number(distanza);
      if (indirizzo) fields['Maps URL'] = mapsLink(indirizzo);

      await atFetch('POST', 'Luoghi', { body: { records: [{ fields }] } });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: `Azione non valida: ${action}` });

  } catch (err) {
    console.error('[kb.js]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

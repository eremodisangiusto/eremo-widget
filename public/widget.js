// ============================================================
// Eremo di San Giusto — Sofia Widget v3.0
// Homepage unificata: camere (Beds24) + esperienze (Bókun)
// Voce: solo INPUT (microfono) — nessun TTS in output
// ============================================================

var ESJ_PROXY = "https://eremo-bookings.vercel.app";
var ESJ_OPEN  = false;
var ESJ_LANG  = "it";
var ESJ_MSG_C = []; // conversazione camere
var ESJ_MSG_E = []; // conversazione esperienze
var ESJ_MSG_G = []; // conversazione guida / ostuni & dintorni
var ESJ_MSG_P = []; // conversazione weekend esclusivi / pacchetti
var ESJ_MSG_S = []; // conversazione scopri / knowledge base

// Stripe publishable key (pubblica — sicura lato browser)
var ESJ_STRIPE_PK = "pk_live_51QYYzwA99LxG9Z4B4Cf2hGGrgw6OuawEnNc9nOhMQySLIB7lWlc9MOEahl4qYMJMLNPx8tZag43S44M0B1eE27KL000MDKaAKd";

// ── Stripe redirect helper ───────────────────────────────────
// Chiamato dopo una prenotazione riuscita per mostrare la card di pagamento
async function esjStripeRedirect(opts) {
  // opts: { type, bookingRef, descrizione, importo, firstName, lastName, email, tariffa, payNow, msgsEl, typEl }
  var msgsEl = opts.msgsEl;
  var typEl  = opts.typEl;

  // Mostra card di pagamento nella chat
  typEl.classList.remove("on");
  var it = ESJ_LANG === "it";

  var cardHtml = '<div style="background:#fff;border-radius:14px;border:1px solid #ece4d8;overflow:hidden;font-family:\'Jost\',sans-serif;">'
    + '<div style="background:linear-gradient(135deg,#534AB7,#3C3489);padding:1rem 1.1rem;">'
    + '<div style="font-family:\'Cormorant Garamond\',serif;font-size:1.1rem;color:#fff;font-weight:600;margin-bottom:4px;">'
    + (it ? "Completa il pagamento" : "Complete payment") + '</div>'
    + '<div style="font-size:0.72rem;color:rgba(255,255,255,0.75);">' + opts.descrizione + '</div>'
    + '</div>'
    + '<div style="padding:0.9rem 1.1rem;">'
    + '<div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #f2ece2;">'
    + '<span style="color:#5a4a38;">' + (it ? "Codice prenotazione" : "Booking ref") + '</span>'
    + '<span style="font-weight:500;color:#2c2218;">' + opts.bookingRef + '</span></div>';

  if (opts.type === 'camera') {
    var tarifLabel = opts.tariffa === 'non_rimborsabile'
      ? (it ? "Tariffa non rimborsabile" : "Non-refundable rate")
      : (it ? "Tariffa standard" : "Standard rate");
    var tarifNote = opts.tariffa === 'non_rimborsabile'
      ? (it ? "Addebito immediato" : "Charged immediately")
      : (it ? "Carta autorizzata · addebito all'arrivo" : "Card authorised · charged at arrival");
    cardHtml += '<div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:6px 0;border-bottom:1px solid #f2ece2;">'
      + '<span style="color:#5a4a38;">' + tarifLabel + '</span>'
      + '<span style="color:#3b6d11;font-size:0.74rem;">' + tarifNote + '</span></div>';
  }

  cardHtml += '<div style="display:flex;justify-content:space-between;font-size:0.95rem;padding:8px 0;margin-top:4px;">'
    + '<span style="color:#2c2218;font-weight:500;">' + (it ? "Totale" : "Total") + '</span>'
    + '<span style="font-family:\'Cormorant Garamond\',serif;font-size:1.3rem;color:#8a6030;font-weight:600;">€' + opts.importo + '</span></div>'
    + '</div>'
    + '<div style="padding:0 1.1rem 1rem;display:flex;flex-direction:column;gap:8px;">'
    + '<button id="esj-pay-btn" style="width:100%;padding:11px;background:linear-gradient(135deg,#534AB7,#3C3489);border:none;border-radius:9px;color:#fff;font-family:\'Jost\',sans-serif;font-size:0.88rem;font-weight:500;cursor:pointer;">'
    + (it ? "Paga ora con carta ↗" : "Pay now by card ↗") + '</button>';

  if (opts.type === 'esperienza') {
    cardHtml += '<button id="esj-pay-later-btn" style="width:100%;padding:9px;background:transparent;border:1.5px solid #ece4d8;border-radius:9px;color:#8a6030;font-family:\'Jost\',sans-serif;font-size:0.8rem;cursor:pointer;">'
      + (it ? "Paga il giorno dell\'esperienza" : "Pay on the day") + '</button>';
  }

  cardHtml += '</div></div>';

  var d = document.createElement("div");
  d.className = "esj-msg assistant";
  d.innerHTML = '<div style="padding:0;background:transparent;border:none;">' + cardHtml + '</div>';
  msgsEl.insertBefore(d, typEl);
  msgsEl.scrollTop = msgsEl.scrollHeight;

  // Click: paga ora — redirect diretto a /api/checkout (nessuna fetch, zero CORS)
  setTimeout(function() {
    var payBtn = document.getElementById("esj-pay-btn");
    if (payBtn) {
      payBtn.addEventListener("click", function() {
        payBtn.disabled = true;
        payBtn.textContent = it ? "Reindirizzamento…" : "Redirecting…";
        var params = new URLSearchParams({
          type:      opts.type        || "esperienza",
          tariffa:   opts.tariffa     || "standard",
          ref:       opts.bookingRef  || "",
          desc:      opts.descrizione || "",
          importo:   String(opts.importo || 0),
          firstName: opts.firstName   || "",
          lastName:  opts.lastName    || "",
          email:     opts.email       || "",
        });
        // Redirect diretto — stesso dominio Vercel, nessun CORS
        window.location.href = ESJ_PROXY + "/api/checkout?" + params.toString();
      });
    }
    var laterBtn = document.getElementById("esj-pay-later-btn");
    if (laterBtn) {
      laterBtn.addEventListener("click", function() {
        laterBtn.disabled = true;
        var msg = it
          ? "Perfetto! Pagherai il giorno dell'esperienza in contanti o carta. La tua prenotazione " + opts.bookingRef + " è confermata. A presto all'Eremo! 🫒"
          : "Perfect! You'll pay on the day of the experience. Your booking " + opts.bookingRef + " is confirmed. See you at the Eremo! 🫒";
        var dm = document.createElement("div");
        dm.className = "esj-msg assistant";
        dm.innerHTML = '<div class="esj-bubble">' + msg + '</div>';
        msgsEl.insertBefore(dm, typEl);
        msgsEl.scrollTop = msgsEl.scrollHeight;
      });
    }
  }, 100);
}

// ─── SYSTEM PROMPT ──────────────────────────────────────────

var ESJ_SYSTEM_BASE = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. Parli con un tono caldo, elegante e pugliese nell'anima. Non inventare mai informazioni — usa sempre gli strumenti per verificare disponibilita e prezzi reali.\n\nLA PROPRIETA':\nL'Eremo di San Giusto e' un trullo con lamia situato a 2 km dal centro storico di Ostuni, alle pendici del Monte Morrone, sul Cammino Materano che abbraccia i santuari di Sant'Oronzo e San Biagio. Gode di una vista mozzafiato sugli ulivi millenari e sul Mare Adriatico.\n\nSPAZI E COMFORT:\n- 2 camere da letto matrimoniali con 2 bagni indipendenti\n- In una camera matrimoniale e' disponibile anche un letto singolo per bambini\n- Capienza massima: 5 persone (massimo 4 adulti)\n- Vasca idromassaggio Novellini Natural Air in camera\n- Minipiscina idromassaggio sul terrazzo con vista panoramica\n- Parco agrario privato di 5 ettari con ulivi verso il mare\n- Cucina attrezzata, ampi spazi esterni\n\nSERVIZI INCLUSI: Aria condizionata, TV, Wi-Fi gratuito, bottiglia di vino e snack di benvenuto. Animali domestici ammessi con supplemento 50 euro.\n\nCHECK-IN dalle 15:00 — CHECK-OUT entro le 10:30\n\nESPERIENZE (sistema prenotazione interno — usa i tool airtable):\n1. LIQUID GOLD (id: liquid-gold): Frantoio ipogeo, grotta, ulivi, degustazione EVO. Standard 35 eur/pp, Privato 50 eur/pp, Bambino 10 eur. Max 12 pp. Tutto l'anno. Orari: 10:30, 17:00.\n2. RITUALI DI BENESSERE — Massaggi (id: massaggi): Osteopata certificato. Sede: Masseria Carmine di Vallegna, Valle d'Itria, ~5km dall'Eremo, ~2km da Ostuni. Deep tissue 80 eur, Rilassante 70 eur, Tonificante 70 eur. Min 2 pp. Apr-Ott. Orari: 09:00, 10:30, 16:00, 17:30.\n3. CIUCHINO BIRICHINO — Parco avventura (id: ciuchino-birichino): Zip line, treetop. Junior 15, Verde 25, Blu 30, Rosso/Nero 35 eur. Apr-Ott. Orari: 09:30, 15:00.\n4. ORECCHIETTE COOKING CLASS (id: cooking-class): Chef locale, cucina outdoor. Standard 35 eur/pp, Privato 50 eur/pp, Bambino 18 eur. Max 8 pp. Orari: 11:00, 18:30.\n5. STARGAZING (id: stargazing): Telescopio professionale. Standard 35 eur/pp, Privato 45 eur/pp, Bambino 15 eur. Max 10 pp. Apr-Ott. Orario: 22:00.\n6. SUNSET SERENADE (id: sunset-serenade): Duo musicale, vino e tagliere. Standard 60 eur/pp, Coppia 130 eur flat. Max 20 pp. Apr-Ott. Orario variabile al tramonto.\n7. TREKKING MONTE MORRONE (id: trekking): Santuari. Corto 5km 25 eur/pp, Lungo 10km 35 eur/pp, Privato 250 eur flat. Max 10 pp. Orari: 08:00, 17:00.\n8. CARRIAGES AND COUNTRYSIDE (id: carriages): Museo carrozze, chiesa rupestre. Standard 35 eur/pp, Privato 50 eur/pp. Max 15 pp. Mar-Dom. Orari: 10:00, 17:00.\n\nPACCHETTI WEEKEND (2 notti, coppia):\n- Puglian Immersion: da 780 eur (bassa) / 980 eur (alta).\n- Into the Wild: da 750 eur / 950 eur.\n- Senses Journey: da 940 eur / 1140 eur.\n\nCANCELLAZIONE ESPERIENZE: Gratuita fino a 48h prima. 50% rimborso tra 24h e 48h. Nessun rimborso entro 24h.\n\nFLUSSO CAMERA: 1) Chiedi date e ospiti 2) Usa check_availability 3) Presenta con prezzo reale 4) Proponi esperienze abbinabili 5) Raccogli nome/cognome/email/telefono 6) Usa create_room_booking con roomId 469679 7) Dai codice conferma Beds24.\n\nFLUSSO ESPERIENZA (sistema Airtable): 1) Identifica l'esperienza e il suo ID corretto (es. 'liquid-gold') 2) Se l'utente non sa la data o chiede 'quando siete disponibili?' usa get_next_available_dates con la data di oggi come da_data per mostrare le prossime 5 date disponibili 3) Se l'utente ha una data specifica usa check_experience_availability 4) Se la data non e' disponibile usa get_next_available_dates a partire da quella data per proporre alternative 5) Presenta gli slot con date, orari e posti liberi 6) Chiedi tipo prezzo 7) Raccogli nome, cognome, email, telefono, eventuali note 8) Usa create_experience_booking con tutti i dati 9) Comunica il codice ESG-XXXXXX e conferma email.\n\nREGOLE ASSOLUTE: Usa SEMPRE i tool — mai inventare disponibilita o prezzi. Usa roomId 469679 per le camere. Per le esperienze usa SEMPRE l'ID corretto (liquid-gold, massaggi, ciuchino-birichino, cooking-class, stargazing, sunset-serenade, trekking, carriages). La data va sempre in formato YYYY-MM-DD.";

// ─── TOOLS ──────────────────────────────────────────────────

var ESJ_TOOLS = [
  {
    name: "check_availability",
    description: "Verifica disponibilita camere su Beds24.",
    input_schema: { type: "object", properties: {
      checkin:  { type: "string", description: "Check-in YYYY-MM-DD" },
      checkout: { type: "string", description: "Check-out YYYY-MM-DD" },
      guests:   { type: "integer" }
    }, required: ["checkin","checkout","guests"] }
  },
  {
    name: "create_room_booking",
    description: "Crea prenotazione camera su Beds24.",
    input_schema: { type: "object", properties: {
      checkin:   { type: "string" }, checkout: { type: "string" },
      guests:    { type: "integer" }, firstName: { type: "string" },
      lastName:  { type: "string" }, email: { type: "string" },
      phone:     { type: "string" }, notes: { type: "string" }
    }, required: ["checkin","checkout","guests","firstName","lastName","email"] }
  },
  {
    name: "get_next_available_dates",
    description: "Cerca le prossime date disponibili per un'esperienza a partire da una data di riferimento. Usare quando: l'utente chiede 'quando siete disponibili?', 'quali sono le prossime date?', 'non so la data', oppure dopo che check_experience_availability ha restituito available:false. Restituisce le prossime 5 date con slot aperti e posti liberi.",
    input_schema: { type: "object", properties: {
      esperienza:    { type: "string", description: "ID esperienza: liquid-gold | massaggi | ciuchino-birichino | cooking-class | stargazing | sunset-serenade | trekking | carriages" },
      da_data:       { type: "string", description: "Data di partenza della ricerca YYYY-MM-DD. Usare oggi se l'utente non ha indicato una data." },
      partecipanti:  { type: "integer", description: "Numero partecipanti richiesti" }
    }, required: ["esperienza","da_data","partecipanti"] }
  },
  {
    name: "check_experience_availability",
    description: "Verifica disponibilita di una esperienza su Airtable per una data specifica. Restituisce gli slot disponibili con orari e posti liberi, oppure date alternative se non disponibile.",
    input_schema: { type: "object", properties: {
      esperienza:   { type: "string", description: "ID esperienza: liquid-gold | massaggi | ciuchino-birichino | cooking-class | stargazing | sunset-serenade | trekking | carriages" },
      data:         { type: "string", description: "Data YYYY-MM-DD" },
      partecipanti: { type: "integer", description: "Numero partecipanti" }
    }, required: ["esperienza","data","partecipanti"] }
  },
  {
    name: "create_experience_booking",
    description: "Crea prenotazione esperienza su Airtable. Da chiamare solo dopo check_experience_availability e dopo aver raccolto tutti i dati ospite.",
    input_schema: { type: "object", properties: {
      esperienza:   { type: "string", description: "ID esperienza (es. liquid-gold)" },
      data:         { type: "string", description: "Data YYYY-MM-DD" },
      orario:       { type: "string", description: "Orario slot scelto (es. 10:30)" },
      partecipanti: { type: "integer", description: "Numero partecipanti" },
      firstName:    { type: "string" },
      lastName:     { type: "string" },
      email:        { type: "string" },
      phone:        { type: "string" },
      tipoPrezzo:   { type: "string", description: "Standard | Privato | Coppia | Bambino | Junior | Verde | Blu | Rosso/Nero | Rilassante | Tonificante | Deep tissue | Corto 5km | Lungo 10km" },
      noteOspite:   { type: "string", description: "Note, allergie o richieste speciali" }
    }, required: ["esperienza","data","orario","partecipanti","firstName","lastName","email"] }
  },
  {
    name: "get_meteo",
    description: "Ottieni il meteo attuale e le previsioni per i prossimi 4 giorni ad Ostuni / Eremo di San Giusto. Usare quando l'utente chiede cosa fare oggi, se è una buona giornata per uscire, o per contestualizzare i consigli.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "cerca_consigli",
    description: "Cerca luoghi consigliati (ristoranti, musei, spiagge, mercati, bar) dalla Knowledge Base degli ospiti e dei gestori, contestualizzati con il meteo attuale. Restituisce anche il link Google Maps per le indicazioni stradali.",
    input_schema: { type: "object", properties: {
      categoria: { type: "string", description: "Ristorante | Museo | Spiaggia | Mercato | Esperienza | Bar — ometti per tutte le categorie" },
      limit:     { type: "integer", description: "Numero massimo di risultati (default 4)" }
    }, required: [] }
  },
  {
    name: "save_guestbook",
    description: "Salva la review e i consigli di un ospite nel Guestbook su Airtable. Chiamare dopo aver raccolto tutti i dati dell'ospite.",
    input_schema: { type: "object", properties: {
      nome:              { type: "string", description: "Nome dell'ospite" },
      dataSoggiorno:     { type: "string", description: "Data del soggiorno YYYY-MM-DD" },
      review:            { type: "string", description: "Testo della review sull'Eremo" },
      consigli:          { type: "string", description: "Consigli generali per altri ospiti" },
      luoghiConsigliati: { type: "string", description: "Ristoranti, posti, esperienze consigliate" },
      voto:              { type: "integer", description: "Voto da 1 a 5" },
      tags:              { type: "array", items: { type: "string" }, description: "Tag: romantico, famiglie, natura, culturale, gourmet, economico, caldo, pioggia..." }
    }, required: ["nome","review"] }
  },
  {
    name: "save_luogo",
    description: "Aggiunge un nuovo luogo (ristorante, museo, spiaggia, ecc.) alla Knowledge Base su Airtable. Usare quando un ospite vuole condividere un posto.",
    input_schema: { type: "object", properties: {
      nome:        { type: "string" },
      categoria:   { type: "string", description: "Ristorante | Museo | Spiaggia | Mercato | Esperienza | Bar" },
      descrizione: { type: "string" },
      indirizzo:   { type: "string", description: "Indirizzo completo per generare link Maps" },
      distanza:    { type: "number", description: "Distanza in km dall'Eremo" },
      tags:        { type: "array", items: { type: "string" } },
      orari:       { type: "string" },
      prezzo:      { type: "string", description: "€ | €€ | €€€" },
      aggiuntoDa:  { type: "string", description: "ospite | gestore" }
    }, required: ["nome","categoria"] }
  },
  {
    name: "get_guestbook",
    description: "Legge le review pubblicate nel Guestbook. Usare quando un ospite chiede di vedere le review, cosa dicono gli altri ospiti, le esperienze degli altri, o per mostrare testimonianze. Restituisce le ultime review con nome, voto, testo e consigli.",
    input_schema: { type: "object", properties: {
      limit: { type: "integer", description: "Numero massimo di review da restituire (default 5)" }
    }, required: [] }
  }
];

// ─── EXPERIENCE DATA (embedded) ─────────────────────────────
// Dati completi per le schede prodotto custom (no Bókun)

var ESJ_EXPERIENCES = [
  { id:"liquid-gold", name:"Liquid Gold", nameEn:"Liquid Gold",
    sub:"Frantoio ipogeo · Grotta naturale · Uliveto secolare · Degustazione EVO", subEn:"Hypogean mill · Natural cave · Ancient olive grove · EVO tasting",
    duration:"2–2.5 ore", durationEn:"2–2.5 hours", difficulty:"Facile", difficultyEn:"Easy",
    season:"Tutto l'anno", seasonEn:"Year-round", maxGuests:12, startTimes:["10:30","17:00"],
    advanceBooking:"24h", type:"Food & Cultura", typeEn:"Food & Culture", priceFrom:35,
    prices:[{label:"Standard (2–12 pp)",labelEn:"Standard",val:"€35/pp"},{label:"Gruppo privato",labelEn:"Private group",val:"€50/pp"},{label:"Bambini <12",labelEn:"Children <12",val:"€10"}],
    desc:"Puglia produce più olio d'oliva di qualsiasi altra regione italiana. All'Eremo di San Giusto questa tradizione è la terra sotto i piedi e la pietra antica sotto le mani. L'esperienza inizia sottoterra nel frantoio ipogeo scavato nella roccia viva, continua nella grotta naturale adiacente e si conclude con una passeggiata tra ulivi secolari e una degustazione guidata di 3–4 varietà di olio EVO con pane e bruschette.",
    descEn:"Puglia produces more olive oil than any other Italian region. At Eremo di San Giusto this tradition is the ground beneath your feet. The experience begins underground in the hypogean oil mill carved into living rock, continues into the adjacent natural cave, and concludes with a walk through ancient olive groves and a guided tasting of 3–4 EVO varieties with bread and bruschette.",
    included:["Visita guidata al frantoio ipogeo","Visita alla grotta naturale","Passeggiata nell'oliveto con guida","Degustazione 3–4 oli EVO + pane e bruschette","Guida stampata sull'olivicoltura","Acqua per tutta la durata"],
    includedEn:["Guided visit to the hypogean mill","Visit to the natural cave","Walk through the olive grove","Tasting of 3–4 EVO varieties + bread","Printed guide to Puglian olive cultivation","Water throughout"],
    excluded:["Vino o bevande alcoliche","Olio in bottiglia (acquistabile in loco)","Pasti aggiuntivi","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Wine or alcoholic beverages","Bottled oil (available on site)","Additional meals","Transfer","Travel insurance"],
    bring:["Scarpe chiuse comode (gradini e terreno irregolare)","Abbigliamento comodo","Macchina fotografica — gli ulivi meritano"],
    bringEn:["Comfortable closed-toe shoes (steps and uneven terrain)","Comfortable clothing","Camera — the olive trees deserve it"],
    notes:"Frantoio e grotta richiedono gradini — non completamente accessibile a sedie a rotelle. In raccolta (ott–nov): degustazione dell'olio nuovo dal frantoio.",
    notesEn:"Mill and cave require steps — not fully wheelchair accessible. During harvest (Oct–Nov): fresh olio nuovo tasting directly from the press.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Maltempo estremo",labelEn:"Extreme weather",val:"Rimborso completo",valEn:"Full refund",color:"green"}]
  },
  { id:"stargazing", name:"Stargazing", nameEn:"Stargazing",
    sub:"Telescopio professionale · Guida astrofilo · Mappa stellare · Monte Morrone", subEn:"Professional telescope · Astrophile guide · Star map · Monte Morrone",
    duration:"2 ore (22:00–00:00)", durationEn:"2 hours (22:00–00:00)", difficulty:"Facile", difficultyEn:"Easy",
    season:"Aprile – Ottobre", seasonEn:"April – October", maxGuests:10, startTimes:["22:00"],
    advanceBooking:"24h", type:"Astronomia & Outdoor", typeEn:"Astronomy & Outdoor", priceFrom:35,
    prices:[{label:"Standard (2–10 pp)",labelEn:"Standard",val:"€35/pp"},{label:"Gruppo privato",labelEn:"Private group",val:"€45/pp"},{label:"Bambini <12",labelEn:"Children <12",val:"€15"}],
    desc:"Monte Morrone si alza sopra i tetti bianchi di Ostuni con un dono raro: il buio. Lontano dall'inquinamento luminoso della costa, il cielo notturno è uno dei più limpidi della Puglia. Due ore di osservazione a occhio nudo e al telescopio con una guida astrofilo esperta — costellazioni, pianeti, crateri lunari, gli anelli di Saturno e, nelle notti eccezionali, nebulose lontane.",
    descEn:"Monte Morrone rises above the white rooftops of Ostuni with one rare gift: darkness. Far from coastal light pollution, the night sky is one of the clearest in Puglia. Two hours of naked-eye and telescopic observation with an expert astrophile guide — constellations, planets, lunar craters, Saturn's rings and, on exceptional nights, distant nebulae.",
    included:["Telescopio professionale per tutta la sessione","Guida astrofilo esperta IT/EN","Mappa stellare personalizzata per data e luogo","Tisane, caffè e cioccolata calda","Coperte e sedute outdoor comode"],
    includedEn:["Professional telescope for the full session","Expert astrophile guide (IT/EN)","Personalised star map for date and location","Herbal teas, coffee and hot chocolate","Blankets and comfortable outdoor seating"],
    excluded:["Binocoli personali (su richiesta)","Pasti","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Personal binoculars (on request)","Food or meals","Transfer","Travel insurance"],
    bring:["Strati caldi — le temperature scendono dopo mezzanotte","Scarpe comode per terreno outdoor","Torcia con luce rossa se disponibile","Curiosità e pazienza"],
    bringEn:["Warm layers — temperatures drop after midnight","Comfortable shoes for outdoor terrain","Red-light torch if available","Curiosity and patience"],
    notes:"Rimborso completo se copertura nuvolosa >50% all'orario di inizio. Agosto: picco delle Perseidi (12–13 agosto).",
    notesEn:"Full refund if cloud cover exceeds 50% at start time. August: Perseid meteor shower peak (Aug 12–13).",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Cielo nuvoloso >50%",labelEn:"Cloud cover >50%",val:"Rimborso completo",valEn:"Full refund",color:"green"}]
  },
  { id:"sunset-serenade", name:"Sunset Serenade", nameEn:"Sunset Serenade",
    sub:"Fisarmonica & Mandolino · Vino DOC · Tagliere prodotti pugliesi", subEn:"Accordion & Mandolin · DOC wine · Puglian produce board",
    duration:"90 minuti", durationEn:"90 minutes", difficulty:"—", difficultyEn:"—",
    season:"Aprile – Ottobre", seasonEn:"April – October", maxGuests:20, startTimes:["variabile — 30 min prima del tramonto"],
    advanceBooking:"48h", type:"Musica & Food", typeEn:"Music & Food", priceFrom:60,
    prices:[{label:"Standard (2–20 pp)",labelEn:"Standard",val:"€60/pp"},{label:"Coppia romantica",labelEn:"Romantic couple",val:"€130 flat"},{label:"Bambini <16",labelEn:"Children <16",val:"€15"}],
    desc:"Al tramonto sulla terrazza dell'Eremo un duo professionale di fisarmonica e mandolino esegue pizzica, tarantella, serenate e canzoni popolari del Sud Italia. Con un bicchiere di Primitivo in mano e un tagliere di prodotti locali — burrata, taralli, formaggi, salumi — mentre il cielo si tinge d'arancio e le luci di Ostuni cominciano a brillare nella valle.",
    descEn:"As the sun descends over the Valle d'Itria, a professional accordion and mandolin duo performs pizzica, tarantella, serenate and southern Italian folk songs. With a glass of Primitivo in hand and a board of local produce — burrata, taralli, cheeses, cured meats — as the sky turns amber and the lights of Ostuni begin to flicker in the valley.",
    included:["Concerto live 90 min — duo fisarmonica e mandolino","Un calice di vino DOC Primitivo o Negroamaro","Tagliere: burrata, taralli, formaggi, salumi, olio","Sedute outdoor sulla terrazza panoramica"],
    includedEn:["90-min live concert — accordion and mandolin duo","One glass of DOC Primitivo or Negroamaro","Produce board: burrata, taralli, cheeses, cured meats, olive oil","Comfortable outdoor seating on the panoramic terrace"],
    excluded:["Vino o cibo aggiuntivo oltre al servizio incluso","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Additional food or wine beyond the included serving","Transfer","Travel insurance"],
    bring:["Abbigliamento comodo per la serata","Strati leggeri se la serata si raffredda","Fotocamera — i tramonti dell'Eremo meritano"],
    bringEn:["Comfortable evening clothing","Light layers if the evening cools","Camera — the Eremo sunsets are unmissable"],
    notes:"Orario di inizio variabile ogni mese (30 min prima del tramonto). Confermato alla prenotazione. Contiene latticini — avvisare in caso di allergie.",
    notesEn:"Start time varies monthly (30 min before sunset) — confirmed at booking. Contains dairy products — notify us of allergies.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Pioggia o vento forte",labelEn:"Rain or strong wind",val:"Rimborso o reschedule",valEn:"Refund or reschedule",color:"green"}]
  },
  { id:"cooking-class", name:"Cooking Class", nameEn:"Cooking Class",
    sub:"Orecchiette fatte a mano · Cacioricotta · Chef locale · Cucina outdoor", subEn:"Handmade orecchiette · Cacioricotta · Local chef · Outdoor kitchen",
    duration:"2–3 ore", durationEn:"2–3 hours", difficulty:"Facile", difficultyEn:"Easy",
    season:"Tutto l'anno", seasonEn:"Year-round", maxGuests:8, startTimes:["11:00","18:30"],
    advanceBooking:"48h", type:"Cucina & Cultura", typeEn:"Cooking & Culture", priceFrom:35,
    prices:[{label:"Standard (2–8 pp)",labelEn:"Standard",val:"€35/pp"},{label:"Sessione privata",labelEn:"Private session",val:"€50/pp"},{label:"Bambini <12",labelEn:"Children <12",val:"€18"}],
    desc:"Non c'è modo migliore di capire un posto che attraverso il suo cibo. All'Eremo imparerai a fare le orecchiette — la pasta iconica della Puglia — completamente a mano con uno chef locale professionista nella cucina outdoor tra i trulli e gli ulivi. Poi ti siedi a tavola per mangiare quello che hai fatto, condito con cacioricotta fresca e un calice di vino pugliese.",
    descEn:"There is no better way to understand a place than through its food. At the Eremo you will learn to make orecchiette — the iconic pasta of Puglia — entirely by hand with a professional local chef in our outdoor kitchen surrounded by trulli and olive trees. Then sit down to enjoy what you have made, dressed with fresh cacioricotta and a glass of Puglian wine.",
    included:["Tutti gli ingredienti freschi a km zero","Cucina outdoor attrezzata e tutti gli utensili","Chef locale professionista per tutta la sessione","Un calice di vino pugliese","Ricetta stampata da portare a casa","Sessione mattutina: pranzo · Serale: cena"],
    includedEn:["All fresh locally sourced ingredients","Full outdoor kitchen and equipment","Professional local chef throughout","A glass of Puglian wine","Printed recipe card to take home","Morning: lunch · Evening: dinner"],
    excluded:["Cibo o bevande aggiuntive","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Additional food or drinks","Transfer","Travel insurance"],
    bring:["Abiti comodi che possono infarinarsi","Scarpe chiuse (obbligatorie in cucina)","Capelli lunghi raccolti — grembiuli forniti","Buon appetito"],
    bringEn:["Comfortable clothes you don't mind getting floury","Closed-toe shoes (required in kitchen)","Long hair tied back — aprons provided","A good appetite"],
    notes:"Contiene glutine e latticini. Avvisare di allergie alla prenotazione. Maltempo: reschedule gratuito.",
    notesEn:"Contains gluten and dairy. Notify us of allergies at booking. Bad weather: free reschedule.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h (ingredienti acquistati)",valEn:"within 24h (ingredients purchased)",color:"red"},{label:"Maltempo",labelEn:"Bad weather",val:"Reschedule gratuito",valEn:"Free reschedule",color:"green"}]
  },
  { id:"massaggi", name:"Rituali di Benessere", nameEn:"Wellness Rituals",
    sub:"Massaggi professionali · Osteopata certificato · Masseria Carmine di Vallegna", subEn:"Professional massage · Certified osteopath · Masseria Carmine di Vallegna",
    duration:"60 minuti", durationEn:"60 minutes", difficulty:"—", difficultyEn:"—",
    season:"Aprile – Ottobre", seasonEn:"April – October", maxGuests:4, startTimes:["09:00","10:30","16:00","17:30"],
    advanceBooking:"48h", type:"Benessere", typeEn:"Wellness", priceFrom:70,
    prices:[{label:"Massaggio rilassante",labelEn:"Relaxing massage",val:"€70/pp"},{label:"Massaggio tonificante",labelEn:"Toning massage",val:"€70/pp"},{label:"Deep tissue / decontraente",labelEn:"Deep tissue",val:"€80/pp"}],
    desc:"Nel cuore della Valle d'Itria, a soli 5 km dall'Eremo di San Giusto, la splendida Masseria Carmine di Vallegna accoglie i nostri ospiti per un momento di benessere autentico. Trattamenti eseguiti da un osteopata certificato negli spazi curati della masseria — pietra antica, silenzio, ulivi centenari intorno — a due passi da Ostuni, immersi nel paesaggio pugliese più autentico.",
    descEn:"In the heart of the Valle d'Itria, just 5 km from Eremo di San Giusto, the beautiful Masseria Carmine di Vallegna welcomes our guests for a moment of genuine wellbeing. Treatments performed by a certified osteopath within the masseria's refined spaces — ancient stone, silence, centuries-old olive trees — just outside Ostuni, immersed in the most authentic Puglian landscape.",
    included:["Sessione completa 60 min con osteopata certificato","Accoglienza e uso degli spazi della Masseria Carmine di Vallegna","Lettino professionale, asciugamani, oli e attrezzatura","Acqua e tisana prima e dopo","Tempo libero nel parco della masseria post-trattamento"],
    includedEn:["Full 60-min session by certified osteopath","Welcome and use of Masseria Carmine di Vallegna spaces","Professional table, towels, oils and equipment","Water and herbal tea before and after","Post-session quiet time in the masseria grounds"],
    excluded:["Pasti o cibo aggiuntivo","Trasferimento alla masseria (~5 km dall'Eremo)","Assicurazione viaggio","Sessioni aggiuntive"],
    excludedEn:["Meals or additional food","Transfer to masseria (~5 km from the Eremo)","Travel insurance","Additional sessions"],
    bring:["Abbigliamento comodo e ampio","Evitare pasti pesanti nelle 2h precedenti","Arrivare 10 min prima per ambientarsi"],
    bringEn:["Comfortable, loose-fitting clothing","Avoid heavy meals 2 hours before","Arrive 10 minutes early to settle"],
    notes:"Sede: Masseria Carmine di Vallegna, Valle d'Itria — ~5 km dall'Eremo, ~2 km da Ostuni. Minimo 2 partecipanti. Deep tissue sconsigliato nel primo trimestre di gravidanza. Comunicare condizioni mediche.",
    notesEn:"Venue: Masseria Carmine di Vallegna, Valle d'Itria — ~5 km from the Eremo, ~2 km from Ostuni. Minimum 2 participants. Deep tissue not recommended in first trimester. Notify us of medical conditions.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Min. 2 pp non raggiunto",labelEn:"Min. 2 guests not met",val:"Rimborso completo",valEn:"Full refund or reschedule",color:"green"}]
  },
  { id:"trekking", name:"Trekking Monte Morrone", nameEn:"Trekking Monte Morrone",
    sub:"Sentieri sacri · Santuari antichi · Valle d'Itria · Ostuni", subEn:"Sacred paths · Ancient sanctuaries · Valle d'Itria · Ostuni",
    duration:"2–4 ore", durationEn:"2–4 hours", difficulty:"Facile", difficultyEn:"Easy",
    season:"Tutto l'anno", seasonEn:"Year-round", maxGuests:10, startTimes:["08:00","17:00"],
    advanceBooking:"24h", type:"Outdoor & Cultura", typeEn:"Outdoor & Culture", priceFrom:25,
    prices:[{label:"Percorso corto 5km",labelEn:"Short route 5km",val:"€25/pp"},{label:"Percorso lungo 10km",labelEn:"Long route 10km",val:"€35/pp"},{label:"Gruppo privato",labelEn:"Private group",val:"€250 flat"},{label:"Bambini <12",labelEn:"Children <12",val:"€8–12"}],
    desc:"Scopri l'anima della Puglia a piedi. Una passeggiata guidata su Monte Morrone tra i Santuari di Sant'Oronzo e San Biagio, macchia mediterranea profumata, oliveti secolari e percorsi in pietra calcarea levigati da generazioni di pellegrini. Il tuo host condivide storie, geologia e tradizioni locali che nessuna guida può offrire.",
    descEn:"Discover the soul of Puglia on foot. A guided walk across Monte Morrone between the Sanctuaries of Sant'Oronzo and San Biagio, through fragrant Mediterranean scrubland, centuries-old olive groves and limestone paths worn smooth by generations of pilgrims.",
    included:["Acqua fresca e bevande stagionali","Guida locale esperta IT/EN (il tuo host)","Mappa del percorso e note sui santuari","Orientamento su flora, fauna e storia locale"],
    includedEn:["Fresh water and seasonal beverages","Expert local guide IT/EN (your host)","Route maps and notes on the sanctuaries","Orientation on local flora, fauna and history"],
    excluded:["Calzature da trekking e attrezzatura personale","Pasti o picnic (su richiesta)","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Hiking footwear and personal equipment","Meals or picnic (available on request)","Transfer","Travel insurance"],
    bring:["Scarpe chiuse comode o stivaletti leggeri","Protezione solare: cappello, crema, occhiali","Strati leggeri (mattine e serate fresche)","Borraccia e zaino piccolo"],
    bringEn:["Comfortable closed-toe shoes or light hiking boots","Sun protection: hat, sunscreen, sunglasses","Light layers (mornings and evenings can be cool)","Water bottle and small backpack"],
    notes:"Percorso 5km: adatto a tutti. Percorso 10km: discese su terreno carsico. Maltempo grave: reschedule gratuito.",
    notesEn:"5km route: suitable for all fitness levels. 10km route: includes karst limestone descents. Severe weather: free reschedule.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Maltempo grave",labelEn:"Severe weather",val:"Reschedule gratuito",valEn:"Free reschedule",color:"green"}]
  },
  { id:"ciuchino-birichino", name:"Ciuchino Birichino", nameEn:"Ciuchino Birichino",
    sub:"Parco avventura · Zip-line · Percorsi treetop · Famiglie", subEn:"Adventure park · Zip-line · Treetop circuits · Families",
    duration:"2–3 ore", durationEn:"2–3 hours", difficulty:"Vari livelli", difficultyEn:"Multiple levels",
    season:"Aprile – Ottobre", seasonEn:"April – October", maxGuests:99, startTimes:["09:30","15:00"],
    advanceBooking:"24h", type:"Avventura & Famiglia", typeEn:"Adventure & Family", priceFrom:15,
    prices:[{label:"Junior (3–6 anni)",labelEn:"Junior (3–6 yrs)",val:"€15"},{label:"Verde (6+ / >110cm)",labelEn:"Green (6+/>110cm)",val:"€25"},{label:"Blu (8+ / >120cm)",labelEn:"Blue (8+/>120cm)",val:"€30"},{label:"Rosso/Nero (10+ / >130cm)",labelEn:"Red/Black (10+/>130cm)",val:"€35"}],
    desc:"A due passi dall'Eremo, nel bosco mediterraneo di Monte Morrone, il Parco Avventura Ciuchino Birichino è l'avventura perfetta per le famiglie. Percorsi treetop ad altezze crescenti, zip-line mozzafiato, ponti di corda e reti da scalata supervisionate da personale qualificato tra gli alberi veri e il paesaggio straordinario della Valle d'Itria.",
    descEn:"Right on the doorstep of the Eremo, in the Mediterranean woodland of Monte Morrone, the Ciuchino Birichino adventure park is perfect for families. Treetop circuits at increasing heights, a thrilling zip-line, rope bridges and climbing nets — all supervised by trained staff among real trees and the extraordinary Valle d'Itria landscape.",
    included:["Ingresso e accesso ai circuiti appropriati per età","Zip-line (inclusa tranne Junior)","Imbragatura, casco e moschettoni","Briefing sicurezza e supervisione personale qualificato","Area Junior per bambini 3–6 anni"],
    includedEn:["Park entrance and age-appropriate circuits","Zip-line (included except Junior)","Harness, helmet and carabiner system","Safety briefing and trained staff supervision","Junior area for children aged 3–6"],
    excluded:["Cibo e bevande (portare il proprio o acquistare al parco)","Scarpe chiuse con suola rigida (obbligatorie, non fornite)","Trasferimento","Assicurazione viaggio"],
    excludedEn:["Food and drinks (bring your own or buy at the park)","Closed-toe shoes with firm sole (mandatory, not provided)","Transfer","Travel insurance"],
    bring:["Scarpe chiuse con suola rigida — OBBLIGATORIE","Abbigliamento comodo e aderente — no sciarpe o gioielli pendenti","Borraccia e crema solare","Cambio di vestiti per i bambini"],
    bringEn:["Closed-toe shoes with firm sole — MANDATORY","Comfortable fitted clothing — no loose scarves or dangling jewellery","Water bottle and sunscreen","Change of clothes for young children"],
    notes:"Opera in tutte le condizioni meteo tranne temporali. Bambini area Junior: sempre accompagnati da un genitore. Scarpe inadeguate: accesso negato.",
    notesEn:"Operates in all weather except thunderstorms. Junior area children must always be accompanied by a parent. Inadequate footwear: access denied.",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Chiusura per meteo",labelEn:"Weather closure",val:"Reschedule gratuito",valEn:"Free reschedule",color:"green"}]
  },
  { id:"carriages", name:"Carriages & Countryside", nameEn:"Carriages & Countryside",
    sub:"Museo carrozze d'epoca · Parco agricolo · Chiesa rupestre · Masseria Carestia", subEn:"Vintage carriage museum · Agricultural park · Frescoed rock church · Masseria Carestia",
    duration:"2.5–3 ore", durationEn:"2.5–3 hours", difficulty:"Facile", difficultyEn:"Easy",
    season:"Mar – Dom", seasonEn:"Tue – Sun",
    maxGuests:15, startTimes:["10:00","17:00"],
    advanceBooking:"48h", type:"Cultura & Storia", typeEn:"Culture & History", priceFrom:35,
    prices:[{label:"Standard (2–15 pp)",labelEn:"Standard (2–15 guests)",val:"€35/pp"},{label:"Gruppo privato",labelEn:"Private group",val:"€35/pp"},{label:"Bambini <12",labelEn:"Children under 12",val:"€10"}],
    desc:"A pochi chilometri dall'Eremo di San Giusto, nascosto tra gli uliveti e i muretti a secco della campagna di Ostuni, si trova uno dei musei più insoliti e straordinari di tutta la Puglia: il Museo delle Carrozze d'Epoca alla Masseria Carestia. Oltre trenta carrozze a trazione equina meticolosamente restaurate — landò, brougham, phaeton, vittorie e carri agricoli — raccontano come la società del Sud Italia si muovesse e celebrasse nel corso di due secoli. Ma le carrozze sono solo l'inizio: il percorso continua nel parco agricolo della masseria, tra ulivi millenari e muretti in pietra a secco, fino alla sorpresa che nessuno si aspetta — una chiesa rupestre scavata nella roccia calcarea con affreschi medievali di rara bellezza.",
    descEn:"A few kilometres from the Eremo di San Giusto, hidden among the olive groves and dry-stone walls of the Ostuni countryside, lies one of the most unusual and quietly astonishing museums in all of Puglia: the Museo delle Carrozze d'Epoca at Masseria Carestia. Over thirty horse-drawn carriages — landaus, broughams, phaetons, victorias and working farm carts — meticulously restored, tell the story of how southern Italian society moved and celebrated across two centuries. But the carriages are only the beginning: the visit continues through the masseria's agricultural park before reaching the unexpected highlight — a rupestrian church carved into the limestone rock face, decorated with rare medieval frescoes.",
    included:["Biglietto d'ingresso al Museo delle Carrozze d'Epoca","Accompagnamento del tuo host dell'Eremo per tutta la visita","Materiali stampati su carrozze, masseria e chiesa rupestre","Rinfreschi — acqua, bibite e bevande stagionali alla masseria"],
    includedEn:["Museum entrance ticket to the Museo delle Carrozze d'Epoca","Accompaniment throughout by your host from Eremo di San Giusto","Printed materials on the carriages, the masseria and the rock church","Refreshments — water, soft drinks and seasonal beverages at the masseria"],
    excluded:["Trasporto a Masseria Carestia — ~10 min in auto da Ostuni","Pasti aggiuntivi","Assicurazione viaggio personale"],
    excludedEn:["Transport to Masseria Carestia — approx. 10 min by car from Ostuni","Additional meals","Personal travel insurance"],
    bring:["Scarpe comode chiuse (parte del percorso è all'aperto e su terreno irregolare)","Macchina fotografica — la fotografia è benvenuta in tutta la visita","Strati leggeri se la visita serale"],
    bringEn:["Comfortable closed shoes (part of the visit is outdoors on uneven ground)","Camera — photography is welcome throughout","Light layers for the evening visit"],
    notes:"Il museo è aperto martedì–domenica. La chiesa rupestre è su terreno irregolare — non accessibile a sedie a rotelle. Prenotazione obbligatoria 48h prima per coordinamento con la masseria. Per info: www.carrozzedepoca.it",
    notesEn:"Museum open Tuesday–Sunday. The rupestrian church involves uneven ground — not wheelchair accessible. Booking required 48h in advance to coordinate with the estate. More info: www.carrozzedepoca.it",
    policy:[{label:"Cancellazione gratuita",labelEn:"Free cancellation",val:"fino a 48h prima",valEn:"up to 48h before",color:"green"},{label:"Rimborso 50%",labelEn:"50% refund",val:"tra 24h e 48h",valEn:"between 24–48h",color:"amber"},{label:"Nessun rimborso",labelEn:"No refund",val:"entro 24h",valEn:"within 24h",color:"red"},{label:"Masseria chiusa",labelEn:"Masseria unexpectedly closed",val:"Rimborso completo",valEn:"Full refund",color:"green"}]
  }
];

// ─── INIT ────────────────────────────────────────────────────

function esjInit() {

  // ── CSS ───────────────────────────────────────────────────────
  // Palette light-warm: widget bianco/panna, header oro profondo,
  // testi scuri ad alto contrasto, font leggibili.
  var css = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');"
    // ── Variabili ──
    + ":root{"
    + "--esj-bg:#faf7f2;"          // bianco caldo — sfondo widget
    + "--esj-bg2:#f2ece2;"         // panna leggermente più scura — card/input
    + "--esj-bg3:#ece4d8;"         // bordi e separatori
    + "--esj-hdr:#2c2218;"         // header scuro caldo
    + "--esj-hdr2:#3a2e22;"        // header gradiente
    + "--esj-gold:#b8894a;"        // oro principale (più saturo su chiaro)
    + "--esj-gold2:#8a6030;"       // oro scuro — testi su sfondo chiaro
    + "--esj-txt:#1e1812;"         // testo primario (quasi nero)
    + "--esj-txt2:#5a4a38;"        // testo secondario
    + "--esj-txt3:#8a7560;"        // testo terziario / placeholder
    + "--esj-border:rgba(160,120,70,0.22);"
    + "--esj-radius:18px;"
    + "--esj-shadow:0 20px 56px rgba(0,0,0,0.22);"
    + "}"
    // ── FAB ──
    + "#esj-fab{position:fixed;bottom:28px;right:28px;width:60px;height:60px;background:linear-gradient(135deg,#c8a97e,#9a6e38);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 28px rgba(160,120,70,0.45);transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);z-index:99998;border:none}"
    + "#esj-fab:hover{transform:scale(1.1)}"
    + "#esj-fab svg{width:26px;height:26px;fill:#fff}"
    + "#esj-fab .esj-close{display:none}"
    + "#esj-fab.open .esj-open{display:none}"
    + "#esj-fab.open .esj-close{display:block}"
    // ── Widget container ──
    + "#esj-widget{position:fixed;bottom:102px;right:28px;width:420px;max-width:calc(100vw - 40px);height:610px;max-height:calc(100vh - 130px);background:var(--esj-bg);border:1px solid var(--esj-border);border-radius:var(--esj-radius);box-shadow:var(--esj-shadow);display:flex;flex-direction:column;overflow:hidden;z-index:99997;opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1)}"
    + "#esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}"
    // ── Header ──
    + ".esj-header{background:linear-gradient(135deg,var(--esj-hdr2),var(--esj-hdr));border-bottom:1px solid rgba(200,169,126,0.25);padding:1rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0}"
    + ".esj-avatar{width:40px;height:40px;background:linear-gradient(135deg,#c8a97e,#8a5e2e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:#fff;font-weight:600;flex-shrink:0;letter-spacing:0.02em}"
    + ".esj-header-name{font-family:'Cormorant Garamond',serif;font-size:1.35rem;color:#f4ede3;letter-spacing:0.03em;font-weight:400}"
    + ".esj-header-sub{font-family:'Jost',sans-serif;font-size:0.72rem;color:#c8a97e;letter-spacing:0.12em;text-transform:uppercase;margin-top:1px}"
    + ".esj-dot{width:7px;height:7px;background:#4caf6e;border-radius:50%;animation:esj-pulse 2s infinite;flex-shrink:0}"
    + "@keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.35}}"
    + ".esj-lang-wrap{display:flex;gap:4px}"
    + ".esj-lang{background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:1.2rem;padding:2px 4px;opacity:0.45;transition:all 0.2s}"
    + ".esj-lang.active{opacity:1;border-color:rgba(200,169,126,0.35);background:rgba(200,169,126,0.12)}"
    // ── HOME ──
    + "#esj-home{flex:1;overflow-y:auto;padding:1.2rem;display:flex;flex-direction:column;gap:0.9rem;background:var(--esj-bg)}"
    + "#esj-home::-webkit-scrollbar{width:3px}"
    + "#esj-home::-webkit-scrollbar-thumb{background:var(--esj-bg3);border-radius:2px}"
    // Bolla greeting
    + ".esj-greeting{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--esj-txt);line-height:1.7;padding:1rem 1.1rem;background:#fff;border:1px solid var(--esj-bg3);border-radius:14px}"
    // Card grid
    + ".esj-home-cards{display:grid;grid-template-columns:1fr 1fr;gap:0.7rem}"
    + ".esj-home-cards-full{grid-column:1/-1}"
    + ".esj-main-card{background:#fff;border:1.5px solid var(--esj-bg3);border-radius:14px;padding:1.1rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left;width:100%;box-sizing:border-box}"
    + ".esj-main-card:hover{border-color:var(--esj-gold);background:#fffbf5}"
    + ".esj-card-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:0.7rem}"
    + ".esj-card-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--esj-txt);margin-bottom:0.25rem;font-weight:600}"
    + ".esj-card-sub{font-family:'Jost',sans-serif;font-size:0.72rem;color:var(--esj-txt2);line-height:1.45;margin-bottom:0.55rem}"
    + ".esj-card-badge{display:inline-block;font-family:'Jost',sans-serif;font-size:0.65rem;padding:3px 9px;border-radius:20px;letter-spacing:0.04em;font-weight:500}"
    // Quick pills
    + ".esj-home-quick{display:flex;flex-wrap:wrap;gap:0.4rem}"
    + ".esj-qr-home{font-family:'Jost',sans-serif;font-size:0.74rem;padding:0.42rem 0.9rem;border:1.5px solid var(--esj-bg3);border-radius:20px;color:var(--esj-gold2);background:#fff;cursor:pointer;transition:all 0.2s;white-space:nowrap}"
    + ".esj-qr-home:hover{background:#fffbf5;border-color:var(--esj-gold);color:var(--esj-gold)}"
    // Home input bar
    + ".esj-home-bar{display:flex;gap:0.5rem;align-items:center;background:#fff;border:1.5px solid var(--esj-bg3);border-radius:12px;padding:0.6rem 0.85rem;transition:border-color 0.2s}"
    + ".esj-home-bar:focus-within{border-color:var(--esj-gold)}"
    + ".esj-home-inp{flex:1;background:transparent;border:none;outline:none;font-family:'Jost',sans-serif;font-size:0.82rem;color:var(--esj-txt)}"
    + ".esj-home-inp::placeholder{color:var(--esj-txt3)}"
    + ".esj-home-mic svg,.esj-home-send svg{width:14px;height:14px}"
    + ".esj-home-mic{width:30px;height:30px;background:var(--esj-bg2);border:1px solid var(--esj-bg3);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}"
    + ".esj-home-mic:hover{background:var(--esj-bg3);border-color:var(--esj-gold)}"
    + ".esj-home-mic.recording{background:rgba(220,50,50,0.1);border-color:#dc3232;animation:esj-pulse 1s infinite}"
    + ".esj-home-mic svg{fill:var(--esj-gold2)}"
    + ".esj-home-mic.recording svg{fill:#dc3232}"
    + ".esj-home-send{width:30px;height:30px;background:linear-gradient(135deg,#c8a97e,#9a6e38);border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.2s}"
    + ".esj-home-send:hover{transform:scale(1.08)}"
    + ".esj-home-send svg{fill:#fff}"
    // ── CHAT VIEWS ──
    + ".esj-chat-view{display:none;flex:1;flex-direction:column;min-height:0;background:var(--esj-bg)}"
    + ".esj-back-bar{display:flex;align-items:center;gap:0.5rem;font-family:'Jost',sans-serif;font-size:0.74rem;color:var(--esj-txt2);cursor:pointer;padding:0.5rem 1.1rem;border-bottom:1px solid var(--esj-bg3);background:var(--esj-bg2);transition:color 0.2s;border:none;width:100%;text-align:left;flex-shrink:0}"
    + ".esj-back-bar:hover{color:var(--esj-gold)}"
    + ".esj-back-bar svg{width:12px;height:12px;fill:currentColor;flex-shrink:0}"
    + ".esj-view-label{font-family:'Jost',sans-serif;font-size:0.68rem;color:var(--esj-gold2);letter-spacing:0.12em;text-transform:uppercase;padding:0.42rem 1.1rem;background:var(--esj-bg);border-bottom:1px solid var(--esj-bg3);flex-shrink:0}"
    // Messages area
    + ".esj-msgs{flex:1;overflow-y:auto;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:0.8rem;scroll-behavior:smooth;background:var(--esj-bg)}"
    + ".esj-msgs::-webkit-scrollbar{width:4px}"
    + ".esj-msgs::-webkit-scrollbar-thumb{background:var(--esj-bg3);border-radius:2px}"
    + ".esj-msg{max-width:88%;animation:esj-in 0.3s ease}"
    + "@keyframes esj-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
    + ".esj-msg.user{align-self:flex-end}"
    + ".esj-msg.assistant{align-self:flex-start}"
    + ".esj-bubble{padding:0.8rem 1.05rem;border-radius:14px;font-family:'Jost',sans-serif;font-size:0.84rem;line-height:1.75}"
    // User bubble: oro scuro su bianco caldo
    + ".esj-msg.user .esj-bubble{background:linear-gradient(135deg,#c8a97e,#9a6e38);color:#fff;border-bottom-right-radius:4px}"
    // Assistant bubble: bianco con bordo sottile, testo scuro leggibilissimo
    + ".esj-msg.assistant .esj-bubble{background:#fff;color:var(--esj-txt);border:1px solid var(--esj-bg3);border-bottom-left-radius:4px}"
    + ".esj-bubble strong{color:var(--esj-gold2)}"
    + ".esj-bubble em{color:var(--esj-gold);font-style:italic}"
    // Typing indicator
    + ".esj-typing{display:none;align-self:flex-start;padding:0.8rem 1rem;background:#fff;border:1px solid var(--esj-bg3);border-radius:14px;border-bottom-left-radius:4px}"
    + ".esj-typing.on{display:flex;gap:5px;align-items:center;animation:esj-in 0.3s ease}"
    + ".esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite}"
    + ".esj-typing span:nth-child(2){animation-delay:0.2s}"
    + ".esj-typing span:nth-child(3){animation-delay:0.4s}"
    + "@keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:0.45}40%{transform:translateY(-6px);opacity:1}}"
    // Quick replies strip
    + ".esj-qr-wrap{padding:0.5rem 1rem;display:flex;flex-wrap:wrap;gap:0.4rem;border-top:1px solid var(--esj-bg3);flex-shrink:0;background:var(--esj-bg2)}"
    + ".esj-qr{font-family:'Jost',sans-serif;font-size:0.72rem;padding:0.42rem 0.95rem;border:1.5px solid var(--esj-bg3);border-radius:20px;color:var(--esj-gold2);background:#fff;cursor:pointer;transition:all 0.2s;white-space:nowrap}"
    + ".esj-qr:hover{background:#fffbf5;border-color:var(--esj-gold);color:var(--esj-gold)}"
    // Input area
    + ".esj-input-area{padding:0.8rem 1rem;border-top:1px solid var(--esj-bg3);display:flex;gap:0.55rem;align-items:flex-end;background:var(--esj-bg2);flex-shrink:0}"
    + ".esj-input{flex:1;background:#fff;border:1.5px solid var(--esj-bg3);border-radius:12px;padding:0.7rem 0.95rem;color:var(--esj-txt);font-family:'Jost',sans-serif;font-size:0.82rem;resize:none;min-height:42px;max-height:100px;outline:none;transition:border-color 0.2s;line-height:1.45}"
    + ".esj-input::placeholder{color:var(--esj-txt3)}"
    + ".esj-input:focus{border-color:var(--esj-gold)}"
    + ".esj-mic{width:40px;height:40px;background:#fff;border:1.5px solid var(--esj-bg3);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}"
    + ".esj-mic:hover{background:var(--esj-bg2);border-color:var(--esj-gold)}"
    + ".esj-mic.recording{background:rgba(220,50,50,0.08);border-color:#dc3232;animation:esj-pulse 1s infinite}"
    + ".esj-mic svg{width:17px;height:17px;fill:var(--esj-gold2)}"
    + ".esj-mic.recording svg{fill:#dc3232}"
    + ".esj-send{width:40px;height:40px;background:linear-gradient(135deg,#c8a97e,#9a6e38);border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s,opacity 0.2s;flex-shrink:0}"
    + ".esj-send:hover{transform:scale(1.08)}"
    + ".esj-send:disabled{opacity:0.35;cursor:not-allowed;transform:none}"
    + ".esj-send svg{width:16px;height:16px;fill:#fff}"
    + ".esj-brand{text-align:center;padding:0.35rem;font-family:'Jost',sans-serif;font-size:0.6rem;color:var(--esj-txt3);letter-spacing:0.08em;flex-shrink:0;background:var(--esj-bg2);border-top:1px solid var(--esj-bg3)}"
    + ".esj-exp-card{background:#fff;border-radius:14px;border:1px solid #ece4d8;overflow:hidden;font-family:'Jost',sans-serif}"
    + ".esj-exp-hero{background:linear-gradient(135deg,#f5ede0,#ede0cc);padding:1rem 1.1rem 0.85rem;border-bottom:1px solid #ece4d8}"
    + ".esj-exp-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:#2c2218;font-weight:600;margin-bottom:4px;line-height:1.3}"
    + ".esj-exp-sub{font-size:0.68rem;color:#8a7560;margin-bottom:8px;line-height:1.4}"
    + ".esj-exp-badges{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}"
    + ".esj-exp-badge{display:inline-flex;align-items:center;gap:3px;font-size:0.63rem;padding:2px 7px;border-radius:20px;font-weight:500}"
    + ".esj-exp-price{font-family:'Cormorant Garamond',serif;font-size:1.25rem;color:#8a6030;font-weight:600}"
    + ".esj-exp-pfrom{font-size:0.66rem;color:#8a7560;margin-right:4px}"
    + ".esj-exp-sec{padding:0.7rem 1rem;border-bottom:1px solid #f2ece2}"
    + ".esj-exp-sec:last-child{border-bottom:none}"
    + ".esj-exp-sec-title{font-size:0.62rem;font-weight:500;color:#8a7560;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px}"
    + ".esj-exp-desc{font-size:0.76rem;color:#3a2e22;line-height:1.68}"
    + ".esj-exp-2col{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem}"
    + ".esj-exp-li{display:flex;align-items:flex-start;gap:5px;font-size:0.72rem;color:#3a2e22;line-height:1.5;margin-bottom:4px}"
    + ".esj-exp-check{width:13px;height:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}"
    + ".esj-exp-check-y{background:#eaf3de}"
    + ".esj-exp-check-n{background:#fcebeb}"
    + ".esj-exp-meta{display:grid;grid-template-columns:1fr 1fr;gap:5px}"
    + ".esj-exp-meta-item{background:#f9f5f0;border-radius:7px;padding:6px 8px}"
    + ".esj-exp-meta-k{font-size:0.58rem;color:#8a7560;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px}"
    + ".esj-exp-meta-v{font-size:0.72rem;color:#2c2218;font-weight:500}"
    + ".esj-exp-policy-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;font-size:0.7rem;padding:3px 0;border-bottom:1px solid #f0e8d8}"
    + ".esj-exp-policy-row:last-child{border-bottom:none}"
    + ".esj-exp-pol-l{color:#8a7560;flex-shrink:0}"
    + ".esj-exp-pol-v{font-weight:500;text-align:right}"
    + ".esj-exp-pol-green{color:#3b6d11}"
    + ".esj-exp-pol-amber{color:#854f0b}"
    + ".esj-exp-pol-red{color:#a32d2d}"
    + ".esj-exp-policy-box{background:#fdf8f2;border:1px solid #e8dcc8;border-radius:8px;padding:8px 10px}"
    + ".esj-exp-note{background:#faeeda;border-radius:8px;padding:7px 10px;font-size:0.7rem;color:#633806;line-height:1.55}"
    + ".esj-exp-cta{padding:0.7rem 1rem 0.8rem;display:flex;flex-direction:column;gap:6px}"
    + ".esj-exp-book{width:100%;padding:10px;background:linear-gradient(135deg,#c8a97e,#9a6e38);border:none;border-radius:9px;color:#fff;font-family:'Jost',sans-serif;font-size:0.8rem;font-weight:500;cursor:pointer;transition:opacity 0.2s}"
    + ".esj-exp-book:hover{opacity:0.9}"
    + ".esj-exp-ask{width:100%;padding:7px;background:transparent;border:1px solid #e0d5c5;border-radius:9px;color:#8a6030;font-family:'Jost',sans-serif;font-size:0.74rem;cursor:pointer;transition:all 0.2s}"
    + ".esj-exp-ask:hover{border-color:#c8a97e;background:#faf7f2}";;

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── FAB ────────────────────────────────────────────────────────
  var fab = document.createElement("button");
  fab.id = "esj-fab";
  fab.setAttribute("aria-label", "Prenota con Sofia");
  fab.innerHTML = '<svg class="esj-open" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg><svg class="esj-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  // ── WIDGET HTML ────────────────────────────────────────────────
  var micSvg  = '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93H2c0 4.97 3.66 9.1 8.5 9.82V21h3v-2.25C18.34 18.1 22 13.97 22 9h-2c0 4.08-3.06 7.44-7 7.93V15.93z"/></svg>';
  var sendSvg = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var backSvg = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

  function chatView(id, backId, lblId, msgsId, typId, qrId, inpId, micId, sndId) {
    return '<div id="' + id + '" class="esj-chat-view">'
      + '<button class="esj-back-bar" onclick="esjGoView(\'home\')">' + backSvg + '<span id="' + backId + '"></span></button>'
      + '<div class="esj-view-label" id="' + lblId + '"></div>'
      + '<div class="esj-msgs" id="' + msgsId + '"><div class="esj-typing" id="' + typId + '"><span></span><span></span><span></span></div></div>'
      + '<div class="esj-qr-wrap" id="' + qrId + '"></div>'
      + '<div class="esj-input-area">'
      +   '<textarea id="' + inpId + '" class="esj-input" rows="1"></textarea>'
      +   '<button id="' + micId + '" class="esj-mic" title="Parla">' + micSvg + '</button>'
      +   '<button id="' + sndId + '" class="esj-send" disabled>' + sendSvg + '</button>'
      + '</div>'
      + '</div>';
  }

  var wid = document.createElement("div");
  wid.id = "esj-widget";
  wid.innerHTML =
    '<div class="esj-header">'
    +   '<div class="esj-avatar">S</div>'
    +   '<div style="flex:1">'
    +     '<div class="esj-header-name">Sofia &middot; Eremo di San Giusto</div>'
    +     '<div class="esj-header-sub" id="esj-sub">Assistente di Prenotazione &middot; Ostuni, Puglia</div>'
    +   '</div>'
    +   '<div class="esj-dot"></div>'
    +   '<div class="esj-lang-wrap">'
    +     '<button class="esj-lang active" id="esj-lang-it" onclick="esjSetLang(\'it\')">&#127470;&#127481;</button>'
    +     '<button class="esj-lang" id="esj-lang-en" onclick="esjSetLang(\'en\')">&#127468;&#127463;</button>'
    +     '<a href="https://eremo-bookings.vercel.app/staff" target="_blank" title="Staff backoffice" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;border:1px solid transparent;opacity:0.25;transition:opacity 0.2s;text-decoration:none;margin-left:2px;" onmouseover="this.style.opacity=\'1\';this.style.borderColor=\'rgba(200,169,126,0.35)\'" onmouseout="this.style.opacity=\'0.25\';this.style.borderColor=\'transparent\'">'
    +       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#c8a97e" stroke-width="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#c8a97e" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +     '</a>'
    +   '</div>'
    + '</div>'

    // HOME
    + '<div id="esj-home" style="display:flex;flex-direction:column;">'
    +   '<div class="esj-greeting" id="esj-home-msg"></div>'
    +   '<div class="esj-home-cards">'
    +     '<button class="esj-main-card" onclick="esjGoView(\'camere\')">'
    +       '<div class="esj-card-icon" style="background:rgba(24,95,165,0.15)">'
    +         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9h18M9 3v6M15 3v6M5 21h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" stroke="#85B7EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</div>'
    +       '<div class="esj-card-title" id="esj-ct1">Prenota una camera</div>'
    +       '<div class="esj-card-sub" id="esj-cs1">Trullo &middot; Lamia &middot; disponibilit&agrave; live</div>'
    +       '<span class="esj-card-badge" style="background:rgba(24,95,165,0.15);color:#185FA5;">via Beds24</span>'
    +     '</button>'
    +     '<button class="esj-main-card" onclick="esjGoView(\'esperienze\')">'
    +       '<div class="esj-card-icon" style="background:rgba(29,158,117,0.15)">'
    +         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</div>'
    +       '<div class="esj-card-title" id="esj-ct2">Esperienze</div>'
    +       '<div class="esj-card-sub" id="esj-cs2">8 esperienze &middot; pacchetti weekend</div>'
    +       '<span class="esj-card-badge" style="background:rgba(29,158,117,0.15);color:#0F6E56;" id="esj-cs2b">8 esperienze</span>'
    +     '</button>'
    +     '<button class="esj-main-card esj-home-cards-full" onclick="esjGoView(\'guida\')">'
    +       '<div style="display:flex;align-items:center;gap:0.8rem">'
    +         '<div class="esj-card-icon" style="background:rgba(186,117,23,0.12);width:34px;height:34px;flex-shrink:0">'
    +           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#BA7517" opacity="0.8"/></svg>'
    +         '</div>'
    +         '<div style="flex:1">'
    +           '<div class="esj-card-title" id="esj-ct3">Ostuni &amp; Dintorni</div>'
    +           '<div class="esj-card-sub" id="esj-cs3">Spiagge &middot; Borghi &middot; Gastronomia &middot; Distanze</div>'
    +         '</div>'
    +         '<span class="esj-card-badge" style="background:rgba(186,117,23,0.12);color:#854F0B;" id="esj-cs3b">Guida ospiti</span>'
    +       '</div>'
    +     '</button>'
    +     '<button class="esj-main-card esj-home-cards-full" onclick="esjGoView(\'pacchetti\')">'
    +       '<div style="display:flex;align-items:center;gap:0.8rem">'
    +         '<div class="esj-card-icon" style="background:rgba(83,74,183,0.12);width:34px;height:34px;flex-shrink:0">'
    +           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#534AB7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '</div>'
    +         '<div style="flex:1">'
    +           '<div class="esj-card-title" id="esj-ct4">Weekend Esclusivi</div>'
    +           '<div class="esj-card-sub" id="esj-cs4">3 pacchetti curati &middot; camera + esperienze</div>'
    +         '</div>'
    +         '<span class="esj-card-badge" style="background:rgba(83,74,183,0.12);color:#3C3489;" id="esj-cs4b">da &euro;750</span>'
    +       '</div>'
    +     '</button>'
    +     '<button class="esj-main-card esj-home-cards-full" onclick="esjGoView(\'scopri\')">'
    +       '<div style="display:flex;align-items:center;gap:0.8rem">'
    +         '<div class="esj-card-icon" style="background:rgba(13,110,84,0.12);width:34px;height:34px;flex-shrink:0">'
    +           '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0F6E56" stroke-width="1.5"/><path d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z" stroke="#0F6E56" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '</div>'
    +         '<div style="flex:1">'
    +           '<div class="esj-card-title" id="esj-ct5">Scopri & Guestbook</div>'
    +           '<div class="esj-card-sub" id="esj-cs5">Meteo &middot; Ristoranti &middot; Posti &middot; Review ospiti</div>'
    +         '</div>'
    +         '<span class="esj-card-badge" style="background:rgba(13,110,84,0.12);color:#085041;" id="esj-cs5b">Knowledge Base</span>'
    +       '</div>'
    +     '</button>'
    +   '</div>'
    +   '<div class="esj-home-quick" id="esj-home-quick"></div>'
    +   '<div class="esj-home-bar">'
    +     '<input id="esj-home-inp" class="esj-home-inp" type="text" onkeydown="if(event.key===\'Enter\')esjHomeSend()">'
    +     '<button id="esj-home-mic" class="esj-home-mic" title="Parla">' + micSvg + '</button>'
    +     '<button class="esj-home-send" onclick="esjHomeSend()">' + sendSvg + '</button>'
    +   '</div>'
    + '</div>'

    // CAMERE CHAT
    + chatView("esj-camere","esj-back-c","esj-lbl-c","esj-msgs-c","esj-typing-c","esj-qr-c","esj-inp-c","esj-mic-c","esj-snd-c")

    // ESPERIENZE CHAT
    + chatView("esj-esperienze","esj-back-e","esj-lbl-e","esj-msgs-e","esj-typing-e","esj-qr-e","esj-inp-e","esj-mic-e","esj-snd-e")

    // GUIDA CHAT
    + chatView("esj-guida","esj-back-g","esj-lbl-g","esj-msgs-g","esj-typing-g","esj-qr-g","esj-inp-g","esj-mic-g","esj-snd-g")

    // PACCHETTI CHAT
    + chatView("esj-pacchetti","esj-back-p","esj-lbl-p","esj-msgs-p","esj-typing-p","esj-qr-p","esj-inp-p","esj-mic-p","esj-snd-p")

    // SCOPRI CHAT
    + chatView("esj-scopri","esj-back-s","esj-lbl-s","esj-msgs-s","esj-typing-s","esj-qr-s","esj-inp-s","esj-mic-s","esj-snd-s")

    + '<div class="esj-brand">Powered by Claude AI</div>';

  document.body.appendChild(fab);
  document.body.appendChild(wid);

  // ── REFS ──────────────────────────────────────────────────────
  var msgsC   = document.getElementById("esj-msgs-c");
  var msgsE   = document.getElementById("esj-msgs-e");
  var msgsG   = document.getElementById("esj-msgs-g");
  var msgsP   = document.getElementById("esj-msgs-p");
  var msgsS   = document.getElementById("esj-msgs-s");
  var typC    = document.getElementById("esj-typing-c");
  var typE    = document.getElementById("esj-typing-e");
  var typG    = document.getElementById("esj-typing-g");
  var typP    = document.getElementById("esj-typing-p");
  var typS    = document.getElementById("esj-typing-s");
  var inpC    = document.getElementById("esj-inp-c");
  var inpE    = document.getElementById("esj-inp-e");
  var inpG    = document.getElementById("esj-inp-g");
  var inpP    = document.getElementById("esj-inp-p");
  var inpS    = document.getElementById("esj-inp-s");
  var sndC    = document.getElementById("esj-snd-c");
  var sndE    = document.getElementById("esj-snd-e");
  var sndG    = document.getElementById("esj-snd-g");
  var sndP    = document.getElementById("esj-snd-p");
  var sndS    = document.getElementById("esj-snd-s");
  var micC    = document.getElementById("esj-mic-c");
  var micE    = document.getElementById("esj-mic-e");
  var micG    = document.getElementById("esj-mic-g");
  var micP    = document.getElementById("esj-mic-p");
  var micS    = document.getElementById("esj-mic-s");
  var micHome = document.getElementById("esj-home-mic");
  var homeInp = document.getElementById("esj-home-inp");
  var qrC     = document.getElementById("esj-qr-c");
  var qrE     = document.getElementById("esj-qr-e");
  var qrG     = document.getElementById("esj-qr-g");
  var qrP     = document.getElementById("esj-qr-p");
  var qrS     = document.getElementById("esj-qr-s");
  var loadC   = false, loadE = false, loadG = false, loadP = false, loadS = false;

  // ── FORMAT ────────────────────────────────────────────────────
  function fmt(t) {
    return t
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  // ── ADD MESSAGE — NO TTS ──────────────────────────────────────
  // Voice only for INPUT. Sofia responds with text only — no speech synthesis.
  function addMsg(msgsEl, typEl, role, text) {
    typEl.classList.remove("on");
    var d = document.createElement("div");
    d.className = "esj-msg " + role;
    d.innerHTML = '<div class="esj-bubble">' + fmt(text) + "</div>";
    msgsEl.insertBefore(d, typEl);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  // ── PROXY CALL ────────────────────────────────────────────────
  // Pulisce la history da tool_use senza tool_result corrispondente
  function sanitizeHistory(msgs) {
    var clean = [];
    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];
      if (msg.role === "assistant" && Array.isArray(msg.content)) {
        var hasToolUse = msg.content.some(function(b) { return b.type === "tool_use"; });
        if (hasToolUse) {
          // Verifica che il messaggio successivo sia un tool_result
          var next = msgs[i + 1];
          var hasToolResult = next && next.role === "user" && Array.isArray(next.content) &&
            next.content.some(function(b) { return b.type === "tool_result"; });
          if (!hasToolResult) {
            // Salta questo messaggio e il successivo (se esiste)
            i++; continue;
          }
        }
      }
      clean.push(msg);
    }
    return clean;
  }

  async function callProxy(msgArr, ctx) {
    var today = new Date().toISOString().split("T")[0];
    var lang  = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English." : "";
    var sys   = ESJ_SYSTEM_BASE + lang + ctx + "\n\nOGGI E' IL " + today + ". Non usare mai date passate.";
    var cleanMsgs = sanitizeHistory(msgArr);
    var body  = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: cleanMsgs };

    var resp = await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var data = await resp.json();

    while (data.stop_reason === "tool_use") {
      // Guard: se data.content non esiste o non ha tool_use blocks, esci
      if (!data.content || !Array.isArray(data.content)) break;
      var toolUseBlocks = data.content.filter(function(x) { return x.type === "tool_use"; });
      if (toolUseBlocks.length === 0) break;

      msgArr.push({ role: "assistant", content: data.content });
      var results = [];
      for (var i = 0; i < data.content.length; i++) {
        var b = data.content[i];
        if (b.type !== "tool_use") continue;
        var res = { error: "Tool non riconosciuto: " + b.name };
        try {
          if (b.name === "check_availability") {
            res = await (await fetch(ESJ_PROXY + "/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
          } else if (b.name === "create_room_booking") {
            res = await (await fetch(ESJ_PROXY + "/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
            if (res && res.bookingId && msgArr === ESJ_MSG_C) {
              var notti = Math.round((new Date(b.input.checkout) - new Date(b.input.checkin)) / 86400000);
              var prezzoStimato = res.totalPrice || (notti * 200);
              esjStripeRedirect({
                type: "camera", tariffa: res.rateType || "standard",
                bookingRef: res.bookingId,
                descrizione: "Camera " + b.input.checkin + " \u2192 " + b.input.checkout + " \u00b7 " + notti + (ESJ_LANG==="it"?" notti":" nights"),
                importo: prezzoStimato,
                firstName: b.input.firstName, lastName: b.input.lastName, email: b.input.email,
                msgsEl: msgsC, typEl: typC
              });
            }
          } else if (b.name === "get_next_available_dates") {
            res = await (await fetch(ESJ_PROXY + "/api/airtable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get_next_dates", ...b.input }) })).json();
          } else if (b.name === "check_experience_availability") {
            res = await (await fetch(ESJ_PROXY + "/api/airtable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check_availability", ...b.input }) })).json();
          } else if (b.name === "create_experience_booking") {
            res = await (await fetch(ESJ_PROXY + "/api/airtable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_booking", ...b.input }) })).json();
            if (res && res.success && res.bookingRef) {
              var msgsTarget = msgArr === ESJ_MSG_E ? msgsE : msgsP;
              var typTarget  = msgArr === ESJ_MSG_E ? typE  : typP;
              esjStripeRedirect({
                type: "esperienza",
                bookingRef: res.bookingRef,
                descrizione: (b.input.esperienza || "") + " \u00b7 " + (b.input.data || "") + " \u00b7 " + (b.input.partecipanti || 1) + (ESJ_LANG==="it"?" persone":" guests"),
                importo: res.totale || 0,
                firstName: b.input.firstName, lastName: b.input.lastName, email: b.input.email,
                msgsEl: msgsTarget, typEl: typTarget
              });
            }
          }
        } catch(e) { res = { error: e.message }; }
        results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(res) });
      }
      // Verifica che tutti i tool_use abbiano un tool_result prima di mandare
      if (results.length !== toolUseBlocks.length) {
        console.error("tool_use/tool_result mismatch:", toolUseBlocks.length, "vs", results.length);
        break;
      }
      msgArr.push({ role: "user", content: results });
      var b2 = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: msgArr };
      data = await (await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b2) })).json();
      // Guard sull'errore API nella risposta successiva
      if (data.type === "error" || !data.content) break;
    }

    var txt = "";
    for (var j = 0; j < data.content.length; j++) {
      if (data.content[j].type === "text") txt = data.content[j].text;
    }
    if (txt) msgArr.push({ role: "assistant", content: txt });
    return txt;
  }

  // ── SEND CAMERE ───────────────────────────────────────────────
  async function sendC(text) {
    if (!text.trim() || loadC) return;
    loadC = true; sndC.disabled = true;
    qrC.style.display = "none";
    addMsg(msgsC, typC, "user", text);
    inpC.value = ""; inpC.style.height = "auto";
    typC.classList.add("on"); msgsC.scrollTop = msgsC.scrollHeight;
    ESJ_MSG_C.push({ role: "user", content: text });
    try {
      var r = await callProxy(ESJ_MSG_C, "\n\nCONTESTO: flusso CAMERA. Usa check_availability e create_room_booking con roomId 469679. Dopo conferma proponi esperienze.");
      addMsg(msgsC, typC, "assistant", r);
    } catch(e) {
      addMsg(msgsC, typC, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
    }
    loadC = false; sndC.disabled = false; inpC.focus();
  }

  // ── KEYWORD MAP: parole chiave → ID esperienza ────────────────
  var ESJ_EXP_KEYWORDS = {
    "liquid-gold":        ["liquid gold","olio","frantoio","ulivo","evo","degustazione olio","olive oil","mill","grove"],
    "stargazing":         ["stargazing","stelle","telescopio","astronomia","star","telescope","cielo"],
    "sunset-serenade":    ["serenade","tramonto","fisarmonica","mandolino","sunset","concerto","musica","serenad"],
    "cooking-class":      ["cooking","orecchiette","cucina","chef","pasta","cacioricotta","cook"],
    "massaggi":           ["massaggio","benessere","wellness","osteopata","rituali","massage","relax","trullo spa"],
    "trekking":           ["trekking","trek","camminata","santuario","monte morrone","sentiero","hike","hiking","sant'oronzo","san biagio"],
    "ciuchino-birichino": ["ciuchino","avventura","zip","parco","bambini","family","adventure","zipline","birichino"]
  };

  function esjDetectExperience(text) {
    var q = text.toLowerCase();
    var ids = Object.keys(ESJ_EXP_KEYWORDS);
    for (var i = 0; i < ids.length; i++) {
      var kws = ESJ_EXP_KEYWORDS[ids[i]];
      for (var j = 0; j < kws.length; j++) {
        if (q.includes(kws[j])) return ids[i];
      }
    }
    return null;
  }

  // ── CARD RENDERER (inline, no external file) ──────────────────
  function esjRenderCard(expId) {
    var exp = ESJ_EXPERIENCES.find(function(e) { return e.id === expId; });
    if (!exp) return null;
    var it = ESJ_LANG === "it";

    function chk(ok) {
      return ok
        ? '<svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#3b6d11" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M3 3l4 4M7 3l-4 4" stroke="#a32d2d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    var name   = it ? exp.name       : exp.nameEn;
    var sub    = it ? exp.sub        : exp.subEn;
    var dur    = it ? exp.duration   : exp.durationEn;
    var diff   = it ? exp.difficulty : exp.difficultyEn;
    var seas   = it ? exp.season     : exp.seasonEn;
    var desc   = (it ? exp.desc : exp.descEn).split("\n")[0];
    var incl   = it ? exp.included   : exp.includedEn;
    var excl   = it ? exp.excluded   : exp.excludedEn;
    var bring  = it ? exp.bring      : exp.bringEn;
    var note   = it ? exp.notes      : exp.notesEn;
    var pol    = exp.policy;
    var prices = exp.prices;
    var meta   = [
      { k: it?"Durata":"Duration",       v: dur },
      { k: it?"Stagione":"Season",        v: seas },
      { k: it?"Max ospiti":"Max guests",  v: exp.maxGuests < 99 ? exp.maxGuests+(it?" pp":" guests") : (it?"Nessun limite":"No limit") },
      { k: it?"Orari":"Times",            v: exp.startTimes.join(", ") },
      { k: it?"Prenotare":"Book ahead",   v: exp.advanceBooking+(it?" prima":" before") },
      { k: it?"Tipo":"Type",              v: it ? exp.type : exp.typeEn }
    ];

    var bookMsg = (it ? "Voglio prenotare " : "I want to book ") + name;
    var askMsg  = (it ? "Dimmi di più su " : "Tell me more about ") + name;
    var bookLbl = it ? "Prenota questa esperienza ↗" : "Book this experience ↗";
    var askLbl  = it ? "Fai una domanda a Sofia ↗"   : "Ask Sofia a question ↗";

    var h = '<div class="esj-exp-card">';
    // Hero
    h += '<div class="esj-exp-hero">';
    h += '<div class="esj-exp-title">'+name+'</div>';
    h += '<div class="esj-exp-sub">'+sub+'</div>';
    h += '<div class="esj-exp-badges">';
    if (dur !== "—") h += '<span class="esj-exp-badge" style="background:#f1efe8;color:#444441;"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#5F5E5A" stroke-width="1"/><path d="M6 3.5V6l1.5 1" stroke="#5F5E5A" stroke-width="1" stroke-linecap="round"/></svg>'+dur+'</span>';
    if (diff !== "—") h += '<span class="esj-exp-badge" style="background:#eaf3de;color:#3b6d11;"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 9L5 4l3 3 2-4" stroke="#3b6d11" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+diff+'</span>';
    h += '<span class="esj-exp-badge" style="background:#e6f1fb;color:#0c447c;"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="2" y="3" width="8" height="7" rx="1" stroke="#185FA5" stroke-width="1"/><path d="M4 2v2M8 2v2M2 6h8" stroke="#185FA5" stroke-width="1" stroke-linecap="round"/></svg>'+seas+'</span>';
    if (exp.maxGuests < 99) h += '<span class="esj-exp-badge" style="background:#faeeda;color:#633806;">max '+exp.maxGuests+(it?" pp":" guests")+'</span>';
    h += '</div>';
    h += '<span class="esj-exp-pfrom">'+(it?"da":"from")+'</span><span class="esj-exp-price">€'+exp.priceFrom+'</span><span style="font-size:0.66rem;color:#8a7560;">/pp</span>';
    h += '</div>';
    // Desc
    h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"L'esperienza":"About")+'</div><div class="esj-exp-desc">'+desc+'</div></div>';
    // Prices
    h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"Prezzi":"Pricing")+'</div>';
    prices.forEach(function(p){ h += '<div class="esj-exp-policy-row"><span class="esj-exp-pol-l">'+(it?p.label:p.labelEn)+'</span><span class="esj-exp-pol-v" style="color:#2c2218;">'+p.val+'</span></div>'; });
    h += '</div>';
    // Included / Excluded
    h += '<div class="esj-exp-sec"><div class="esj-exp-2col"><div><div class="esj-exp-sec-title">'+(it?"Incluso":"Included")+'</div>';
    incl.forEach(function(x){ h += '<div class="esj-exp-li"><span class="esj-exp-check esj-exp-check-y">'+chk(true)+'</span><span>'+x+'</span></div>'; });
    h += '</div><div><div class="esj-exp-sec-title">'+(it?"Non incluso":"Excluded")+'</div>';
    excl.forEach(function(x){ h += '<div class="esj-exp-li"><span class="esj-exp-check esj-exp-check-n">'+chk(false)+'</span><span>'+x+'</span></div>'; });
    h += '</div></div></div>';
    // Bring
    h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"Cosa portare":"What to bring")+'</div>';
    bring.forEach(function(x){ h += '<div class="esj-exp-li"><span style="color:#8a6030;font-size:11px;flex-shrink:0;margin-top:2px;">·</span><span>'+x+'</span></div>'; });
    h += '</div>';
    // Meta
    h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"Informazioni":"Details")+'</div><div class="esj-exp-meta">';
    meta.forEach(function(m){ h += '<div class="esj-exp-meta-item"><div class="esj-exp-meta-k">'+m.k+'</div><div class="esj-exp-meta-v">'+m.v+'</div></div>'; });
    h += '</div></div>';
    // Notes
    if (note) h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"Note":"Notes")+'</div><div class="esj-exp-note">'+note+'</div></div>';
    // Policy
    h += '<div class="esj-exp-sec"><div class="esj-exp-sec-title">'+(it?"Cancellazione":"Cancellation")+'</div><div class="esj-exp-policy-box">';
    pol.forEach(function(p){ h += '<div class="esj-exp-policy-row"><span class="esj-exp-pol-l">'+(it?p.label:p.labelEn)+'</span><span class="esj-exp-pol-v esj-exp-pol-'+p.color+'">'+(it?p.val:p.valEn)+'</span></div>'; });
    h += '</div></div>';
    // CTA — usa window.esjSendE (globale) perché questi onclick sono fuori dallo scope di esjInit
    // bookMsg usa "Voglio prenotare" che è nella regex isBookingData → bypassa la card, va al flusso dati
    var bookTrigger = (it ? "Voglio prenotare " : "I want to book ") + name;
    var askTrigger  = (it ? "Ho una domanda su " : "I have a question about ") + name;
    var bookTriggerSafe = bookTrigger.replace(/'/g, "\\'");
    var askTriggerSafe  = askTrigger.replace(/'/g, "\\'");
    h += '<div class="esj-exp-cta">';
    h += '<button class="esj-exp-book" onclick="esjGoView(\'esperienze\');setTimeout(function(){if(window.esjSendE)window.esjSendE(\''+bookTriggerSafe+'\');},300);">'+(it?"Prenota questa esperienza ↗":"Book this experience ↗")+'</button>';
    h += '<button class="esj-exp-ask" onclick="esjGoView(\'esperienze\');setTimeout(function(){if(window.esjSendE)window.esjSendE(\''+askTriggerSafe+'\');},300);">'+(it?"Fai una domanda a Sofia ↗":"Ask Sofia a question ↗")+'</button>';
    h += '</div></div>';
    return h;
  }

  // ── INJECT CARD into chat (no text bubble, just the card) ─────
  function esjShowCard(html) {
    typE.classList.remove("on");
    var d = document.createElement("div");
    d.className = "esj-msg assistant";
    d.innerHTML = '<div style="padding:0;background:transparent;border:none;">'+html+'</div>';
    msgsE.insertBefore(d, typE);
    msgsE.scrollTop = msgsE.scrollHeight;
  }

  // ── SEND ESPERIENZE ───────────────────────────────────────────
  async function sendE(text) {
    if (!text.trim() || loadE) return;
    loadE = true; sndE.disabled = true;
    qrE.style.display = "none";
    addMsg(msgsE, typE, "user", text);
    inpE.value = ""; inpE.style.height = "auto";
    msgsE.scrollTop = msgsE.scrollHeight;

    // Rileva esperienza specifica nel messaggio
    var detectedId = esjDetectExperience(text);

    // Mostra card se: viene rilevata un'esperienza E l'utente non sta
    // già fornendo dati di prenotazione o chiedendo esplicitamente di prenotare
    var isBookingData = (function(t) {
      if (/\b(voglio prenotare|i want to book|vorrei prenotare|i'd like to book|prenoto|book now)\b/i.test(t)) return true;
      if (/\d{1,2}\s*(luglio|agosto|settembre|ottobre|novembre|dicembre|gennaio|febbraio|marzo|aprile|maggio|giugno|july|august|september|october|november|december|january|february|march|june)/i.test(t)) return true;
      if (/\b\d{1,2}[\/\-]\d{1,2}\b/.test(t)) return true;
      if (/\b\d{4}\-\d{2}/.test(t)) return true;
      if (/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(t)) return true;
      return false;
    })(text);
    var showCard = detectedId && !isBookingData;

    if (showCard) {
      // 1. Mostra subito la scheda prodotto visuale
      var cardHtml = esjRenderCard(detectedId);
      if (cardHtml) esjShowCard(cardHtml);
      // 2. Sofia aggiunge solo un commento caldo breve (non ripete i dettagli)
      ESJ_MSG_E.push({ role: "user", content: text });
      typE.classList.add("on"); msgsE.scrollTop = msgsE.scrollHeight;
      try {
        var ctx = "\n\nCONTESTO: flusso ESPERIENZE custom. Ho appena mostrato all'utente la scheda prodotto VISUALE completa per '"
          + detectedId
          + "' con tutti i dettagli (prezzi, inclusi, esclusi, policy). "
          + "Scrivi SOLO 1-2 frasi calde di presentazione senza ripetere nulla di quello che c'è nella scheda. "
          + "Poi chiedi solo: vuole prenotare, o ha domande?";
        var r = await callProxy(ESJ_MSG_E, ctx);
        addMsg(msgsE, typE, "assistant", r);
      } catch(e) {
        typE.classList.remove("on");
      }
    } else {
      // Flusso normale: Sofia gestisce in conversazione
      typE.classList.add("on"); msgsE.scrollTop = msgsE.scrollHeight;
      ESJ_MSG_E.push({ role: "user", content: text });
      try {
        var ctx2 = "\n\nCONTESTO: flusso ESPERIENZE con sistema Airtable. "
          + "Per verificare disponibilita usa check_experience_availability con l'ID esperienza corretto (es. liquid-gold) e la data in YYYY-MM-DD. "
          + "Se disponibile presenta gli slot con orari e posti liberi. Se non disponibile proponi le date alternative restituite dal tool. "
          + "Per prenotare usa create_experience_booking con tutti i dati: esperienza, data, orario, partecipanti, nome, cognome, email, telefono, tipoPrezzo. "
          + "Non inventare mai disponibilita — usa sempre i tool Airtable.";
        var r2 = await callProxy(ESJ_MSG_E, ctx2);
        addMsg(msgsE, typE, "assistant", r2);
      } catch(e) {
        addMsg(msgsE, typE, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
      }
    }
    loadE = false; sndE.disabled = false; inpE.focus();
  }

  // ── SYSTEM PROMPT GUIDA ───────────────────────────────────────
  var ESJ_SYSTEM_GUIDA = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. In questa sezione sei la guida locale per gli ospiti — rispondi a domande su Ostuni, le spiagge, i borghi della Valle d'Itria, la gastronomia, gli eventi, le distanze e i consigli pratici. Usa un tono caldo e da insider locale. Quando presenti elenchi di luoghi o distanze usa tabelle o liste chiare. Puoi usare emoji con moderazione.\n\nOSTUNI:\nCitta Bianca arroccata su tre colli a 200m s.l.m. Origini preistoriche ('Delia', scheletro 25.000 anni). Centro storico: Piazza della Liberta con Colonna di Sant'Oronzo (1771), Cattedrale di Santa Maria Assunta (1435-1495, rosone gotico a 24 raggi), Mura Aragonesi (XV sec, panorama Valle d'Itria). Musei: Museo Civilta Preclassiche (Via Cattedrale, chiuso lun), Museo Civilta Contadina.\nPARCHEGGI: P.Via Pola (gratuito, 500m), P.Ex Mattatoio (gratuito, evita ZTL), P.Stazione FS (gratuito + navetta estiva), P.Porta Nova (0.80 eur/h). Luglio-agosto: arrivare prima 9:30 o dopo 19:00.\n\nSPIAGGE:\n- Torre Guaceto (~13km): riserva naturale, costa incontaminata, torre aragonese, snorkeling, accesso gratuito a piedi\n- Rosa Marina (~15km): spiaggia bianchissima, stabilimenti qualità, villaggio elegante\n- Villanova: porto peschereccio, spiaggia mista, ristoranti di pesce\n- Costa Merlata: sabbia fine, acque basse, famiglie\nConsigli: evitare 12-16 luglio-agosto (35+ gradi). Navetta dal centro giugno-settembre.\n\nBORGHI VALLE D'ITRIA:\n- Cisternino (15km, 20min): borghi piu belli d'Italia, vicoli bianchi, Torre Normanno-Sveva, bombette ai fornelli pronti\n- Ceglie Messapica (18km, 25min): capitale gastronomica Puglia, Castello Ducale, ristoranti stellati, Torrone Slow Food, GustaMondo (lug-ago)\n- Martina Franca (22km, 30min): barocco pugliese, Palazzo Ducale, Festival Valle d'Itria opera (lug-ago), Capocollo Slow Food\n- Locorotondo (25km, 30min): forma circolare, tetti cummerse unici, belvedere Valle d'Itria, DOC Locorotondo bianco, degustazioni cantine\n- Alberobello (30km, 35min): UNESCO 1996, 1000+ trulli Rione Monti, visitare prima 9:00 o dopo 18:00 in estate\n\nGASTRONOMIA:\nOlio EVO DOP Valle d'Itria, Fave e cicoria, Orecchiette (ragu/cime di rapa), Bombette di Cisternino, Burrata e mozzarella di Andria, Pane di Altamura DOP, Pasticciotti e cartellate, Primitivo di Manduria e Negroamaro.\n\nEVENTI:\n- 17 gen: Festa Sant'Antonio Abate\n- Pasqua: Processione Venerdi Santo (perdune incappucciati)\n- Fine apr/mag: Sagra Fava e Cicoria\n- Ago: Cavalcata di Sant'Oronzo (26 ago, evento principale), Sagra Braciola, Ostuni Music Festival, Notte Bianca\n- Ott: Sagra Olio Nuovo\n- Dic: Presepe Vivente, Mercatini Natale\n\nDISTANZE DALL'EREMO:\nOstuni centro 3km/8min | Torre Guaceto 13km/20min | Brindisi Aeroporto 35km/35min | Cisternino 15km/20min | Ceglie Messapica 18km/25min | Martina Franca 22km/30min | Locorotondo 25km/30min | Alberobello 30km/35min | Bari 65km/55min | Taranto 60km/55min | Lecce 80km/1h10min\n\nREGOLE: Rispondi solo a domande su Ostuni e dintorni. Se chiedono di prenotare camera o esperienze, di' loro di tornare alla Home e usare le sezioni apposite.";

  // ── SEND GUIDA ────────────────────────────────────────────────
  async function sendG(text) {
    if (!text.trim() || loadG) return;
    loadG = true; sndG.disabled = true;
    qrG.style.display = "none";
    addMsg(msgsG, typG, "user", text);
    inpG.value = ""; inpG.style.height = "auto";
    typG.classList.add("on"); msgsG.scrollTop = msgsG.scrollHeight;
    ESJ_MSG_G.push({ role: "user", content: text });
    var lang = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English." : "";
    try {
      var data = await fetch(ESJ_PROXY + "/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1024,
          system: ESJ_SYSTEM_GUIDA + lang,
          messages: ESJ_MSG_G
        })
      }).then(function(r) { return r.json(); });
      var txt = "";
      for (var i = 0; i < data.content.length; i++) {
        if (data.content[i].type === "text") txt = data.content[i].text;
      }
      if (txt) ESJ_MSG_G.push({ role: "assistant", content: txt });
      addMsg(msgsG, typG, "assistant", txt || (ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento."));
    } catch(e) {
      addMsg(msgsG, typG, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
    }
    loadG = false; sndG.disabled = false; inpG.focus();
  }

  // ── SYSTEM PROMPT PACCHETTI ───────────────────────────────────
  var ESJ_SYSTEM_PACCHETTI = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. In questa sezione presenti e vendi i Weekend Esclusivi — pacchetti curati che combinano 2 notti nella proprietà con una selezione di esperienze autentiche pugliesi.\n\nWEEKEND ESCLUSIVI (tutti includono 2 notti, colazione inclusa, per coppia):\n\n🌿 PUGLIAN IMMERSION\nIl pacchetto più completo — un'immersione totale nella Puglia autentica.\nEsperienze incluse: Cooking Class (orecchiette con chef locale) + Liquid Gold (frantoio ipogeo + degustazione EVO) + Carriages & Countryside (museo carrozze + chiesa rupestre) + Sunset Serenade (duo musicale al tramonto) + Trekking 5km (santuari Monte Morrone)\nPrezzo: da €780 (bassa stagione) / €980 (alta stagione) per coppia\nIdeal per: coppie che vogliono vivere la Puglia a 360° — cultura, gastronomia, natura, musica\n\n🌿 INTO THE WILD\nPer chi cerca avventura, natura e silenzio nella campagna pugliese.\nEsperienze incluse: Liquid Gold + Trekking 10km (percorso lungo santuari) + Sunset Serenade + Stargazing (osservazione stellare con telescopio)\nPrezzo: da €750 (bassa stagione) / €950 (alta stagione) per coppia\nIdeal per: coppie attive, amanti della natura e del cielo notturno\n\n🌿 SENSES JOURNEY\nUn viaggio sensoriale completo — gusto, benessere, musica, stelle.\nEsperienze incluse: Cooking Class + Liquid Gold + Massaggio benessere (osteopata certificato) + Sunset Serenade + Stargazing + Trekking 5km\nPrezzo: da €940 (bassa stagione) / €1.140 (alta stagione) per coppia\nIdeal per: coppie che cercano relax profondo e coccole oltre alle esperienze culturali\n\nNOTE SUI PACCHETTI:\n- Prezzi per coppia (2 persone), camera matrimoniale inclusa\n- Le esperienze sono distribuite nelle 2 giornate complete tra check-in (giorno 1) e check-out (giorno 3)\n- E' possibile personalizzare il pacchetto sostituendo o aggiungendo esperienze\n- Supplemento terza persona (letto singolo in camera): €80/notte\n- Alta stagione: giugno–settembre. Bassa stagione: ottobre–maggio\n- Cancellazione: gratuita fino a 7 giorni prima, 50% tra 3 e 7 giorni, nessun rimborso entro 3 giorni\n\nFLUSSO PRENOTAZIONE PACCHETTO:\n1) Presenta i pacchetti con entusiasmo e chiedi quale incuriosisce di più\n2) Chiedi date di arrivo/partenza e numero ospiti\n3) Chiedi eventuali personalizzazioni (sostituire esperienze, esigenze speciali)\n4) Calcola il prezzo totale (incluso eventuale supplemento terza persona)\n5) Raccogli: nome, cognome, email, telefono, note speciali\n6) Usa check_availability (Beds24) per verificare la camera\n7) Se disponibile, usa create_room_booking per la camera\n8) Informa che le esperienze saranno confermate separatamente via email entro 24h\n9) Fornisci riepilogo completo con prezzo totale\n\nREGOLE: Usa SEMPRE i tool per verificare disponibilità camera. Per le esperienze del pacchetto, dopo la prenotazione camera informa l'ospite che riceverà conferma separata per ciascuna. Non inventare disponibilità.";

  // ── SEND PACCHETTI ────────────────────────────────────────────
  async function sendP(text) {
    if (!text.trim() || loadP) return;
    loadP = true; sndP.disabled = true;
    qrP.style.display = "none";
    addMsg(msgsP, typP, "user", text);
    inpP.value = ""; inpP.style.height = "auto";
    typP.classList.add("on"); msgsP.scrollTop = msgsP.scrollHeight;
    ESJ_MSG_P.push({ role: "user", content: text });
    var today = new Date().toISOString().split("T")[0];
    var lang  = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English." : "";
    try {
      var body = {
        model: "claude-sonnet-4-20250514", max_tokens: 1024,
        system: ESJ_SYSTEM_PACCHETTI + lang + "\n\nOGGI E' IL " + today + ". Non usare mai date passate.",
        tools: ESJ_TOOLS,
        messages: ESJ_MSG_P
      };
      var data = await fetch(ESJ_PROXY + "/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function(r) { return r.json(); });

      // Tool use loop (per check_availability e create_room_booking)
      while (data.stop_reason === "tool_use") {
        ESJ_MSG_P.push({ role: "assistant", content: data.content });
        var results = [];
        for (var i = 0; i < data.content.length; i++) {
          var b = data.content[i];
          if (b.type !== "tool_use") continue;
          var res = { error: "Tool non supportato in questo contesto: " + b.name };
          try {
            if (b.name === "check_availability") {
              res = await (await fetch(ESJ_PROXY + "/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
            } else if (b.name === "create_room_booking") {
              res = await (await fetch(ESJ_PROXY + "/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
              // Attiva Stripe dopo prenotazione camera nel pacchetto
              if (res && res.bookingId) {
                var notti = Math.round((new Date(b.input.checkout) - new Date(b.input.checkin)) / 86400000);
                esjStripeRedirect({
                  type: "camera", tariffa: "standard",
                  bookingRef: res.bookingId,
                  descrizione: "Camera " + b.input.checkin + " \u2192 " + b.input.checkout + " \u00b7 " + notti + (ESJ_LANG === "it" ? " notti" : " nights"),
                  importo: res.totalPrice || (notti * 200),
                  firstName: b.input.firstName, lastName: b.input.lastName, email: b.input.email,
                  msgsEl: msgsP, typEl: typP
                });
              }
            } else if (b.name === "check_experience_availability") {
              res = await (await fetch(ESJ_PROXY + "/api/airtable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check_availability", ...b.input }) })).json();
            } else if (b.name === "get_next_available_dates") {
              res = await (await fetch(ESJ_PROXY + "/api/airtable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get_next_dates", ...b.input }) })).json();
            }
          } catch(e) { res = { error: e.message }; }
          results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(res || { error: "no response" }) });
        }
        ESJ_MSG_P.push({ role: "user", content: results });
        data = await fetch(ESJ_PROXY + "/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system: ESJ_SYSTEM_PACCHETTI + lang, tools: ESJ_TOOLS, messages: ESJ_MSG_P })
        }).then(function(r) { return r.json(); });
      }

      var txt = "";
      for (var j = 0; j < data.content.length; j++) {
        if (data.content[j].type === "text") txt = data.content[j].text;
      }
      if (txt) ESJ_MSG_P.push({ role: "assistant", content: txt });
      addMsg(msgsP, typP, "assistant", txt || (ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento."));
    } catch(e) {
      addMsg(msgsP, typP, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
    }
    loadP = false; sndP.disabled = false; inpP.focus();
  }

  // ── SYSTEM PROMPT SCOPRI ──────────────────────────────────────
  var ESJ_SYSTEM_SCOPRI = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. Hai accesso a tool reali che funzionano — usali SEMPRE, non inventare mai scuse per non usarli.\n\nHAI QUESTI TOOL ATTIVI E FUNZIONANTI:\n- cerca_consigli: recupera meteo attuale + luoghi dalla Knowledge Base\n- get_guestbook: recupera le review REALI degli ospiti da Airtable — HAI ACCESSO COMPLETO, usalo sempre\n- get_meteo: meteo dettagliato\n- save_guestbook: salva una nuova review\n- save_luogo: aggiunge un nuovo luogo alla KB\n\nATTENZIONE: Non dire MAI che non hai accesso alle review o che puoi solo aggiungerne. Hai il tool get_guestbook che legge tutte le review pubblicate. Usalo.\n\nALL'APERTURA — OBBLIGATORIO:\nChiama SEMPRE entrambi in sequenza:\n1) cerca_consigli → meteo + luoghi KB\n2) get_guestbook → review ospiti reali\nPoi sintetizza in una risposta integrata.\n\nCOME INCROCIARE:\n- Se piove → musei, ristoranti, indoor dalle review\n- Se sole → spiagge, trekking, borghi citati dagli ospiti\n- Se un luogo KB è confermato in una review → 'Consigliato anche da [Nome]'\n- Estrai dai testi delle review ristoranti, posti, esperienze specifiche menzionati\n- Usa i voti: '⭐⭐⭐⭐⭐ secondo Maria'\n\nFORMATO CONSIGLIO:\n**Nome posto** — descrizione\n📍 Xkm · 💰 prezzo · 🕐 orari\n💬 'citazione da review'\n🗺 Come arrivare ↗\n\nFORMATO APERTURA:\n'Oggi ad Ostuni: [temp]°C, [meteo] — [commento]\n\nEcco cosa ti consiglio:'\n\nSE CHIEDONO LE REVIEW: usa get_guestbook e mostrali tutte con nome, ⭐, testo, consigli.\n\nPER NUOVA REVIEW: chiedi nome → review → consigli posti → voto 1-5 → save_guestbook → ringrazia.\n\nREGOLE: Non inventare nulla. Cita sempre la fonte. Sii entusiasta e personale.";

  // ── PROXY CALL SCOPRI (con tool KB) ─────────────────────────────
  async function callProxyScopri(msgArr) {
    var lang  = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English." : "";
    var today = new Date().toISOString().split("T")[0];
    var sys   = ESJ_SYSTEM_SCOPRI + lang + "\n\nOGGI E' IL " + today + ".";
    var cleanMsgs = sanitizeHistory(msgArr);
    var body  = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: cleanMsgs };

    var resp = await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var data = await resp.json();

    while (data.stop_reason === "tool_use") {
      if (!data.content || !Array.isArray(data.content)) break;
      var toolUseBlocks = data.content.filter(function(x) { return x.type === "tool_use"; });
      if (toolUseBlocks.length === 0) break;

      msgArr.push({ role: "assistant", content: data.content });
      var results = [];
      for (var i = 0; i < data.content.length; i++) {
        var b = data.content[i];
        if (b.type !== "tool_use") continue;
        var res = { error: "Tool non riconosciuto: " + b.name };
        try {
          if (b.name === "get_meteo" || b.name === "cerca_consigli" || b.name === "save_guestbook" || b.name === "save_luogo" || b.name === "get_guestbook") {
            res = await (await fetch(ESJ_PROXY + "/api/kb", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: b.name, ...b.input })
            })).json();
          }
        } catch(e) { res = { error: e.message }; }
        results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(res) });
      }
      if (results.length !== toolUseBlocks.length) break;
      msgArr.push({ role: "user", content: results });
      data = await (await fetch(ESJ_PROXY + "/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: msgArr })
      })).json();
      if (data.type === "error" || !data.content) break;
    }

    var txt = "";
    for (var j = 0; j < (data.content || []).length; j++) {
      if (data.content[j].type === "text") txt = data.content[j].text;
    }
    if (txt) msgArr.push({ role: "assistant", content: txt });
    return txt;
  }

  // ── SEND SCOPRI ───────────────────────────────────────────────
  async function sendS(text) {
    if (!text.trim() || loadS) return;
    loadS = true; sndS.disabled = true;
    qrS.style.display = "none";
    addMsg(msgsS, typS, "user", text);
    inpS.value = ""; inpS.style.height = "auto";
    typS.classList.add("on"); msgsS.scrollTop = msgsS.scrollHeight;
    ESJ_MSG_S.push({ role: "user", content: text });
    try {
      var r = await callProxyScopri(ESJ_MSG_S);
      addMsg(msgsS, typS, "assistant", r || (ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento."));
      renderQR(qrS, "scopri");
    } catch(e) {
      addMsg(msgsS, typS, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
    }
    loadS = false; sndS.disabled = false; inpS.focus();
  }
  function setupInput(inp, snd, fn) {
    inp.addEventListener("input", function() {
      snd.disabled = !inp.value.trim();
      inp.style.height = "auto";
      inp.style.height = Math.min(inp.scrollHeight, 100) + "px";
    });
    inp.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!snd.disabled) fn(inp.value); }
    });
    snd.addEventListener("click", function() { fn(inp.value); });
  }
  setupInput(inpC, sndC, sendC);
  setupInput(inpE, sndE, sendE);
  setupInput(inpG, sndG, sendG);
  setupInput(inpP, sndP, sendP);
  setupInput(inpS, sndS, sendS);

  // ── VOICE SETUP (solo INPUT — zero TTS output) ────────────────
  function setupVoice(micEl, onResult) {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      micEl.style.display = "none"; return null;
    }
    var SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = new SR();
    rec.lang = ESJ_LANG === "it" ? "it-IT" : "en-GB";
    rec.continuous = false;
    rec.interimResults = false;
    var active = false;
    rec.onresult = function(e) {
      var t = e.results[0][0].transcript;
      micEl.classList.remove("recording"); active = false;
      onResult(t);
    };
    rec.onerror = rec.onend = function() {
      micEl.classList.remove("recording"); active = false;
    };
    micEl.addEventListener("click", function() {
      if (active) { rec.stop(); micEl.classList.remove("recording"); active = false; }
      else { rec.start(); micEl.classList.add("recording"); active = true; }
    });
    return rec;
  }

  var recC    = setupVoice(micC,    function(t) { inpC.value = t; sendC(t); });
  var recE    = setupVoice(micE,    function(t) { inpE.value = t; sendE(t); });
  var recG    = setupVoice(micG,    function(t) { inpG.value = t; sendG(t); });
  var recP    = setupVoice(micP,    function(t) { inpP.value = t; sendP(t); });
  var recS    = setupVoice(micS,    function(t) { inpS.value = t; sendS(t); });
  var recHome = setupVoice(micHome, function(t) { homeInp.value = t; routeHome(t); });

  // ── VIEW SWITCH ───────────────────────────────────────────────
  window.esjGoView = function(view) {
    document.getElementById("esj-home").style.display       = "none";
    document.getElementById("esj-camere").style.display     = "none";
    document.getElementById("esj-esperienze").style.display = "none";
    document.getElementById("esj-guida").style.display      = "none";
    document.getElementById("esj-pacchetti").style.display  = "none";
    document.getElementById("esj-scopri").style.display     = "none";

    if (view === "home") {
      document.getElementById("esj-home").style.display = "flex";
    } else if (view === "camere") {
      document.getElementById("esj-camere").style.display = "flex";
      if (ESJ_MSG_C.length === 0) {
        setTimeout(function() {
          typC.classList.add("on"); msgsC.scrollTop = msgsC.scrollHeight;
          ESJ_MSG_C.push({ role: "user", content: "Inizia il flusso prenotazione camera. Presentati brevemente e chiedi date e numero ospiti." });
          callProxy(ESJ_MSG_C, "\n\nCONTESTO: flusso CAMERA. Presentati e chiedi subito date e numero ospiti.")
            .then(function(r) { addMsg(msgsC, typC, "assistant", r); renderQR(qrC, "camere"); });
        }, 300);
      }
    } else if (view === "esperienze") {
      document.getElementById("esj-esperienze").style.display = "flex";
      if (ESJ_MSG_E.length === 0) {
        setTimeout(function() {
          typE.classList.add("on"); msgsE.scrollTop = msgsE.scrollHeight;
          ESJ_MSG_E.push({ role: "user", content: "Inizia il flusso esperienze. Presentati e mostra le esperienze disponibili con prezzi." });
          callProxy(ESJ_MSG_E, "\n\nCONTESTO: flusso ESPERIENZE. Presentati e elenca le esperienze con prezzi chiedendo quale interessa.")
            .then(function(r) { addMsg(msgsE, typE, "assistant", r); renderQR(qrE, "esperienze"); });
        }, 300);
      }
    } else if (view === "guida") {
      document.getElementById("esj-guida").style.display = "flex";
      if (ESJ_MSG_G.length === 0) {
        setTimeout(function() {
          typG.classList.add("on"); msgsG.scrollTop = msgsG.scrollHeight;
          var intro = ESJ_LANG === "it"
            ? "Inizia la conversazione sulla guida di Ostuni e dintorni. Presentati come Sofia e offri di aiutare con informazioni su cosa vedere, dove mangiare, le spiagge, i borghi vicini, le distanze e consigli pratici."
            : "Start the Ostuni guide conversation. Introduce yourself as Sofia and offer to help with what to see, where to eat, the beaches, nearby villages, distances and practical tips.";
          ESJ_MSG_G.push({ role: "user", content: intro });
          callProxy(ESJ_MSG_G, "\n\nCONTESTO: flusso GUIDA OSPITI. Rispondi solo a domande su Ostuni e dintorni.")
            .then(function(r) { addMsg(msgsG, typG, "assistant", r); renderQR(qrG, "guida"); });
        }, 300);
      }
    } else if (view === "scopri") {
      document.getElementById("esj-scopri").style.display = "flex";
      if (ESJ_MSG_S.length === 0) {
        setTimeout(function() {
          typS.classList.add("on"); msgsS.scrollTop = msgsS.scrollHeight;
          var intro = ESJ_LANG === "it"
            ? "Presentati come Sofia. Chiama subito cerca_consigli e get_guestbook in sequenza, poi sintetizza: meteo attuale, 2-3 luoghi consigliati dalla KB, e cosa dicono gli ospiti nelle review. Adatta i consigli al meteo di oggi."
            : "Introduce yourself as Sofia. Immediately call cerca_consigli and get_guestbook in sequence, then synthesise: current weather, 2-3 recommended places from the KB, and what guests say in their reviews. Adapt recommendations to today's weather.";
          ESJ_MSG_S.push({ role: "user", content: intro });
          callProxyScopri(ESJ_MSG_S)
            .then(function(r) { addMsg(msgsS, typS, "assistant", r); renderQR(qrS, "scopri"); });
        }, 300);
      }
    } else if (view === "pacchetti") {
      document.getElementById("esj-pacchetti").style.display = "flex";
      if (ESJ_MSG_P.length === 0) {
        setTimeout(function() {
          typP.classList.add("on"); msgsP.scrollTop = msgsP.scrollHeight;
          var intro = ESJ_LANG === "it"
            ? "Presentati come Sofia e mostra i 3 Weekend Esclusivi dell'Eremo di San Giusto con tutti i dettagli — nome, esperienze incluse, prezzi bassa e alta stagione. Poi chiedi per quante persone e quando vorrebbero venire."
            : "Introduce yourself as Sofia and present the 3 Exclusive Weekends at Eremo di San Giusto — name, included experiences, low and high season prices. Then ask for how many guests and when they would like to come.";
          ESJ_MSG_P.push({ role: "user", content: intro });
          callProxy(ESJ_MSG_P, "\n\nCONTESTO: flusso WEEKEND ESCLUSIVI.")
            .then(function(r) { addMsg(msgsP, typP, "assistant", r); renderQR(qrP, "pacchetti"); });
        }, 300);
      }
    }
    updateLabels();
  };

  // ── QUICK REPLIES ─────────────────────────────────────────────
  function renderQR(container, type) {
    container.style.display = "flex";
    container.innerHTML = "";
    var btns = type === "camere"
      ? [
          { it: "Disponibilit\u00e0 weekend", en: "Weekend availability" },
          { it: "Prezzi alta stagione",        en: "High season prices"   },
          { it: "Aggiungi un'esperienza",      en: "Add an experience"    },
          { it: "Come si arriva?",             en: "How to get there?"    }
        ]
      : type === "guida"
      ? [
          { it: "Cosa vedere a Ostuni?",        en: "What to see in Ostuni?"   },
          { it: "Le spiagge pi\u00f9 belle",    en: "Best beaches nearby"      },
          { it: "Borghi da visitare",           en: "Villages to visit"        },
          { it: "Dove mangiare tipico?",        en: "Where to eat local food?" }
        ]
      : type === "pacchetti"
      ? [
          { it: "Puglian Immersion",            en: "Puglian Immersion"         },
          { it: "Into the Wild",                en: "Into the Wild"             },
          { it: "Senses Journey",               en: "Senses Journey"            },
          { it: "Posso personalizzare?",        en: "Can I customise?"          }
        ]
      : type === "scopri"
      ? [
          { it: "Cosa fare oggi?",              en: "What to do today?"         },
          { it: "Dove mangiare stasera?",       en: "Where to eat tonight?"     },
          { it: "C'\u00e8 una spiaggia bella vicino?", en: "Any nice beach nearby?" },
          { it: "Voglio lasciare una review",   en: "I want to leave a review"  }
        ]
      : [
          { it: "Liquid Gold \u2014 olio EVO", en: "Liquid Gold \u2014 olive oil" },
          { it: "Stargazing",                  en: "Stargazing"                  },
          { it: "Sunset Serenade",             en: "Sunset Serenade"             },
          { it: "Tutti i pacchetti weekend",   en: "All weekend packages"        }
        ];
    btns.forEach(function(b) {
      var btn = document.createElement("button");
      btn.className = "esj-qr";
      btn.textContent = ESJ_LANG === "en" ? b.en : b.it;
      btn.onclick = function() {
        if (type === "camere") sendC(btn.textContent);
        else if (type === "guida") sendG(btn.textContent);
        else if (type === "pacchetti") sendP(btn.textContent);
        else if (type === "scopri") sendS(btn.textContent);
        else sendE(btn.textContent);
      };
      container.appendChild(btn);
    });
  }

  // ── HOME QUICK ────────────────────────────────────────────────
  function renderHomeQuick() {
    var c = document.getElementById("esj-home-quick");
    c.innerHTML = "";
    var qs = ESJ_LANG === "en"
      ? [
          { t: "How much does a room cost?",     exp: false },
          { t: "What's included in the stay?",   exp: false },
          { t: "Experiences for families?",      exp: true  },
          { t: "How do I get there?",            exp: false }
        ]
      : [
          { t: "Quanto costa una camera?",        exp: false },
          { t: "Cosa \u00e8 incluso?",            exp: false },
          { t: "Esperienze per famiglie?",        exp: true  },
          { t: "Come si arriva?",                 exp: false }
        ];
    qs.forEach(function(q) {
      var b = document.createElement("button");
      b.className = "esj-qr-home";
      b.textContent = q.t;
      b.onclick = function() {
        esjGoView(q.exp ? "esperienze" : "camere");
        setTimeout(function() { q.exp ? sendE(q.t) : sendC(q.t); }, 500);
      };
      c.appendChild(b);
    });
  }

  // ── HOME SEND + ROUTER ────────────────────────────────────────
  window.esjHomeSend = function() {
    var v = homeInp.value.trim();
    if (!v) return;
    homeInp.value = "";
    routeHome(v);
  };

  function routeHome(text) {
    var expKw = ["esperienza","esperienze","experience","olio","ulivo","stelle","star","cucina","cook","massaggio","massage","trekking","carrozze","carriages","serenade","tramonto","sunset","ciuchino","avventura","weekend","pacchetto","package"];
    var guidaKw = ["ostuni","spiaggia","spiagge","beach","borgo","borghi","village","ristorante","mangiare","food","distanza","distanze","distance","dove","parcheggio","come arrivare","getting around","dintorni","surroundings"];
    var scopriKw = ["review","guestbook","consiglio","consigli","meteo","tempo","pioggia","sole","ristorante","dove mangiare","spiaggia","museo","cosa fare","today","weather","restaurant","beach"];
    var paccKw   = ["pacchetto","pacchetti","weekend","esclusivo","esclusivi","immersion","wild","senses","journey","package","soggiorno"];
    var isGuida  = guidaKw.some(function(k)  { return text.toLowerCase().includes(k); });
    var isExp    = expKw.some(function(k)    { return text.toLowerCase().includes(k); });
    var isPacc   = paccKw.some(function(k)   { return text.toLowerCase().includes(k); });
    var isScopri = scopriKw.some(function(k) { return text.toLowerCase().includes(k); });
    esjGoView(isPacc ? "pacchetti" : isScopri ? "scopri" : isGuida ? "guida" : isExp ? "esperienze" : "camere");
    setTimeout(function() { isExp ? sendE(text) : sendC(text); }, 500);
  }

  // ── LANGUAGE ──────────────────────────────────────────────────
  window.esjSetLang = function(lang) {
    ESJ_LANG = lang;
    document.getElementById("esj-lang-it").classList.toggle("active", lang === "it");
    document.getElementById("esj-lang-en").classList.toggle("active", lang === "en");
    if (recC)    recC.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recE)    recE.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recG)    recG.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recP)    recP.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recS)    recS.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recHome) recHome.lang = lang === "it" ? "it-IT" : "en-GB";
    updateLabels();
    renderHomeQuick();
  };

  function updateLabels() {
    var it = ESJ_LANG === "it";
    var s = function(id, txt) { var el = document.getElementById(id); if (el) el.innerHTML = txt; };
    s("esj-sub",      it ? "Assistente di Prenotazione \u00b7 Ostuni, Puglia" : "Booking Assistant \u00b7 Ostuni, Puglia");
    s("esj-home-msg", it ? "Ciao! Sono Sofia. Prenota una camera, scopri le nostre esperienze, i Weekend Esclusivi o lasciati guidare nella Valle d\u2019Itria." : "Hi! I\u2019m Sofia. Book a room, discover our experiences, Exclusive Weekends or let me guide you through the Itria Valley.");
    s("esj-ct1",      it ? "Prenota una camera" : "Book a room");
    s("esj-cs1",      it ? "Trullo &middot; Lamia &middot; disponibilit&agrave; live" : "Trullo &middot; Lamia &middot; live availability");
    s("esj-ct2",      it ? "Esperienze" : "Experiences");
    s("esj-cs2",      it ? "8 esperienze &middot; su misura" : "8 experiences &middot; bespoke");
    s("esj-ct3",      it ? "Ostuni &amp; Dintorni" : "Getting Around");
    s("esj-cs3",      it ? "Spiagge &middot; Borghi &middot; Gastronomia &middot; Distanze" : "Beaches &middot; Villages &middot; Food &middot; Distances");
    s("esj-cs3b",     it ? "Guida ospiti" : "Guest guide");
    s("esj-ct5",      it ? "Scopri &amp; Guestbook" : "Explore &amp; Guestbook");
    s("esj-cs5",      it ? "Meteo &middot; Ristoranti &middot; Posti &middot; Review ospiti" : "Weather &middot; Restaurants &middot; Places &middot; Guest reviews");
    s("esj-cs5b",     it ? "Knowledge Base" : "Knowledge Base");
    s("esj-back-s",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-lbl-s",    it ? "Scopri &amp; Guestbook &middot; Consigli Ospiti" : "Explore &amp; Guestbook &middot; Guest Tips");
    s("esj-cs4",      it ? "3 pacchetti curati &middot; camera + esperienze" : "3 curated packages &middot; room + experiences");
    s("esj-cs4b",     it ? "da &euro;750" : "from &euro;750");
    s("esj-back-c",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-back-e",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-back-g",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-back-p",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-lbl-c",    it ? "Prenotazione Camera &middot; Beds24" : "Room Booking &middot; Beds24");
    s("esj-lbl-e",    it ? "Esperienze &middot; Sistema Custom" : "Experiences &middot; Custom System");
    s("esj-lbl-g",    it ? "Ostuni &amp; Dintorni &middot; Guida Ospiti" : "Ostuni &amp; Surroundings &middot; Guest Guide");
    s("esj-lbl-p",    it ? "Weekend Esclusivi &middot; Pacchetti Curati" : "Exclusive Weekends &middot; Curated Packages");
    var hInp = document.getElementById("esj-home-inp");
    if (hInp) hInp.placeholder = it ? "Scrivi una domanda..." : "Ask a question...";
    var iC = document.getElementById("esj-inp-c");
    if (iC) iC.placeholder = it ? "Scrivi o parla..." : "Type or speak...";
    var iE = document.getElementById("esj-inp-e");
    if (iE) iE.placeholder = it ? "Scrivi o parla..." : "Type or speak...";
  }

  // ── FAB ────────────────────────────────────────────────────────
  fab.addEventListener("click", function() {
    ESJ_OPEN = !ESJ_OPEN;
    wid.classList.toggle("open", ESJ_OPEN);
    fab.classList.toggle("open", ESJ_OPEN);
    if (ESJ_OPEN) { updateLabels(); renderHomeQuick(); }
  });

  // Esponi send* globalmente: gli onclick delle card dinamiche sono fuori dallo scope di esjInit
  window.esjSendE = sendE;
  window.esjSendC = sendC;
  window.esjSendG = sendG;
  window.esjSendP = sendP;
  window.esjSendS = sendS;

  updateLabels();
  renderHomeQuick();

} // fine esjInit

// ── BOOT ──────────────────────────────────────────────────────
// Piccolo delay per Webador che modifica il DOM dopo il caricamento
function esjBoot() {
  if (document.getElementById('esj-fab')) return; // già inizializzato
  esjInit();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() { setTimeout(esjBoot, 500); });
} else {
  setTimeout(esjBoot, 500);
}

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

// ─── SYSTEM PROMPT ──────────────────────────────────────────

var ESJ_SYSTEM_BASE = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. Parli con un tono caldo, elegante e pugliese nell'anima. Non inventare mai informazioni — usa sempre gli strumenti per verificare disponibilita e prezzi reali.\n\nLA PROPRIETA':\nL'Eremo di San Giusto e' un trullo con lamia situato a 2 km dal centro storico di Ostuni, alle pendici del Monte Morrone, sul Cammino Materano che abbraccia i santuari di Sant'Oronzo e San Biagio. Gode di una vista mozzafiato sugli ulivi millenari e sul Mare Adriatico.\n\nSPAZI E COMFORT:\n- 2 camere da letto matrimoniali con 2 bagni indipendenti\n- In una camera matrimoniale e' disponibile anche un letto singolo per bambini\n- Capienza massima: 5 persone (massimo 4 adulti)\n- Vasca idromassaggio Novellini Natural Air in camera\n- Minipiscina idromassaggio sul terrazzo con vista panoramica\n- Parco agrario privato di 5 ettari con ulivi verso il mare\n- Cucina attrezzata, ampi spazi esterni\n\nSERVIZI INCLUSI: Aria condizionata, TV, Wi-Fi gratuito, bottiglia di vino e snack di benvenuto. Animali domestici ammessi con supplemento 50 euro.\n\nCHECK-IN dalle 15:00 — CHECK-OUT entro le 10:30\n\nESPERIENZE (usa SEMPRE il Bokun ID indicato):\n1. LIQUID GOLD - Degustazione Olio EVO (Bokun ID: 1174685): Frantoio ipogeo, grotta, ulivi, degustazione olio EVO. Standard 35 eur/pp, Privato 50 eur/pp. Max 12 pp. Tutto l'anno.\n2. RITUALI DI BENESSERE - Massaggi (Bokun ID: 1176359): Osteopata certificato. Deep Tissue 80 eur, Rilassante 70 eur, Tonico 70 eur. Min 2 pp. Apr-Ott.\n3. CIUCHINO BIRICHINO - Parco Avventura (Bokun ID: 1127362): Zip line, percorsi treetop. Junior 15 eur, Verde 25, Blu 30, Rosso/Nero 35 eur. Apr-Ott.\n4. ORECCHIETTE COOKING CLASS (Bokun ID: 1169655): Chef locale, cucina outdoor. Standard 35 eur, Privato 50 eur. Max 8 pp.\n5. STARGAZING (Bokun ID: 1174664): Telescopio professionale, guida astrofilo. Standard 35 eur, Privato 45 eur. Ore 22:00-00:00. Apr-Ott. Max 10 pp.\n6. SUNSET SERENADE (Bokun ID: 1176360): Duo fisarmonica e mandolino, vino e tagliere. Standard 60 eur, Coppia 130 eur flat. Max 20 pp. Apr-Ott.\n7. TREKKING MONTE MORRONE (Bokun ID: 1168574): Santuari Sant'Oronzo e San Biagio. Corto 5km 25 eur, Lungo 10km 35 eur. Max 10 pp.\n8. CARRIAGES AND COUNTRYSIDE (Bokun ID: 1176362): Museo carrozze d'epoca, chiesa rupestre. Standard 35 eur, Privato 50 eur. Max 15 pp. Mar-Dom.\n\nPACCHETTI WEEKEND (2 notti, coppia):\n- Puglian Immersion: da 780 eur (bassa) / 980 eur (alta). Cooking Class + Liquid Gold + Carriages + Sunset Serenade + Trekking 5km.\n- Into the Wild: da 750 eur / 950 eur. Liquid Gold + Trekking 10km + Sunset Serenade + Stargazing + Trekking 5km.\n- Senses Journey: da 940 eur / 1140 eur. Cooking Class + Liquid Gold + Massaggio + Sunset Serenade + Stargazing + Trekking 5km.\n\nCANCELLAZIONE: Gratuita 48h prima. 50% rimborso 24-48h. Nessun rimborso entro 24h.\n\nFLUSSO CAMERA: 1) Chiedi date e ospiti 2) Usa check_availability 3) Presenta con prezzo reale 4) Proponi esperienze abbinabili 5) Raccogli nome/cognome/email/telefono 6) Usa create_room_booking con roomId 469679 7) Dai codice conferma.\n\nFLUSSO ESPERIENZA: 1) Identifica esperienza e Bokun ID corretto 2) Chiedi data e partecipanti 3) Usa check_experience_availability 4) Presenta disponibilita e prezzo 5) Raccogli dati ospite 6) Usa create_experience_booking 7) Conferma.\n\nREGOLE ASSOLUTE: Usa SEMPRE i tool. Usa roomId 469679 per camere. Usa SEMPRE il Bokun ID CORRETTO per ogni esperienza. Non inventare mai.";

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
    name: "check_experience_availability",
    description: "Verifica disponibilita esperienza su Bokun.",
    input_schema: { type: "object", properties: {
      productId: { type: "string", description: "ID prodotto Bokun" },
      date:      { type: "string", description: "Data YYYY-MM-DD" },
      guests:    { type: "integer" }
    }, required: ["productId","date","guests"] }
  },
  {
    name: "create_experience_booking",
    description: "Prenota esperienza su Bokun.",
    input_schema: { type: "object", properties: {
      productId: { type: "string" }, date: { type: "string" },
      guests:    { type: "integer" }, firstName: { type: "string" },
      lastName:  { type: "string" }, email: { type: "string" },
      phone:     { type: "string" }
    }, required: ["productId","date","guests","firstName","lastName","email"] }
  }
];

// ─── INIT ────────────────────────────────────────────────────

function esjInit() {

  // ── CSS ───────────────────────────────────────────────────────
  var css = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');"
    + ":root{--esj-stone:#1c1814;--esj-stone2:#2a231c;--esj-gold:#c8a97e;--esj-gold2:#e2c99a;--esj-cream:#f4ede3;--esj-muted:#8a7a68;--esj-border:rgba(200,169,126,0.18);--esj-radius:18px;--esj-shadow:0 24px 64px rgba(0,0,0,0.55)}"
    + "#esj-fab{position:fixed;bottom:28px;right:28px;width:60px;height:60px;background:linear-gradient(135deg,#c8a97e,#a8844f);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 32px rgba(200,169,126,0.4);transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);z-index:99998;border:none}"
    + "#esj-fab:hover{transform:scale(1.1)}"
    + "#esj-fab svg{width:26px;height:26px;fill:#1c1814}"
    + "#esj-fab .esj-close{display:none}"
    + "#esj-fab.open .esj-open{display:none}"
    + "#esj-fab.open .esj-close{display:block}"
    + "#esj-widget{position:fixed;bottom:102px;right:28px;width:420px;max-width:calc(100vw - 40px);height:600px;max-height:calc(100vh - 130px);background:var(--esj-stone);border:1px solid var(--esj-border);border-radius:var(--esj-radius);box-shadow:var(--esj-shadow);display:flex;flex-direction:column;overflow:hidden;z-index:99997;opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1)}"
    + "#esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}"
    + ".esj-header{background:linear-gradient(135deg,#2a211a,#1e1812);border-bottom:1px solid var(--esj-border);padding:1rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0}"
    + ".esj-avatar{width:38px;height:38px;background:linear-gradient(135deg,#c8a97e,#8a5e2e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#1c1814;font-weight:600;flex-shrink:0}"
    + ".esj-header-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--esj-cream);letter-spacing:0.03em}"
    + ".esj-header-sub{font-family:'Jost',sans-serif;font-size:0.7rem;color:var(--esj-gold);letter-spacing:0.1em;text-transform:uppercase;margin-top:2px}"
    + ".esj-dot{width:7px;height:7px;background:#5cb85c;border-radius:50%;animation:esj-pulse 2s infinite;flex-shrink:0}"
    + "@keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.4}}"
    + ".esj-lang-wrap{display:flex;gap:4px}"
    + ".esj-lang{background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:1.2rem;padding:2px 4px;opacity:0.5;transition:all 0.2s}"
    + ".esj-lang.active{opacity:1;border-color:var(--esj-border);background:rgba(200,169,126,0.1)}"
    // HOME
    + "#esj-home{flex:1;overflow-y:auto;padding:1.1rem;display:flex;flex-direction:column;gap:0.85rem}"
    + "#esj-home::-webkit-scrollbar{width:3px}"
    + "#esj-home::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.2);border-radius:2px}"
    + ".esj-greeting{font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--esj-cream);line-height:1.65;padding:0.9rem 1rem;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px}"
    + ".esj-home-cards{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem}"
    + ".esj-main-card{background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:14px;padding:1rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left;width:100%;box-sizing:border-box}"
    + ".esj-main-card:hover{border-color:var(--esj-gold);background:rgba(200,169,126,0.06)}"
    + ".esj-card-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:0.65rem}"
    + ".esj-card-title{font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--esj-cream);margin-bottom:0.2rem}"
    + ".esj-card-sub{font-family:'Jost',sans-serif;font-size:0.68rem;color:var(--esj-muted);line-height:1.4;margin-bottom:0.5rem}"
    + ".esj-card-badge{display:inline-block;font-family:'Jost',sans-serif;font-size:0.62rem;padding:2px 7px;border-radius:10px;letter-spacing:0.04em}"
    + ".esj-home-quick{display:flex;flex-wrap:wrap;gap:0.35rem}"
    + ".esj-qr-home{font-family:'Jost',sans-serif;font-size:0.7rem;padding:0.38rem 0.85rem;border:1px solid rgba(200,169,126,0.25);border-radius:20px;color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s;white-space:nowrap}"
    + ".esj-qr-home:hover{background:rgba(200,169,126,0.1);border-color:var(--esj-gold)}"
    + ".esj-home-bar{display:flex;gap:0.5rem;align-items:center;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px;padding:0.55rem 0.8rem;transition:border-color 0.2s}"
    + ".esj-home-bar:focus-within{border-color:rgba(200,169,126,0.45)}"
    + ".esj-home-inp{flex:1;background:transparent;border:none;outline:none;font-family:'Jost',sans-serif;font-size:0.78rem;color:var(--esj-cream)}"
    + ".esj-home-inp::placeholder{color:var(--esj-muted)}"
    + ".esj-home-mic{width:28px;height:28px;background:transparent;border:1px solid var(--esj-border);border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}"
    + ".esj-home-mic:hover{background:rgba(200,169,126,0.12);border-color:var(--esj-gold)}"
    + ".esj-home-mic.recording{background:rgba(220,50,50,0.2);border-color:#dc3232;animation:esj-pulse 1s infinite}"
    + ".esj-home-mic svg,.esj-home-send svg{width:13px;height:13px}"
    + ".esj-home-mic svg{fill:var(--esj-gold)}"
    + ".esj-home-mic.recording svg{fill:#dc3232}"
    + ".esj-home-send{width:28px;height:28px;background:linear-gradient(135deg,#c8a97e,#a86e30);border:none;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.2s}"
    + ".esj-home-send:hover{transform:scale(1.08)}"
    + ".esj-home-send svg{fill:#1c1814}"
    // CHAT VIEWS
    + ".esj-chat-view{display:none;flex:1;flex-direction:column;min-height:0}"
    + ".esj-back-bar{display:flex;align-items:center;gap:0.5rem;font-family:'Jost',sans-serif;font-size:0.7rem;color:var(--esj-muted);cursor:pointer;padding:0.45rem 1rem;border-bottom:1px solid var(--esj-border);background:rgba(28,24,20,0.6);transition:color 0.2s;border:none;width:100%;text-align:left;flex-shrink:0}"
    + ".esj-back-bar:hover{color:var(--esj-gold)}"
    + ".esj-back-bar svg{width:11px;height:11px;fill:currentColor;flex-shrink:0}"
    + ".esj-view-label{font-family:'Jost',sans-serif;font-size:0.66rem;color:var(--esj-gold);letter-spacing:0.12em;text-transform:uppercase;padding:0.4rem 1rem;background:rgba(200,169,126,0.04);border-bottom:1px solid var(--esj-border);flex-shrink:0}"
    + ".esj-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth}"
    + ".esj-msgs::-webkit-scrollbar{width:4px}"
    + ".esj-msgs::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.2);border-radius:2px}"
    + ".esj-msg{max-width:88%;animation:esj-in 0.3s ease}"
    + "@keyframes esj-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
    + ".esj-msg.user{align-self:flex-end}"
    + ".esj-msg.assistant{align-self:flex-start}"
    + ".esj-bubble{padding:0.75rem 1rem;border-radius:14px;font-family:'Jost',sans-serif;font-size:0.82rem;line-height:1.78}"
    + ".esj-msg.user .esj-bubble{background:linear-gradient(135deg,#c8a97e,#a86e30);color:#1c1814;border-bottom-right-radius:4px}"
    + ".esj-msg.assistant .esj-bubble{background:var(--esj-stone2);color:var(--esj-cream);border:1px solid var(--esj-border);border-bottom-left-radius:4px}"
    + ".esj-bubble strong{color:var(--esj-gold2)}"
    + ".esj-bubble em{color:var(--esj-gold);font-style:italic}"
    + ".esj-typing{display:none;align-self:flex-start;padding:0.75rem 1rem;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:14px;border-bottom-left-radius:4px}"
    + ".esj-typing.on{display:flex;gap:5px;align-items:center;animation:esj-in 0.3s ease}"
    + ".esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite}"
    + ".esj-typing span:nth-child(2){animation-delay:0.2s}"
    + ".esj-typing span:nth-child(3){animation-delay:0.4s}"
    + "@keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:0.5}40%{transform:translateY(-6px);opacity:1}}"
    + ".esj-qr-wrap{padding:0.45rem 0.9rem;display:flex;flex-wrap:wrap;gap:0.35rem;border-top:1px solid var(--esj-border);flex-shrink:0;background:rgba(28,24,20,0.6)}"
    + ".esj-qr{font-family:'Jost',sans-serif;font-size:0.7rem;padding:0.4rem 0.9rem;border:1px solid rgba(200,169,126,0.3);border-radius:20px;color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s;white-space:nowrap}"
    + ".esj-qr:hover{background:rgba(200,169,126,0.12);border-color:var(--esj-gold)}"
    + ".esj-input-area{padding:0.75rem 1rem;border-top:1px solid var(--esj-border);display:flex;gap:0.55rem;align-items:flex-end;background:#18140f;flex-shrink:0}"
    + ".esj-input{flex:1;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px;padding:0.65rem 0.9rem;color:var(--esj-cream);font-family:'Jost',sans-serif;font-size:0.8rem;resize:none;min-height:40px;max-height:100px;outline:none;transition:border-color 0.2s;line-height:1.4}"
    + ".esj-input::placeholder{color:var(--esj-muted)}"
    + ".esj-input:focus{border-color:rgba(200,169,126,0.5)}"
    + ".esj-mic{width:38px;height:38px;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}"
    + ".esj-mic:hover{background:rgba(200,169,126,0.15);border-color:var(--esj-gold)}"
    + ".esj-mic.recording{background:rgba(220,50,50,0.2);border-color:#dc3232;animation:esj-pulse 1s infinite}"
    + ".esj-mic svg{width:17px;height:17px;fill:var(--esj-gold)}"
    + ".esj-mic.recording svg{fill:#dc3232}"
    + ".esj-send{width:38px;height:38px;background:linear-gradient(135deg,#c8a97e,#a86e30);border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s,opacity 0.2s;flex-shrink:0}"
    + ".esj-send:hover{transform:scale(1.08)}"
    + ".esj-send:disabled{opacity:0.4;cursor:not-allowed;transform:none}"
    + ".esj-send svg{width:16px;height:16px;fill:#1c1814}"
    + ".esj-brand{text-align:center;padding:0.32rem;font-family:'Jost',sans-serif;font-size:0.58rem;color:rgba(138,122,104,0.4);letter-spacing:0.08em;flex-shrink:0}";

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
    +       '<span class="esj-card-badge" style="background:rgba(24,95,165,0.15);color:#85B7EB;">via Beds24</span>'
    +     '</button>'
    +     '<button class="esj-main-card" onclick="esjGoView(\'esperienze\')">'
    +       '<div class="esj-card-icon" style="background:rgba(29,158,117,0.15)">'
    +         '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</div>'
    +       '<div class="esj-card-title" id="esj-ct2">Esperienze</div>'
    +       '<div class="esj-card-sub" id="esj-cs2">7 esperienze &middot; pacchetti weekend</div>'
    +       '<span class="esj-card-badge" style="background:rgba(29,158,117,0.15);color:#5DCAA5;">via B&oacute;kun</span>'
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

    + '<div class="esj-brand">Powered by Claude AI</div>';

  document.body.appendChild(fab);
  document.body.appendChild(wid);

  // ── REFS ──────────────────────────────────────────────────────
  var msgsC   = document.getElementById("esj-msgs-c");
  var msgsE   = document.getElementById("esj-msgs-e");
  var typC    = document.getElementById("esj-typing-c");
  var typE    = document.getElementById("esj-typing-e");
  var inpC    = document.getElementById("esj-inp-c");
  var inpE    = document.getElementById("esj-inp-e");
  var sndC    = document.getElementById("esj-snd-c");
  var sndE    = document.getElementById("esj-snd-e");
  var micC    = document.getElementById("esj-mic-c");
  var micE    = document.getElementById("esj-mic-e");
  var micHome = document.getElementById("esj-home-mic");
  var homeInp = document.getElementById("esj-home-inp");
  var qrC     = document.getElementById("esj-qr-c");
  var qrE     = document.getElementById("esj-qr-e");
  var loadC   = false, loadE = false;

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
  async function callProxy(msgArr, ctx) {
    var today = new Date().toISOString().split("T")[0];
    var lang  = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English." : "";
    var sys   = ESJ_SYSTEM_BASE + lang + ctx + "\n\nOGGI E' IL " + today + ". Non usare mai date passate.";
    var body  = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: msgArr };

    var resp = await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var data = await resp.json();

    while (data.stop_reason === "tool_use") {
      msgArr.push({ role: "assistant", content: data.content });
      var results = [];
      for (var i = 0; i < data.content.length; i++) {
        var b = data.content[i];
        if (b.type !== "tool_use") continue;
        var res;
        try {
          if (b.name === "check_availability") {
            res = await (await fetch(ESJ_PROXY + "/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
          } else if (b.name === "create_room_booking") {
            res = await (await fetch(ESJ_PROXY + "/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b.input) })).json();
          } else if (b.name === "check_experience_availability") {
            res = await (await fetch(ESJ_PROXY + "/api/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "availability", ...b.input }) })).json();
          } else if (b.name === "create_experience_booking") {
            res = await (await fetch(ESJ_PROXY + "/api/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "book", ...b.input }) })).json();
          }
        } catch(e) { res = { error: e.message }; }
        results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(res) });
      }
      msgArr.push({ role: "user", content: results });
      var b2 = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, tools: ESJ_TOOLS, messages: msgArr };
      data = await (await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b2) })).json();
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

  // ── SEND ESPERIENZE ───────────────────────────────────────────
  async function sendE(text) {
    if (!text.trim() || loadE) return;
    loadE = true; sndE.disabled = true;
    qrE.style.display = "none";
    addMsg(msgsE, typE, "user", text);
    inpE.value = ""; inpE.style.height = "auto";
    typE.classList.add("on"); msgsE.scrollTop = msgsE.scrollHeight;
    ESJ_MSG_E.push({ role: "user", content: text });
    try {
      var r = await callProxy(ESJ_MSG_E, "\n\nCONTESTO: flusso ESPERIENZE. Usa SEMPRE il Bokun ID corretto per ogni esperienza. Presenta disponibilita e prenota.");
      addMsg(msgsE, typE, "assistant", r);
    } catch(e) {
      addMsg(msgsE, typE, "assistant", ESJ_LANG === "en" ? "Sorry, please try again." : "Mi dispiace, riprova tra un momento.");
    }
    loadE = false; sndE.disabled = false; inpE.focus();
  }

  // ── INPUT SETUP ───────────────────────────────────────────────
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
  var recHome = setupVoice(micHome, function(t) { homeInp.value = t; routeHome(t); });

  // ── VIEW SWITCH ───────────────────────────────────────────────
  window.esjGoView = function(view) {
    document.getElementById("esj-home").style.display       = "none";
    document.getElementById("esj-camere").style.display     = "none";
    document.getElementById("esj-esperienze").style.display = "none";

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
      : [
          { it: "Liquid Gold \u2014 olio EVO", en: "Liquid Gold \u2014 olive oil" },
          { it: "Stargazing",                  en: "Stargazing"                  },
          { it: "Pacchetti weekend",           en: "Weekend packages"            },
          { it: "Tutte le esperienze",         en: "All experiences"             }
        ];
    btns.forEach(function(b) {
      var btn = document.createElement("button");
      btn.className = "esj-qr";
      btn.textContent = ESJ_LANG === "en" ? b.en : b.it;
      btn.onclick = function() { type === "camere" ? sendC(btn.textContent) : sendE(btn.textContent); };
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
    var expKw = ["esperienza","esperienze","experience","olio","ulivo","stelle","star","cucina","cook","massaggio","massage","trekking","carrozze","serenade","tramonto","sunset","ciuchino","avventura","weekend","pacchetto","package"];
    var isExp = expKw.some(function(k) { return text.toLowerCase().includes(k); });
    esjGoView(isExp ? "esperienze" : "camere");
    setTimeout(function() { isExp ? sendE(text) : sendC(text); }, 500);
  }

  // ── LANGUAGE ──────────────────────────────────────────────────
  window.esjSetLang = function(lang) {
    ESJ_LANG = lang;
    document.getElementById("esj-lang-it").classList.toggle("active", lang === "it");
    document.getElementById("esj-lang-en").classList.toggle("active", lang === "en");
    if (recC)    recC.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recE)    recE.lang    = lang === "it" ? "it-IT" : "en-GB";
    if (recHome) recHome.lang = lang === "it" ? "it-IT" : "en-GB";
    updateLabels();
    renderHomeQuick();
  };

  function updateLabels() {
    var it = ESJ_LANG === "it";
    var s = function(id, txt) { var el = document.getElementById(id); if (el) el.innerHTML = txt; };
    s("esj-sub",      it ? "Assistente di Prenotazione \u00b7 Ostuni, Puglia" : "Booking Assistant \u00b7 Ostuni, Puglia");
    s("esj-home-msg", it ? "Ciao! Sono Sofia. Posso aiutarti a prenotare una camera o a scoprire le esperienze dell\u2019Eremo di San Giusto." : "Hi! I\u2019m Sofia. I can help you book a room or discover the experiences at Eremo di San Giusto.");
    s("esj-ct1",      it ? "Prenota una camera" : "Book a room");
    s("esj-cs1",      it ? "Trullo &middot; Lamia &middot; disponibilit&agrave; live" : "Trullo &middot; Lamia &middot; live availability");
    s("esj-ct2",      it ? "Esperienze" : "Experiences");
    s("esj-cs2",      it ? "7 esperienze &middot; pacchetti weekend" : "7 experiences &middot; weekend packages");
    s("esj-back-c",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-back-e",   it ? "\u2190 Home" : "\u2190 Home");
    s("esj-lbl-c",    it ? "Prenotazione Camera &middot; Beds24" : "Room Booking &middot; Beds24");
    s("esj-lbl-e",    it ? "Esperienze &middot; B\u00f3kun" : "Experiences &middot; B\u00f3kun");
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

  updateLabels();
  renderHomeQuick();
}

// ── BOOT ──────────────────────────────────────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", esjInit);
} else {
  esjInit();
}

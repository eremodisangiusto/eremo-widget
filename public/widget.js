// Eremo di San Giusto - AI Booking Widget
// Versione pulita senza problemi di scope

var ESJ_PROXY = "https://eremo-bookings.vercel.app";

var ESJ_SYSTEM = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. Parli sempre in italiano, con un tono caldo, elegante e pugliese nell'anima. Non inventare mai informazioni - usa sempre gli strumenti per verificare disponibilita e prezzi reali.\n\nLA PROPRIETA':\nL'Eremo di San Giusto e' un trullo con lamia situato a 2 km dal centro storico di Ostuni, alle pendici del Monte Morrone, sul Cammino Materano che abbraccia i santuari di Sant'Oronzo e San Biagio. Gode di una vista mozzafiato sugli ulivi millenari e sul Mare Adriatico. Da questo punto si ammirano tra i piu' bei tramonti di tutta la Puglia.\n\nSPAZI E COMFORT:\n- 2 camere da letto matrimoniali con 2 bagni indipendenti\n- In una camera matrimoniale all'interno del trullo e' disponibile anche un letto singolo per bambini\n- Capienza massima: 5 persone (massimo 4 adulti)\n- Vasca idromassaggio Novellini Natural Air in camera\n- Minipiscina idromassaggio sul terrazzo con vista panoramica\n- Parco agrario privato di 5 ettari con ulivi che degradano verso il mare\n- Ampi spazi esterni con tavoli e sedute per pranzi e cene all'aperto\n- Cucina attrezzata con piastra a induzione, frigorifero, lavastoviglie\n\nSERVIZI INCLUSI:\n- Aria condizionata in tutte le camere, TV schermo piatto, Wi-Fi gratuito\n- Bottiglia di vino e snack di benvenuto\n- Animali domestici ammessi con supplemento di 50 euro per l'intero soggiorno\n\nORARIO CHECK-IN dalle ore 15:00, CHECK-OUT entro le ore 10:30\n\nESPERIENZE (usa SEMPRE l'ID Bokun indicato, non inventare altri ID):\n1. LIQUID GOLD - Degustazione Olio EVO (Bokun ID: 1174685): Visita frantoio ipogeo, grotta naturale, passeggiata tra ulivi secolari, degustazione 3-4 varieta' olio EVO con pane e bruschette. 2-2.5 ore. Orari 09:30 o 16:00. Standard 20 euro/persona, Privato 30 euro/persona, Bambini sotto 12 anni 10 euro.\n\n2. RITUALI DI BENESSERE - Massaggi (Bokun ID: 1176359): Massaggi del Dott. Jacopo Gioffredi (osteopata) nel trullo o sulla terrazza. Deep Tissue 80 euro/persona, Rilassante 70 euro/persona, Tonico 70 euro/persona. 45-60 minuti. Minimo 2 partecipanti. Stagione aprile-ottobre.\n\n3. CIUCHINO BIRICHINO - Parco Avventura (Bokun ID: 1127362): Parco avventura con zip line e ponti di corda. Junior 3-6 anni 15 euro, Verde 6+ anni 25 euro, Blu 8+ anni 30 euro, Rosso/Nero 10+/adulti 35 euro. Stagione aprile-ottobre. Scarpe chiuse obbligatorie.\n\n4. ORECCHIETTE COOKING CLASS (Bokun ID: 1169655): Lezione pasta fatta a mano con chef locale. Standard 35 euro/persona, Privato 50 euro/persona, Bambini sotto 12 anni 18 euro. Mattina 10:00 o sera 18:30. Gruppi 2-8 persone.\n\n5. STARGAZING - Notte sotto le stelle (Bokun ID: 1174664): Osservazione astronomica con telescopio professionale. Standard 30 euro/persona, Privato 45 euro/persona, Bambini 15 euro. 2 ore (22:00-00:00). Stagione aprile-ottobre.\n\n6. SUNSET SERENADE - Concerto al tramonto (Bokun ID: 1176360): Concerto fisarmonica e mandolino al tramonto con vino e tagliere. Standard 45 euro/persona, Privato 60 euro/persona, Bambini 15 euro, Coppia romantica 130 euro. Stagione aprile-ottobre.\n\n7. TREKKING SUL MONTE MORRONE (Bokun ID: 1168574): Escursione guidata tra i santuari di Sant'Oronzo e San Biagio. Percorso corto 5 km 15 euro/adulto. Percorso lungo 10 km 25 euro/adulto. Gruppo privato 120 euro forfait.\n\n8. CARRIAGES AND COUNTRYSIDE - Museo Carrozze (Bokun ID: 1176362): Visita Masseria Carestia con museo carrozze d'epoca e chiesa rupestre medievale. Standard 20 euro/persona, Privato 30 euro/persona, Bambini 10 euro. Martedi-domenica.\n\nPOLITICA DI CANCELLAZIONE: Gratuita fino a 48 ore prima. Rimborso 50% tra 24 e 48 ore prima. Nessun rimborso entro le 24 ore.\n\nFLUSSO PRENOTAZIONE CAMERA:\n1. Chiedi date e numero ospiti (max 5 persone, max 4 adulti)\n2. Usa check_availability per verificare disponibilita reale su Beds24\n3. Presenta proprieta' con prezzo reale\n4. Proponi esperienze adatte\n5. Raccogli nome completo, email, telefono, richieste speciali\n6. Crea prenotazione con create_room_booking usando roomId 469679\n7. Fornisci riepilogo con codice conferma reale da Beds24\n\nFLUSSO PRENOTAZIONE ESPERIENZA:\n1. Chiedi data e numero partecipanti\n2. Usa check_experience_availability con il Bokun ID CORRETTO dell'esperienza\n3. Presenta disponibilita e prezzo\n4. Raccogli nome completo, email, telefono\n5. Crea prenotazione con create_experience_booking usando il Bokun ID CORRETTO\n6. Fornisci riepilogo con codice conferma\n\nREGOLE ASSOLUTE: Usa SEMPRE check_availability prima di confermare disponibilita' camera. Usa SEMPRE check_experience_availability prima di confermare disponibilita' esperienza. Usa SEMPRE roomId 469679 per camere. Usa SEMPRE il Bokun ID CORRETTO per ogni esperienza - non inventare ID. Non inventare prezzi o informazioni.";

var ESJ_TOOLS = [
  {
    name: "check_availability",
    description: "Verifica disponibilita camere su Beds24 per date e numero ospiti.",
    input_schema: {
      type: "object",
      properties: {
        checkin:  { type: "string", description: "Check-in YYYY-MM-DD" },
        checkout: { type: "string", description: "Check-out YYYY-MM-DD" },
        guests:   { type: "integer", description: "Numero ospiti" }
      },
      required: ["checkin","checkout","guests"]
    }
  },
  {
    name: "create_room_booking",
    description: "Crea una prenotazione su Beds24 dopo aver raccolto tutti i dati dell'ospite.",
    input_schema: {
      type: "object",
      properties: {
        checkin:   { type: "string", description: "Check-in YYYY-MM-DD" },
        checkout:  { type: "string", description: "Check-out YYYY-MM-DD" },
        guests:    { type: "integer", description: "Numero ospiti" },
        firstName: { type: "string", description: "Nome ospite" },
        lastName:  { type: "string", description: "Cognome ospite" },
        email:     { type: "string", description: "Email ospite" },
        phone:     { type: "string", description: "Telefono ospite" },
        notes:     { type: "string", description: "Richieste speciali" }
      },
      required: ["checkin","checkout","guests","firstName","lastName","email"]
    }
  },
  {
    name: "check_experience_availability",
    description: "Verifica disponibilita di un'esperienza su Bokun per una data e numero di partecipanti.",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID prodotto Bokun (es. 1168574)" },
        date:      { type: "string", description: "Data esperienza YYYY-MM-DD" },
        guests:    { type: "integer", description: "Numero partecipanti" }
      },
      required: ["productId","date","guests"]
    }
  },
  {
    name: "create_experience_booking",
    description: "Prenota un'esperienza su Bokun dopo aver raccolto tutti i dati del partecipante.",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "ID prodotto Bokun" },
        date:      { type: "string", description: "Data esperienza YYYY-MM-DD" },
        guests:    { type: "integer", description: "Numero partecipanti" },
        firstName: { type: "string", description: "Nome" },
        lastName:  { type: "string", description: "Cognome" },
        email:     { type: "string", description: "Email" },
        phone:     { type: "string", description: "Telefono" }
      },
      required: ["productId","date","guests","firstName","lastName","email"]
    }
  }
];

var ESJ_MESSAGES = [];
var ESJ_OPEN = false;
var ESJ_LANG = "it";

function esjInit() {
  var style = document.createElement("style");
  style.textContent = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');\n:root{--esj-stone:#1c1814;--esj-stone2:#2a231c;--esj-gold:#c8a97e;--esj-gold2:#e2c99a;--esj-cream:#f4ede3;--esj-muted:#8a7a68;--esj-border:rgba(200,169,126,0.18);--esj-radius:18px;--esj-shadow:0 24px 64px rgba(0,0,0,0.55),0 4px 16px rgba(0,0,0,0.3)}\n#esj-fab{position:fixed;bottom:28px;right:28px;width:60px;height:60px;background:linear-gradient(135deg,#c8a97e,#a8844f);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 32px rgba(200,169,126,0.4),0 2px 8px rgba(0,0,0,0.3);transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s ease;z-index:99998;border:none}\n#esj-fab:hover{transform:scale(1.1);box-shadow:0 12px 40px rgba(200,169,126,0.55)}\n#esj-fab svg{width:26px;height:26px;fill:#1c1814}\n#esj-fab .esj-close{display:none}\n#esj-fab.open .esj-open{display:none}\n#esj-fab.open .esj-close{display:block}\n#esj-widget{position:fixed;bottom:102px;right:28px;width:400px;max-width:calc(100vw - 40px);height:580px;max-height:calc(100vh - 130px);background:var(--esj-stone);border:1px solid var(--esj-border);border-radius:var(--esj-radius);box-shadow:var(--esj-shadow);display:flex;flex-direction:column;overflow:hidden;z-index:99997;opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1)}\n#esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}\n.esj-header{background:linear-gradient(135deg,#2a211a 0%,#1e1812 100%);border-bottom:1px solid var(--esj-border);padding:1rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0}\n.esj-avatar{width:38px;height:38px;background:linear-gradient(135deg,#c8a97e,#8a5e2e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#1c1814;font-weight:600;flex-shrink:0}\n.esj-header-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--esj-cream);letter-spacing:0.03em}\n.esj-header-sub{font-family:'Jost',sans-serif;font-size:0.85rem;color:var(--esj-gold);letter-spacing:0.1em;text-transform:uppercase;margin-top:2px}\n.esj-dot{width:7px;height:7px;background:#5cb85c;border-radius:50%;animation:esj-pulse 2s infinite;flex-shrink:0}\n@keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.4}}\n.esj-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth}\n.esj-msgs::-webkit-scrollbar{width:4px}\n.esj-msgs::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.2);border-radius:2px}\n.esj-msg{max-width:88%;animation:esj-in 0.3s ease}\n@keyframes esj-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n.esj-msg.user{align-self:flex-end}\n.esj-msg.assistant{align-self:flex-start}\n.esj-bubble{padding:0.8rem 1.1rem;border-radius:14px;font-family:'Jost',sans-serif;font-size:1.45rem;line-height:1.8}\n.esj-msg.user .esj-bubble{background:linear-gradient(135deg,#c8a97e,#a86e30);color:#1c1814;border-bottom-right-radius:4px}\n.esj-msg.assistant .esj-bubble{background:var(--esj-stone2);color:var(--esj-cream);border:1px solid var(--esj-border);border-bottom-left-radius:4px}\n.esj-typing{display:none;align-self:flex-start;padding:0.8rem 1rem;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:14px;border-bottom-left-radius:4px}\n.esj-typing.on{display:flex;gap:5px;align-items:center;animation:esj-in 0.3s ease}\n.esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite}\n.esj-typing span:nth-child(2){animation-delay:0.2s}\n.esj-typing span:nth-child(3){animation-delay:0.4s}\n@keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:0.5}40%{transform:translateY(-6px);opacity:1}}\n.esj-qr-wrap{padding:0.5rem 1rem;display:flex;flex-wrap:wrap;gap:0.4rem;border-top:1px solid var(--esj-border);flex-shrink:0;background:rgba(28,24,20,0.6)}\n.esj-qr{font-family:'Jost',sans-serif;font-size:1.1rem;padding:0.55rem 1.2rem;border:1px solid rgba(200,169,126,0.3);border-radius:20px;color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s ease;white-space:nowrap}\n.esj-qr:hover{background:rgba(200,169,126,0.12);border-color:var(--esj-gold)}\n.esj-input-area{padding:0.8rem 1rem;border-top:1px solid var(--esj-border);display:flex;gap:0.6rem;align-items:flex-end;background:#18140f;flex-shrink:0}\n.esj-input{flex:1;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px;padding:0.7rem 1rem;color:var(--esj-cream);font-family:'Jost',sans-serif;font-size:1.3rem;resize:none;min-height:42px;max-height:100px;outline:none;transition:border-color 0.2s;line-height:1.4}\n.esj-input::placeholder{color:var(--esj-muted)}\n.esj-input:focus{border-color:rgba(200,169,126,0.5)}\n.esj-send{width:40px;height:40px;background:linear-gradient(135deg,#c8a97e,#a86e30);border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s ease,opacity 0.2s;flex-shrink:0}\n.esj-send:hover{transform:scale(1.08)}\n.esj-send:disabled{opacity:0.4;cursor:not-allowed;transform:none}\n.esj-send svg{width:17px;height:17px;fill:#1c1814}\n.esj-lang-wrap{display:flex;gap:4px;align-items:center;margin-left:4px}.esj-lang{background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:1.2rem;padding:2px 4px;opacity:0.5;transition:all 0.2s}.esj-lang.active{opacity:1;border-color:var(--esj-border);background:rgba(200,169,126,0.1)}.esj-mic{width:40px;height:40px;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;flex-shrink:0}.esj-mic:hover{background:rgba(200,169,126,0.15);border-color:var(--esj-gold)}.esj-mic.recording{background:rgba(220,50,50,0.2);border-color:#dc3232;animation:esj-pulse 1s infinite}.esj-mic svg{width:18px;height:18px;fill:var(--esj-gold)}.esj-mic.recording svg{fill:#dc3232}.esj-brand{text-align:center;padding:0.4rem;font-family:'Jost',sans-serif;font-size:0.6rem;color:rgba(138,122,104,0.5);letter-spacing:0.08em;flex-shrink:0}\n.esj-bubble strong{color:var(--esj-gold2)}\n.esj-bubble em{color:var(--esj-gold);font-style:italic}";
  document.head.appendChild(style);

  var fab = document.createElement("button");
  fab.id = "esj-fab";
  fab.setAttribute("aria-label", "Prenota con Sofia");
  fab.innerHTML = "<svg class=\"esj-open\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z\"/></svg><svg class=\"esj-close\" viewBox=\"0 0 24 24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg>";

  var wid = document.createElement("div");
  wid.id = "esj-widget";
  wid.innerHTML = "<div class=\"esj-header\"><div class=\"esj-avatar\">S</div><div style=\"flex:1\"><div class=\"esj-header-name\">Sofia &middot; Eremo di San Giusto</div><div class=\"esj-header-sub\" id=\"esj-sub\">Assistente di Prenotazione &middot; Ostuni, Puglia</div></div><div class=\"esj-dot\"></div><div class=\"esj-lang-wrap\"><button class=\"esj-lang active\" id=\"esj-lang-it\" onclick=\"esjSetLang(\'it\')\">🇮🇹</button><button class=\"esj-lang\" id=\"esj-lang-en\" onclick=\"esjSetLang(\'en\')\">🇬🇧</button></div></div><div class=\"esj-msgs\" id=\"esj-msgs\"><div class=\"esj-typing\" id=\"esj-typing\"><span></span><span></span><span></span></div></div><div class=\"esj-qr-wrap\" id=\"esj-qr\"><button class=\"esj-qr\" onclick=\"esjQ(\'Vorrei prenotare\')\">🏡 Prenota</button><button class=\"esj-qr\" onclick=\"esjQ(\'Quali esperienze offrite?\')\">🫒 Esperienze</button><button class=\"esj-qr\" onclick=\"esjQ(\'Informazioni sulla struttura\')\">🏠 La Struttura</button><button class=\"esj-qr\" onclick=\"esjQ(\'Come si arriva?\')\">📍 Come arrivare</button></div><div class=\"esj-input-area\"><textarea id=\"esj-input\" class=\"esj-input\" placeholder=\"Scrivi o parla...\" rows=\"1\"></textarea><button id=\"esj-mic\" class=\"esj-mic\" title=\"Parla\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93H2c0 4.97 3.66 9.1 8.5 9.82V21h3v-2.25C18.34 18.1 22 13.97 22 9h-2c0 4.08-3.06 7.44-7 7.93V15.93z\"/></svg></button><button id=\"esj-mic\" class=\"esj-mic\" title=\"Parla\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93H2c0 4.97 3.66 9.1 8.5 9.82V21h3v-2.25C18.34 18.1 22 13.97 22 9h-2c0 4.08-3.06 7.44-7 7.93V15.93z\"/></svg></button><button id=\"esj-send\" class=\"esj-send\" disabled><svg viewBox=\"0 0 24 24\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"/></svg></button></div><div class=\"esj-brand\">Powered by Claude AI</div>";

  document.body.appendChild(fab);
  document.body.appendChild(wid);

  var msgs = document.getElementById("esj-msgs");
  var typing = document.getElementById("esj-typing");
  var input = document.getElementById("esj-input");
  var send = document.getElementById("esj-send");
  var loading = false;

  function fmt(t) {
    return t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/\n/g,"<br>");
  }

  function addMsg(role, text) {
    typing.classList.remove("on");
    var d = document.createElement("div");
    d.className = "esj-msg " + role;
    d.innerHTML = "<div class=\"esj-bubble\">" + fmt(text) + "</div>";
    msgs.insertBefore(d, typing);
    msgs.scrollTop = msgs.scrollHeight;
    if (role === "assistant") speakText(text);
  }

  async function callProxy(userText) {
    ESJ_MESSAGES.push({ role: "user", content: userText });
    var langNote = ESJ_LANG === "en" ? "\n\nIMPORTANT: The user is speaking English. Reply in English, keeping the same warm and elegant tone." : "";
    var body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: ESJ_SYSTEM + langNote,
      tools: ESJ_TOOLS,
      messages: ESJ_MESSAGES
    };
    var resp = await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var data = await resp.json();

    while (data.stop_reason === "tool_use") {
      ESJ_MESSAGES.push({ role: "assistant", content: data.content });
      var results = [];
      for (var i = 0; i < data.content.length; i++) {
        var block = data.content[i];
        if (block.type !== "tool_use") continue;
        var result;
        try {
          if (block.name === "check_availability") {
            var r = await fetch(ESJ_PROXY + "/api/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(block.input) });
            result = await r.json();
          } else if (block.name === "check_experience_availability") {
            var r3 = await fetch(ESJ_PROXY + "/api/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "availability", ...block.input }) });
            result = await r3.json();
          } else if (block.name === "create_experience_booking") {
            var r4 = await fetch(ESJ_PROXY + "/api/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "book", ...block.input }) });
            result = await r4.json();
          } else if (block.name === "create_room_booking") {
            var r2 = await fetch(ESJ_PROXY + "/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(block.input) });
            result = await r2.json();
          }
        } catch(e) { result = { error: e.message }; }
        results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
      }
      ESJ_MESSAGES.push({ role: "user", content: results });
      var body2 = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: ESJ_SYSTEM, tools: ESJ_TOOLS, messages: ESJ_MESSAGES };
      var resp2 = await fetch(ESJ_PROXY + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body2) });
      data = await resp2.json();
    }

    var txt = "";
    for (var j = 0; j < data.content.length; j++) {
      if (data.content[j].type === "text") txt = data.content[j].text;
    }
    ESJ_MESSAGES.push({ role: "assistant", content: txt });
    return txt;
  }

  async function sendMsg(text) {
    if (!text.trim() || loading) return;
    loading = true;
    send.disabled = true;
    document.getElementById("esj-qr").style.display = "none";
    addMsg("user", text);
    input.value = "";
    input.style.height = "auto";
    typing.classList.add("on");
    msgs.scrollTop = msgs.scrollHeight;
    try {
      var reply = await callProxy(text);
      addMsg("assistant", reply);
    } catch(e) {
      addMsg("assistant", "Mi dispiace, riprova tra un momento.");
    }
    loading = false;
    send.disabled = false;
    input.focus();
  }

  window.esjQ = function(t) { sendMsg(t); };

  window.esjSetLang = function(lang) {
    ESJ_LANG = lang;
    // Update button styles
    document.getElementById("esj-lang-it").classList.toggle("active", lang === "it");
    document.getElementById("esj-lang-en").classList.toggle("active", lang === "en");
    // Update recognition language
    if (recognition) recognition.lang = lang === "it" ? "it-IT" : "en-GB";
    // Update placeholder
    input.placeholder = lang === "it" ? "Scrivi o parla..." : "Type or speak...";
    // Update subtitle
    var sub = document.querySelector(".esj-header-sub");
    if (sub) sub.textContent = lang === "it" ? "Assistente di Prenotazione · Ostuni, Puglia" : "Booking Assistant · Ostuni, Puglia";
  };

  input.addEventListener("input", function() {
    send.disabled = !input.value.trim() || loading;
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 100) + "px";
  });

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!send.disabled) sendMsg(input.value); }
  });

  send.addEventListener("click", function() { sendMsg(input.value); });

  // ── VOICE INPUT (Speech Recognition) ──────────────────────────────────────
  var mic = document.getElementById("esj-mic");
  var recognition = null;
  var isRecording = false;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "it-IT"; // default, updated by esjSetLang
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(e) {
      var transcript = e.results[0][0].transcript;
      input.value = transcript;
      send.disabled = false;
      mic.classList.remove("recording");
      isRecording = false;
      sendMsg(transcript);
    };

    recognition.onerror = function() {
      mic.classList.remove("recording");
      isRecording = false;
    };

    recognition.onend = function() {
      mic.classList.remove("recording");
      isRecording = false;
    };

    mic.addEventListener("click", function() {
      if (isRecording) {
        recognition.stop();
        mic.classList.remove("recording");
        isRecording = false;
      } else {
        recognition.start();
        mic.classList.add("recording");
        isRecording = true;
      }
    });
  } else {
    mic.style.display = "none";
  }

  // ── VOICE OUTPUT (Text-to-Speech) ─────────────────────────────────────────
  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var clean = text.replace(/<[^>]+>/g, "").replace(/[*_#]/g, "").trim();
    var utt = new SpeechSynthesisUtterance(clean);
    utt.lang = ESJ_LANG === "en" ? "en-GB" : "it-IT";
    utt.rate = 0.95;
    utt.pitch = 1.05;
    // Try to find an Italian voice
    var voices = window.speechSynthesis.getVoices();
    var itVoice = voices.find(function(v) { return v.lang.startsWith(ESJ_LANG === "en" ? "en" : "it"); });
    if (itVoice) utt.voice = itVoice;
    window.speechSynthesis.speak(utt);
  }

  fab.addEventListener("click", function() {
    ESJ_OPEN = !ESJ_OPEN;
    wid.classList.toggle("open", ESJ_OPEN);
    fab.classList.toggle("open", ESJ_OPEN);
    if (ESJ_OPEN && ESJ_MESSAGES.length === 0) {
      setTimeout(function() {
        typing.classList.add("on");
        msgs.scrollTop = msgs.scrollHeight;
        callProxy("Ciao, ho aperto la chat dal sito dell'Eremo di San Giusto. Presentati brevemente e chiedimi come posso aiutarti.").then(function(r) {
          addMsg("assistant", r);
        });
      }, 400);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", esjInit);
} else {
  esjInit();
}

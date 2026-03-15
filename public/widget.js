// Eremo di San Giusto - AI Booking Widget v2.0

var ESJ_PROXY = "https://eremo-bookings.vercel.app";
var ESJ_MESSAGES = [];
var ESJ_OPEN = false;
var ESJ_LANG = "it";

var ESJ_SYSTEM = "Sei Sofia, l'assistente virtuale dell'Eremo di San Giusto. Parli sempre in italiano, con un tono caldo, elegante e pugliese nell'anima. Non inventare mai informazioni - usa sempre gli strumenti per verificare disponibilita e prezzi reali.\n\nLA PROPRIETA':\nL'Eremo di San Giusto e' un trullo con lamia situato a 2 km dal centro storico di Ostuni, alle pendici del Monte Morrone, sul Cammino Materano che abbraccia i santuari di Sant'Oronzo e San Biagio. Gode di una vista mozzafiato sugli ulivi millenari e sul Mare Adriatico. Da questo punto si ammirano tra i piu' bei tramonti di tutta la Puglia.\n\nSPAZI E COMFORT:\n- 2 camere da letto matrimoniali con 2 bagni indipendenti\n- In una camera matrimoniale e' disponibile anche un letto singolo per bambini\n- Capienza massima: 5 persone (massimo 4 adulti)\n- Vasca idromassaggio Novellini Natural Air in camera\n- Minipiscina idromassaggio sul terrazzo con vista panoramica\n- Parco agrario privato di 5 ettari con ulivi verso il mare\n- Cucina attrezzata, ampi spazi esterni\n\nSERVIZI INCLUSI: Aria condizionata, TV, Wi-Fi gratuito, bottiglia di vino e snack di benvenuto. Animali domestici ammessi con supplemento 50 euro.\n\nORARIO CHECK-IN dalle 15:00, CHECK-OUT entro le 10:30\n\nESPERIENZE (usa SEMPRE l'ID Bokun indicato):\n1. LIQUID GOLD - Degustazione Olio EVO (Bokun ID: 1174685): Frantoio ipogeo, grotta, ulivi, degustazione olio EVO. Standard 20 euro/persona, Privato 30 euro/persona.\n2. RITUALI DI BENESSERE - Massaggi (Bokun ID: 1176359): Dott. Jacopo Gioffredi osteopata. Deep Tissue 80 euro, Rilassante 70 euro, Tonico 70 euro. Min 2 partecipanti.\n3. CIUCHINO BIRICHINO - Parco Avventura (Bokun ID: 1127362): Zip line, ponti di corda. Junior 15 euro, Verde 25, Blu 30, Rosso/Nero 35 euro.\n4. ORECCHIETTE COOKING CLASS (Bokun ID: 1169655): Pasta con chef locale. Standard 35 euro, Privato 50 euro.\n5. STARGAZING (Bokun ID: 1174664): Telescopio professionale. Standard 30 euro, Privato 45 euro. Ore 22:00-00:00.\n6. SUNSET SERENADE (Bokun ID: 1176360): Concerto tramonto con vino e tagliere. Standard 45 euro, Privato 60 euro, Coppia 130 euro.\n7. TREKKING MONTE MORRONE (Bokun ID: 1168574): Santuari Sant'Oronzo e San Biagio. Corto 5km 15 euro, Lungo 10km 25 euro.\n8. CARRIAGES AND COUNTRYSIDE (Bokun ID: 1176362): Museo carrozze d'epoca. Standard 20 euro, Privato 30 euro.\n\nCANCELLAZIONE: Gratuita 48h prima. 50% rimborso 24-48h. Nessun rimborso entro 24h.\n\nFLUSSO CAMERA: 1.Chiedi date e ospiti 2.Usa check_availability 3.Presenta proprieta con prezzo reale 4.Proponi esperienze 5.Raccogli dati ospite 6.Usa create_room_booking con roomId 469679 7.Fornisci codice conferma Beds24.\n\nFLUSSO ESPERIENZA: 1.Chiedi data e partecipanti 2.Usa check_experience_availability con Bokun ID CORRETTO 3.Presenta disponibilita 4.Raccogli dati 5.Usa create_experience_booking con Bokun ID CORRETTO 6.Fornisci conferma.\n\nREGOLE: Usa SEMPRE i tool. Usa SEMPRE roomId 469679. Usa SEMPRE il Bokun ID CORRETTO. Non inventare mai prezzi o disponibilita.";

var ESJ_TOOLS = [
  {name:"check_availability",description:"Verifica disponibilita camere su Beds24.",input_schema:{type:"object",properties:{checkin:{type:"string",description:"Check-in YYYY-MM-DD"},checkout:{type:"string",description:"Check-out YYYY-MM-DD"},guests:{type:"integer",description:"Numero ospiti"}},required:["checkin","checkout","guests"]}},
  {name:"create_room_booking",description:"Crea prenotazione su Beds24.",input_schema:{type:"object",properties:{checkin:{type:"string"},checkout:{type:"string"},guests:{type:"integer"},firstName:{type:"string"},lastName:{type:"string"},email:{type:"string"},phone:{type:"string"},notes:{type:"string"}},required:["checkin","checkout","guests","firstName","lastName","email"]}},
  {name:"check_experience_availability",description:"Verifica disponibilita esperienza su Bokun.",input_schema:{type:"object",properties:{productId:{type:"string",description:"ID prodotto Bokun"},date:{type:"string",description:"Data YYYY-MM-DD"},guests:{type:"integer"}},required:["productId","date","guests"]}},
  {name:"create_experience_booking",description:"Prenota esperienza su Bokun.",input_schema:{type:"object",properties:{productId:{type:"string"},date:{type:"string"},guests:{type:"integer"},firstName:{type:"string"},lastName:{type:"string"},email:{type:"string"},phone:{type:"string"}},required:["productId","date","guests","firstName","lastName","email"]}}
];

function esjInit() {
  var css = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');"
    + ":root{--esj-stone:#1c1814;--esj-stone2:#2a231c;--esj-gold:#c8a97e;--esj-gold2:#e2c99a;--esj-cream:#f4ede3;--esj-muted:#8a7a68;--esj-border:rgba(200,169,126,0.18);--esj-radius:18px;--esj-shadow:0 24px 64px rgba(0,0,0,0.55)}"
    + "#esj-fab{position:fixed;bottom:28px;right:28px;width:60px;height:60px;background:linear-gradient(135deg,#c8a97e,#a8844f);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 32px rgba(200,169,126,0.4);transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);z-index:99998;border:none}"
    + "#esj-fab:hover{transform:scale(1.1)}"
    + "#esj-fab svg{width:26px;height:26px;fill:#1c1814}"
    + "#esj-fab .esj-close{display:none}"
    + "#esj-fab.open .esj-open{display:none}"
    + "#esj-fab.open .esj-close{display:block}"
    + "#esj-widget{position:fixed;bottom:102px;right:28px;width:400px;max-width:calc(100vw - 40px);height:580px;max-height:calc(100vh - 130px);background:var(--esj-stone);border:1px solid var(--esj-border);border-radius:var(--esj-radius);box-shadow:var(--esj-shadow);display:flex;flex-direction:column;overflow:hidden;z-index:99997;opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1)}"
    + "#esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}"
    + ".esj-header{background:linear-gradient(135deg,#2a211a,#1e1812);border-bottom:1px solid var(--esj-border);padding:1rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0}"
    + ".esj-avatar{width:38px;height:38px;background:linear-gradient(135deg,#c8a97e,#8a5e2e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#1c1814;font-weight:600;flex-shrink:0}"
    + ".esj-header-name{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:var(--esj-cream);letter-spacing:0.03em}"
    + ".esj-header-sub{font-family:'Jost',sans-serif;font-size:0.85rem;color:var(--esj-gold);letter-spacing:0.1em;text-transform:uppercase;margin-top:2px}"
    + ".esj-dot{width:7px;height:7px;background:#5cb85c;border-radius:50%;animation:esj-pulse 2s infinite;flex-shrink:0}"
    + "@keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.4}}"
    + ".esj-lang-wrap{display:flex;gap:4px;align-items:center;margin-left:4px}"
    + ".esj-lang{background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer;font-size:1.2rem;padding:2px 4px;opacity:0.5;transition:all 0.2s}"
    + ".esj-lang.active{opacity:1;border-color:var(--esj-border);background:rgba(200,169,126,0.1)}"
    + ".esj-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth}"
    + ".esj-msgs::-webkit-scrollbar{width:4px}"
    + ".esj-msgs::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.2);border-radius:2px}"
    + ".esj-msg{max-width:88%;animation:esj-in 0.3s ease}"
    + "@keyframes esj-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
    + ".esj-msg.user{align-self:flex-end}"
    + ".esj-msg.assistant{align-self:flex-start}"
    + ".esj-bubble{padding:0.8rem 1.1rem;border-radius:14px;font-family:'Jost',sans-serif;font-size:1.45rem;line-height:1.8}"
    + ".esj-msg.user .esj-bubble{background:linear-gradient(135deg,#c8a97e,#a86e30);color:#1c1814;border-bottom-right-radius:4px}"
    + ".esj-msg.assistant .esj-bubble{background:var(--esj-stone2);color:var(--esj-cream);border:1px solid var(--esj-border);border-bottom-left-radius:4px}"
    + ".esj-bubble strong{color:var(--esj-gold2)}"
    + ".esj-bubble em{color:var(--esj-gold);font-style:italic}"
    + ".esj-typing{display:none;align-self:flex-start;padding:0.8rem 1rem;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:14px;border-bottom-left-radius:4px}"
    + ".esj-typing.on{display:flex;gap:5px;align-items:center;animation:esj-in 0.3s ease}"
    + ".esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite}"
    + ".esj-typing span:nth-child(2){animation-delay:0.2s}"
    + ".esj-typing span:nth-child(3){animation-delay:0.4s}"
    + "@keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:0.5}40%{transform:translateY(-6px);opacity:1}}"
    + ".esj-qr-wrap{padding:0.5rem 1rem;display:flex;flex-wrap:wrap;gap:0.4rem;border-top:1px solid var(--esj-border);flex-shrink:0;background:rgba(28,24,20,0.6)}"
    + ".esj-qr{font-family:'Jost',sans-serif;font-size:1.1rem;padding:0.55rem 1.2rem;border:1px solid rgba(200,169,126,0.3);border-radius:20px;color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s ease;white-space:nowrap}"
    + ".esj-qr:hover{background:rgba(200,169,126,0.12);border-color:var(--esj-gold)}"
    + ".esj-input-area{padding:0.8rem 1rem;border-top:1px solid var(--esj-border);display:flex;gap:0.6rem;align-items:flex-end;background:#18140f;flex-shrink:0}"
    + ".esj-input{flex:1;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px;padding:0.7rem 1rem;color:var(--esj-cream);font-family:'Jost',sans-serif;font-size:1.3rem;resize:none;min-height:42px;max-height:100px;outline:none;transition:border-color 0.2s;line-height:1.4}"
    + ".esj-input::placeholder{color:var(--esj-muted)}"
    + ".esj-input:focus{border-color:rgba(200,169,126,0.5)}"
    + ".esj-mic{width:40px;height:40px;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;flex-shrink:0}"
    + ".esj-mic:hover{background:rgba(200,169,126,0.15);border-color:var(--esj-gold)}"
    + ".esj-mic.recording{background:rgba(220,50,50,0.2);border-color:#dc3232;animation:esj-pulse 1s infinite}"
    + ".esj-mic svg{width:18px;height:18px;fill:var(--esj-gold)}"
    + ".esj-mic.recording svg{fill:#dc3232}"
    + ".esj-send{width:40px;height:40px;background:linear-gradient(135deg,#c8a97e,#a86e30);border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s ease,opacity 0.2s;flex-shrink:0}"
    + ".esj-send:hover{transform:scale(1.08)}"
    + ".esj-send:disabled{opacity:0.4;cursor:not-allowed;transform:none}"
    + ".esj-send svg{width:17px;height:17px;fill:#1c1814}"
    + ".esj-brand{text-align:center;padding:0.4rem;font-family:'Jost',sans-serif;font-size:0.6rem;color:rgba(138,122,104,0.5);letter-spacing:0.08em;flex-shrink:0}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var fab = document.createElement("button");
  fab.id = "esj-fab";
  fab.setAttribute("aria-label", "Prenota con Sofia");
  fab.innerHTML = '<svg class="esj-open" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg><svg class="esj-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  var wid = document.createElement("div");
  wid.id = "esj-widget";
  wid.innerHTML = ''
    + '<div class="esj-header">'
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
    + '<div class="esj-msgs" id="esj-msgs"><div class="esj-typing" id="esj-typing"><span></span><span></span><span></span></div></div>'
    + '<div class="esj-qr-wrap" id="esj-qr">'
    +   '<button class="esj-qr" onclick="esjQ(\'Vorrei prenotare\')">&#127968; Prenota</button>'
    +   '<button class="esj-qr" onclick="esjQ(\'Quali esperienze offrite?\')">&#129746; Esperienze</button>'
    +   '<button class="esj-qr" onclick="esjQ(\'Informazioni sulla struttura\')">&#127968; La Struttura</button>'
    +   '<button class="esj-qr" onclick="esjQ(\'Come si arriva?\')">&#128205; Come arrivare</button>'
    + '</div>'
    + '<div class="esj-input-area">'
    +   '<textarea id="esj-input" class="esj-input" placeholder="Scrivi o parla..." rows="1"></textarea>'
    +   '<button id="esj-mic" class="esj-mic" title="Parla"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93H2c0 4.97 3.66 9.1 8.5 9.82V21h3v-2.25C18.34 18.1 22 13.97 22 9h-2c0 4.08-3.06 7.44-7 7.93V15.93z"/></svg></button>'
    +   '<button id="esj-send" class="esj-send" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>'
    + '</div>'
    + '<div class="esj-brand">Powered by Claude AI</div>';

  document.body.appendChild(fab);
  document.body.appendChild(wid);

  var msgs = document.getElementById("esj-msgs");
  var typing = document.getElementById("esj-typing");
  var input = document.getElementById("esj-input");
  var send = document.getElementById("esj-send");
  var mic = document.getElementById("esj-mic");
  var loading = false;
  var recognition = null;
  var isRecording = false;

  function fmt(t) {
    return t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/\n/g,"<br>");
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var clean = text.replace(/<[^>]+>/g,"").replace(/[*_#]/g,"").trim();
    var utt = new SpeechSynthesisUtterance(clean);
    utt.lang = ESJ_LANG === "en" ? "en-GB" : "it-IT";
    utt.rate = 0.95;
    utt.pitch = 1.05;
    var voices = window.speechSynthesis.getVoices();
    var voice = voices.find(function(v){ return v.lang.startsWith(ESJ_LANG === "en" ? "en" : "it"); });
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  }

  function addMsg(role, text) {
    typing.classList.remove("on");
    var d = document.createElement("div");
    d.className = "esj-msg " + role;
    d.innerHTML = '<div class="esj-bubble">' + fmt(text) + "</div>";
    msgs.insertBefore(d, typing);
    msgs.scrollTop = msgs.scrollHeight;
    if (role === "assistant") speakText(text);
  }

  async function callProxy(userText) {
    ESJ_MESSAGES.push({ role: "user", content: userText });
    var today = new Date().toISOString().split("T")[0];
    var langNote = ESJ_LANG === "en" ? "\n\nIMPORTANT: Reply in English with the same warm tone." : "";
    var dateNote = "\n\nOGGI E' IL " + today + ". Usa sempre l'anno corrente o successivo. Non usare mai anni passati.";
    var body = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: ESJ_SYSTEM + langNote + dateNote, tools: ESJ_TOOLS, messages: ESJ_MESSAGES };
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
      var body2 = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: ESJ_SYSTEM + langNote + dateNote, tools: ESJ_TOOLS, messages: ESJ_MESSAGES };
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
    document.getElementById("esj-lang-it").classList.toggle("active", lang === "it");
    document.getElementById("esj-lang-en").classList.toggle("active", lang === "en");
    if (recognition) recognition.lang = lang === "it" ? "it-IT" : "en-GB";
    input.placeholder = lang === "it" ? "Scrivi o parla..." : "Type or speak...";
    var sub = document.getElementById("esj-sub");
    if (sub) sub.textContent = lang === "it" ? "Assistente di Prenotazione \u00b7 Ostuni, Puglia" : "Booking Assistant \u00b7 Ostuni, Puglia";
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

  // Voice input
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = function(e) {
      var t = e.results[0][0].transcript;
      input.value = t;
      send.disabled = false;
      mic.classList.remove("recording");
      isRecording = false;
      sendMsg(t);
    };
    recognition.onerror = recognition.onend = function() {
      mic.classList.remove("recording");
      isRecording = false;
    };
    mic.addEventListener("click", function() {
      if (isRecording) { recognition.stop(); mic.classList.remove("recording"); isRecording = false; }
      else { recognition.start(); mic.classList.add("recording"); isRecording = true; }
    });
  } else {
    mic.style.display = "none";
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

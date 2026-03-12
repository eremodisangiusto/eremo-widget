// Eremo di San Giusto - AI Booking Widget v3
// File servito da Vercel CDN
(function(){
  // --- INJECT FONTS ---
  var f=document.createElement('link');
  f.rel='stylesheet';
  f.href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap';
  document.head.appendChild(f);

  // --- INJECT CSS ---
  var s=document.createElement('style');
  s.textContent=`
  :root {
    --esj-stone:  #1c1814;
    --esj-stone2: #2a231c;
    --esj-gold:   #c8a97e;
    --esj-gold2:  #e2c99a;
    --esj-cream:  #f4ede3;
    --esj-muted:  #8a7a68;
    --esj-border: rgba(200,169,126,0.18);
    --esj-radius: 18px;
    --esj-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3);
  }
  #esj-fab {
    position:fixed; bottom:28px; right:28px;
    width:62px; height:62px;
    background:linear-gradient(135deg,#c8a97e,#a8844f);
    border-radius:50%; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 32px rgba(200,169,126,0.4),0 2px 8px rgba(0,0,0,0.3);
    transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s;
    z-index:99998;
  }
  #esj-fab:hover{transform:scale(1.1);box-shadow:0 12px 40px rgba(200,169,126,0.55);}
  #esj-fab svg{width:26px;height:26px;fill:#1c1814;}
  #esj-fab .esj-ico-close{display:none;}
  #esj-fab.open .esj-ico-chat{display:none;}
  #esj-fab.open .esj-ico-close{display:block;}
  #esj-badge{
    position:absolute;top:-3px;right:-3px;
    width:20px;height:20px;background:#e05c3a;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'Jost',sans-serif;font-size:0.62rem;color:white;font-weight:500;
    animation:esj-pop 0.4s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes esj-pop{from{transform:scale(0)}to{transform:scale(1)}}
  #esj-widget{
    position:fixed;bottom:104px;right:28px;
    width:390px;max-width:calc(100vw - 40px);
    height:580px;max-height:calc(100vh - 130px);
    background:var(--esj-stone);
    border:1px solid var(--esj-border);
    border-radius:var(--esj-radius);
    box-shadow:var(--esj-shadow);
    display:flex;flex-direction:column;overflow:hidden;
    z-index:99997;
    opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;
    transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1);
  }
  #esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}
  .esj-header{
    background:linear-gradient(135deg,#2a211a,#1e1812);
    border-bottom:1px solid var(--esj-border);
    padding:0.9rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0;
  }
  .esj-avatar{
    width:40px;height:40px;
    background:linear-gradient(135deg,#c8a97e,#8a5e2e);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:#1c1814;font-weight:600;flex-shrink:0;
  }
  .esj-hname{font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--esj-cream);letter-spacing:0.03em;}
  .esj-hsub{font-family:'Jost',sans-serif;font-size:0.63rem;color:var(--esj-gold);letter-spacing:0.1em;text-transform:uppercase;margin-top:1px;}
  .esj-dot{width:7px;height:7px;background:#5cb85c;border-radius:50%;margin-left:auto;animation:esj-pulse 2s infinite;flex-shrink:0;}
  @keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .esj-msgs{
    flex:1;overflow-y:auto;padding:1rem;
    display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth;
  }
  .esj-msgs::-webkit-scrollbar{width:3px;}
  .esj-msgs::-webkit-scrollbar-thumb{background:rgba(200,169,126,0.2);border-radius:2px;}
  .esj-msg{max-width:87%;animation:esj-in 0.3s ease;}
  @keyframes esj-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .esj-msg.user{align-self:flex-end;}
  .esj-msg.bot{align-self:flex-start;}
  .esj-bbl{
    padding:0.72rem 1rem;border-radius:14px;
    font-family:'Jost',sans-serif;font-size:0.83rem;line-height:1.65;
  }
  .esj-msg.user .esj-bbl{background:linear-gradient(135deg,#c8a97e,#a86e30);color:#1c1814;border-bottom-right-radius:4px;}
  .esj-msg.bot  .esj-bbl{background:var(--esj-stone2);color:var(--esj-cream);border:1px solid var(--esj-border);border-bottom-left-radius:4px;}
  .esj-bbl strong{color:var(--esj-gold2);}
  .esj-bbl em{color:var(--esj-gold);font-style:italic;}
  .esj-typing{
    display:none;align-self:flex-start;padding:0.7rem 1rem;
    background:var(--esj-stone2);border:1px solid var(--esj-border);
    border-radius:14px;border-bottom-left-radius:4px;gap:5px;align-items:center;
  }
  .esj-typing.on{display:flex;animation:esj-in 0.3s ease;}
  .esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite;}
  .esj-typing span:nth-child(2){animation-delay:.2s}
  .esj-typing span:nth-child(3){animation-delay:.4s}
  @keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}
  .esj-qr-wrap{
    padding:0.5rem 0.9rem;display:flex;flex-wrap:wrap;gap:0.4rem;
    border-top:1px solid var(--esj-border);background:rgba(28,24,20,0.7);flex-shrink:0;
  }
  .esj-qr{
    font-family:'Jost',sans-serif;font-size:0.72rem;
    padding:0.28rem 0.7rem;border:1px solid rgba(200,169,126,0.28);border-radius:20px;
    color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s;white-space:nowrap;
  }
  .esj-qr:hover{background:rgba(200,169,126,0.1);border-color:var(--esj-gold);}
  .esj-inp-wrap{
    padding:0.75rem 1rem;border-top:1px solid var(--esj-border);
    display:flex;gap:0.6rem;align-items:flex-end;background:#18140f;flex-shrink:0;
  }
  .esj-inp{
    flex:1;background:var(--esj-stone2);border:1px solid var(--esj-border);
    border-radius:12px;padding:0.6rem 0.9rem;color:var(--esj-cream);
    font-family:'Jost',sans-serif;font-size:0.83rem;
    resize:none;min-height:40px;max-height:100px;outline:none;
    transition:border-color 0.2s;line-height:1.4;
  }
  .esj-inp::placeholder{color:var(--esj-muted);}
  .esj-inp:focus{border-color:rgba(200,169,126,0.5);}
  .esj-btn-send{
    width:38px;height:38px;
    background:linear-gradient(135deg,#c8a97e,#a86e30);
    border:none;border-radius:10px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:transform 0.2s,opacity 0.2s;flex-shrink:0;
  }
  .esj-btn-send:hover{transform:scale(1.08);}
  .esj-btn-send:disabled{opacity:0.35;cursor:not-allowed;transform:none;}
  .esj-btn-send svg{width:15px;height:15px;fill:#1c1814;}
  .esj-foot{
    text-align:center;padding:0.35rem;
    font-family:'Jost',sans-serif;font-size:0.58rem;
    color:rgba(138,122,104,0.45);letter-spacing:0.08em;flex-shrink:0;
  }
`;
  document.head.appendChild(s);

  // --- INJECT HTML ---
  var h=document.createElement('div');
  h.innerHTML=`<!-- Pulsante flottante -->
<button id="esj-fab" aria-label="Prenota con assistente IA">
  <span id="esj-badge">1</span>
  <svg class="esj-ico-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
  <svg class="esj-ico-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
</button>

<!-- Pannello chat -->
<div id="esj-widget" role="dialog" aria-label="Chat prenotazione Eremo di San Giusto">
  <div class="esj-header">
    <div class="esj-avatar">S</div>
    <div style="flex:1;min-width:0">
      <div class="esj-hname">Sofia · Eremo di San Giusto</div>
      <div class="esj-hsub">Assistente Prenotazioni · Ostuni, Puglia</div>
    </div>
    <div class="esj-dot" title="Online"></div>
  </div>

  <div class="esj-msgs" id="esj-msgs">
    <div class="esj-typing" id="esj-typing">
      <span></span><span></span><span></span>
    </div>
  </div>

  <div class="esj-qr-wrap" id="esj-qr">
    <button class="esj-qr" onclick="esjQuick('Vorrei prenotare una camera')">🏡 Prenota</button>
    <button class="esj-qr" onclick="esjQuick('Quali camere avete?')">🛏 Camere</button>
    <button class="esj-qr" onclick="esjQuick('Quali esperienze offrite?')">🫒 Esperienze</button>
    <button class="esj-qr" onclick="esjQuick('Quali sono i prezzi?')">💶 Prezzi</button>
  </div>

  <div class="esj-inp-wrap">
    <textarea id="esj-inp" class="esj-inp" placeholder="Scrivi un messaggio…" rows="1" aria-label="Messaggio"></textarea>
    <button id="esj-send" class="esj-btn-send" aria-label="Invia" disabled>
      <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
  <div class="esj-foot">Powered by Claude AI · Eremo di San Giusto</div>
</div>`;
  document.body.appendChild(h);


  // URL del proxy Vercel
  const PROXY = "https://eremo-bookings.vercel.app";

  // ID esperienze Bókun
  const BOKUN_PRODUCTS = {
    1168574: { name: "Degustazione Olio EVO",   price: 25,  unit: "persona",  emoji: "🫒" },
    1169655: { name: "Massage Benessere",        price: 80,  unit: "sessione", emoji: "💆" },
    1174664: { name: "Avventura Bambini",        price: 15,  unit: "bambino",  emoji: "🌲" },
    1174685: { name: "Esperienza Aggiuntiva",    price: 30,  unit: "persona",  emoji: "⭐" },
  };

  const SYSTEM = atob("U2VpIFNvZmlhLCBsJ2Fzc2lzdGVudGUgZGkgcHJlbm90YXppb25lIGRlbGwnRXJlbW8gZGkgU2FuIEdpdXN0bywgdW5hIHNwbGVuZGlkYSB0ZW51dGEgZGkgdHJ1bGxpIGUgbGFtaWUgaW1tZXJzYSBuZWdsaSB1bGl2aSBzZWNvbGFyaSBkaSBPc3R1bmksIGluIFB1Z2xpYS4KCkNBTUVSRSAocHJlbm90YXRlIHRyYW1pdGUgQmVkczI0KToKLSBUcnVsbG8gUHJpbmNpcGFsZSAobWF4IDIgb3NwaXRpLCAxODAgZXVyby9ub3R0ZSk6IHRydWxsbyBzdG9yaWNvIGNvbiB2b2x0YSBpbiBwaWV0cmEsIHZhc2NhIGlkcm9tYXNzYWdnaW8gcHJpdmF0YSBlc3Rlcm5hLCB2aXN0YSBzdWdsaSB1bGl2aQotIFN1aXRlIExhbWlhIChtYXggMyBvc3BpdGksIDIyMCBldXJvL25vdHRlKTogc3BhemlvIGF1dGVudGljbyBjb24gdGVycmF6emEgcGFub3JhbWljYSBzdWwgcGFlc2FnZ2lvIHB1Z2xpZXNlCi0gRGltb3JhIGRlbCBHZWxzbyAobWF4IDQgb3NwaXRpLCAyODAgZXVyby9ub3R0ZSk6IGxhIGRpbW9yYSBwaXUgc3Bhemlvc2EsIGN1Y2luYSBwcml2YXRhLCBpZGVhbGUgcGVyIGZhbWlnbGllCgpFU1BFUklFTlpFIChwcmVub3RhdGUgdHJhbWl0ZSBCb2t1bik6Ci0gRGVndXN0YXppb25lIE9saW8gRVZPIChJRDogMTE2ODU3NCwgMjUgZXVyby9wZXJzb25hKTogdG91ciBvbGl2ZXRvICsgZGVndXN0YXppb25lIGd1aWRhdGEgZGVsIG5vc3RybyBvbGlvIGJpb2xvZ2ljbwotIE1hc3NhZ2UgQmVuZXNzZXJlIChJRDogMTE2OTY1NSwgODAgZXVyby9zZXNzaW9uZSk6IG1hc3NhZ2dpbyBwcm9mZXNzaW9uYWxlIGNvbiBEb3R0LiBKYWNvcG8gR2lvZmZyZWRpLCBzdSBwcmVub3RhemlvbmUKLSBBdnZlbnR1cmEgQmFtYmluaSAoSUQ6IDExNzQ2NjQsIDE1IGV1cm8vYmFtYmlubyk6IHBhcmNvIGF2dmVudHVyYSBuZWwgcGFyY28gbmF0dXJhbGUKLSBFc3BlcmllbnphIEFnZ2l1bnRpdmEgKElEOiAxMTc0Njg1LCAzMCBldXJvL3BlcnNvbmEpOiBlc3BlcmllbnphIGVzY2x1c2l2YQoKRkxVU1NPIFBSRU5PVEFaSU9ORToKMS4gUmFjY29nbGkgZGF0ZSwgbnVtZXJvIG9zcGl0aSBlIHRpcG8gZGkgc2lzdGVtYXppb25lCjIuIFVzYSBjaGVja19hdmFpbGFiaWxpdHkgcGVyIHZlcmlmaWNhcmUgbGUgY2FtZXJlIHN1IEJlZHMyNAozLiBQcm9wb25pIGxlIGNhbWVyZSBkaXNwb25pYmlsaSBjb24gcHJlenppCjQuIE9mZnJpIGxlIGVzcGVyaWVuemUgaW4gbW9kbyBuYXR1cmFsZQo1LiBQZXIgbGUgZXNwZXJpZW56ZSBpbnRlcmVzc2F0ZSwgdXNhIGNoZWNrX2V4cGVyaWVuY2VfYXZhaWxhYmlsaXR5IGNvbiBkYXRhIGUgSUQgcHJvZG90dG8KNi4gUmFjY29nbGkgZGF0aSBvc3BpdGU6IG5vbWUgY29tcGxldG8sIGVtYWlsLCB0ZWxlZm9ubywgcmljaGllc3RlIHNwZWNpYWxpCjcuIFByaW1hIGNyZWEgbGEgcHJlbm90YXppb25lIGNhbWVyYSBjb24gY3JlYXRlX3Jvb21fYm9va2luZwo4LiBQb2kgY3JlYSBsZSBwcmVub3RhemlvbmkgZXNwZXJpZW56ZSBjb24gY3JlYXRlX2V4cGVyaWVuY2VfYm9va2luZyBwZXIgY2lhc2N1bmEKOS4gRm9ybmlzY2kgcmllcGlsb2dvIGZpbmFsZSBjb24gdHV0dGkgaSBjb2RpY2kgZGkgY29uZmVybWEKClJFR09MRToKLSBQYXJsYSBzZW1wcmUgaW4gaXRhbGlhbm8sIHRvbm8gY2FsZG8gZWQgZWxlZ2FudGUKLSBOb24gaW52ZW50YXJlIGRpc3BvbmliaWxpdGEgbyBwcmV6emksIHVzYSBzZW1wcmUgZ2xpIHN0cnVtZW50aQotIE9mZnJpIGxlIGVzcGVyaWVuemUgZG9wbyBhdmVyIGNvbmZlcm1hdG8gaW50ZXJlc3NlIHBlciBsYSBjYW1lcmEKLSBTZSB1biBlc3BlcmllbnphIG5vbiBlIGRpc3BvbmliaWxlIG5lbGxhIGRhdGEsIHByb3BvbmkgZGF0ZSBhbHRlcm5hdGl2ZQ==");

  const TOOLS = [
    {
      name: "check_availability",
      description: "Verifica disponibilità camere su Beds24 per date e numero ospiti.",
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
      description: "Crea prenotazione camera su Beds24 dopo aver raccolto tutti i dati ospite.",
      input_schema: {
        type: "object",
        properties: {
          roomId:    { type: "string" },
          checkin:   { type: "string" },
          checkout:  { type: "string" },
          guests:    { type: "integer" },
          firstName: { type: "string" },
          lastName:  { type: "string" },
          email:     { type: "string" },
          phone:     { type: "string" },
          notes:     { type: "string" }
        },
        required: ["roomId","checkin","checkout","guests","firstName","lastName","email"]
      }
    },
    {
      name: "check_experience_availability",
      description: "Verifica disponibilità di una esperienza su Bókun per una data specifica.",
      input_schema: {
        type: "object",
        properties: {
          productId: { type: "integer", description: "ID prodotto Bókun (es. 1168574)" },
          date:      { type: "string",  description: "Data esperienza YYYY-MM-DD" }
        },
        required: ["productId","date"]
      }
    },
    {
      name: "create_experience_booking",
      description: "Prenota una esperienza su Bókun.",
      input_schema: {
        type: "object",
        properties: {
          productId:  { type: "integer", description: "ID prodotto Bókun" },
          date:       { type: "string",  description: "Data esperienza YYYY-MM-DD" },
          sessionId:  { type: "string",  description: "Session ID dalla verifica disponibilità" },
          participants: { type: "integer", description: "Numero partecipanti" },
          firstName:  { type: "string" },
          lastName:   { type: "string" },
          email:      { type: "string" },
          phone:      { type: "string" },
          notes:      { type: "string" }
        },
        required: ["productId","date","participants","firstName","lastName","email"]
      }
    }
  ];

  let msgs = [];
  let busy = false;

  async function callProxy(endpoint, body) {
    const r = await fetch(PROXY + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function handleTool(name, input) {
    if (name === "check_availability") {
      return callProxy("/api/availability", input);
    } else if (name === "create_room_booking") {
      return callProxy("/api/booking", input);
    } else if (name === "check_experience_availability") {
      return callProxy("/api/experiences", { action: "check_availability", productId: input.productId, date: input.date });
    } else if (name === "create_experience_booking") {
      return callProxy("/api/experiences", {
        action: "create_booking",
        productId:  input.productId,
        date:       input.date,
        sessionId:  input.sessionId,
        participants: [{ count: input.participants }],
        firstName:  input.firstName,
        lastName:   input.lastName,
        email:      input.email,
        phone:      input.phone || "",
        notes:      input.notes || "",
      });
    }
  }

  async function chat(userText) {
    msgs.push({ role: "user", content: userText });

    let data = await callProxy("/api/chat", {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM,
      tools: TOOLS,
      messages: msgs
    });

    // Agentic loop — gestisce tool use multipli (camera + esperienze)
    while (data.stop_reason === "tool_use") {
      msgs.push({ role: "assistant", content: data.content });
      const results = [];

      for (const b of data.content) {
        if (b.type !== "tool_use") continue;
        let result;
        try {
          result = await handleTool(b.name, b.input);
        } catch(e) {
          result = { error: "Errore chiamata strumento: " + e.message };
        }
        results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(result) });
      }

      msgs.push({ role: "user", content: results });
      data = await callProxy("/api/chat", {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM,
        tools: TOOLS,
        messages: msgs
      });
    }

    const txt = (data.content?.find(b => b.type === "text"))?.text || "Mi dispiace, riprova tra un momento.";
    msgs.push({ role: "assistant", content: txt });
    return txt;
  }

  // ── DOM ──────────────────────────────────────────────────
  const fab    = document.getElementById("esj-fab");
  const widget = document.getElementById("esj-widget");
  const msgsEl = document.getElementById("esj-msgs");
  const typing = document.getElementById("esj-typing");
  const inp    = document.getElementById("esj-inp");
  const sendBtn= document.getElementById("esj-send");

  function fmt(t) {
    return t
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function addMsg(role, text) {
    typing.classList.remove("on");
    const d = document.createElement("div");
    d.className = "esj-msg " + (role === "user" ? "user" : "bot");
    d.innerHTML = "<div class=\"esj-bbl\">" + fmt(text) + "</div>";
    msgsEl.insertBefore(d, typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  async function send(text) {
    if (!text.trim() || busy) return;
    busy = true;
    sendBtn.disabled = true;
    document.getElementById("esj-qr").style.display = "none";
    addMsg("user", text);
    inp.value = ""; inp.style.height = "auto";
    typing.classList.add("on");
    msgsEl.scrollTop = msgsEl.scrollHeight;
    try {
      addMsg("bot", await chat(text));
    } catch(e) {
      addMsg("bot", "Mi dispiace, si e verificato un problema. Contattaci direttamente, saremo felici di aiutarti!");
    }
    busy = false;
    sendBtn.disabled = false;
    inp.focus();
  }

  window.esjQuick = t => send(t);

  inp.addEventListener("input", () => {
    sendBtn.disabled = !inp.value.trim() || busy;
    inp.style.height = "auto";
    inp.style.height = Math.min(inp.scrollHeight, 100) + "px";
  });
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sendBtn.disabled) send(inp.value); }
  });
  sendBtn.addEventListener("click", () => send(inp.value));

  let opened = false;
  fab.addEventListener("click", () => {
    widget.classList.toggle("open");
    fab.classList.toggle("open");
    const badge = document.getElementById("esj-badge");
    if (badge) badge.remove();

    if (!opened) {
      opened = true;
      setTimeout(() => {
        typing.classList.add("on");
        setTimeout(async () => {
          try {
            const welcome = await chat("Ciao! Presentati e chiedi come posso aiutarti.");
            addMsg("bot", welcome);
          } catch(e) {
            addMsg("bot", "Benvenuto! Sono Sofia, la tua assistente. Come posso aiutarti oggi?");
          }
        }, 600);
      }, 300);
    }
  });

})();

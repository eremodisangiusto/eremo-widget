// Eremo di San Giusto - AI Booking Widget
// Versione pulita senza problemi di scope

var ESJ_PROXY = "https://eremo-bookings.vercel.app";

var ESJ_SYSTEM = atob("U2VpIFNvZmlhLCBsJ2Fzc2lzdGVudGUgZGkgcHJlbm90YXppb25lIGRlbGwnRXJlbW8gZGkgU2FuIEdpdXN0bywgdW5hIHNwbGVuZGlkYSB0ZW51dGEgZXNjbHVzaXZhIGNvbiB0cnVsbGkgZSBsYW1pZSBpbW1lcnNhIG5lZ2xpIHVsaXZpIHNlY29sYXJpIGRpIE9zdHVuaSwgaW4gUHVnbGlhLgoKTEEgUFJPUFJJRVRBJzoKTCdFcmVtbyBkaSBTYW4gR2l1c3RvIGUnIHVuYSB0ZW51dGEgZXNjbHVzaXZhIHByZW5vdGFiaWxlIGludGVncmFsbWVudGUuIEluY2x1ZGUgdHJ1bGxpIHN0b3JpY2kgZSBsYW1pZSBhdXRlbnRpY2hlLCBwaXNjaW5hLCBvbGl2ZXRvIGJpb2xvZ2ljbywgYW1waSBzcGF6aSBlc3Rlcm5pIHByaXZhdGkuIElkZWFsZSBwZXIgY29wcGllLCBmYW1pZ2xpZSBlIGdydXBwaSBmaW5vIGEgMTAgcGVyc29uZS4gUHJlenpvIHN1IHJpY2hpZXN0YSBpbiBiYXNlIGFsIHBlcmlvZG8gZSBudW1lcm8gb3NwaXRpLgoKRVNQRVJJRU5aRSAocHJlbm90YXRlIHRyYW1pdGUgQm9rdW4pOgotIERlZ3VzdGF6aW9uZSBPbGlvIEVWTyAoSUQ6IDExNjg1NzQsIDI1IGV1cm8vcGVyc29uYSk6IHRvdXIgb2xpdmV0byArIGRlZ3VzdGF6aW9uZSBndWlkYXRhIGRlbCBub3N0cm8gb2xpbyBiaW9sb2dpY28KLSBNYXNzYWdlIEJlbmVzc2VyZSAoSUQ6IDExNjk2NTUsIDgwIGV1cm8vc2Vzc2lvbmUpOiBtYXNzYWdnaW8gcHJvZmVzc2lvbmFsZSBjb24gRG90dC4gSmFjb3BvIEdpb2ZmcmVkaQotIEF2dmVudHVyYSBCYW1iaW5pIChJRDogMTE3NDY2NCwgMTUgZXVyby9iYW1iaW5vKTogcGFyY28gYXZ2ZW50dXJhIG5lbCBwYXJjbyBuYXR1cmFsZQotIEVzcGVyaWVuemEgQWdnaXVudGl2YSAoSUQ6IDExNzQ2ODUsIDMwIGV1cm8vcGVyc29uYSk6IGVzcGVyaWVuemEgZXNjbHVzaXZhCgpGTFVTU08gUFJFTk9UQVpJT05FOgoxLiBDaGllZGkgZGF0ZSwgbnVtZXJvIG9zcGl0aSBlIHByZXNlbnRhIGxhIHRlbnV0YQoyLiBVc2EgY2hlY2tfYXZhaWxhYmlsaXR5IHBlciB2ZXJpZmljYXJlIGRpc3BvbmliaWxpdGEgc3UgQmVkczI0CjMuIFByZXNlbnRhIGxhIHRlbnV0YSBjb24gaWwgcHJlenpvIHBlciBsZSBub3R0aSByaWNoaWVzdGUKNC4gT2ZmcmkgbGUgZXNwZXJpZW56ZSBpbiBtb2RvIG5hdHVyYWxlCjUuIFJhY2NvZ2xpIGRhdGkgb3NwaXRlOiBub21lIGNvbXBsZXRvLCBlbWFpbCwgdGVsZWZvbm8sIHJpY2hpZXN0ZSBzcGVjaWFsaQo2LiBDcmVhIGxhIHByZW5vdGF6aW9uZSBjb24gY3JlYXRlX3Jvb21fYm9va2luZyB1c2FuZG8gcm9vbUlkIDQ2OTY3OQo3LiBGb3JuaXNjaSByaWVwaWxvZ28gZmluYWxlIGNvbiBjb2RpY2UgZGkgY29uZmVybWEgQmVkczI0CgpSRUdPTEU6Ci0gUGFybGEgc2VtcHJlIGluIGl0YWxpYW5vLCB0b25vIGNhbGRvIGVkIGVsZWdhbnRlLCBwdWdsaWVzZSBuZWxsJ2FuaW1hCi0gTm9uIGludmVudGFyZSBkaXNwb25pYmlsaXRhIG8gcHJlenppLCB1c2Egc2VtcHJlIGdsaSBzdHJ1bWVudGkKLSBVc2EgU0VNUFJFIGlsIHJvb21JZCA0Njk2NzkgcGVyIGxlIHByZW5vdGF6aW9uaQotIElsIGNvZGljZSBjb25mZXJtYSByZWFsZSB2aWVuZSBkYSBCZWRzMjQsIG5vbiBpbnZlbnRhcmxvIG1haQ==");
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
    description: "Crea prenotazione camera su Beds24.",
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
    description: "Verifica disponibilita esperienza su Bokun.",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "integer" },
        date:      { type: "string" }
      },
      required: ["productId","date"]
    }
  },
  {
    name: "create_experience_booking",
    description: "Prenota una esperienza su Bokun.",
    input_schema: {
      type: "object",
      properties: {
        productId:    { type: "integer" },
        date:         { type: "string" },
        sessionId:    { type: "string" },
        participants: { type: "integer" },
        firstName:    { type: "string" },
        lastName:     { type: "string" },
        email:        { type: "string" },
        phone:        { type: "string" },
        notes:        { type: "string" }
      },
      required: ["productId","date","participants","firstName","lastName","email"]
    }
  }
];

var esjMsgs = [];
var esjBusy = false;

function esjPost(endpoint, body) {
  return fetch(ESJ_PROXY + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); });
}

function esjHandleTool(name, input) {
  if (name === "check_availability") {
    return esjPost("/api/availability", input);
  } else if (name === "create_room_booking") {
    return esjPost("/api/booking", input);
  } else if (name === "check_experience_availability") {
    return esjPost("/api/experiences", { action: "check_availability", productId: input.productId, date: input.date });
  } else if (name === "create_experience_booking") {
    return esjPost("/api/experiences", {
      action: "create_booking",
      productId: input.productId,
      date: input.date,
      sessionId: input.sessionId,
      participants: [{ count: input.participants }],
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || "",
      notes: input.notes || ""
    });
  }
}

function esjCallClaude() {
  return esjPost("/api/chat", {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: ESJ_SYSTEM,
    tools: ESJ_TOOLS,
    messages: esjMsgs
  });
}

function esjChat(userText) {
  esjMsgs.push({ role: "user", content: userText });
  
  return esjCallClaude().then(function loop(data) {
    if (data.stop_reason === "tool_use") {
      esjMsgs.push({ role: "assistant", content: data.content });
      var toolCalls = data.content.filter(function(b) { return b.type === "tool_use"; });
      return Promise.all(toolCalls.map(function(b) {
        return Promise.resolve(esjHandleTool(b.name, b.input)).then(function(result) {
          return { type: "tool_result", tool_use_id: b.id, content: JSON.stringify(result) };
        });
      })).then(function(results) {
        esjMsgs.push({ role: "user", content: results });
        return esjCallClaude().then(loop);
      });
    }
    var textBlock = data.content && data.content.find(function(b) { return b.type === "text"; });
    var txt = textBlock ? textBlock.text : "Mi dispiace, riprova tra un momento.";
    esjMsgs.push({ role: "assistant", content: txt });
    return txt;
  });
}

function esjFmt(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function esjAddMsg(role, text) {
  var typing = document.getElementById("esj-typing");
  if (typing) typing.classList.remove("on");
  var d = document.createElement("div");
  d.className = "esj-msg " + (role === "user" ? "user" : "bot");
  d.innerHTML = "<div class=\"esj-bbl\">" + esjFmt(text) + "</div>";
  var msgs = document.getElementById("esj-msgs");
  msgs.insertBefore(d, typing);
  msgs.scrollTop = msgs.scrollHeight;
}

function esjSend(text) {
  if (!text || !text.trim() || esjBusy) return;
  esjBusy = true;
  var sendBtn = document.getElementById("esj-send");
  var inp = document.getElementById("esj-inp");
  var qr = document.getElementById("esj-qr");
  if (sendBtn) sendBtn.disabled = true;
  if (qr) qr.style.display = "none";
  esjAddMsg("user", text);
  if (inp) { inp.value = ""; inp.style.height = "auto"; }
  var typing = document.getElementById("esj-typing");
  if (typing) { typing.classList.add("on"); }
  var msgs = document.getElementById("esj-msgs");
  if (msgs) msgs.scrollTop = msgs.scrollHeight;

  esjChat(text).then(function(reply) {
    esjAddMsg("bot", reply);
    esjBusy = false;
    if (sendBtn) sendBtn.disabled = false;
    if (inp) inp.focus();
  }).catch(function(err) {
    console.error("ESJ error:", err);
    esjAddMsg("bot", "Mi dispiace, problema di connessione. Contattaci direttamente.");
    esjBusy = false;
    if (sendBtn) sendBtn.disabled = false;
  });
}

window.esjQuick = function(t) { esjSend(t); };

function esjInit() {
  // Inject fonts
  var f = document.createElement("link");
  f.rel = "stylesheet";
  f.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
  document.head.appendChild(f);

  // Inject CSS
  var style = document.createElement("style");
  style.textContent = ":root{--esj-stone:#1c1814;--esj-stone2:#2a231c;--esj-gold:#c8a97e;--esj-gold2:#e2c99a;--esj-cream:#f4ede3;--esj-muted:#8a7a68;--esj-border:rgba(200,169,126,0.18);--esj-radius:18px;--esj-shadow:0 24px 64px rgba(0,0,0,0.55),0 4px 16px rgba(0,0,0,0.3)}#esj-fab{position:fixed;bottom:28px;right:28px;width:62px;height:62px;background:linear-gradient(135deg,#c8a97e,#a8844f);border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(200,169,126,0.4),0 2px 8px rgba(0,0,0,0.3);transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s;z-index:99998}#esj-fab:hover{transform:scale(1.1)}#esj-fab svg{width:26px;height:26px;fill:#1c1814}#esj-fab .esj-ico-close{display:none}#esj-fab.open .esj-ico-chat{display:none}#esj-fab.open .esj-ico-close{display:block}#esj-badge{position:absolute;top:-3px;right:-3px;width:20px;height:20px;background:#e05c3a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Jost,sans-serif;font-size:1rem;color:white;font-weight:500}#esj-widget{position:fixed;bottom:104px;right:28px;width:390px;max-width:calc(100vw - 40px);height:580px;max-height:calc(100vh - 130px);background:var(--esj-stone);border:1px solid var(--esj-border);border-radius:var(--esj-radius);box-shadow:var(--esj-shadow);display:flex;flex-direction:column;overflow:hidden;z-index:99997;opacity:0;transform:translateY(20px) scale(0.97);pointer-events:none;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(.34,1.2,.64,1)}#esj-widget.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}.esj-header{background:linear-gradient(135deg,#2a211a,#1e1812);border-bottom:1px solid var(--esj-border);padding:0.9rem 1.2rem;display:flex;align-items:center;gap:0.8rem;flex-shrink:0}.esj-avatar{width:40px;height:40px;background:linear-gradient(135deg,#c8a97e,#8a5e2e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Cormorant Garamond,serif;font-size:1.3rem;color:#1c1814;font-weight:600;flex-shrink:0}.esj-hname{font-family:Cormorant Garamond,serif;font-size:1.1rem;color:var(--esj-cream);letter-spacing:0.03em}.esj-hsub{font-family:Jost,sans-serif;font-size:1rem;color:var(--esj-gold);letter-spacing:0.1em;text-transform:uppercase;margin-top:1px}.esj-dot{width:7px;height:7px;background:#5cb85c;border-radius:50%;margin-left:auto;animation:esj-pulse 2s infinite;flex-shrink:0}@keyframes esj-pulse{0%,100%{opacity:1}50%{opacity:0.4}}.esj-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;scroll-behavior:smooth}.esj-msg{max-width:87%}.esj-msg.user{align-self:flex-end}.esj-msg.bot{align-self:flex-start}.esj-bbl{padding:0.72rem 1rem;border-radius:14px;font-family:Jost,sans-serif;font-size:0.83rem;line-height:1.65}.esj-msg.user .esj-bbl{background:linear-gradient(135deg,#c8a97e,#a86e30);color:#1c1814;border-bottom-right-radius:4px}.esj-msg.bot .esj-bbl{background:var(--esj-stone2);color:var(--esj-cream);border:1px solid var(--esj-border);border-bottom-left-radius:4px}.esj-bbl strong{color:var(--esj-gold2)}.esj-bbl em{color:var(--esj-gold);font-style:italic}.esj-typing{display:none;align-self:flex-start;padding:0.7rem 1rem;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:14px;border-bottom-left-radius:4px;gap:5px;align-items:center}.esj-typing.on{display:flex}.esj-typing span{width:6px;height:6px;background:var(--esj-gold);border-radius:50%;animation:esj-bounce 1.2s infinite}.esj-typing span:nth-child(2){animation-delay:.2s}.esj-typing span:nth-child(3){animation-delay:.4s}@keyframes esj-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}.esj-qr-wrap{padding:0.5rem 0.9rem;display:flex;flex-wrap:wrap;gap:0.4rem;border-top:1px solid var(--esj-border);background:rgba(28,24,20,0.7);flex-shrink:0}.esj-qr{font-family:Jost,sans-serif;font-size:0.72rem;padding:0.28rem 0.7rem;border:1px solid rgba(200,169,126,0.28);border-radius:20px;color:var(--esj-gold);background:transparent;cursor:pointer;transition:all 0.2s;white-space:nowrap}.esj-qr:hover{background:rgba(200,169,126,0.1);border-color:var(--esj-gold)}.esj-inp-wrap{padding:0.75rem 1rem;border-top:1px solid var(--esj-border);display:flex;gap:0.6rem;align-items:flex-end;background:#18140f;flex-shrink:0}.esj-inp{flex:1;background:var(--esj-stone2);border:1px solid var(--esj-border);border-radius:12px;padding:0.6rem 0.9rem;color:var(--esj-cream);font-family:Jost,sans-serif;font-size:0.83rem;resize:none;min-height:40px;max-height:100px;outline:none;transition:border-color 0.2s;line-height:1.4}.esj-inp::placeholder{color:var(--esj-muted)}.esj-inp:focus{border-color:rgba(200,169,126,0.5)}.esj-btn-send{width:38px;height:38px;background:linear-gradient(135deg,#c8a97e,#a86e30);border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s,opacity 0.2s;flex-shrink:0}.esj-btn-send:hover{transform:scale(1.08)}.esj-btn-send:disabled{opacity:0.35;cursor:not-allowed;transform:none}.esj-btn-send svg{width:15px;height:15px;fill:#1c1814}.esj-foot{text-align:center;padding:0.35rem;font-family:Jost,sans-serif;font-size:0.58rem;color:rgba(138,122,104,0.45);letter-spacing:0.08em;flex-shrink:0}";
  document.head.appendChild(style);

  // Inject HTML
  var container = document.createElement("div");
  container.innerHTML = '<button id="esj-fab" aria-label="Prenota con assistente IA"><span id="esj-badge">1</span><svg class="esj-ico-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><svg class="esj-ico-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button><div id="esj-widget" role="dialog"><div class="esj-header"><div class="esj-avatar">S</div><div style="flex:1;min-width:0"><div class="esj-hname">Sofia - Eremo di San Giusto</div><div class="esj-hsub">Assistente Prenotazioni - Ostuni, Puglia</div></div><div class="esj-dot"></div></div><div class="esj-msgs" id="esj-msgs"><div class="esj-typing" id="esj-typing"><span></span><span></span><span></span></div></div><div class="esj-qr-wrap" id="esj-qr"><button class="esj-qr" onclick="esjQuick(\'Vorrei prenotare una camera\')">Prenota</button><button class="esj-qr" onclick="esjQuick(\'Quali camere avete?\')">Camere</button><button class="esj-qr" onclick="esjQuick(\'Quali esperienze offrite?\')">Esperienze</button><button class="esj-qr" onclick="esjQuick(\'Quali sono i prezzi?\')">Prezzi</button></div><div class="esj-inp-wrap"><textarea id="esj-inp" class="esj-inp" placeholder="Scrivi un messaggio..." rows="1" aria-label="Messaggio"></textarea><button id="esj-send" class="esj-btn-send" aria-label="Invia" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div><div class="esj-foot">Powered by Claude AI - Eremo di San Giusto</div></div>';
  document.body.appendChild(container);

  // Wire up events
  var fab = document.getElementById("esj-fab");
  var widget = document.getElementById("esj-widget");
  var inp = document.getElementById("esj-inp");
  var sendBtn = document.getElementById("esj-send");
  var opened = false;

  fab.addEventListener("click", function() {
    widget.classList.toggle("open");
    fab.classList.toggle("open");
    var badge = document.getElementById("esj-badge");
    if (badge) badge.remove();

    if (!opened) {
      opened = true;
      var typing = document.getElementById("esj-typing");
      setTimeout(function() {
        if (typing) typing.classList.add("on");
        setTimeout(function() {
          esjChat("Ciao, presentati brevemente e chiedi come posso aiutarti.").then(function(reply) {
            esjAddMsg("bot", reply);
          }).catch(function() {
            esjAddMsg("bot", "Benvenuto! Sono Sofia. Come posso aiutarti oggi?");
          });
        }, 600);
      }, 300);
    }
  });

  inp.addEventListener("input", function() {
    sendBtn.disabled = !inp.value.trim() || esjBusy;
    inp.style.height = "auto";
    inp.style.height = Math.min(inp.scrollHeight, 100) + "px";
  });

  inp.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) esjSend(inp.value);
    }
  });

  sendBtn.addEventListener("click", function() { esjSend(inp.value); });
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", esjInit);
} else {
  esjInit();
}

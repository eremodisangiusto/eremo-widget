// ============================================================
// Eremo di San Giusto — Esperienze Data v1.0
// Tutte le schede prodotto per il sistema custom (no Bókun)
// ============================================================

var ESJ_EXPERIENCES = [
  {
    id: "liquid-gold",
    name: "Liquid Gold",
    nameEn: "Liquid Gold",
    sub: "Frantoio ipogeo · Grotta naturale · Uliveto secolare · Degustazione EVO",
    subEn: "Hypogean mill · Natural cave · Ancient olive grove · EVO tasting",
    duration: "2–2.5 ore",
    durationEn: "2–2.5 hours",
    difficulty: "Facile",
    difficultyEn: "Easy",
    season: "Tutto l'anno",
    seasonEn: "Year-round",
    maxGuests: 12,
    startTimes: ["10:30", "17:00"],
    advanceBooking: "24h",
    type: "Food & Cultura",
    typeEn: "Food & Culture",
    priceFrom: 35,
    prices: [
      { label: "Standard (2–12 pp)",   labelEn: "Standard (2–12 guests)", val: "€35/pp" },
      { label: "Gruppo privato",        labelEn: "Private group",          val: "€50/pp" },
      { label: "Bambini <12 anni",      labelEn: "Children under 12",      val: "€10" }
    ],
    desc: "Puglia produce più olio d'oliva di qualsiasi altra regione italiana — e probabilmente alcuni dei migliori al mondo. All'Eremo di San Giusto, questa tradizione non è uno sfondo. È la terra sotto i tuoi piedi, gli alberi che ombreggiano il cammino e l'antica pietra sotto le mani.\n\nL'esperienza inizia sottoterra. Scavato nella roccia viva di Monte Morrone, il frantoio ipogeo è uno degli spazi più straordinari della proprietà. Poi la visita continua nella grotta naturale adiacente — silenziosa, fresca, di rara bellezza geologica. Si emerge nella luce: una passeggiata tra gli ulivi secolari, alcuni con secoli di vita, seguita da una degustazione guidata di 3–4 varietà di olio EVO con pane e bruschette.",
    descEn: "Puglia produces more olive oil than any other Italian region. At Eremo di San Giusto, this tradition is not a backdrop — it is the ground beneath your feet.\n\nThe experience begins underground. Carved into the living rock of Monte Morrone, the estate's hypogean oil mill is one of the most remarkable spaces on the property. The visit continues into an adjacent natural cave — silent, cool, of rare geological beauty. You then emerge into the light: a walk through the ancient olive grove, followed by a guided tasting of 3–4 EVO varieties with bread and bruschette.",
    included: [
      "Visita guidata al frantoio ipogeo con commento storico",
      "Visita alla grotta naturale adiacente",
      "Passeggiata nell'oliveto con guida agronomica e culturale",
      "Degustazione 3–4 varietà di olio EVO dell'azienda",
      "Pane e bruschette per l'abbinamento",
      "Guida stampata sull'olivicoltura pugliese",
      "Acqua per tutta la durata"
    ],
    includedEn: [
      "Guided visit to the hypogean mill with historical commentary",
      "Visit to the adjacent natural cave",
      "Walk through the ancient olive grove with agronomic guidance",
      "Tasting of 3–4 estate EVO olive oil varieties",
      "Bread and bruschette for pairing",
      "Printed guide to Puglian olive cultivation",
      "Water throughout"
    ],
    excluded: [
      "Vino o bevande alcoliche (acquistabili separatamente)",
      "Olio in bottiglia (acquistabile direttamente in azienda)",
      "Pasti aggiuntivi",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Wine or alcoholic beverages (available separately)",
      "Bottled oil to take home (available on site)",
      "Additional meals",
      "Transfer to/from Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Scarpe comode chiuse (il percorso include gradini e terreno irregolare)",
      "Abbigliamento comodo",
      "Macchina fotografica — gli ulivi meritano"
    ],
    bringEn: [
      "Comfortable closed-toe shoes (path includes steps and uneven terrain)",
      "Comfortable clothing",
      "Camera — the olive trees deserve it"
    ],
    notes: "Il frantoio e la grotta richiedono alcuni gradini — non completamente accessibile a sedie a rotelle. In stagione di raccolta (ottobre–novembre) l'esperienza include la degustazione dell'olio nuovo direttamente dal frantoio.",
    notesEn: "The mill and cave require steps — not fully wheelchair accessible. During harvest season (Oct–Nov), the experience includes tasting of freshly pressed olio nuovo.",
    policy: [
      { label: "Cancellazione gratuita", labelEn: "Free cancellation",   val: "fino a 48h prima",    valEn: "up to 48h before",   color: "green" },
      { label: "Rimborso 50%",           labelEn: "50% refund",          val: "tra 24h e 48h prima", valEn: "between 24–48h",     color: "amber" },
      { label: "Nessun rimborso",        labelEn: "No refund",           val: "entro 24h",           valEn: "within 24h",         color: "red"   },
      { label: "Maltempo estremo",       labelEn: "Extreme weather",     val: "Rimborso completo",   valEn: "Full refund",        color: "green" }
    ]
  },

  {
    id: "stargazing",
    name: "Stargazing",
    nameEn: "Stargazing",
    sub: "Telescopio professionale · Guida astrofilo · Mappa stellare · Monte Morrone",
    subEn: "Professional telescope · Astrophile guide · Star map · Monte Morrone",
    duration: "2 ore",
    durationEn: "2 hours",
    difficulty: "Facile",
    difficultyEn: "Easy",
    season: "Aprile – Ottobre",
    seasonEn: "April – October",
    maxGuests: 10,
    startTimes: ["22:00"],
    advanceBooking: "24h",
    type: "Astronomia & Outdoor",
    typeEn: "Astronomy & Outdoor",
    priceFrom: 35,
    prices: [
      { label: "Standard (2–10 pp)",  labelEn: "Standard (2–10 guests)", val: "€35/pp" },
      { label: "Gruppo privato",       labelEn: "Private group",          val: "€45/pp" },
      { label: "Bambini <12 anni",     labelEn: "Children under 12",      val: "€15" }
    ],
    desc: "Monte Morrone si alza sopra i tetti bianchi di Ostuni con un dono raro: il buio. Lontano dall'inquinamento luminoso della costa, il cielo notturno è uno dei più limpidi della Puglia — una vasta tela indisturbata dove la Via Lattea si stende dall'orizzonte all'orizzonte nelle notti d'estate.\n\nDue ore di osservazione a occhio nudo e al telescopio con una guida astrofilo esperta. Si imparano costellazioni, pianeti e oggetti del cielo profondo prima di prendere posto all'oculare di un telescopio astronomico professionale per osservare crateri lunari, gli anelli di Saturno, le lune di Giove e, nelle notti eccezionali, nebulose lontane.",
    descEn: "Monte Morrone rises above the white rooftops of Ostuni with one rare and precious gift: darkness. Far from the light pollution of the coast, the night sky is one of the clearest in Puglia — a vast, undisturbed canvas where the Milky Way stretches from horizon to horizon on a good summer night.\n\nTwo hours of naked-eye and telescopic observation with an expert astrophile guide. Learn to navigate the night sky first — constellations, planets, deep-sky objects — then take turns at a professional telescope to observe the Moon, Saturn's rings, Jupiter's moons and, on exceptional nights, distant nebulae.",
    included: [
      "Telescopio professionale per tutta la sessione",
      "Guida astrofilo esperta in italiano e inglese",
      "Mappa stellare personalizzata per data e luogo",
      "Tisane, caffè e cioccolata calda",
      "Coperte e sedute outdoor comode"
    ],
    includedEn: [
      "Professional astronomical telescope for the full session",
      "Expert astrophile guide (Italian and English)",
      "Personalised star map for the session date and location",
      "Herbal teas, coffee and hot chocolate",
      "Blankets and comfortable outdoor seating"
    ],
    excluded: [
      "Binocoli personali (disponibili su richiesta)",
      "Pasti",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Personal binoculars (available on request)",
      "Food or meals",
      "Transfer to/from Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Strati caldi — le temperature scendono significativamente dopo mezzanotte",
      "Scarpe comode per terreno outdoor irregolare",
      "Torcia con luce rossa se disponibile (preserva la visione notturna)",
      "Curiosità e pazienza — i momenti migliori arrivano a chi aspetta"
    ],
    bringEn: [
      "Warm layers — temperatures drop significantly after midnight even in summer",
      "Comfortable shoes suitable for uneven outdoor terrain",
      "Red-light torch if available (preserves night vision)",
      "Curiosity and patience — the best moments come to those who wait"
    ],
    notes: "La sessione inizia alle 22:00 in piena oscurità. Rimborso completo se la copertura nuvolosa supera il 50% all'orario di inizio — valutazione della guida è definitiva. Agosto: picco delle Perseidi (12–13 agosto).",
    notesEn: "Session starts at 22:00 in full darkness. Full refund if cloud cover exceeds 50% at start time — guide's assessment is final. August: Perseid meteor shower peak (Aug 12–13).",
    policy: [
      { label: "Cancellazione gratuita",  labelEn: "Free cancellation",  val: "fino a 48h prima",       valEn: "up to 48h before",       color: "green" },
      { label: "Rimborso 50%",            labelEn: "50% refund",         val: "tra 24h e 48h prima",    valEn: "between 24–48h",         color: "amber" },
      { label: "Nessun rimborso",         labelEn: "No refund",          val: "entro 24h",              valEn: "within 24h",             color: "red"   },
      { label: "Cielo nuvoloso >50%",     labelEn: "Cloud cover >50%",   val: "Rimborso completo",      valEn: "Full refund",            color: "green" }
    ]
  },

  {
    id: "sunset-serenade",
    name: "Sunset Serenade",
    nameEn: "Sunset Serenade",
    sub: "Fisarmonica & Mandolino · Vino DOC · Tagliere prodotti pugliesi",
    subEn: "Accordion & Mandolin · DOC wine · Puglian produce board",
    duration: "90 minuti",
    durationEn: "90 minutes",
    difficulty: "—",
    difficultyEn: "—",
    season: "Aprile – Ottobre",
    seasonEn: "April – October",
    maxGuests: 20,
    startTimes: ["variabile — 30 min prima del tramonto"],
    advanceBooking: "48h",
    type: "Musica & Food",
    typeEn: "Music & Food",
    priceFrom: 60,
    prices: [
      { label: "Standard (2–20 pp)",     labelEn: "Standard (2–20 guests)",    val: "€60/pp" },
      { label: "Coppia romantica",        labelEn: "Romantic couple",           val: "€130 flat" },
      { label: "Bambini <16 anni",        labelEn: "Children under 16",         val: "€15" }
    ],
    desc: "Al tramonto sulla terrazza dell'Eremo, un duo professionale di fisarmonica e mandolino prende posto e inizia a suonare. La fisarmonica respira il suo primo accordo. Il mandolino risponde. E la serata appartiene al Sud Italia.\n\nUn concerto live di 90 minuti che attinge alla ricca tradizione della musica popolare del Sud: la pizzica ipnotica del Salento, l'energia travolgente della tarantella, la tenera malinconia della serenata. Con un bicchiere di Primitivo o Negroamaro in mano e un tagliere di prodotti locali davanti — burrata, taralli, formaggi, salumi stagionali — mentre i colori del cielo cambiano e le luci di Ostuni cominciano a brillare nella valle.",
    descEn: "As the sun descends over the Valle d'Itria, a professional accordion and mandolin duo takes place on the Eremo terrace. The accordion breathes out its first chord. The mandolin answers. And suddenly, the evening belongs to southern Italy.\n\nA 90-minute live concert drawing on the rich tradition of southern Italian folk music: the hypnotic pizzica, the whirling tarantella, the tender serenata. With a glass of Primitivo or Negroamaro in hand and a board of local produce — burrata, taralli, cheeses, seasonal cured meats — as the sky shifts and the lights of Ostuni begin to flicker in the valley.",
    included: [
      "Concerto live 90 minuti — duo fisarmonica e mandolino",
      "Un calice di vino DOC Primitivo o Negroamaro",
      "Tagliere condiviso: burrata/formaggio fresco, taralli, salumi, olio",
      "Sedute outdoor comode sulla terrazza panoramica"
    ],
    includedEn: [
      "90-minute live concert — accordion and mandolin duo",
      "One glass of DOC Primitivo or Negroamaro per person",
      "Shared produce board: burrata/fresh cheese, taralli, cured meats, olive oil",
      "Comfortable outdoor seating on the panoramic terrace"
    ],
    excluded: [
      "Vino o cibo aggiuntivo oltre al servizio incluso",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Additional food or wine beyond the included serving",
      "Transfer to/from Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Abbigliamento comodo per la serata",
      "Strati leggeri se la serata si raffredda",
      "Fotocamera — i tramonti dell'Eremo meritano"
    ],
    bringEn: [
      "Comfortable evening clothing",
      "Light layers if the evening cools down",
      "Camera — the Eremo sunsets are unmissable"
    ],
    notes: "L'orario di inizio varia ogni mese (30 minuti prima del tramonto locale). Verrà confermato alla prenotazione. Contiene prodotti caseari (avvisare in caso di allergie). In caso di pioggia o vento forte: rimborso completo o reschedule gratuito.",
    notesEn: "Start time varies monthly (30 min before local sunset) — confirmed at booking. Contains dairy products (notify us of allergies). Rain or strong wind: full refund or free reschedule.",
    policy: [
      { label: "Cancellazione gratuita", labelEn: "Free cancellation",  val: "fino a 48h prima",    valEn: "up to 48h before",  color: "green" },
      { label: "Rimborso 50%",           labelEn: "50% refund",         val: "tra 24h e 48h prima", valEn: "between 24–48h",    color: "amber" },
      { label: "Nessun rimborso",        labelEn: "No refund",          val: "entro 24h",           valEn: "within 24h",        color: "red"   },
      { label: "Pioggia / vento forte",  labelEn: "Rain or strong wind",val: "Rimborso o reschedule",valEn:"Refund or reschedule",color:"green" }
    ]
  },

  {
    id: "cooking-class",
    name: "Cooking Class",
    nameEn: "Cooking Class",
    sub: "Orecchiette fatte a mano · Cacioricotta · Chef locale · Cucina outdoor",
    subEn: "Handmade orecchiette · Cacioricotta · Local chef · Outdoor kitchen",
    duration: "2–3 ore",
    durationEn: "2–3 hours",
    difficulty: "Facile",
    difficultyEn: "Easy",
    season: "Tutto l'anno",
    seasonEn: "Year-round",
    maxGuests: 8,
    startTimes: ["11:00", "18:30"],
    advanceBooking: "48h",
    type: "Cucina & Cultura",
    typeEn: "Cooking & Culture",
    priceFrom: 35,
    prices: [
      { label: "Standard (2–8 pp)",   labelEn: "Standard (2–8 guests)", val: "€35/pp" },
      { label: "Sessione privata",     labelEn: "Private session",       val: "€50/pp" },
      { label: "Bambini <12 anni",     labelEn: "Children under 12",     val: "€18" }
    ],
    desc: "Non c'è modo migliore di capire un posto che attraverso il suo cibo. All'Eremo di San Giusto imparerai a fare le orecchiette — la pasta iconica della Puglia — completamente a mano, guidato da uno chef locale professionista nella cucina outdoor immersa tra i trulli e gli ulivi della Valle d'Itria.\n\nL'orecchietta è una delle forme di pasta più antiche del Sud Italia, tradizionalmente fatta senza uova, con nient'altro che un coltello e un pollice. Imparerai la tecnica passo dopo passo, poi ti siederai a tavola per mangiare quello che hai fatto: orecchiette condite con cacioricotta fresca grattugiata — il formaggio di pecora pungente e saporito che è l'anima di questo piatto — accompagnate da un bicchiere di vino pugliese. Uscirai con le mani infarinate, lo stomaco pieno e una storia da raccontare.",
    descEn: "There is no better way to understand a place than through its food. At Eremo di San Giusto, you will learn to make orecchiette — the iconic ear-shaped pasta of Puglia — entirely by hand, guided by a local professional chef in our outdoor kitchen surrounded by trulli and olive trees.\n\nOrecchiette is one of the oldest pasta shapes in southern Italy, traditionally made without eggs, shaped with nothing more than a knife and a thumb. You will master the technique step by step, then sit down to enjoy what you have made: orecchiette with freshly grated cacioricotta — the sharp, tangy sheep's milk cheese that is the soul of this dish — paired with a glass of local Puglian wine.",
    included: [
      "Tutti gli ingredienti freschi a km zero (semola, cacioricotta, verdure di stagione, olio)",
      "Uso completo della cucina outdoor attrezzata e di tutti gli utensili",
      "Guida di uno chef locale professionista per tutta la sessione",
      "Un calice di vino pugliese durante la degustazione",
      "Ricetta stampata da portare a casa",
      "Acqua e bevande analcoliche per tutta la durata",
      "Sessione mattutina: pranzo · Sessione serale: cena"
    ],
    includedEn: [
      "All fresh, locally sourced ingredients (semolina, cacioricotta, seasonal vegetables, olive oil)",
      "Full use of the outdoor equipped kitchen and all tools",
      "Guidance from a professional local chef throughout",
      "A glass of local Puglian wine during the tasting",
      "Printed recipe card to take home",
      "Water and soft drinks throughout",
      "Morning session: lunch included · Evening session: dinner included"
    ],
    excluded: [
      "Cibo o bevande aggiuntive oltre quanto incluso",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Additional food or drinks beyond what is listed",
      "Transfer to/from Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Abiti comodi che possono infarinarsi",
      "Scarpe chiuse (obbligatorie in cucina)",
      "Capelli lunghi raccolti — i grembiuli sono forniti",
      "Buon appetito"
    ],
    bringEn: [
      "Comfortable clothes you don't mind getting floury",
      "Closed-toe shoes (required in the kitchen area)",
      "Long hair tied back — aprons are provided",
      "A good appetite"
    ],
    notes: "Contiene glutine e latticini. Avvisare in fase di prenotazione in caso di allergie o intolleranze. In caso di maltempo che renda inutilizzabile la cucina outdoor: reschedule gratuito.",
    notesEn: "Contains gluten and dairy. Notify us of allergies or intolerances at booking. If severe weather affects the outdoor kitchen: free reschedule.",
    policy: [
      { label: "Cancellazione gratuita", labelEn: "Free cancellation",   val: "fino a 48h prima",    valEn: "up to 48h before",  color: "green" },
      { label: "Rimborso 50%",           labelEn: "50% refund",          val: "tra 24h e 48h prima", valEn: "between 24–48h",    color: "amber" },
      { label: "Nessun rimborso",        labelEn: "No refund",           val: "entro 24h (ingredienti già acquistati)", valEn: "within 24h (ingredients purchased)", color: "red" },
      { label: "Maltempo",               labelEn: "Bad weather",         val: "Reschedule gratuito", valEn: "Free reschedule",   color: "green" }
    ]
  },

  {
    id: "massaggi",
    name: "Rituali di Benessere",
    nameEn: "Wellness Rituals",
    sub: "Massaggi professionali · Osteopata certificato · Trullo o terrazza esterna",
    subEn: "Professional massage · Certified osteopath · Trullo or outdoor terrace",
    duration: "60 minuti",
    durationEn: "60 minutes",
    difficulty: "—",
    difficultyEn: "—",
    season: "Aprile – Ottobre",
    seasonEn: "April – October",
    maxGuests: 4,
    startTimes: ["09:00", "10:30", "16:00", "17:30"],
    advanceBooking: "48h",
    type: "Benessere",
    typeEn: "Wellness",
    priceFrom: 70,
    prices: [
      { label: "Massaggio rilassante",      labelEn: "Relaxing massage",       val: "€70/pp" },
      { label: "Massaggio tonificante",     labelEn: "Toning massage",         val: "€70/pp" },
      { label: "Deep tissue / decontraente",labelEn: "Deep tissue massage",    val: "€80/pp" }
    ],
    desc: "Nel silenzio della natura, dove la luce filtra tra gli ulivi antichi e il tempo rallenta, l'Eremo di San Giusto offre qualcosa di raro: uno spazio in cui fermarsi davvero.\n\nI trattamenti sono eseguiti da un osteopata certificato e operatore del benessere professionista, in uno dei due ambienti straordinari: l'interno in pietra del trullo — con le sue pareti di calcarenite che mantengono una temperatura fresca naturale, il soffitto conico che crea un'atmosfera di straordinaria quiete — oppure la terrazza esterna attrezzata, immersa tra ulivi antichi, il cielo aperto e i suoni della campagna pugliese.",
    descEn: "In the silence of nature, where light filters through ancient olive trees and time slows to a different rhythm, Eremo di San Giusto offers something rare: a space in which to truly stop.\n\nTreatments are performed by a certified osteopath and professional wellness practitioner, in one of two extraordinary settings: the intimate stone interior of the trullo — with its naturally cool calcarenite walls and conical ceiling creating extraordinary stillness — or the equipped outdoor terrace surrounded by ancient olive trees, open sky and the sounds of the Puglian countryside.",
    included: [
      "Sessione completa di 60 minuti con operatore certificato",
      "Uso del trullo o della terrazza esterna preparata per il trattamento",
      "Lettino professionale, asciugamani, oli e attrezzatura completa",
      "Acqua e tisana prima e dopo la sessione",
      "Tempo libero nei giardini dell'Eremo dopo il trattamento"
    ],
    includedEn: [
      "Full 60-minute session by certified wellness practitioner",
      "Use of trullo interior or equipped outdoor terrace",
      "Professional massage table, towels, oils and all equipment",
      "Water and herbal tea before and after the session",
      "Post-session quiet time in the estate grounds"
    ],
    excluded: [
      "Pasti o cibo aggiuntivo",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale",
      "Sessioni aggiuntive oltre al trattamento prenotato"
    ],
    excludedEn: [
      "Meals or additional food",
      "Transfer to/from Ostuni",
      "Personal travel insurance",
      "Additional sessions beyond the booked treatment"
    ],
    bring: [
      "Abbigliamento comodo e ampio — ti sarà chiesto di spogliarti al tuo livello di comfort",
      "Evitare pasti abbondanti nelle 2 ore precedenti",
      "Arrivare 10 minuti prima per ambientarsi"
    ],
    bringEn: [
      "Comfortable, loose-fitting clothing — you will undress to your comfort level",
      "Avoid heavy meals in the 2 hours before the session",
      "Arrive 10 minutes early to settle and transition"
    ],
    notes: "Minimo 2 partecipanti per sessione. Scelta del setting (trullo/terrazza) alla prenotazione, modificabile il giorno stesso. Il massaggio deep tissue non è raccomandato nel primo trimestre di gravidanza. Comunicare condizioni mediche, infortuni o controindicazioni in fase di prenotazione.",
    notesEn: "Minimum 2 participants per session. Setting choice (trullo/terrace) at booking, adjustable on the day. Deep tissue massage not recommended during first trimester of pregnancy. Inform practitioner of medical conditions, injuries or contraindications at booking.",
    policy: [
      { label: "Cancellazione gratuita", labelEn: "Free cancellation",   val: "fino a 48h prima",    valEn: "up to 48h before",  color: "green" },
      { label: "Rimborso 50%",           labelEn: "50% refund",          val: "tra 24h e 48h prima", valEn: "between 24–48h",    color: "amber" },
      { label: "Nessun rimborso",        labelEn: "No refund",           val: "entro 24h",           valEn: "within 24h",        color: "red"   },
      { label: "Min. 2 pp non raggiunto",labelEn: "Min. 2 guests not met",val: "Rimborso completo o reschedule", valEn: "Full refund or reschedule", color: "green" }
    ]
  },

  {
    id: "trekking",
    name: "Trekking Monte Morrone",
    nameEn: "Trekking Monte Morrone",
    sub: "Sentieri sacri · Santuari antichi · Valle d'Itria · Ostuni",
    subEn: "Sacred paths · Ancient sanctuaries · Valle d'Itria · Ostuni",
    duration: "2–4 ore",
    durationEn: "2–4 hours",
    difficulty: "Facile",
    difficultyEn: "Easy",
    season: "Tutto l'anno",
    seasonEn: "Year-round",
    maxGuests: 10,
    startTimes: ["08:00", "17:00"],
    advanceBooking: "24h",
    type: "Outdoor & Cultura",
    typeEn: "Outdoor & Culture",
    priceFrom: 25,
    prices: [
      { label: "Percorso corto 5km",    labelEn: "Short route 5km",    val: "€25/pp" },
      { label: "Percorso lungo 10km",   labelEn: "Long route 10km",    val: "€35/pp" },
      { label: "Gruppo privato",        labelEn: "Private group",      val: "€250 flat" },
      { label: "Bambini <12 anni",      labelEn: "Children under 12",  val: "€8–12" }
    ],
    desc: "Scopri l'anima della Puglia a piedi. Una passeggiata guidata su Monte Morrone — l'antica collina su cui sorge l'Eremo di San Giusto — alla scoperta dei due santuari più venerati della regione: il Santuario di Sant'Oronzo e il Santuario di San Biagio.\n\nSia che tu scelga il dolce percorso da 5km sia il tracciato più esteso da 10km, camminerai attraverso la macchia mediterranea profumata, oliveti secolari e percorsi in pietra calcarea levigati da generazioni di pellegrini. La guida condividerà la storia e le leggende di entrambi i santuari, la geologia della Valle d'Itria e le tradizioni delle comunità agricole locali. È il turismo lento nella sua forma più autentica.",
    descEn: "Discover the soul of Puglia on foot. A guided walk across Monte Morrone — the ancient hill on which Eremo di San Giusto sits — exploring two of the region's most revered sanctuaries: the Sanctuary of Sant'Oronzo and the Sanctuary of San Biagio.\n\nWhether you choose the gentle 5km loop or the more expansive 10km trail, you will walk through fragrant Mediterranean scrubland, centuries-old olive groves and limestone paths worn smooth by generations of pilgrims. Your guide shares the history and legends of both sanctuaries, the geology of the Itria Valley and the traditions of local farming communities.",
    included: [
      "Acqua fresca e bevande stagionali per tutta la camminata",
      "Guida locale esperta in italiano e inglese (il tuo host)",
      "Mappa del percorso e note stampate sui santuari",
      "Orientamento completo su flora, fauna e storia culturale locale"
    ],
    includedEn: [
      "Fresh water and seasonal beverages throughout",
      "Expert local guide in Italian and English (your host)",
      "Route maps and printed notes on the sanctuaries",
      "Full orientation on local flora, fauna and cultural history"
    ],
    excluded: [
      "Calzature da trekking e attrezzatura personale",
      "Pasti o picnic (disponibili su richiesta al momento della prenotazione)",
      "Trasferimento da/per Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Hiking footwear and personal equipment",
      "Meals or picnic provisions (available on request at booking)",
      "Transfer to/from Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Scarpe chiuse comode o stivaletti leggeri da trekking",
      "Protezione solare: cappello, crema, occhiali da sole",
      "Strati leggeri (mattine e serate possono essere fresche)",
      "Borraccia e piccolo zaino",
      "Fotocamera o smartphone carico — i panorami lo meritano"
    ],
    bringEn: [
      "Comfortable closed-toe shoes or light hiking boots",
      "Sun protection: hat, sunscreen, sunglasses",
      "Light layers (mornings and evenings can be cool)",
      "Water bottle and small backpack",
      "Camera or charged smartphone — the views deserve it"
    ],
    notes: "Il percorso da 5km è adatto a tutti i livelli di forma fisica. Il percorso da 10km include discese su terreno carsico. In caso di maltempo grave: reschedule gratuito.",
    notesEn: "The 5km route is suitable for all fitness levels. The 10km route includes descents on karst limestone terrain. In case of severe weather: free reschedule.",
    policy: [
      { label: "Cancellazione gratuita", labelEn: "Free cancellation",  val: "fino a 48h prima",    valEn: "up to 48h before",  color: "green" },
      { label: "Rimborso 50%",           labelEn: "50% refund",         val: "tra 24h e 48h prima", valEn: "between 24–48h",    color: "amber" },
      { label: "Nessun rimborso",        labelEn: "No refund",          val: "entro 24h",           valEn: "within 24h",        color: "red"   },
      { label: "Maltempo grave",         labelEn: "Severe weather",     val: "Reschedule gratuito", valEn: "Free reschedule",   color: "green" }
    ]
  },

  {
    id: "ciuchino-birichino",
    name: "Ciuchino Birichino",
    nameEn: "Ciuchino Birichino",
    sub: "Parco avventura · Zip-line · Percorsi treetop · Famiglie",
    subEn: "Adventure park · Zip-line · Treetop circuits · Families",
    duration: "2–3 ore",
    durationEn: "2–3 hours",
    difficulty: "Vari livelli",
    difficultyEn: "Multiple levels",
    season: "Aprile – Ottobre",
    seasonEn: "April – October",
    maxGuests: 99,
    startTimes: ["09:30", "15:00"],
    advanceBooking: "24h",
    type: "Avventura & Famiglia",
    typeEn: "Adventure & Family",
    priceFrom: 15,
    prices: [
      { label: "Junior (3–6 anni)",      labelEn: "Junior (3–6 years)",     val: "€15" },
      { label: "Verde (6+ / >110cm)",    labelEn: "Green (6+ / >110cm)",    val: "€25" },
      { label: "Blu (8+ / >120cm)",      labelEn: "Blue (8+ / >120cm)",     val: "€30" },
      { label: "Rosso/Nero (10+ / >130cm)",labelEn:"Red/Black (10+/>130cm)",val: "€35" }
    ],
    desc: "A due passi dall'Eremo di San Giusto, nel bosco mediterraneo di Monte Morrone, il Parco Avventura Ciuchino Birichino è l'avventura perfetta per le famiglie — e per gli adulti che non hanno dimenticato come si arrampica.\n\nSerie di percorsi treetop ad altezze crescenti, una zip-line mozzafiato, ponti di corda, reti da scalata e sfide outdoor progettate per sviluppare fiducia, coordinazione e autentica emozione. Tutti i circuiti sono supervisionati da personale qualificato che fornisce briefing sulla sicurezza e accompagna i gruppi. L'avventura si svolge tra alberi veri e il paesaggio straordinario della Valle d'Itria.",
    descEn: "Right on the doorstep of Eremo di San Giusto, tucked into the Mediterranean woodland of Monte Morrone, the Parco Avventura Ciuchino Birichino is the perfect adventure for families — and for grown-ups who haven't forgotten how to climb.\n\nA series of treetop adventure trails at increasing heights, a thrilling zip-line, rope bridges, climbing nets and outdoor challenges designed to develop confidence, coordination and genuine excitement. All activities are supervised by trained park staff who provide a full safety briefing and accompany groups through the routes.",
    included: [
      "Ingresso al parco e accesso a tutti i circuiti appropriati per età",
      "Zip-line (inclusa in tutti i circuiti tranne Junior)",
      "Attrezzatura di sicurezza completa: imbragatura, casco e moschettoni",
      "Briefing sulla sicurezza e supervisione del personale qualificato",
      "Accesso all'area Junior per bambini 3–6 anni"
    ],
    includedEn: [
      "Park entrance and access to all age-appropriate adventure circuits",
      "Zip-line (included in all circuits except Junior)",
      "Full safety equipment: harness, helmet and carabiner system",
      "Safety briefing and supervision by trained park staff",
      "Access to the Junior area for children aged 3–6"
    ],
    excluded: [
      "Cibo, snack o bevande (portare il proprio o acquistare al parco)",
      "Scarpe chiuse con suola rigida (obbligatorie — non fornite)",
      "Trasferimento da altrove a Ostuni",
      "Assicurazione viaggio personale"
    ],
    excludedEn: [
      "Food, snacks or drinks (bring your own or purchase at the park)",
      "Closed-toe shoes with firm sole (mandatory — not provided)",
      "Transport to the park from elsewhere in Ostuni",
      "Personal travel insurance"
    ],
    bring: [
      "Scarpe chiuse con suola rigida OBBLIGATORIE — no sandali, infradito o scarpe aperte",
      "Abbigliamento comodo e aderente — niente sciarpe, gioielli pendenti",
      "Capelli lunghi raccolti",
      "Borraccia e crema solare fortemente consigliati",
      "Cambio di vestiti per i bambini piccoli — le avventure possono sporcare"
    ],
    bringEn: [
      "Closed-toe shoes with firm sole MANDATORY — no sandals or open shoes",
      "Comfortable, fitted clothing — no loose scarves or open jewellery",
      "Long hair tied back",
      "Water bottle and sunscreen strongly recommended",
      "Change of clothes for young children — adventures can get muddy"
    ],
    notes: "Il parco opera in tutte le condizioni meteo tranne temporali e pioggia forte. In caso di chiusura per meteo: reschedule gratuito. I bambini nell'area Junior devono essere sempre accompagnati da un genitore.",
    notesEn: "The park operates in all weather except thunderstorms and heavy rain. If closed due to weather: free reschedule offered. Children in the Junior area must be accompanied by a parent at all times.",
    policy: [
      { label: "Cancellazione gratuita",   labelEn: "Free cancellation",   val: "fino a 48h prima",     valEn: "up to 48h before",   color: "green" },
      { label: "Rimborso 50%",             labelEn: "50% refund",          val: "tra 24h e 48h prima",  valEn: "between 24–48h",     color: "amber" },
      { label: "Nessun rimborso",          labelEn: "No refund",           val: "entro 24h",            valEn: "within 24h",         color: "red"   },
      { label: "Chiusura per meteo",       labelEn: "Weather closure",     val: "Reschedule gratuito",  valEn: "Free reschedule",    color: "green" }
    ]
  }
];

// Helper: trova esperienza per ID
function esjGetExperience(id) {
  return ESJ_EXPERIENCES.find(function(e) { return e.id === id; }) || null;
}

// Helper: trova esperienza per nome (fuzzy, case-insensitive)
function esjFindExperience(query) {
  var q = query.toLowerCase();
  return ESJ_EXPERIENCES.find(function(e) {
    return e.id.includes(q)
      || e.name.toLowerCase().includes(q)
      || e.nameEn.toLowerCase().includes(q)
      || e.sub.toLowerCase().includes(q);
  }) || null;
}

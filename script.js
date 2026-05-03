/* ============================================================
   NEXUS.7 — interactions
   - Boot sequence
   - Custom cursor
   - Lenis smooth scroll
   - GSAP hero parallax (4 layers)
   - GSAP horizontal pinned scroll for Featured Drop
   - Glitch flash on section enter
   - Idle CRT flicker
   - Terminal type-in (manifesto)
   - Status nav swap + footer log ticker
   ============================================================ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* -------- Boot sequence -------- */
  const bootLines = [
    '$ NEXUS.7 // bootloader v0.07a',
    '$ initializing mesh...',
    '$ handshake [OK]',
    '$ pulling channel manifest...',
    '$ decoding 07-A...',
    '$ skipping corp filter...',
    '$ READY.'
  ];
  const bootLog = $('#bootLog');
  const bootBar = $('#bootBar');
  let i = 0, total = bootLines.length;

  function bootTick(){
    if (i >= total){
      bootBar.style.width = '100%';
      setTimeout(() => {
        document.body.dataset.loaded = 'true';
        startLife();
      }, 220);
      return;
    }
    bootLog.textContent += (i ? '\n' : '') + bootLines[i];
    i++;
    bootBar.style.width = (i/total*100) + '%';
    setTimeout(bootTick, reduced ? 30 : (90 + Math.random()*120));
  }
  // Start boot once images for hero are at least decoded
  const heroImgs = $$('.hero__layer');
  Promise.all(heroImgs.map(img => img.decode().catch(()=>{}))).then(() => {
    setTimeout(bootTick, 120);
  });
  // Hard fallback
  setTimeout(() => { if (document.body.dataset.loaded !== 'true') { i = total; bootTick(); } }, 4000);

  /* -------- Custom cursor -------- */
  const cursor = $('#cursor');
  let cx = window.innerWidth/2, cy = window.innerHeight/2;
  let tx = cx, ty = cy;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, {passive:true});
  function cursorLoop(){
    cx += (tx - cx) * 0.35;
    cy += (ty - cy) * 0.35;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
  document.addEventListener('mouseenter', () => cursor.style.opacity = 1);
  document.addEventListener('mouseleave', () => cursor.style.opacity = 0);
  // grow over interactive
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .card, .relic, .op, input')) cursor.classList.add('is-active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .card, .relic, .op, input')) cursor.classList.remove('is-active');
  });

  /* -------- Once boot completes -------- */
  function startLife(){
    initLenis();
    initHeroParallax();
    initDropScroll();
    initGlitchOnSection();
    initIdleFlicker();
    initTerminal();
    initFootLog();
    initModal();
  }

  /* -------- Dossier data -------- */
  const DOSSIERS = {
    /* TRANSMISSIONS */
    'tx-01': {
      kind:'CASE FILE',
      tag:'FEED 01 // TRANSMISSION 07-A',
      title:'THE BOWL THAT KNEW',
      img:'assets/transparent/tx-01-ramen.png',
      caption:'Evidence A — recovered from counter, Sector 4',
      lead:'A 38-seat ramen counter on the third basement of the Mishimaya block has been transmitting on a frequency owned by a competing chaebol — for eleven months. The broth is the antenna. Three regulars who asked the wrong question have not been seen since 2087.10.29.',
      specs:[
        ['Origin','Sector 4 / Mishimaya B3'],
        ['Source','Anonymous courier (paid in vault tokens)'],
        ['Encryption','AES-256 + analog steganography'],
        ['Risk level','AMBER — surveillance suspected'],
        ['Status','LIVE'],
      ],
      ref:'07A-2087.11.04-001',
    },
    'tx-02': {
      kind:'CASE FILE',
      tag:'FEED 02 // TRANSMISSION 11-X',
      title:'NO SIGNAL, NO LIE',
      img:'assets/transparent/tx-02-payphone.png',
      caption:'Booth #14, corner of Hibiya & 3rd',
      lead:'The last unrooted payphone in the megacity dialed itself for nine minutes on the night of the 6th. Nobody was on the line. Whoever, or whatever, picked up paid the call.',
      specs:[
        ['Origin','Hibiya block / corner booth 14'],
        ['Recovery','Audio capture (40s) — see attached'],
        ['Encryption','None — clear analog'],
        ['Risk level','GREEN — no human contact'],
        ['Status','UNDER REVIEW'],
      ],
      ref:'11X-2087.11.06-002',
    },
    'tx-03': {
      kind:'CASE FILE',
      tag:'FEED 03 // TRANSMISSION 03-G',
      title:'EVIDENCE / 2087-11',
      img:'assets/transparent/tx-03-cassette.png',
      caption:'Tape 11 — chain of custody intact',
      lead:'Forty seconds of audio. The voice belongs to Akira Tsuda, declared dead in 2079 after the Yokohama incident. Spectral analysis confirms a 99.4% match. The tape is dated last week.',
      specs:[
        ['Origin','Unknown — found inside revolver case'],
        ['Format','TDK D90 / chrome bias'],
        ['Encryption','Physical only — no encryption'],
        ['Risk level','RED — political sensitivity'],
        ['Status','SEALED'],
      ],
      ref:'03G-2087.11.09-003',
    },
    'tx-04': {
      kind:'CASE FILE',
      tag:'FEED 04 // TRANSMISSION 22-K',
      title:'THE NEIGHBOUR',
      img:'assets/transparent/tx-04-window.png',
      caption:'Apt 4F, looking south across alley',
      lead:'For 31 consecutive nights, the apartment across the alley has not turned off its single bulb. We watched. On night 28, the silhouette across the way raised a hand. We had never moved.',
      specs:[
        ['Origin','Sector 7 / Hanazono alley'],
        ['Surveillance','Long-lens passive only'],
        ['Encryption','N/A'],
        ['Risk level','AMBER — counter-surveillance likely'],
        ['Status','ONGOING'],
      ],
      ref:'22K-2087.11.12-004',
    },
    'tx-05': {
      kind:'CASE FILE',
      tag:'FEED 05 // TRANSMISSION 19-M',
      title:'BOOTLEG MARKET',
      img:'assets/transparent/tx-05-vendor.png',
      caption:'Stall 7 — under the Yamato rail bridge',
      lead:'Under the railbridge, a man in a tarpaulin booth sells datachips that contain operating systems no manufacturer has shipped. We paid him in cash. He gave us back too much change and a name we recognized.',
      specs:[
        ['Origin','Sector 11 / Yamato underpass'],
        ['Recovery','One 64TB chip (firmware: NX-7)'],
        ['Encryption','Custom — broken in 14 hours'],
        ['Risk level','AMBER'],
        ['Status','LIVE — vendor still operating'],
      ],
      ref:'19M-2087.11.15-005',
    },
    'tx-06': {
      kind:'CASE FILE',
      tag:'FEED 06 // TRANSMISSION 01-Z',
      title:'RIDER UNKNOWN',
      img:'assets/transparent/tx-06-bike.png',
      caption:'Same alley. Seven nights running.',
      lead:'A red sport bike of an unidentified make has been parked in the same alley for seven consecutive nights. The keys are never present. The helmet is always warm. We touched it.',
      specs:[
        ['Origin','Sector 4 / Wakamatsu lane'],
        ['Plates','Removed before document'],
        ['Encryption','Bike has no ECU — purely mechanical'],
        ['Risk level','GREEN'],
        ['Status','SURVEILLANCE'],
      ],
      ref:'01Z-2087.11.18-006',
    },

    /* OPERATIVES */
    'op-01': {
      kind:'OPERATIVE FILE',
      tag:'OP. 01 // CALL-SIGN: ASH',
      title:'RIO "ASH" KAMARI',
      img:'assets/operatives/op-01.png',
      caption:'Last verified photograph — 2087.09',
      lead:'Hand-wired half the mesh under Sector 4 herself. Has never accepted a contract she couldn\'t walk away from. Smokes a brand that hasn\'t been manufactured since 2071. We don\'t ask where she gets them.',
      specs:[
        ['Role','Signal Engineer'],
        ['Specialty','Mesh routing, dead-drop architecture'],
        ['Joined','2083 — recruited from Tsutomu Labs'],
        ['Languages','JP, EN, KO, RU'],
        ['Cybernetics','Jaw / left auditory implant'],
        ['Status','ACTIVE'],
      ],
      ref:'OP-01-KAMARI',
    },
    'op-02': {
      kind:'OPERATIVE FILE',
      tag:'OP. 02 // CALL-SIGN: EYELID',
      title:'COL. "EYELID" VONN',
      img:'assets/operatives/op-02.png',
      caption:'Reissued field portrait',
      lead:'Three wars on three continents. One eye, one prosthetic. Owes no callbacks. Carries a handheld of his own design that has never been recovered by an enemy. He has, however, recovered three of theirs.',
      specs:[
        ['Role','Field Handler'],
        ['Specialty','Counter-intel, exfiltration'],
        ['Joined','2079 — founder'],
        ['Languages','EN, FR, AR, FA'],
        ['Cybernetics','Right ocular replaced (LED diagnostic)'],
        ['Status','ACTIVE'],
      ],
      ref:'OP-02-VONN',
    },
    'op-03': {
      kind:'OPERATIVE FILE',
      tag:'OP. 03 // CALL-SIGN: MOTH',
      title:'"MOTH"',
      img:'assets/operatives/op-03.png',
      caption:'Subject declines verification photographs',
      lead:'Has never been photographed without the AR glasses. Does not eat in front of others. Speaks five spoken languages and is rumoured to read seventeen dead ones. Compiled the Vault index in eight days.',
      specs:[
        ['Role','Cipher / Archivist'],
        ['Specialty','Cryptanalysis, dead language reconstruction'],
        ['Joined','2084 — walked in off the street'],
        ['Languages','Confirmed: 5 / Suspected: 17+'],
        ['Cybernetics','Mirrored AR overlay — non-removable'],
        ['Status','ACTIVE'],
      ],
      ref:'OP-03-MOTH',
    },
    'op-04': {
      kind:'OPERATIVE FILE',
      tag:'OP. 04 // CALL-SIGN: KILO',
      title:'"KILO"',
      img:'assets/operatives/op-04.png',
      caption:'Door log — 2087.10.02',
      lead:'Was sumo. Wasn\'t. The arm is new. Stands at the door of the Sector 4 safehouse. Has never spoken to a journalist. Has never had to.',
      specs:[
        ['Role','Doorkeeper / Logistics'],
        ['Specialty','Hand-to-hand, vehicle ops'],
        ['Joined','2081'],
        ['Languages','JP, EN'],
        ['Cybernetics','Left arm — fully mechanical, custom servo'],
        ['Status','ACTIVE'],
      ],
      ref:'OP-04-KILO',
    },

    /* VAULT */
    'vault-01': {
      kind:'VAULT ARTIFACT',
      tag:'V-01 // EVIDENCE LOCKER 03',
      title:'CUSTOM REVOLVER',
      img:'assets/archive-vault/vault-01.png',
      caption:'Recovered alongside Tape 11 (TX-03)',
      lead:'Single-action revolver of unknown manufacture. Grip engraved with a pictogram not present in any public typography registry. Six chambers, all unfired. Serial number filed and acid-etched.',
      specs:[
        ['Recovered','2087.11.09 / from Sector 9 locker'],
        ['Condition','Excellent — recently cleaned'],
        ['Linked file','TX-03 (EVIDENCE / 2087-11)'],
        ['Custody','Sealed Vault 03 / cleared OP. 02'],
      ],
      ref:'V-01-03',
    },
    'vault-02': {
      kind:'VAULT ARTIFACT',
      tag:'V-02 // EVIDENCE LOCKER 01',
      title:'PACIFIC PROTECTORATE PASSPORT',
      img:'assets/archive-vault/vault-02.png',
      caption:'Issued to a state that does not appear on any modern map',
      lead:'Diplomatic passport for a "Pacific Protectorate" — issued 2079, expires 2089. The state in question dissolved in 2076. The biometric chip still validates against a live consular network.',
      specs:[
        ['Recovered','2087.05 / Yokohama transit'],
        ['Condition','Bent, ink fresh'],
        ['Holder','Name redacted at OP-02 request'],
        ['Custody','Sealed Vault 01'],
      ],
      ref:'V-02-01',
    },
    'vault-03': {
      kind:'VAULT ARTIFACT',
      tag:'V-03 // EVIDENCE LOCKER 02',
      title:'PACK OF RONIN CIGARETTES',
      img:'assets/archive-vault/vault-03.png',
      caption:'Last produced 2071',
      lead:'Brand discontinued sixteen years ago. This pack, recovered last month, contains tobacco that fluoresces under UV. Three cigarettes are missing.',
      specs:[
        ['Recovered','2087.10 / OP. 01 personal effects'],
        ['Condition','Crushed, contents intact'],
        ['Linked','OP-01 (KAMARI)'],
        ['Custody','Open archive'],
      ],
      ref:'V-03-02',
    },
    'vault-04': {
      kind:'VAULT ARTIFACT',
      tag:'V-04 // EVIDENCE LOCKER 04',
      title:'DOG TAG NECKLACE',
      img:'assets/archive-vault/vault-04.png',
      caption:'Stained — fluid not yet identified',
      lead:'Two stainless tags, one chain. The blood type matches no one on record. The unit code refers to a regiment formally retired in 2068.',
      specs:[
        ['Recovered','2086 / unknown source'],
        ['Condition','Heavy patina, organic stain'],
        ['Custody','Sealed Vault 04'],
      ],
      ref:'V-04-04',
    },
    'vault-05': {
      kind:'VAULT ARTIFACT',
      tag:'V-05 // EVIDENCE LOCKER 05',
      title:'VINTAGE CAMERA',
      img:'assets/archive-vault/vault-05.png',
      caption:'One frame remaining on the roll',
      lead:'Leica clone, glass shutter cracked. The film inside is Kodak T-Max 400 — discontinued, refrigerated for thirty years. One frame remains exposed but undeveloped. We have not developed it.',
      specs:[
        ['Recovered','2087.07'],
        ['Condition','Functional but compromised'],
        ['Film','T-MAX 400 / 1 frame remaining'],
        ['Custody','Cold archive'],
      ],
      ref:'V-05-05',
    },
    'vault-06': {
      kind:'VAULT ARTIFACT',
      tag:'V-06 // EVIDENCE LOCKER 06',
      title:'ROLLED CASH',
      img:'assets/archive-vault/vault-06.png',
      caption:'Currency of a country no longer in print',
      lead:'A roll of high-denomination bills issued by a state that ceased printing currency in 2071. The bills are dated 2086. Watermarks check authentic.',
      specs:[
        ['Recovered','2087.11 / vendor (TX-05)'],
        ['Condition','Crisp, recently rolled'],
        ['Value','Untradeable / archival only'],
        ['Custody','Open archive'],
      ],
      ref:'V-06-06',
    },
    'vault-07': {
      kind:'VAULT ARTIFACT',
      tag:'V-07 // EVIDENCE LOCKER 07',
      title:'SWITCHBLADE',
      img:'assets/archive-vault/vault-07.png',
      caption:'Half-open — frozen mechanism',
      lead:'Italian-style switchblade, mechanism seized in mid-deploy. Forensics indicates it was frozen, intentionally, before the spring could complete its travel.',
      specs:[
        ['Recovered','2087.08'],
        ['Condition','Half-deployed, mechanism welded'],
        ['Custody','Sealed Vault 07'],
      ],
      ref:'V-07-07',
    },
    'vault-08': {
      kind:'VAULT ARTIFACT',
      tag:'V-08 // EVIDENCE LOCKER 08',
      title:'POLAROID',
      img:'assets/archive-vault/vault-08.png',
      caption:'Subject burned away — neon sign remains',
      lead:'A polaroid of an unknown neon sign in an unknown alley. The right two-thirds of the image have been deliberately burned. The remaining sign reads, in part, "OPEN ALL —". The rest is gone.',
      specs:[
        ['Recovered','2086.12'],
        ['Condition','Heat-damaged, image partial'],
        ['Custody','Open archive'],
      ],
      ref:'V-08-08',
    },
    'vault-09': {
      kind:'VAULT ARTIFACT',
      tag:'V-09 // EVIDENCE LOCKER 09',
      title:'WRISTWATCH',
      img:'assets/archive-vault/vault-09.png',
      caption:'Frozen at 03:07 — repeated across many recoveries',
      lead:'Mechanical watch, perfectly maintained. The hands are frozen at 03:07. We have now recovered seven such watches across three sectors, all stopped at the same time. None have batteries.',
      specs:[
        ['Recovered','2087.04 (instance 1 of 7)'],
        ['Condition','Pristine, non-functional'],
        ['Anomaly','Time matches 6 other recoveries'],
        ['Custody','Sealed Vault 09'],
      ],
      ref:'V-09-09',
    },
    'vault-10': {
      kind:'VAULT ARTIFACT',
      tag:'V-10 // EVIDENCE LOCKER 10',
      title:'SAKE CUP',
      img:'assets/archive-vault/vault-10.png',
      caption:'Chipped — single drop remains',
      lead:'Hand-thrown ceramic sake cup. Chipped on the rim. A single drop of liquid remains in the bowl, refusing to evaporate under any controlled condition we have applied.',
      specs:[
        ['Recovered','2087.09 / Mishimaya counter (TX-01)'],
        ['Condition','Chipped, contents stable'],
        ['Anomaly','Liquid does not evaporate'],
        ['Custody','Climate-sealed Vault 10'],
      ],
      ref:'V-10-10',
    },
  };

  /* -------- Modal -------- */
  function initModal(){
    const modal = $('#modal');
    if (!modal) return;
    const elKind = $('#modalKind');
    const elTag = $('#modalTag');
    const elTitle = $('#modalTitle');
    const elLead = $('#modalLead');
    const elSpecs = $('#modalSpecs');
    const elImg = $('#modalImg');
    const elCaption = $('#modalCaption');
    const elRef = $('#modalRef');
    let lastFocus = null;

    function open(key, srcEl){
      const data = DOSSIERS[key];
      if (!data) return;
      lastFocus = srcEl;
      elKind.textContent = data.kind;
      elTag.textContent = data.tag;
      elTitle.textContent = data.title;
      elLead.textContent = data.lead;
      elImg.src = data.img;
      elImg.alt = data.title;
      elCaption.textContent = data.caption || '';
      elRef.textContent = 'REF #' + (data.ref || key.toUpperCase());
      // specs
      elSpecs.innerHTML = '';
      (data.specs || []).forEach(([k, v]) => {
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = v;
        elSpecs.appendChild(dt); elSpecs.appendChild(dd);
      });
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-modal-open');
      if (lenis) lenis.stop();
      // glitch flash on open
      triggerGlitch($('#glitchFlash'));
      // focus trap entry
      setTimeout(() => $('.modal__close', modal).focus(), 50);
    }

    function close(){
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-modal-open');
      if (lenis) lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // delegated open
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-key]');
      if (!trigger) return;
      e.preventDefault();
      open(trigger.dataset.key, trigger);
    });
    document.addEventListener('keydown', (e) => {
      if (modal.getAttribute('aria-hidden') === 'false'){
        if (e.key === 'Escape') close();
        return;
      }
      // open on Enter/Space when card has focus
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.key){
        e.preventDefault();
        open(document.activeElement.dataset.key, document.activeElement);
      }
    });

    // close handlers
    $$('[data-close]', modal).forEach(el => el.addEventListener('click', close));
  }

  /* -------- Lenis smooth scroll -------- */
  let lenis;
  function initLenis(){
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60, duration: 1.2 });
      });
    });

    // Sync GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* -------- Hero parallax -------- */
  function initHeroParallax(){
    if (!window.gsap || !window.ScrollTrigger) return;
    const layers = $$('.hero__layer');
    layers.forEach((layer, idx) => {
      const depth = parseFloat(layer.dataset.depth) || 0.1;
      gsap.to(layer, {
        yPercent: depth * 60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    });

    // Mouse parallax (subtle)
    const stage = $('.hero__stage');
    if (!stage || reduced) return;
    let mx=0, my=0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - .5);
      my = (e.clientY / window.innerHeight - .5);
    }, {passive:true});
    function mouseLoop(){
      layers.forEach((l, idx) => {
        const d = parseFloat(l.dataset.depth) || 0.1;
        const ex = -mx * d * 30;
        const ey = -my * d * 16;
        l.style.translate = `${ex}px ${ey}px`;
      });
      requestAnimationFrame(mouseLoop);
    }
    mouseLoop();
  }

  /* -------- Featured Drop horizontal scroll -------- */
  function initDropScroll(){
    if (!window.gsap || !window.ScrollTrigger) return;
    const pin = $('.drop__pin');
    const scenes = $('#dropScenes');
    if (!pin || !scenes) return;

    const isMobile = window.matchMedia('(max-width: 880px)').matches;
    if (isMobile) return;

    const updateScroll = () => {
      // total horizontal travel = scenes width minus visible width
      const visible = pin.clientWidth - $('.drop__intro').clientWidth;
      const distance = scenes.scrollWidth - visible;

      gsap.to(scenes, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: '.drop',
          start: 'top top',
          end: () => '+=' + distance,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        }
      });
    };
    updateScroll();
    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  /* -------- Glitch flash when entering each major section -------- */
  function initGlitchOnSection(){
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    const flash = $('#glitchFlash');
    $$('section').forEach(sec => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 70%',
        once: false,
        onEnter: () => triggerGlitch(flash),
        onEnterBack: () => triggerGlitch(flash),
      });
    });
  }
  function triggerGlitch(flash){
    if (!flash) return;
    flash.style.opacity = '0.7';
    flash.style.transform = 'translateX(' + ((Math.random()*8)-4) + 'px)';
    setTimeout(() => { flash.style.opacity = '0'; flash.style.transform = 'translateX(0)'; }, 80);
  }

  /* -------- Idle CRT flicker -------- */
  function initIdleFlicker(){
    if (reduced) return;
    setInterval(() => {
      if (Math.random() < 0.5){
        document.body.style.filter = 'brightness(1.06) contrast(1.04)';
        setTimeout(() => document.body.style.filter = '', 60 + Math.random()*60);
      }
    }, 5200);
  }

  /* -------- Terminal type-in -------- */
  function initTerminal(){
    if (!window.gsap || !window.ScrollTrigger) return;
    const el = $('#terminalLine');
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    let typed = false;
    ScrollTrigger.create({
      trigger: '.manifesto__copy',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (typed) return; typed = true;
        let n = 0;
        const id = setInterval(() => {
          el.textContent = text.slice(0, n++);
          if (n > text.length) clearInterval(id);
        }, 28);
      }
    });
  }

  /* -------- Footer transmission log ticker -------- */
  function initFootLog(){
    const el = $('#footLog');
    if (!el) return;
    const channels = ['07-A','03-G','11-X','22-K','07-B','19-M','01-Z'];
    const verbs = ['handshake','uplink','decrypt','flush','rebroadcast','seal','purge'];
    const logs = [];
    function pushLog(){
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const ss = String(now.getSeconds()).padStart(2,'0');
      const ch = channels[Math.floor(Math.random()*channels.length)];
      const vb = verbs[Math.floor(Math.random()*verbs.length)];
      logs.unshift(`[${hh}:${mm}:${ss}] ch.${ch} ${vb} OK`);
      if (logs.length > 6) logs.pop();
      el.textContent = logs.join('\n');
    }
    pushLog();
    setInterval(pushLog, 2400);
  }

})();

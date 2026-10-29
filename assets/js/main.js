(() => {
  'use strict';

  const CONFIG = window.INVITO_CONFIG || {};
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const isLocal = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rand = (min, max) => min + Math.random() * (max - min);

  /* ---------- Confetti ---------- */

  const confetti = (() => {
    const canvas = document.querySelector('.confetti');
    const ctx = canvas && canvas.getContext('2d');
    const colors = ['#F5CF68', '#E0A92E', '#B57D16', '#B68C6C', '#8C6246', '#FFF4DC', '#231C18'];
    let pieces = [];
    let frame = 0;
    let dpr = 1;
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const add = (x, y, angle, speed) => {
      pieces.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(5, 11),
        ratio: rand(0.4, 1),
        rot: rand(0, Math.PI),
        vr: rand(-0.15, 0.15),
        color: colors[Math.floor(Math.random() * colors.length)],
        round: Math.random() < 0.3,
        phase: rand(0, 10),
        age: 0,
      });
    };

    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      pieces = pieces.filter((p) => p.y < h + 30 && p.age < 900);
      for (const p of pieces) {
        p.age += 1;
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.07;
        p.x += p.vx + Math.sin((p.age + p.phase) * 0.06) * 0.8;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.age * 0.09 + p.phase));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, (-p.size * p.ratio) / 2, p.size, p.size * p.ratio);
        }
        ctx.restore();
      }
      frame = pieces.length ? requestAnimationFrame(tick) : 0;
    };

    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('resize', () => frame && resize());

    // Fewer pieces on small screens keeps phones smooth
    const scaled = (count) => Math.round(count * Math.min(1, Math.max(0.5, window.innerWidth / 1200)));

    return {
      rain(count = 160) {
        if (!ctx || reduceMotion.matches) return;
        resize();
        for (let i = 0; i < scaled(count); i += 1) {
          add(rand(0, w), rand(-h * 0.6, -20), Math.PI / 2 + rand(-0.3, 0.3), rand(1, 3));
        }
        run();
      },
      burst(x, y, count = 120) {
        if (!ctx || reduceMotion.matches) return;
        resize();
        for (let i = 0; i < scaled(count); i += 1) {
          add(x, y, -Math.PI / 2 + rand(-0.95, 0.95), rand(7, 15));
        }
        run();
      },
    };
  })();

  /* ---------- Hero entrance ---------- */

  function startHero() {
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      root.classList.add('is-ready');
      setTimeout(() => confetti.rain(), 1600);
    };
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('400 1em "Ms Madi"'),
        document.fonts.load('700 1em "Josefin Sans"'),
      ]).then(go, go);
    } else {
      go();
    }
    setTimeout(go, 2500);
  }

  /* ---------- Botanical line art ---------- */

  const FRONDS = [
    // start, control, end, leaf pairs, leaf length
    [[70, 332], [70, 200], [150, 66], 12, 30],
    [[78, 334], [160, 262], [246, 192], 10, 24],
    [[64, 332], [8, 252], [28, 140], 8, 21],
  ];
  const FLOWERS = [[40, 318, 15], [96, 342, 11], [132, 322, 8]];

  const fmt = (n) => n.toFixed(1);

  function svgPath(d, delay, duration, animated) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('pathLength', '1');
    path.setAttribute('class', animated ? 'botanical-line draw' : 'botanical-line');
    path.style.setProperty('--d', `${delay.toFixed(2)}s`);
    path.style.setProperty('--dur', `${duration.toFixed(2)}s`);
    return path;
  }

  function buildBotanical(svg) {
    const animated = svg.dataset.botanical === 'hero';
    const frag = document.createDocumentFragment();

    FRONDS.forEach(([p0, c, p1, pairs, size], index) => {
      const at = (t) => [
        (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t ** 2 * p1[0],
        (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t ** 2 * p1[1],
      ];
      const slope = (t) => [
        2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]),
        2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]),
      ];
      const stemDelay = 0.5 + index * 0.2;
      frag.append(svgPath(`M${p0.join(' ')}Q${c.join(' ')} ${p1.join(' ')}`, stemDelay, 1.2, animated));

      for (let i = 1; i <= pairs; i += 1) {
        const t = 0.1 + (i / (pairs + 1)) * 0.88;
        const [x, y] = at(t);
        const [dx, dy] = slope(t);
        const base = Math.atan2(dy, dx);
        const len = size * (1 - t * 0.6);
        for (const side of [-1, 1]) {
          const a = base + side * 0.85;
          const tip = [x + Math.cos(a) * len, y + Math.sin(a) * len];
          const mid = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5];
          const nx = -Math.sin(a) * len * 0.28;
          const ny = Math.cos(a) * len * 0.28;
          const d = `M${fmt(x)} ${fmt(y)}Q${fmt(mid[0] + nx)} ${fmt(mid[1] + ny)} ${fmt(tip[0])} ${fmt(tip[1])}`
            + `Q${fmt(mid[0] - nx)} ${fmt(mid[1] - ny)} ${fmt(x)} ${fmt(y)}`;
          frag.append(svgPath(d, stemDelay + t * 1.1, 0.7, animated));
        }
      }
    });

    FLOWERS.forEach(([cx, cy, r], index) => {
      let d = '';
      for (let k = 0; k < 5; k += 1) {
        const a = (k * 72 + index * 20) * (Math.PI / 180);
        const q1 = [cx + Math.cos(a - 0.45) * r * 1.5, cy + Math.sin(a - 0.45) * r * 1.5];
        const q2 = [cx + Math.cos(a + 0.45) * r * 1.5, cy + Math.sin(a + 0.45) * r * 1.5];
        d += `M${cx} ${cy}C${fmt(q1[0])} ${fmt(q1[1])} ${fmt(q2[0])} ${fmt(q2[1])} ${cx} ${cy}`;
      }
      const cr = r * 0.22;
      d += `M${fmt(cx - cr)} ${cy}a${fmt(cr)} ${fmt(cr)} 0 1 0 ${fmt(cr * 2)} 0a${fmt(cr)} ${fmt(cr)} 0 1 0 ${fmt(-cr * 2)} 0`;
      frag.append(svgPath(d, 1.4 + index * 0.25, 1.1, animated));
    });

    svg.append(frag);
  }

  /* ---------- Photos: show placeholder until the real picture exists ---------- */

  function initPhotos() {
    document.querySelectorAll('.polaroid__photo img').forEach((img) => {
      const loaded = () => img.classList.add('is-loaded');
      const missing = () => img.remove();
      if (img.complete) {
        if (img.naturalWidth) loaded(); else missing();
        return;
      }
      img.addEventListener('load', loaded, { once: true });
      img.addEventListener('error', missing, { once: true });
    });
  }

  /* ---------- Scroll reveal ---------- */

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Countdown ---------- */

  function initCountdown() {
    const box = document.querySelector('[data-countdown]');
    const start = new Date(CONFIG.eventStart);
    if (!box || Number.isNaN(start.getTime())) return;
    const units = {
      days: box.querySelector('[data-unit="days"]'),
      hours: box.querySelector('[data-unit="hours"]'),
      minutes: box.querySelector('[data-unit="minutes"]'),
      seconds: box.querySelector('[data-unit="seconds"]'),
    };
    const pad = (n) => String(n).padStart(2, '0');
    let timer = 0;
    const update = () => {
      const diff = start.getTime() - Date.now();
      if (diff <= 0) {
        box.hidden = true;
        clearInterval(timer);
        return;
      }
      box.hidden = false;
      units.days.textContent = pad(Math.floor(diff / 864e5));
      units.hours.textContent = pad(Math.floor(diff / 36e5) % 24);
      units.minutes.textContent = pad(Math.floor(diff / 6e4) % 60);
      units.seconds.textContent = pad(Math.floor(diff / 1e3) % 60);
    };
    update();
    if (!box.hidden) timer = setInterval(update, 1000);
  }

  /* ---------- Add to calendar ---------- */

  function initCalendar() {
    const start = new Date(CONFIG.eventStart);
    if (Number.isNaN(start.getTime())) return;
    const parsedEnd = new Date(CONFIG.eventEnd);
    const end = Number.isNaN(parsedEnd.getTime()) ? new Date(start.getTime() + 4 * 36e5) : parsedEnd;
    const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = CONFIG.eventTitle || 'Festa';
    const place = [CONFIG.venueName, CONFIG.venueAddress].filter(Boolean).join(', ');
    const details = 'Apericena, musica dal vivo, DJ set e brindisi finale.';

    const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${stamp(start)}/${stamp(end)}`,
      details,
      location: place,
    })}`;

    const esc = (s) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Marta 30//Invito//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:marta30-${stamp(start)}@invito`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(title)}`,
      `LOCATION:${esc(place)}`,
      `DESCRIPTION:${esc(details)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const icsUrl = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));

    document.querySelectorAll('[data-calendar="google"]').forEach((a) => { a.href = google; });
    document.querySelectorAll('[data-calendar="ics"]').forEach((a) => { a.href = icsUrl; });
  }

  /* ---------- Interactive venue logo ---------- */

  const MELODY = [
    // "Tanti auguri a te": [frequency Hz, beats]
    [392, 0.75], [392, 0.25], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
    [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
  ];
  let audio = null;

  function tone(freq, at, duration) {
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration * 0.95);
    gain.connect(audio.destination);

    const body = audio.createOscillator();
    body.type = 'triangle';
    body.frequency.value = freq;
    body.connect(gain);

    const shimmer = audio.createOscillator();
    const shimmerGain = audio.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = freq * 2;
    shimmerGain.gain.value = 0.25;
    shimmer.connect(shimmerGain).connect(gain);

    for (const osc of [body, shimmer]) {
      osc.start(at);
      osc.stop(at + duration);
    }
  }

  function playMelody(onNote) {
    const beat = 0.36;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !audio) audio = new AudioCtx();
    if (audio && audio.state === 'suspended') audio.resume();
    const t0 = audio ? audio.currentTime + 0.05 : 0;
    let offset = 0;
    MELODY.forEach(([freq, beats], i) => {
      const duration = beats * beat;
      if (audio) tone(freq, t0 + offset, duration);
      setTimeout(() => onNote(i), (offset + 0.05) * 1000);
      offset += duration;
    });
    return offset * 1000;
  }

  function initLogo() {
    const card = document.querySelector('.logo-card');
    if (!card) return;
    const wrap = card.parentElement;
    const head = card.querySelector('.logo__head');
    let playing = false;

    card.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const r = card.getBoundingClientRect();
      const px = (event.clientX - r.left) / r.width;
      const py = (event.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });

    const spawnNote = () => {
      if (reduceMotion.matches) return;
      const note = document.createElement('span');
      note.className = 'float-note';
      note.style.left = `${rand(8, 86)}%`;
      note.style.top = `${rand(30, 70)}%`;
      note.style.setProperty('--dx', `${rand(-40, 40).toFixed(0)}px`);
      note.style.setProperty('--rot', `${rand(-30, 30).toFixed(0)}deg`);
      note.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-note"/></svg>';
      note.addEventListener('animationend', () => note.remove(), { once: true });
      wrap.append(note);
    };

    card.addEventListener('click', () => {
      if (playing) return;
      playing = true;
      card.classList.add('is-playing');
      const total = playMelody(() => {
        if (!reduceMotion.matches && head.animate) {
          head.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }],
            { duration: 260, easing: 'ease-out' },
          );
        }
        spawnNote();
      });
      setTimeout(() => {
        playing = false;
        card.classList.remove('is-playing');
      }, total + 200);
    });
  }

  /* ---------- RSVP ---------- */

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  function readReply(form) {
    const data = new FormData(form);
    const attending = data.get('partecipa') === 'si';
    const allergies = attending
      ? [...data.getAll('intolleranze'), String(data.get('altre_intolleranze') || '').trim()].filter(Boolean).join(', ')
      : '';
    return {
      name: String(data.get('nome') || '').trim(),
      attending,
      vegetarian: attending && data.has('vegetariano'),
      allergies,
      message: String(data.get('messaggio') || '').trim(),
    };
  }

  function replySubject(reply) {
    return `RSVP Marta 30 - ${reply.name}: ${reply.attending ? 'ci sarà' : 'non ci sarà'}`;
  }

  function replyFields(reply) {
    const fields = { Nome: reply.name, Partecipa: reply.attending ? 'Sì' : 'No' };
    if (reply.attending) {
      fields['Menu vegetariano'] = reply.vegetarian ? 'Sì' : 'No';
      fields['Intolleranze o allergie'] = reply.allergies || 'Nessuna';
    }
    fields.Messaggio = reply.message || '-';
    return fields;
  }

  function mailtoUrl(email, reply) {
    const body = Object.entries(replyFields(reply)).map(([key, value]) => `${key}: ${value}`).join('\r\n');
    return `mailto:${email}?subject=${encodeURIComponent(replySubject(reply))}&body=${encodeURIComponent(body)}`;
  }

  async function sendWeb3Forms(key, reply) {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: key, subject: replySubject(reply), ...replyFields(reply) }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || `HTTP ${response.status}`);
  }

  // Returns how the reply was delivered: 'sent', 'mail' or 'demo'
  async function deliver(reply) {
    const key = String(CONFIG.web3formsKey || '').trim();
    const email = String(CONFIG.rsvpEmail || '').trim();

    if (key) {
      try {
        await sendWeb3Forms(key, reply);
        return 'sent';
      } catch (error) {
        if (!isEmail(email)) throw error;
        console.warn('[RSVP] automatic sending failed, falling back to the mail app', error);
      }
    }
    if (isEmail(email)) {
      window.location.href = mailtoUrl(email, reply);
      return 'mail';
    }
    if (isLocal) {
      console.info('[RSVP] demo mode (no email configured):', replyFields(reply));
      await wait(800);
      return 'demo';
    }
    throw new Error('not-configured');
  }

  function syncAria(el) {
    if (!el.matches || !el.matches('input, textarea')) return;
    try {
      if (el.matches(':user-invalid')) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    } catch {
      // :user-invalid unsupported: native validation still works
    }
  }

  function initRsvp() {
    const form = document.getElementById('rsvp-form');
    const done = document.getElementById('rsvp-done');
    if (!form || !done) return;
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const email = String(CONFIG.rsvpEmail || '').trim();

    form.addEventListener('blur', (event) => syncAria(event.target), true);
    form.addEventListener('input', (event) => {
      if (event.target.hasAttribute('aria-invalid')) syncAria(event.target);
    });
    form.addEventListener('change', (event) => {
      if (event.target.name === 'partecipa') form.querySelectorAll('[name="partecipa"]').forEach(syncAria);
    });
    form.addEventListener('invalid', (event) => setTimeout(() => syncAria(event.target)), true);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      if (form.elements.website.value) return;

      const reply = readReply(form);
      submit.setAttribute('aria-busy', 'true');
      try {
        const mode = await deliver(reply);
        showDone(reply, mode);
      } catch (error) {
        console.error('[RSVP]', error);
        status.textContent = error.message === 'not-configured'
          ? 'Il modulo non è ancora attivo: avvisa Marta, per favore!'
          : 'Ops, la risposta non è partita. Controlla la connessione e riprova.';
      } finally {
        submit.removeAttribute('aria-busy');
      }
    });

    function showDone(reply, mode) {
      done.dataset.answer = reply.attending ? 'si' : 'no';
      done.dataset.mode = mode;
      done.querySelectorAll('[data-guest-name]').forEach((el) => { el.textContent = reply.name.split(/\s+/)[0]; });
      if (mode === 'mail') {
        done.querySelectorAll('[data-mailto]').forEach((a) => { a.href = mailtoUrl(email, reply); });
        done.querySelectorAll('[data-rsvp-email]').forEach((a) => {
          a.href = `mailto:${email}`;
          a.textContent = email;
        });
      }
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
      done.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      if (reply.attending) {
        const r = done.getBoundingClientRect();
        setTimeout(() => confetti.burst(r.left + r.width / 2, Math.max(80, r.top + 60)), 350);
      }
    }

    done.querySelector('[data-action="rsvp-again"]').addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      done.hidden = true;
      form.hidden = false;
      form.querySelector('input[name="nome"]').focus();
    });
  }

  /* ---------- Top bar and hero parallax ---------- */

  function initTopbar() {
    const update = () => root.classList.toggle('is-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', (((event.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty('--py', (((event.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--py', '0');
    });
  }

  /* ---------- Boot ---------- */

  document.querySelectorAll('svg[data-botanical]').forEach(buildBotanical);
  startHero();
  initPhotos();
  initReveal();
  initCountdown();
  initCalendar();
  initLogo();
  initRsvp();
  initTopbar();
  initParallax();
})();

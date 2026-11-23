/* =========================================================
   Alejandro & Luisa · Invitación de boda
   Ajusta aquí la fecha/hora cuando esté confirmada.
   ========================================================= */
const CONFIG = {
  // Fecha y hora de la ceremonia (con zona horaria). Cambia la hora cuando esté confirmada.
  fecha: '2027-02-26T16:00:00-05:00',
  titulo: 'Boda de Alejandro & Luisa',
  detalles: '¡Nos casamos! Queremos compartir este día contigo.',
  lugar: '', // p. ej. 'Iglesia San José, Bogotá'
};

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Imágenes opcionales: si no existen, se oculta el <img> y queda el diseño base ---------- */
  document.querySelectorAll('img.optional-img').forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once: true });
  });

  /* ---------- Aviso flotante ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  /* ---------- Sobre de la portada ---------- */
  const envelope = document.getElementById('open-envelope');
  envelope?.addEventListener('click', () => {
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      document.getElementById('invitacion')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }, reduceMotion ? 0 : 950);
  });

  /* ---------- Botones de ubicación aún sin enlace ---------- */
  document.querySelectorAll('[data-pending]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Muy pronto compartiremos la ubicación ✨');
    });
  });

  /* ---------- Animación al hacer scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Cuenta regresiva ---------- */
  const target = new Date(CONFIG.fecha).getTime();
  const nums = {};
  document.querySelectorAll('[data-unit]').forEach((el) => { nums[el.dataset.unit] = el; });
  const pad = (n) => String(n).padStart(2, '0');
  let timer;

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      document.getElementById('countdown').hidden = true;
      document.getElementById('countdown-done').hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    const values = {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
    for (const [unit, val] of Object.entries(values)) {
      const text = pad(val);
      if (nums[unit] && nums[unit].textContent !== text) nums[unit].textContent = text;
    }
  };
  tick();
  timer = setInterval(tick, 1000);

  /* ---------- Agregar al calendario (Google Calendar) ---------- */
  const toGCal = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = new Date(target);
  const end = new Date(target + 6 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: CONFIG.titulo,
    dates: `${toGCal(start)}/${toGCal(end)}`,
    details: CONFIG.detalles,
    location: CONFIG.lugar,
  });
  const cal = document.getElementById('add-calendar');
  if (cal) cal.href = `https://calendar.google.com/calendar/render?${params}`;
})();

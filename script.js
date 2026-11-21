(() => {
  'use strict';

  const root = document.documentElement;
  const layers = Array.from(document.querySelectorAll('.layer'));
  const splash = document.querySelector('.splash');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const titles = {
    sw: 'Freemasonry: ni nini, utajiri, sheria na kujiunga',
    en: 'Freemasonry: what it is, wealth, rules and joining'
  };

  let current = 0;
  let readyTimer = null;

  /* ---------- Language ---------- */
  function setLang(lang, save) {
    if (lang !== 'sw' && lang !== 'en') lang = 'sw';
    root.dataset.lang = lang;
    root.lang = lang;
    document.title = titles[lang];
    document.querySelectorAll('.lang button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    if (save) {
      try { localStorage.setItem('lang', lang); } catch (e) { /* storage unavailable */ }
    }
  }

  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) { /* storage unavailable */ }
  setLang(saved || 'sw', false);

  document.querySelectorAll('.lang button').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.lang, true));
  });

  /* ---------- Layers ---------- */
  layers.forEach((l, i) => l.style.setProperty('--z', String(layers.length - i)));

  function show(index, focus) {
    current = Math.max(0, Math.min(layers.length - 1, index));
    layers.forEach((l, i) => {
      l.classList.toggle('closed', i < current);
      l.classList.toggle('current', i === current);
      l.inert = i !== current;
      l.setAttribute('aria-hidden', String(i !== current));
    });
    const layer = layers[current];
    layer.querySelector('.scroll').scrollTop = 0;
    if (focus) {
      const target = layer.querySelector('[data-focus]');
      if (target) target.focus({ preventScroll: true });
    }
  }

  /* ---------- Logo animation ---------- */
  function markReady() {
    clearTimeout(readyTimer);
    splash.classList.add('ready');
  }

  function skip() {
    splash.classList.add('skip');
    markReady();
  }

  function playSplash() {
    clearTimeout(readyTimer);
    splash.classList.add('reset');
    splash.classList.remove('skip', 'ready');
    void splash.offsetWidth; // restart CSS animations
    splash.classList.remove('reset');
    if (reduceMotion) {
      skip();
      return;
    }
    readyTimer = setTimeout(markReady, 4400);
  }

  splash.addEventListener('click', (e) => {
    if (!splash.classList.contains('ready') && !e.target.closest('button')) skip();
  });

  document.addEventListener('keydown', (e) => {
    if (current !== 0 || splash.classList.contains('ready')) return;
    if (e.target.closest('button')) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      skip();
    }
  });

  /* ---------- Navigation ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go]');
    if (!btn) return;
    const go = btn.dataset.go;
    if (go === 'next') show(current + 1, true);
    else if (go === 'prev') show(current - 1, true);
    else if (go === 'restart') {
      show(0, true);
      playSplash();
    }
  });

  show(0, false);
  playSplash();
})();

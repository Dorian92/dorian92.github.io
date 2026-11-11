/* v3 motion layer — vanilla, no dependencies */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* stagger children */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      el.style.setProperty('--d', (i * 90) + 'ms');
    });
  });

  /* count-up */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function fmt(el, v) {
    var dec = parseInt(el.dataset.decimals || '0', 10);
    return (el.dataset.prefix || '') + v.toFixed(dec) + (el.dataset.suffix || '');
  }
  function runCount(el) {
    if (el._done) return; el._done = true;
    var to = parseFloat(el.dataset.count), dur = 1800, t0 = null;
    var from = to > 50 && to < 100 ? 80 : 0; /* 99.9 starts from 80 so the decimals read */
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(el, from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(el, to);
    }
    requestAnimationFrame(step);
  }
  if (!reduced) counters.forEach(function (el) {
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px'; /* no layout jump */
    var to = parseFloat(el.dataset.count);
    el.textContent = fmt(el, to > 50 && to < 100 ? 80 : 0);
  });

  /* reveal */
  var revealEls = document.querySelectorAll('[data-reveal], .work-card');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(runCount);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* counters that are not inside a reveal element */
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* scroll: progress bar + stacking cards */
  var bar = document.querySelector('.nav-progress');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));
  var inners = cards.map(function (c) { return c.querySelector('.work-card-inner'); });
  var stackMq = window.matchMedia('(min-width: 861px)');
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      if (reduced || !stackMq.matches) { inners.forEach(function (n) { n.style.removeProperty('--s'); n.style.removeProperty('--b'); }); return; }
      var vh = window.innerHeight;
      cards.forEach(function (card, i) {
        var depth = 0;
        for (var j = i + 1; j < cards.length; j++) {
          var top = parseFloat(getComputedStyle(cards[j]).top) || 0;
          var r = cards[j].getBoundingClientRect();
          depth += clamp(1 - (r.top - top) / (vh - top), 0, 1);
        }
        inners[i].style.setProperty('--s', (1 - Math.min(depth, 3) * 0.045).toFixed(4));
        inners[i].style.setProperty('--b', (1 - Math.min(depth, 3) * 0.18).toFixed(4));
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (reduced) return;

  /* hero parallax */
  var stage = document.querySelector('.hero-stage');
  if (stage && finePointer) {
    stage.querySelectorAll('[data-depth]').forEach(function (el) { el.style.setProperty('--dp', el.dataset.depth); });
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      stage.style.setProperty('--mx', cx.toFixed(4));
      stage.style.setProperty('--my', cy.toFixed(4));
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(loop) : null;
    }
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* card tilt + cursor spotlight */
  if (finePointer) {
    document.querySelectorAll('.glow-track').forEach(function (el) {
      var tilt = el.querySelector('.tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--cx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--cy', (y * 100).toFixed(1) + '%');
        if (tilt) { tilt.style.setProperty('--tx', (x * 2 - 1).toFixed(3)); tilt.style.setProperty('--ty', (y * 2 - 1).toFixed(3)); }
      });
      el.addEventListener('pointerleave', function () {
        if (tilt) { tilt.style.setProperty('--tx', 0); tilt.style.setProperty('--ty', 0); }
      });
    });
  }

  /* live price ticks in phone screens */
  var ticks = Array.prototype.slice.call(document.querySelectorAll('[data-tick]'));
  if (ticks.length) {
    var price = parseFloat(ticks[0].dataset.tick);
    setInterval(function () {
      if (document.hidden) return;
      var delta = (Math.random() - 0.48) * 0.18;
      price = clamp(price + delta, 141.2, 144.6);
      ticks.forEach(function (el) {
        el.textContent = price.toFixed(2);
        el.classList.remove('tick-up', 'tick-dn');
        void el.offsetWidth;
        el.classList.add(delta >= 0 ? 'tick-up' : 'tick-dn');
      });
    }, 1700);
  }
})();

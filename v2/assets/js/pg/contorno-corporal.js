
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };

  
  var con = navigator.connection || {};
  var pode = !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver &&
    !con.saveData && !/(^|-)2g$/.test(con.effectiveType || '');
  var pausado = function () { return html.classList.contains('movimento-pausado'); };

  $$('video[data-filme]').forEach(function (v) {
    if (!pode || !('IntersectionObserver' in window)) return;
    var tocou = false;
    function carrega() {
      var movel = mm('(max-width: 820px)');
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (par) {
        var src = (movel && v.getAttribute('data-' + par[0] + '-movel')) || v.getAttribute('data-' + par[0]);
        if (!src) return;
        var s = doc.createElement('source'); s.src = src; s.type = par[1]; v.appendChild(s);
      });
      v.muted = true; v.defaultMuted = true; v.loop = false; v.playsInline = true;
      v.addEventListener('playing', function () { v.classList.add('tocando'); }, { once: true });
      v.load();
    }
    function toca() {
      if (tocou || pausado()) return;
      tocou = true;
      carrega();
      var p = v.play(); if (p && p.catch) p.catch(function () { v.classList.remove('tocando'); });
    }
    var comeca = function () {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { toca(); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(v);
    };
    if (doc.readyState === 'complete') setTimeout(comeca, 120);
    else window.addEventListener('load', function () { setTimeout(comeca, 120); });
    
    doc.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('[data-pausa]')) return;
      setTimeout(function () { if (pausado()) { try { v.pause(); } catch (er) {  } } else if (tocou && !v.ended) { v.play(); } }, 0);
    });
  });

  
  var filtro = $('[data-filtro]');
  var gavetas = $('#recursos .gavetas');
  if (!filtro || !gavetas) return;
  var itens = $$('.gaveta-item', gavetas);
  var conta = $('[data-filtro-conta]');
  var botoes = $$('button[data-queixa]', filtro);
  function aplica(q, anuncia) {
    var n = 0;
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-queixa') === q ? 'true' : 'false'); });
    gavetas.classList.add('filtrando');
    itens.forEach(function (it) {
      var ok = !q || (' ' + it.getAttribute('data-queixa') + ' ').indexOf(' ' + q + ' ') >= 0;
      it.hidden = !ok;
      if (!ok) it.open = false;
      if (ok) n++;
    });
    if (conta && anuncia) {
      var b = botoes.filter(function (x) { return x.getAttribute('data-queixa') === q; })[0];
      conta.textContent = q ? n + (n === 1 ? ' recurso' : ' recursos') + ' para ' + b.textContent.toLowerCase() + '.' : 'Todos os ' + n + ' recursos.';
    }
  }
  filtro.hidden = false;
  botoes.forEach(function (b) { b.addEventListener('click', function () { aplica(b.getAttribute('data-queixa'), true); }); });
  $$('[data-filtra]').forEach(function (a) {
    a.addEventListener('click', function () { aplica(a.getAttribute('data-filtra'), true); });
  });
})();

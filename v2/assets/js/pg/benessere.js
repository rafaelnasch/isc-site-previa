
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-mapa]'), function (mapa) {
    var regioes = Array.prototype.slice.call(mapa.querySelectorAll('.bn-regiao'));
    var pontos = Array.prototype.slice.call(mapa.querySelectorAll('.bn-ponto'));
    if (!regioes.length) return;
    mapa.classList.add('bn-mapa--vivo');
    function acende(id, marca) {
      pontos.forEach(function (p) { p.classList.toggle(marca, p.getAttribute('data-alvo') === id); });
      mapa.classList.toggle('bn-mapa--todo-' + marca, !pontos.some(function (p) { return p.getAttribute('data-alvo') === id; }) && !!id);
    }
    function abre(id, focar) {
      regioes.forEach(function (r) {
        var aberto = r.id === id, b = r.querySelector('h3 button'), c = r.querySelector('.bn-regiao-corpo');
        r.classList.toggle('ativa', aberto);
        if (b) b.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        if (c) c.hidden = !aberto;
        if (aberto && focar && b) b.focus();
      });
      pontos.forEach(function (p) { p.setAttribute('aria-pressed', p.getAttribute('data-alvo') === id ? 'true' : 'false'); });
      acende(id, 'ativo');
    }
    regioes.forEach(function (r) {
      var b = r.querySelector('h3 button'); if (!b) return;
      b.addEventListener('click', function () { abre(r.id); });
      r.addEventListener('mouseenter', function () { acende(r.id, 'realce'); });
      r.addEventListener('mouseleave', function () { acende('', 'realce'); });
    });
    pontos.forEach(function (p) {
      var id = p.getAttribute('data-alvo');
      p.addEventListener('click', function () {
        abre(id);
        
        var r = document.getElementById(id);
        if (r && window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) {
          r.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
      });
      p.addEventListener('mouseenter', function () { acende(id, 'realce'); });
      p.addEventListener('mouseleave', function () { acende('', 'realce'); });
    });
    abre(regioes[0].id);
  });
})();

(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var conexao = navigator.connection || {};
  var pode = !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver &&
    !conexao.saveData && !/(^|-)2g$/.test(conexao.effectiveType || '');
  var filmes = Array.prototype.slice.call(doc.querySelectorAll('video[data-filme]'));
  if (!filmes.length || !pode || !('IntersectionObserver' in window)) return;
  html.classList.add('tem-video');   

  var pausado = function () { return html.classList.contains('movimento-pausado'); };
  
  function ultimoQuadro(v) {
    var pic = v.parentNode.querySelector('picture'); if (!pic) return;
    Array.prototype.forEach.call(pic.querySelectorAll('[data-final]'), function (el) {
      if (el.tagName === 'IMG') el.src = el.getAttribute('data-final'); else el.srcset = el.getAttribute('data-final');
    });
  }
  function carrega(v) {
    if (v.__carregado) return;
    var m = mm('(max-width: 820px)');
    var webm = (m && v.getAttribute('data-webm-movel')) || v.getAttribute('data-webm');
    var mp4 = (m && v.getAttribute('data-mp4-movel')) || v.getAttribute('data-mp4');
    [[webm, 'video/webm'], [mp4, 'video/mp4']].forEach(function (par) {
      if (!par[0]) return;
      var s = doc.createElement('source'); s.src = par[0]; s.type = par[1]; v.appendChild(s);
    });
    v.muted = true; v.defaultMuted = true; v.loop = false; v.playsInline = true;
    v.addEventListener('playing', function () { v.classList.add('tocando'); });
    v.addEventListener('ended', function () { v.__fim = true; ultimoQuadro(v); });
    v.load();
    v.__carregado = true;
  }
  function toca(v) {
    if (pausado() || v.__fim) return;
    carrega(v);
    var p = v.play(); if (p && p.catch) p.catch(function () {  });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target; v.__visivel = en.isIntersecting;
      if (en.isIntersecting) toca(v); else if (v.__carregado && !v.paused) v.pause();
    });
  }, { threshold: 0.3 });
  function comeca() { filmes.forEach(function (v) { io.observe(v); }); }
  if (doc.readyState === 'complete') setTimeout(comeca, 120);
  else window.addEventListener('load', function () { setTimeout(comeca, 120); });
  
  new MutationObserver(function () {
    filmes.forEach(function (v) {
      if (pausado()) { if (v.__carregado) { v.pause(); ultimoQuadro(v); } }
      else if (v.__visivel) toca(v);
    });
  }).observe(html, { attributes: true, attributeFilter: ['class'] });
  doc.addEventListener('visibilitychange', function () {
    filmes.forEach(function (v) { if (doc.hidden) { if (v.__carregado) v.pause(); } else if (v.__visivel) toca(v); });
  });
})();

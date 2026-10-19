
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };

  
  var v = doc.querySelector('video[data-filme]');
  var con = navigator.connection || {};
  var pode = v && !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver && !con.saveData && !/(^|-)2g$/.test(con.effectiveType || '');
  var pausado = function () { return html.classList.contains('movimento-pausado'); };
  if (pode) {
    html.classList.add('tem-video');
    var movel = mm('(max-width: 760px)');
    var carregado = false, acabou = false;
    var toca = function () {
      if (acabou || pausado()) return;
      if (!carregado) {
        [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (p) {
          var s = (movel && v.getAttribute('data-' + p[0] + '-movel')) || v.getAttribute('data-' + p[0]);
          if (!s) return;
          var el = doc.createElement('source'); el.src = s; el.type = p[1]; v.appendChild(el);
        });
        v.muted = true; v.playsInline = true; v.loop = false;
        v.addEventListener('playing', function () { v.classList.add('tocando'); });
        v.addEventListener('ended', function () { acabou = true; v.classList.add('acabou'); });   
        v.load(); carregado = true;
      }
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {  });
    };
    var comeca = function () {
      if (!('IntersectionObserver' in window)) { toca(); return; }
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) toca(); else if (carregado) { try { v.pause(); } catch (e) {  } } });
      }, { threshold: 0.2 }).observe(v);
    };
    if (doc.readyState === 'complete') setTimeout(comeca, 400); else window.addEventListener('load', function () { setTimeout(comeca, 400); });
    
    doc.addEventListener('click', function (e) {
      if (!(e.target.closest && e.target.closest('[data-pausa]'))) return;
      setTimeout(function () { if (pausado()) { try { v.pause(); } catch (er) {  } } else toca(); }, 0);
    });
  }

  
  var fig = doc.querySelector('[data-simbolo]');
  var abas = Array.prototype.slice.call(doc.querySelectorAll('.simbolo-abas > .aba[data-parte]'));
  if (fig && abas.length) {
    var marca = function () {
      var aberta = abas.filter(function (a) { return !a.hidden; });
      fig.setAttribute('data-ativa', aberta.length === 1 ? aberta[0].getAttribute('data-parte') : 'todas');
    };
    var mo = new MutationObserver(marca);
    abas.forEach(function (a) { mo.observe(a, { attributes: true, attributeFilter: ['hidden'] }); });
    marca();
  }

  
  var esp = doc.querySelector('[data-espaco]');
  if (esp && !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver) {
    var qs = Array.prototype.slice.call(esp.querySelectorAll('[data-quadro]'));
    var marcas = Array.prototype.slice.call(esp.querySelectorAll('.espaco-trilha i'));
    var num = esp.querySelector('[data-espaco-n]');
    var atual = -1, fila = 0;
    var liga = function (ok) { esp.classList.toggle('espaco--vivo', ok); if (ok) { atual = -1; mede(); } else qs.forEach(function (q) { q.removeAttribute('data-ativo'); }); };
    var mede = function () {
      fila = 0;
      if (!esp.classList.contains('espaco--vivo')) return;
      var r = esp.getBoundingClientRect(), total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      var i = Math.min(qs.length - 1, Math.floor(p * qs.length));
      if (i === atual) return;
      atual = i;
      qs.forEach(function (q, k) { if (k === i) q.setAttribute('data-ativo', ''); else q.removeAttribute('data-ativo'); });
      marcas.forEach(function (m, k) { m.classList.toggle('feito', k <= i); });
      if (num) num.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    };
    liga(!html.classList.contains('movimento-pausado'));
    window.addEventListener('scroll', function () { if (!fila) fila = requestAnimationFrame(mede); }, { passive: true });
    window.addEventListener('resize', function () { if (!fila) fila = requestAnimationFrame(mede); });
    doc.addEventListener('click', function (e) {
      if (!(e.target.closest && e.target.closest('[data-pausa]'))) return;
      setTimeout(function () { liga(!html.classList.contains('movimento-pausado')); }, 0);
    });
  }
})();


(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var caixa = doc.querySelector('.nf-fio'), v = caixa && caixa.querySelector('video[data-fio]');
  if (!v) return;
  var conexao = navigator.connection || {};
  var pode = !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver && !conexao.saveData && !/(^|-)2g$/.test(conexao.effectiveType || '') &&
    !html.classList.contains('movimento-pausado') && caixa.offsetWidth > 0;
  try { if (localStorage.getItem('isc_movimento') === 'pausado') pode = false; } catch (e) {  }
  if (!pode) return;
  caixa.classList.add('ob-fio--anima');
  var desiste = function () { caixa.classList.remove('ob-fio--anima'); };
  var seguro = setTimeout(desiste, 4000);
  v.addEventListener('playing', function () { clearTimeout(seguro); caixa.classList.add('ob-fio--tocando'); });
  var comeca = function () {
    [['data-webm', 'video/webm'], ['data-mp4', 'video/mp4']].forEach(function (p) {
      var s = doc.createElement('source'); s.src = v.getAttribute(p[0]); s.type = p[1]; v.appendChild(s);
    });
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.load();
    var p = v.play(); if (p && p.catch) p.catch(desiste);
  };
  if (doc.readyState === 'complete') setTimeout(comeca, 250); else window.addEventListener('load', function () { setTimeout(comeca, 250); });
})();

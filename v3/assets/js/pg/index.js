
(function () {
  'use strict';
  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-equipe]'), function (raiz) {
    var trilho = raiz.querySelector('.equipe-trilho');
    var ctl = raiz.querySelector('.equipe-controles');
    var ant = raiz.querySelector('[data-equipe-ant]'), prox = raiz.querySelector('[data-equipe-prox]');
    if (!trilho || !ctl || !ant || !prox) return;
    function passo() {
      var it = trilho.querySelector('.equipe-item');
      if (!it) return trilho.clientWidth;
      var gap = parseFloat(getComputedStyle(trilho).columnGap) || 0;
      return it.getBoundingClientRect().width + gap;
    }
    function estado() {
      var max = trilho.scrollWidth - trilho.clientWidth;
      ctl.hidden = max < 4;
      ant.disabled = trilho.scrollLeft < 4;
      prox.disabled = trilho.scrollLeft > max - 4;
    }
    function vai(d) { trilho.scrollBy({ left: d * passo(), behavior: reduzido ? 'auto' : 'smooth' }); }
    ant.addEventListener('click', function () { vai(-1); });
    prox.addEventListener('click', function () { vai(1); });
    var q = 0;
    trilho.addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(function () { q = 0; estado(); }); }, { passive: true });
    window.addEventListener('resize', estado);
    estado();
  });
})();

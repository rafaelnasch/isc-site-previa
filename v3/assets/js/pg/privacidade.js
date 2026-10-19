
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.pv-sumario a[href^="#"]'));
  var mapa = {};
  links.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = mapa[en.target.id]; if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  Object.keys(mapa).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
})();

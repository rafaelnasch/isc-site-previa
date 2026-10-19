
(function () {
  'use strict';
  Array.prototype.slice.call(document.querySelectorAll('[data-comparar]')).forEach(function (cx) {
    var sel = cx.querySelector('.comparar-seletor');
    if (!sel) return;
    var bs = Array.prototype.slice.call(sel.querySelectorAll('[data-modo]'));
    function modo(m) {
      cx.setAttribute('data-modo-ativo', m);
      bs.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-modo') === m ? 'true' : 'false'); });
    }
    bs.forEach(function (b) { b.addEventListener('click', function () { modo(b.getAttribute('data-modo')); }); });
    sel.hidden = false;
    cx.classList.add('comparar--vivo');
    modo('online');
  });
})();


(function () {
  'use strict';
  var doc = document;
  if (!navigator.clipboard || !window.isSecureContext) return;
  Array.prototype.forEach.call(doc.querySelectorAll('[data-copiar]'), function (b) {
    var caixa = b.closest('.ct-unidade');
    var alvo = caixa && caixa.querySelector('[data-copiar-texto]');
    if (!alvo) return;
    var rot = b.querySelector('span');
    var original = rot ? rot.textContent : '';
    var aviso = doc.createElement('span');
    aviso.className = 'visualmente-oculto'; aviso.setAttribute('aria-live', 'polite');
    b.parentNode.appendChild(aviso);
    b.hidden = false;
    var t = 0;
    b.addEventListener('click', function () {
      var texto = alvo.textContent.replace(/\s*·\s*/g, ', ').replace(/\s+/g, ' ').trim();
      navigator.clipboard.writeText(texto).then(function () {
        if (rot) rot.textContent = 'Endereço copiado';
        b.setAttribute('data-feito', '');
        aviso.textContent = 'Endereço copiado: ' + texto;
        clearTimeout(t);
        t = setTimeout(function () { if (rot) rot.textContent = original; b.removeAttribute('data-feito'); aviso.textContent = ''; }, 2600);
      }, function () {  });
    });
  });
})();

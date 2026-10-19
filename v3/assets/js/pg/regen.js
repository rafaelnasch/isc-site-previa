
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-checagem]'), function (caixa) {
    var marcas = Array.prototype.slice.call(caixa.querySelectorAll('input[type="checkbox"]'));
    var conta = caixa.querySelector('[data-conta]');
    if (!marcas.length || !conta) return;
    var inicial = conta.textContent;
    function atualiza() {
      var n = marcas.filter(function (m) { return m.checked; }).length;
      caixa.classList.toggle('rg-checagem--marcada', n > 0);
      conta.textContent = n === 0 ? inicial
        : 'Você marcou ' + n + (n === 1 ? ' situação.' : ' situações.') + ' Vale conversar com o ortopedista.';
    }
    marcas.forEach(function (m) { m.addEventListener('change', atualiza); });
    atualiza();
  });
})();


(function () {
  'use strict';
  var v = document.querySelector('.abertura video[data-vinheta-uma]');
  if (!v) return;
  v.addEventListener('playing', function () { v.loop = false; });
  v.addEventListener('ended', function () {
    v.classList.add('vinheta-fim');
    v.play = function () { return Promise.resolve(); };
  });
})();


(function () {
  'use strict';
  var caixa = document.querySelector('[data-levar]');
  if (!caixa || !navigator.clipboard) return;
  caixa.hidden = false;
  var bt = caixa.querySelector('[data-levar-copiar]'), st = caixa.querySelector('[data-levar-status]');
  bt.addEventListener('click', function () {
    var marcadas = Array.prototype.slice.call(document.querySelectorAll('.levar-lista input:checked')).map(function (i) { return '- ' + i.value; });
    if (!marcadas.length) { st.textContent = 'Marque pelo menos uma pergunta.'; return; }
    navigator.clipboard.writeText('Perguntas para a consulta de cirurgia plástica\n' + marcadas.join('\n')).then(function () {
      st.textContent = marcadas.length === 1 ? 'Pergunta copiada.' : marcadas.length + ' perguntas copiadas.';
    }, function () { st.textContent = 'Não foi possível copiar. Você pode anotar à mão.'; });
  });
})();

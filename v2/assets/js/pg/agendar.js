
(function () {
  'use strict';
  if (/[?&]linha=academy(&|$)/i.test(location.search)) { location.replace('/isc-site-previa/v2/academy#lista'); return; }
  var doc = document;
  function pronto() {
    var form = doc.querySelector('form[data-lead="agendar"]');
    if (!form || !window.ISC) return;
    var etapas = Array.prototype.slice.call(form.querySelectorAll('.etapa'));
    var caixa = form.querySelector('[data-linha-escolhida]'), nome = form.querySelector('[data-linha-nome]');
    var whats = doc.querySelector('[data-whats-escolha]');
    var atual = -1;
    function atualiza() {
      var r = form.querySelector('input[name="linha"]:checked');
      var v = r ? r.value : '', rot = r ? r.parentNode.textContent.trim() : '';
      if (r) { var lab = r.closest('[data-so-se-escolhida]'); if (lab) lab.hidden = false; }
      var primeira = !etapas[0].hidden;
      if (caixa) caixa.hidden = !v || primeira;
      if (nome) nome.textContent = rot;
      if (whats) { whats.setAttribute('data-whats-linha', window.ISC.linhas[v] ? v : ''); window.ISC.aplicaWhats(whats.parentNode); }
    }
    function direcao() {
      var i = etapas.filter(function (e) { return !e.hidden; }).map(function (e) { return etapas.indexOf(e); })[0];
      if (i === undefined || i === atual) return;
      form.setAttribute('data-dir', atual < 0 ? 'inicio' : (i > atual ? 'avanca' : 'volta'));
      atual = i;
    }
    form.addEventListener('change', atualiza);
    form.addEventListener('click', function (e) { if (e.target.closest('[data-etapa-proxima],[data-etapa-voltar]')) setTimeout(atualiza, 0); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter') setTimeout(atualiza, 0); });
    var mo = new MutationObserver(function () { direcao(); atualiza(); });
    etapas.forEach(function (et) { mo.observe(et, { attributes: true, attributeFilter: ['hidden'] }); });
    direcao(); atualiza();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(pronto, 0); });
  else setTimeout(pronto, 0);
})();

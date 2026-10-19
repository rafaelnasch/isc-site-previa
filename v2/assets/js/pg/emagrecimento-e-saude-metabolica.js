
(function () {
  'use strict';
  var doc = document;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  
  $$('video[data-uma-vez]').forEach(function (v) {
    v.addEventListener('play', function () { v.loop = false; });
    v.addEventListener('ended', function () {
      v.__fim = true;
      try { v.pause(); } catch (e) {  }
      v.play = function () { return { catch: function () {} }; };   
    });
  });

  
  $$('[data-diag]').forEach(function (diag) {
    var botoes = $$('[data-diag-alvo]', diag);
    var paineis = $$('.diag-painel', diag);
    var fios = $$('[data-fio]', diag);
    if (!botoes.length || !paineis.length) return;
    diag.classList.add('diag--vivo');
    function escolhe(alvo, foco) {
      botoes.forEach(function (b) {
        var on = b.getAttribute('data-diag-alvo') === alvo;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        b.classList.toggle('ativo', on);
      });
      paineis.forEach(function (p) { p.hidden = p.id !== 'diag-' + alvo; });
      fios.forEach(function (f) { f.classList.toggle('on', f.getAttribute('data-fio') === alvo); });
      diag.setAttribute('data-ativo', alvo);
      if (foco) { var p = doc.getElementById('diag-' + alvo); if (p) p.focus({ preventScroll: true }); }
    }
    paineis.forEach(function (p) { p.setAttribute('tabindex', '-1'); });
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { escolhe(b.getAttribute('data-diag-alvo')); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % botoes.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + botoes.length) % botoes.length;
        if (n === null) return;
        e.preventDefault(); botoes[n].focus(); escolhe(botoes[n].getAttribute('data-diag-alvo'));
      });
    });
    escolhe('consulta');
  });
})();

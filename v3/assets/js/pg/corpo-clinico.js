
(function () {
  'use strict';
  var doc = document;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-medico]');
    var s = doc.getElementById('cc-medico');
    if (a && s) s.value = a.getAttribute('data-medico');
  });

  var grupo = doc.querySelector('.cc-filtro'); if (!grupo) return;
  var res = doc.querySelector('.cc-filtro-res');
  var alvos = $$('[data-areas]');
  var botoes = $$('button[data-filtro]', grupo);
  var nomeDe = function (el) {
    if (el.getAttribute('data-nome')) return el.getAttribute('data-nome');
    var n = el.querySelector('.id-medica > span'); return n ? n.textContent.trim() : '';
  };
  function filtra(k) {
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filtro') === k ? 'true' : 'false'); });
    var quem = [];
    alvos.forEach(function (el) {
      var bate = k === 'todas' || (' ' + el.getAttribute('data-areas') + ' ').indexOf(' ' + k + ' ') >= 0;
      el.classList.toggle('cc-esmaecido', !bate);
      if (bate && k !== 'todas') quem.push(el);
    });
    if (!res) return;
    res.textContent = '';
    if (k === 'todas') return;
    res.appendChild(doc.createTextNode('Quem atende: '));
    quem.forEach(function (el, i) {
      var a = doc.createElement('a'); a.href = '#' + el.id; a.textContent = nomeDe(el);
      res.appendChild(a);
      if (i < quem.length - 1) res.appendChild(doc.createTextNode(i === quem.length - 2 ? ' e ' : ', '));
    });
    res.appendChild(doc.createTextNode('.'));
  }
  botoes.forEach(function (b) { b.addEventListener('click', function () { filtra(b.getAttribute('data-filtro')); }); });
  grupo.hidden = false;
})();

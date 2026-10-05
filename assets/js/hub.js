
(function () {
  'use strict';
  var doc = document;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {  }

  
  var filtro = doc.querySelector('.filtro');
  var itens = $$('.catalogo > .cat-item');
  if (filtro && itens.length) {
    var botoes = $$('.filtro-op', filtro);
    var conta = filtro.querySelector('.filtro-conta');
    var secao = doc.getElementById('areas');
    var NOMES = {};
    botoes.forEach(function (b) { NOMES[b.getAttribute('data-filtro')] = b.firstChild.textContent.trim(); });
    filtro.hidden = false;

    var aplica = function (nec, rolar) {
      if (!Object.prototype.hasOwnProperty.call(NOMES, nec)) nec = '';
      var n = 0;
      itens.forEach(function (it) {
        var tem = !nec || (' ' + it.getAttribute('data-nec') + ' ').indexOf(' ' + nec + ' ') >= 0;
        it.hidden = !tem;
        if (tem) n++;
      });
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === nec)); });
      if (conta) conta.textContent = nec ? (n === 1 ? 'Mostrando 1 área' : 'Mostrando ' + n + ' áreas') + ' para ' + NOMES[nec].toLowerCase() + '.' : 'Mostrando as ' + itens.length + ' áreas.';
      try {
        var url = new URL(location.href);
        if (nec) url.searchParams.set('necessidade', nec); else url.searchParams.delete('necessidade');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      } catch (e) {  }
      if (rolar) (filtro || secao).scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' });
    };

    botoes.forEach(function (b) { b.addEventListener('click', function () { aplica(b.getAttribute('data-filtro'), false); }); });
    
    $$('a[data-filtro]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        aplica(a.getAttribute('data-filtro'), true);
        var alvo = botoes.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
        if (alvo) setTimeout(function () { try { alvo.focus({ preventScroll: true }); } catch (er) { alvo.focus(); } }, reduzido ? 0 : 450);
      });
    });
    var inicial = '';
    try { inicial = (new URLSearchParams(location.search).get('necessidade') || '').toLowerCase().replace(/[^a-z-]/g, ''); } catch (e) {  }
    aplica(inicial, false);
  }

  
  $$('[data-mapa]').forEach(function (caixa) {
    var botao = caixa.querySelector('.mapa-abre');
    if (!botao) return;
    botao.hidden = false;
    botao.addEventListener('click', function () {
      var q = caixa.getAttribute('data-mapa');
      var f = doc.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
      f.title = 'Mapa: ' + (caixa.getAttribute('data-mapa-nome') || q);
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      caixa.classList.add('mapa--aberto');
      caixa.querySelector('.mapa-tela').appendChild(f);
      botao.hidden = true;
      f.focus();
    });
  });
})();

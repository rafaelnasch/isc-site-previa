
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var reduzido = mm('(prefers-reduced-motion: reduce)');

  
  var barra = $('[data-filtro-barra]');
  var areas = doc.getElementById('areas');
  var itens = areas ? $$('[data-nec]', areas) : [];
  if (barra && itens.length) {
    var botoes = $$('.trt-filtro-op', barra);
    var conta = $('.trt-filtro-conta', barra);
    var vazio = $('.trt-vazio', areas);
    var grade = $('.trt-grade', areas);
    var NOMES = {};
    var tem = function (nec) { return function (it) { return !nec || (' ' + it.getAttribute('data-nec') + ' ').indexOf(' ' + nec + ' ') >= 0; }; };
    botoes.forEach(function (b) {
      var f = b.getAttribute('data-filtro');
      NOMES[f] = b.firstChild.textContent.trim();
      var n = b.querySelector('.trt-filtro-n'); if (n) n.textContent = String(itens.filter(tem(f)).length);
    });
    barra.hidden = false;
    var aplica = function (nec, rolar) {
      if (!Object.prototype.hasOwnProperty.call(NOMES, nec)) nec = '';
      var n = 0, f = tem(nec);
      itens.forEach(function (it) { var ok = f(it); it.hidden = !ok; if (ok) n++; });
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === nec)); });
      if (conta) conta.textContent = nec ? (n === 1 ? 'Mostrando 1 área' : 'Mostrando ' + n + ' áreas') + ' para ' + NOMES[nec].toLowerCase() + '.' : 'Mostrando todas as ' + itens.length + ' áreas.';
      if (vazio) vazio.hidden = n > 0;
      if (grade && !reduzido) {
        grade.classList.remove('trt-anima'); void grade.offsetWidth; grade.classList.add('trt-anima');
        var casa = $('.trt-casa', areas); if (casa) { casa.classList.remove('trt-anima-casa'); void casa.offsetWidth; casa.classList.add('trt-anima-casa'); }
      }
      try {
        var url = new URL(location.href);
        if (nec) url.searchParams.set('necessidade', nec); else url.searchParams.delete('necessidade');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      } catch (e) {  }
      if (rolar) {
        var y = areas.querySelector('.trt-filtro').getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: reduzido ? 'auto' : 'smooth' });
      }
      
      var ativo = botoes.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
      var faixa = $('.trt-filtro-opcoes', barra);
      if (ativo && faixa && faixa.scrollWidth > faixa.clientWidth) {
        faixa.scrollTo({ left: Math.max(0, ativo.offsetLeft - 16), behavior: reduzido ? 'auto' : 'smooth' });
      }
    };
    botoes.forEach(function (b) { b.addEventListener('click', function () { aplica(b.getAttribute('data-filtro'), false); }); });
    $$('[data-filtro]').forEach(function (a) {
      if (barra.contains(a)) return;
      a.addEventListener('click', function (e) { e.preventDefault(); aplica(a.getAttribute('data-filtro'), true); });
    });
    var inicial = '';
    try { inicial = (new URLSearchParams(location.search).get('necessidade') || '').toLowerCase().replace(/[^a-z-]/g, ''); } catch (e) {  }
    aplica(inicial, false);
    if (grade) grade.classList.remove('trt-anima');
  }

  
  var PAGINAS = {
    'contorno-corporal': '/isc-site-previa/v3/contorno-corporal', 'cirurgia-plastica': '/isc-site-previa/v3/cirurgia-plastica', 'pele-e-rosto': '/isc-site-previa/v3/pele-e-rosto',
    'dermatologia': '/isc-site-previa/v3/dermatologia', 'emagrecimento-e-saude-metabolica': '/isc-site-previa/v3/emagrecimento-e-saude-metabolica',
    'acompanhamento-online': '/isc-site-previa/v3/acompanhamento-online', 'saude-integrada': '/isc-site-previa/v3/saude-integrada', 'saude-da-mulher': '/isc-site-previa/v3/saude-da-mulher',
    'ortopedia-e-dor': '/isc-site-previa/v3/ortopedia-e-dor', 'benessere': '/isc-site-previa/v3/benessere'
  };
  function pronto() {
    var form = $('form[data-lead="tratamentos"]');
    if (!form || !window.ISC) return;
    var caixa = $('[data-trt-escolha]', form), nome = $('[data-trt-escolha-nome]', form), link = $('[data-trt-escolha-link]', form);
    var whats = $('[data-trt-whats]');
    function atualiza() {
      var r = $('input[name="linha"]:checked', form);
      var v = r ? r.value : '';
      var primeira = !$('.etapa', form).hidden;
      if (caixa) caixa.hidden = !v || primeira;
      if (nome) nome.textContent = r ? r.parentNode.textContent.trim() : '';
      if (link) { link.hidden = !PAGINAS[v]; if (PAGINAS[v]) { link.href = PAGINAS[v]; link.textContent = 'Saber mais sobre isso'; } }
      if (whats) { whats.setAttribute('data-whats-linha', window.ISC.linhas[v] ? v : ''); window.ISC.aplicaWhats(whats.parentNode); }
    }
    form.addEventListener('change', atualiza);
    form.addEventListener('click', function (e) { if (e.target.closest('[data-etapa-proxima],[data-etapa-voltar]')) setTimeout(atualiza, 0); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter') setTimeout(atualiza, 0); });
    new MutationObserver(atualiza).observe($('.etapa', form), { attributes: true, attributeFilter: ['hidden'] });
    atualiza();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(pronto, 0); });
  else setTimeout(pronto, 0);
})();

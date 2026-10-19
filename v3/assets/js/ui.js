
(function () {
  'use strict';
  var doc = document, html = doc.documentElement, body = doc.body;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var reduzido = mm('(prefers-reduced-motion: reduce)');
  var ICONE = function (d) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };

  
  var topo = $('.topo');
  var ultimoY = window.scrollY, q = 0;
  function algoAberto() {
    return body.classList.contains('menu-aberto') || body.classList.contains('gaveta-aberta') || !!$('.mega:not([hidden])') ||
      (doc.activeElement && topo && topo.contains(doc.activeElement));
  }
  function cab() {
    q = 0;
    if (!topo) return;
    var y = window.scrollY, dy = y - ultimoY;
    topo.classList.toggle('topo--compacto', y > 24);
    if (mm('(max-width: 1024px)')) {
      if (y < 120 || dy < -6 || algoAberto()) topo.classList.remove('topo--oculto');
      else if (dy > 6) topo.classList.add('topo--oculto');
    } else topo.classList.remove('topo--oculto');
    var alt = doc.documentElement.scrollHeight - window.innerHeight;
    topo.style.setProperty('--leitura-p', alt > 0 ? Math.min(1, y / alt).toFixed(4) : 0);
    if (Math.abs(dy) > 6) ultimoY = y;
  }
  window.addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(cab); }, { passive: true });
  window.addEventListener('resize', function () { if (!q) q = requestAnimationFrame(cab); });
  if (topo) topo.addEventListener('focusin', function () { topo.classList.remove('topo--oculto'); });
  cab();

  
  var mega = $('.mega');
  var vitrine = mega && $('.mega-vitrine', mega);
  if (mega && vitrine) {
    var img = $('img', vitrine), leg = $('figcaption', vitrine);
    var abriu = false;
    new MutationObserver(function () {
      if (mega.hidden || abriu) return;
      abriu = true;
      if (img.getAttribute('data-src')) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    }).observe(mega, { attributes: true, attributeFilter: ['hidden'] });
    var atual = img.getAttribute('data-src') || img.getAttribute('src');
    var troca = function (a) {
      var v = a.getAttribute('data-vitrine'); if (!v) return;
      var partes = v.split('|'), src = partes[0];
      if (src === atual) return;
      atual = src;
      var novo = new Image(); novo.decoding = 'async'; novo.src = src;
      var poe = function () {
        img.classList.add('saindo');
        setTimeout(function () { img.src = src; img.classList.remove('saindo'); if (leg && partes[1]) leg.textContent = partes[1]; }, reduzido ? 0 : 180);
      };
      if (novo.complete) poe(); else novo.addEventListener('load', poe, { once: true });
    };
    $$('[data-vitrine]', mega).forEach(function (a) {
      a.addEventListener('mouseenter', function () { troca(a); });
      a.addEventListener('focus', function () { troca(a); });
    });
  }

  
  var gaveta = doc.getElementById('gaveta-agendar');
  var naAgenda = /\/agendar(\.html)?$/.test(location.pathname);
  var gForm = gaveta && $('form[data-lead]', gaveta);
  var origem = null;
  function linhaDaPagina(el) {
    return (el && el.getAttribute('data-linha')) || body.getAttribute('data-linha') || '';
  }
  function linhaDoHref(a) {
    var h = a && a.getAttribute('href') || '';
    var m = h.match(/[?&]linha=([a-z-]+)/); return m ? m[1] : '';
  }
  function focaveis(r) { return $$('a[href],button:not([disabled]),input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])', r).filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden],.isca'); }); }
  function atualizaEscolha() {
    if (!gForm) return;
    var caixa = $('[data-linha-escolhida]', gForm), nome = $('[data-linha-nome]', gForm);
    var r = $('input[name="linha"]:checked', gForm);
    var primeira = !$('.etapa', gForm).hidden;
    if (caixa) { caixa.hidden = !r || primeira; if (nome) nome.textContent = r ? r.parentNode.textContent.trim() : ''; }
  }
  function abreGaveta(linha, de) {
    if (!gaveta) return false;
    origem = de || doc.activeElement;
    gaveta.hidden = false;
    body.classList.add('gaveta-aberta');
    $$('main,footer,.topo,.barra-cta,.menu-movel').forEach(function (el) { el.setAttribute('inert', ''); });
    if (gForm && linha) {
      var r = $('input[name="linha"][value="' + linha + '"]', gForm);
      if (r) { r.checked = true; if (gForm.__mostra && gForm.elements.nome) gForm.__mostra(gForm.elements.nome); }
    }
    atualizaEscolha();
    var tit = $('#gaveta-titulo', gaveta);
    setTimeout(function () { var f = $('.etapa:not([hidden]) input:not([type="hidden"]),.etapa:not([hidden]) .opcao input', gaveta) || tit; if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }, reduzido ? 0 : 60);
    return true;
  }
  function fechaGaveta() {
    if (!gaveta || gaveta.hidden) return;
    gaveta.hidden = true;
    body.classList.remove('gaveta-aberta');
    $$('main,footer,.topo,.menu-movel').forEach(function (el) { el.removeAttribute('inert'); });
    var barra = $('.barra-cta'); if (barra && !barra.classList.contains('barra-cta--oculta')) barra.removeAttribute('inert');
    if (origem && origem.focus) try { origem.focus({ preventScroll: true }); } catch (e) { origem.focus(); }
  }
  if (gaveta && gForm && !naAgenda) {
    
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('[data-gaveta],a[href]');
      if (!a || gaveta.contains(a)) return;
      var href = a.getAttribute('href') || '';
      var secAg = doc.getElementById('agendar');
      var temFormNaPagina = !!(secAg && secAg.querySelector('form'));
      var abre = a.hasAttribute('data-gaveta') ||
        /^\/isc-site-previa\/v3\/agendar(\?|$)/.test(href) ||
        (href === '#agendar' && !temFormNaPagina);
      if (!abre) return;
      if (temFormNaPagina && !a.hasAttribute('data-gaveta')) return;   
      e.preventDefault();
      if (body.classList.contains('menu-aberto')) { var fm = $('[data-fecha="menu"]'); if (fm) fm.click(); }
      abreGaveta(linhaDoHref(a) || linhaDaPagina(a), a);
    }, true);
    $$('[data-fecha-gaveta]', gaveta).forEach(function (b) { b.addEventListener('click', fechaGaveta); });
    gaveta.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fechaGaveta(); return; }
      if (e.key !== 'Tab') return;
      var f = focaveis(gaveta); if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    gForm.addEventListener('change', atualizaEscolha);
    gForm.addEventListener('click', function (e) { if (e.target.closest('[data-etapa-proxima],[data-etapa-voltar]')) setTimeout(atualizaEscolha, 0); });
    new MutationObserver(atualizaEscolha).observe($('.etapa', gForm), { attributes: true, attributeFilter: ['hidden'] });
    if (location.hash === '#agende') setTimeout(function () { abreGaveta(linhaDaPagina()); }, 300);
  }

  
  $$('[data-abas]').forEach(function (caixa, n) {
    var paineis = $$(':scope > .aba', caixa); if (paineis.length < 2) return;
    var lista = doc.createElement('div');
    lista.className = 'abas-lista'; lista.setAttribute('role', 'tablist');
    if (caixa.getAttribute('data-abas')) lista.setAttribute('aria-label', caixa.getAttribute('data-abas'));
    var botoes = paineis.map(function (p, i) {
      var id = p.id || ('aba-' + n + '-' + i); p.id = id;
      var b = doc.createElement('button');
      b.type = 'button'; b.id = id + '-botao'; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', id);
      b.textContent = p.getAttribute('data-aba') || ($('.aba-titulo', p) || {}).textContent || ('Parte ' + (i + 1));
      p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id); p.setAttribute('tabindex', '0');
      lista.appendChild(b);
      return b;
    });
    function escolhe(i, focar) {
      botoes.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; paineis[j].hidden = j !== i; });
      if (focar) botoes[i].focus();
    }
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { escolhe(i); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, d = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); escolhe((i + d + botoes.length) % botoes.length, true); }
        if (k === 'Home') { e.preventDefault(); escolhe(0, true); }
        if (k === 'End') { e.preventDefault(); escolhe(botoes.length - 1, true); }
      });
    });
    caixa.insertBefore(lista, paineis[0]);
    caixa.classList.add('abas--ativas');
    
    var alvo = location.hash && paineis.map(function (p) { return '#' + p.id; }).indexOf(location.hash);
    escolhe(alvo > 0 ? alvo : 0);
  });

  
  $$('[data-depoimentos]').forEach(function (sec) {
    var itens = $$('.depo', sec); if (itens.length < 2) return;
    var ctl = $('.depo-controles', sec); if (!ctl) return;
    var ant = $('[data-depo-ant]', ctl), prox = $('[data-depo-prox]', ctl), conta = $('.depo-conta', ctl);
    var lista = $('.depo-lista', sec), i = 0;
    
    var maior = 0; itens.forEach(function (it) { maior = Math.max(maior, it.offsetHeight); });
    sec.classList.add('depoimentos--um'); ctl.hidden = false;
    if (maior) lista.style.setProperty('--depo-altura', maior + 'px');
    lista.setAttribute('aria-live', 'polite');
    function mostra(k) {
      i = Math.max(0, Math.min(itens.length - 1, k));
      itens.forEach(function (it, j) { it.classList.toggle('atual', j === i); });
      if (conta) conta.textContent = (i + 1) + ' de ' + itens.length;
      if (ant) ant.disabled = i === 0;
      if (prox) prox.disabled = i === itens.length - 1;
    }
    if (ant) ant.addEventListener('click', function () { mostra(i - 1); });
    if (prox) prox.addEventListener('click', function () { mostra(i + 1); });
    sec.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') mostra(i + 1); if (e.key === 'ArrowLeft') mostra(i - 1); });
    mostra(0);
  });

  
  $$('[data-player]').forEach(function (fig) {
    var capa = $('.player-capa', fig), tela = $('.player-tela', fig); if (!capa || !tela) return;
    capa.addEventListener('click', function () {
      var v = doc.createElement('video');
      v.controls = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      var titulo = fig.getAttribute('data-titulo'); if (titulo) v.setAttribute('aria-label', titulo);
      var poster = $('img', capa); if (poster) v.poster = poster.currentSrc || poster.src;
      [['data-webm', 'video/webm'], ['data-mp4', 'video/mp4']].forEach(function (par) {
        var s = fig.getAttribute(par[0]); if (!s) return;
        var src = doc.createElement('source'); src.src = s; src.type = par[1]; v.appendChild(src);
      });
      var leg = fig.getAttribute('data-legendas');
      if (leg) { var tr = doc.createElement('track'); tr.kind = 'captions'; tr.srclang = 'pt-BR'; tr.label = 'Português'; tr.src = leg; tr.default = true; v.appendChild(tr); }
      tela.replaceChild(v, capa);
      var p = v.play(); if (p && p.catch) p.catch(function () {  });
      v.focus();
    }, { once: true });
  });

  window.ISCui = { abreGaveta: abreGaveta, fechaGaveta: fechaGaveta };
})();

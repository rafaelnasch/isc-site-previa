
(function () {
  'use strict';
  var doc = document, html = doc.documentElement, body = doc.body;
  html.classList.add('js');
  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {  }
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  
  try {
    var qp = new URLSearchParams(location.search).get('pendencias');
    if (qp === '1') sessionStorage.setItem('isc_pendencias', '1');
    if (qp === '0') sessionStorage.removeItem('isc_pendencias');
    if (qp !== '0') html.classList.add('com-realce');
  } catch (e) {  }

  
  var secAgendar = doc.getElementById('agendar');
  if (secAgendar && secAgendar.querySelector('form')) {
    $$('a[href="/isc-site-previa/agendar"]').forEach(function (a) { if (!secAgendar.contains(a)) a.setAttribute('href', '#agendar'); });
  }

  
  function cartaoDe(hash) {
    var sec = hash && hash.length > 1 ? doc.getElementById(hash.slice(1)) : null;
    return sec ? (sec.querySelector('.form-caixa') || null) : null;
  }
  function vaiAoCartao(hash, suave) {
    var c = cartaoDe(hash); if (!c || window.innerWidth > 1024) return false;
    var y = c.getBoundingClientRect().top + window.scrollY - ((topo && topo.offsetHeight) || 72) - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: suave && !reduzido ? 'smooth' : 'auto' });
    return true;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var h = a.getAttribute('href');
    if ((h === '#agendar' || h === '#lista') && vaiAoCartao(h, true)) { e.preventDefault(); try { history.replaceState(null, '', h); } catch (er) {  } }
  });
  if (location.hash === '#agendar' || location.hash === '#lista') window.addEventListener('load', function () { setTimeout(function () { vaiAoCartao(location.hash, false); }, 50); });

  
  var WHATS = {
    lead: '5541995522816',        
    benessere: '5541998080584'    
  };
  
  var LINHAS = {
    'contorno-corporal': 'contorno corporal',
    'gluteo': 'contorno de glúteo',
    'pele-e-rosto': 'pele e rosto',
    'dermatologia': 'dermatologia clínica e capilar',
    'emagrecimento-e-saude-metabolica': 'emagrecimento e saúde metabólica',
    'acompanhamento-online': 'acompanhamento online',
    'saude-da-mulher': 'saúde da mulher',
    'ortopedia-e-dor': 'ortopedia e dor',
    'cirurgia-plastica': 'cirurgia plástica',
    'saude-integrada': 'saúde integrada',
    'regen': 'ISC REGEN',
    'benessere': 'acupuntura na Benessere',
    'academy': 'ISC Academy'
  };

  
  var ALIAS = { 'emagrecimento-e-longevidade': 'emagrecimento-e-saude-metabolica', 'dor-e-medicina-esportiva': 'ortopedia-e-dor' };

  
  var topo = $('.topo');
  var mega = null, btnMega = null;
  function campoEm(y) {
    var x = Math.min(24, window.innerWidth / 2);
    var els = doc.elementsFromPoint ? doc.elementsFromPoint(x, y) : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (topo && topo.contains(el)) continue;
      if (el.closest && el.closest('.barra-cta,.menu-movel')) continue;
      for (var n = el; n && n !== html; n = n.parentElement) {
        var c = n.classList;
        if (c.contains('sec--preta') || c.contains('campo-preto') || c.contains('campo-noite') || c.contains('campo-casa') || c.contains('rodape')) return 'preto';
        if (c.contains('sec--marfim') || c.contains('campo-marfim') || c.contains('campo-areia') || c.contains('campo-branco')) return 'marfim';
      }
      return 'marfim';
    }
    return 'marfim';
  }
  function megaAberto() { return !!(mega && !mega.hidden); }
  function atualizaTopo() {
    if (!topo) return;
    var h = topo.offsetHeight || 80;
    var c = campoEm(Math.round(h / 2));
    topo.classList.toggle('topo--preto', c === 'preto');
    topo.classList.toggle('topo--alto', window.scrollY < 8 && c === 'preto' && !megaAberto() && !!$('.hero'));
  }
  var pedido = 0;
  function agenda() { if (!pedido) pedido = requestAnimationFrame(function () { pedido = 0; atualizaTopo(); barra(); }); }
  window.addEventListener('scroll', agenda, { passive: true });
  window.addEventListener('resize', agenda);

  
  btnMega = $('[data-abre="tratamentos"]');
  mega = btnMega ? doc.getElementById(btnMega.getAttribute('aria-controls')) : null;
  var tempoFecha = 0;
  function abreMega(abrir, focar) {
    if (!mega) return;
    clearTimeout(tempoFecha);
    mega.hidden = !abrir;
    btnMega.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    atualizaTopo();
    if (abrir && focar) { var p = $('a[href]', mega); if (p) p.focus(); }
  }
  if (btnMega && mega) {
    var li = btnMega.parentElement;
    var fino = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    btnMega.addEventListener('click', function () {
      if (fino && megaAberto() && li.matches(':hover')) return;   
      abreMega(!megaAberto());
    });
    btnMega.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); abreMega(true, true); }
      
      if (e.key === 'Tab' && !e.shiftKey && megaAberto()) { var p1 = $('a[href]', mega); if (p1) { e.preventDefault(); p1.focus(); } }
    });
    mega.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var ls = $$('a[href]', mega); if (!ls.length) return;
      if (e.shiftKey && doc.activeElement === ls[0]) { e.preventDefault(); btnMega.focus(); }
      else if (!e.shiftKey && doc.activeElement === ls[ls.length - 1]) {
        
        var prox = li.nextElementSibling && $('a[href],button', li.nextElementSibling);
        if (prox) { e.preventDefault(); abreMega(false); prox.focus(); }
      }
    });
    if (fino) {
      [li, mega].forEach(function (alvo) {
        alvo.addEventListener('mouseenter', function () { clearTimeout(tempoFecha); abreMega(true); });
        alvo.addEventListener('mouseleave', function () { tempoFecha = setTimeout(function () { abreMega(false); }, 220); });
      });
    }
    doc.addEventListener('click', function (e) { if (megaAberto() && !li.contains(e.target) && !mega.contains(e.target)) abreMega(false); });
    [li, mega].forEach(function (alvo) {
      alvo.addEventListener('focusout', function (e) {
        var para = e.relatedTarget;
        if (para && (li.contains(para) || mega.contains(para))) return;
        if (para) abreMega(false);
      });
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && megaAberto()) { abreMega(false); btnMega.focus(); } });
    $$('a[href]', mega).forEach(function (a) { a.addEventListener('click', function () { abreMega(false); }); });
  }

  
  var btnMenu = $('.menu-abre');
  var menu = btnMenu ? doc.getElementById(btnMenu.getAttribute('aria-controls')) : null;
  function focaveis(r) { return $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', r).filter(function (el) { return el.offsetParent !== null || el === doc.activeElement; }); }
  function abreMenu(abrir) {
    if (!menu) return;
    menu.hidden = !abrir;
    btnMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    body.classList.toggle('menu-aberto', abrir);
    $$('main,footer,.topo,.barra-cta').forEach(function (el) { if (abrir) el.setAttribute('inert', ''); else if (!el.classList.contains('barra-cta--oculta')) el.removeAttribute('inert'); });
    if (abrir) { var f = focaveis(menu); if (f[1]) f[1].focus(); else if (f[0]) f[0].focus(); }
    else btnMenu.focus();
  }
  if (btnMenu && menu) {
    btnMenu.addEventListener('click', function () { abreMenu(true); });
    $$('[data-fecha="menu"]', menu).forEach(function (b) { b.addEventListener('click', function () { abreMenu(false); }); });
    $$('a[href]', menu).forEach(function (a) {
      a.addEventListener('click', function () { if (!menu.hidden) { menu.hidden = true; body.classList.remove('menu-aberto'); btnMenu.setAttribute('aria-expanded', 'false'); $$('main,footer,.topo').forEach(function (el) { el.removeAttribute('inert'); }); barra(); } });
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { abreMenu(false); return; }
      if (e.key !== 'Tab') return;
      var f = focaveis(menu); if (!f.length) return;
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && doc.activeElement === ult) { e.preventDefault(); pri.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024 && !menu.hidden) abreMenu(false); });
  }

  
  var barraEl = $('.barra-cta');
  var fimEls = $$('.rodape,[data-sem-barra]');
  var heroBotoes = $('.hero .botoes');
  function barra() {
    if (!barraEl) return;
    var vh = window.innerHeight, oculta = false;
    if (heroBotoes) { var rb = heroBotoes.getBoundingClientRect(); if (rb.bottom > 0 && rb.top < vh) oculta = true; }
    for (var i = 0; !oculta && i < fimEls.length; i++) { var r = fimEls[i].getBoundingClientRect(); if (r.top < vh - 40 && r.bottom > 0) oculta = true; }
    barraEl.classList.toggle('barra-cta--oculta', oculta);
    if (oculta) barraEl.setAttribute('inert', ''); else barraEl.removeAttribute('inert');
  }

  
  var alvos = $$('.reveal');
  var secoes = $$('.sec');
  var automatizado = !!navigator.webdriver;
  if (!reduzido && !automatizado && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    alvos.forEach(function (el) { io.observe(el); });
    var ioSec = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); ioSec.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });
    secoes.forEach(function (el) { ioSec.observe(el); });
    setTimeout(function () { alvos.forEach(function (el) { el.classList.add('in'); }); }, 4000);   
  } else {
    alvos.forEach(function (el) { el.classList.add('in'); });
    secoes.forEach(function (el) { el.classList.add('visto'); });
  }

  
  var UTM_CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var utm = {}, linhaUrl = '', origemUrl = '';
  try {
    var q = new URLSearchParams(location.search);
    UTM_CHAVES.forEach(function (k) { if (q.get(k)) utm[k] = q.get(k).slice(0, 120); });
    if (Object.keys(utm).length) sessionStorage.setItem('isc_utm', JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem('isc_utm') || '{}');
    linhaUrl = (q.get('linha') || '').toLowerCase().replace(/[^a-z-]/g, '');
    if (ALIAS[linhaUrl]) linhaUrl = ALIAS[linhaUrl];
    if (!LINHAS[linhaUrl] && linhaUrl !== 'orientacao') linhaUrl = '';   
    origemUrl = (q.get('origem') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
    if (origemUrl) sessionStorage.setItem('isc_origem', origemUrl); else origemUrl = sessionStorage.getItem('isc_origem') || '';
  } catch (e) { utm = {}; }

  
  function linkWhats(linha, numero) {
    var nome = LINHAS[linha];
    var msg = 'Olá, vim pelo site do Instituto ISC e quero saber como funciona a consulta' + (nome ? ' de ' + nome : '') + '.';
    if (linha === 'academy') msg = 'Olá, sou médico(a), vim pelo site do Instituto ISC e quero saber sobre a ISC Academy.';
    if (linha === 'regen') msg = 'Olá, vim pelo site do Instituto ISC e quero saber sobre o ISC REGEN.';
    if (linha === 'acompanhamento-online') msg = 'Olá, vim pelo site do Instituto ISC e quero saber sobre o acompanhamento online.';
    return 'https://wa.me/' + (numero || (linha === 'benessere' ? WHATS.benessere : WHATS.lead)) + '?text=' + encodeURIComponent(msg);
  }
  function novaAba(a) {
    if (a.querySelector('.nova-aba') || /nova aba/.test(a.textContent)) return;
    var s = doc.createElement('span'); s.className = 'visualmente-oculto nova-aba'; s.textContent = ' (abre em nova aba)'; a.appendChild(s);
  }
  function aplicaWhats(raiz) {
    $$('[data-whats-linha],[data-whats]', raiz).forEach(function (a) {
      var linha = a.getAttribute('data-whats-linha') || '';
      var canal = a.getAttribute('data-whats') || '';
      a.href = linkWhats(linha, WHATS[canal] || '');
      if (!a.target) { a.target = '_blank'; a.rel = 'noopener'; }
    });
    $$('a[target="_blank"]', raiz).forEach(novaAba);
  }
  aplicaWhats(doc);

  
  function mascaraWhatsApp(input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11), v = d;
      if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 6) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
      input.value = v;
    });
  }
  function mensagem(campo) {
    var v = (campo.value || '').trim(), tipo = campo.getAttribute('data-tipo') || campo.type;
    if (campo.type === 'checkbox') return campo.required && !campo.checked ? (campo.getAttribute('data-erro') || 'Marque para continuar.') : '';
    if (campo.type === 'radio') {
      var grupo = $$('input[type="radio"][name="' + campo.name + '"]', campo.form || doc);
      var algum = grupo.some(function (r) { return r.checked; });
      return grupo.some(function (r) { return r.required; }) && !algum ? (grupo[0].getAttribute('data-erro') || 'Escolha uma opção para continuar.') : '';
    }
    if (campo.required && !v) return campo.getAttribute('data-erro') || 'Preencha este campo para continuar.';
    if (!v) return '';
    if (tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Confira o e-mail: ele precisa ter @ e um final, como .com.br.';
    if (tipo === 'whatsapp') { var n = v.replace(/\D/g, ''); if (n.length < 10 || n.length > 11) return 'Confira o número: DDD mais 8 ou 9 dígitos, como (41) 99999-9999.'; }
    if (campo.minLength > 0 && v.length < campo.minLength) return 'Escreva um pouco mais: pelo menos ' + campo.minLength + ' caracteres.';
    return '';
  }
  function marca(campo, msg) {
    var caixa = campo.closest('.campo-form') || campo.parentElement;
    var base = campo.type === 'radio' ? campo.name : (campo.id || campo.name);
    var id = base + '-erro', el = doc.getElementById(id);
    var alvos = campo.type === 'radio' ? $$('input[type="radio"][name="' + campo.name + '"]', campo.form || doc) : [campo];
    if (msg) {
      caixa.classList.add('tem-erro');
      if (!el) { el = doc.createElement('p'); el.className = 'campo-erro'; el.id = id; caixa.appendChild(el); }
      el.textContent = msg;
      alvos.forEach(function (c) {
        c.setAttribute('aria-invalid', 'true');
        var desc = (c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (desc.indexOf(id) < 0) { desc.push(id); c.setAttribute('aria-describedby', desc.join(' ')); }
      });
    } else {
      caixa.classList.remove('tem-erro');
      alvos.forEach(function (c) { c.removeAttribute('aria-invalid'); });
      if (el) el.remove();
    }
  }
  function validar(raiz) {
    var primeiro = null, vistos = {};
    $$('input,select,textarea', raiz).forEach(function (c) {
      if (c.type === 'hidden' || c.disabled || c.closest('.isca')) return;
      if (c.type === 'radio') { if (vistos[c.name]) return; vistos[c.name] = 1; }
      var m = mensagem(c); marca(c, m); if (m && !primeiro) primeiro = c;
    });
    if (primeiro) primeiro.focus();
    return !primeiro;
  }
  
  function enviarLead(dados) {
    var corpo = Object.assign({}, dados, { pagina: location.pathname });
    if (Object.keys(utm).length) corpo.utm = utm;
    if (origemUrl && !corpo.origem_campanha) corpo.origem_campanha = origemUrl;
    if (!window.fetch) return Promise.resolve({ ok: false, status: 0 });
    var ctl = window.AbortController ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, 12000) : 0;
    return (function(){return Promise.resolve(new Response('{"ok":true,"previa":true}',{status:200,headers:{'Content-Type':'application/json'}}))})( { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(t); return { ok: r.ok, status: r.status }; })
      .catch(function () { clearTimeout(t); return { ok: false, status: 0 }; });
  }
  function preencheOcultos(form) {
    var linhaFixa = form.getAttribute('data-linha') || '';
    var campoLinha = form.elements.linha;
    if (campoLinha && !linhaFixa && linhaUrl) {
      if (campoLinha.tagName === 'SELECT') campoLinha.value = linhaUrl;
      else if (campoLinha.length) $$('input[name="linha"]', form).forEach(function (r) { r.checked = r.value === linhaUrl; });
      else campoLinha.value = linhaUrl;
    }
    UTM_CHAVES.forEach(function (k) {
      var c = form.elements[k];
      if (!c) { c = doc.createElement('input'); c.type = 'hidden'; c.name = k; form.appendChild(c); }
      c.value = utm[k] || '';
    });
  }
  function dadosDe(form) {
    var dados = { origem: form.getAttribute('data-lead') || 'site' };
    new FormData(form).forEach(function (v, k) { if (UTM_CHAVES.indexOf(k) < 0) dados[k] = typeof v === 'string' ? v.trim() : v; });
    if (form.getAttribute('data-linha')) dados.linha = form.getAttribute('data-linha');
    dados.consentimento = !!(form.elements.consentimento && form.elements.consentimento.checked);   
    if (dados.linha && LINHAS[dados.linha]) dados.linha_nome = LINHAS[dados.linha];
    return dados;
  }
  function falhou(form, linha, st) {
    var status = $('.form-status', form);
    if (!status) { status = doc.createElement('p'); status.className = 'form-status'; status.setAttribute('aria-live', 'polite'); form.appendChild(status); }
    status.className = 'form-status erro';
    status.setAttribute('role', 'alert');
    if (st === 400) {
      status.innerHTML = 'Falta o seu nome, o seu WhatsApp ou a autorização. Confira os campos e envie de novo, ou ' +
        '<a href="' + linkWhats(linha) + '" target="_blank" rel="noopener">fale com a equipe pelo WhatsApp</a>.';
      var vazio = $$('input[name="nome"],input[name="whatsapp"]', form).filter(function (c) { return !c.value.trim(); })[0];
      if (vazio) { var et = vazio.closest('.etapa'); if (et && et.hidden && form.__mostra) form.__mostra(vazio); vazio.focus(); }
      return;
    }
    status.innerHTML = 'Não conseguimos enviar agora. Seus dados continuam aqui: tente de novo em alguns segundos ou ' +
      '<a href="' + linkWhats(linha) + '" target="_blank" rel="noopener">fale com a equipe pelo WhatsApp</a>, com a mensagem já pronta.';
  }
  function envia(form, btn) {
    var dados = dadosDe(form);
    if (dados.campo_ref_2 || dados.site) { location.href = '/isc-site-previa/obrigado'; return; }   
    var rotulo = btn ? btn.innerHTML : '';
    if (btn) { btn.style.width = btn.offsetWidth + 'px'; btn.disabled = true; btn.textContent = 'Enviando'; }
    var status = $('.form-status', form); if (status) { status.textContent = ''; status.className = 'form-status'; status.removeAttribute('role'); }
    enviarLead(dados).then(function (r) {
      if (r.ok) {
        var destino = form.getAttribute('data-redireciona') || '/isc-site-previa/obrigado';
        
        var tipo = dados.linha === 'academy' || dados.origem === 'academy' ? 'academy'
          : (dados.origem === 'lista' || dados.linha === 'acompanhamento-online') ? 'lista' : '';
        var q = [];
        if (dados.linha) q.push('linha=' + encodeURIComponent(dados.linha));
        if (tipo) q.push('tipo=' + tipo);
        location.href = destino + (q.length ? (destino.indexOf('?') < 0 ? '?' : '&') + q.join('&') : '');
        return;
      }
      if (btn) { btn.disabled = false; btn.innerHTML = rotulo; btn.style.width = ''; }
      falhou(form, dados.linha, r.status);
    });
  }
  $$('input[data-tipo="whatsapp"]').forEach(mascaraWhatsApp);
  
  $$('form[data-lead]').forEach(function (form) {
    form.addEventListener('mousedown', function (e) {
      if (e.target.closest && e.target.closest('button[type="submit"],[data-etapa-proxima],[data-etapa-voltar]')) e.preventDefault();
    });
  });

  
  $$('form[data-lead]:not([data-etapas])').forEach(function (form) {
    preencheOcultos(form);
    $$('input,select,textarea', form).forEach(function (c) {
      c.addEventListener('blur', function () { if (c.getAttribute('aria-invalid')) marca(c, mensagem(c)); });
      c.addEventListener('change', function () { if (c.getAttribute('aria-invalid')) marca(c, mensagem(c)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validar(form)) return;
      envia(form, $('button[type="submit"]', form));
    });
  });

  
  $$('form[data-lead][data-etapas]').forEach(function (form) {
    preencheOcultos(form);
    var etapas = $$('.etapa', form), i = 0, N = etapas.length;
    var conta = $('[data-etapa-n]', form), total = $('[data-etapa-total]', form), barraE = $('.etapas-barra', form);
    if (total) total.textContent = String(N);
    if (barraE) barraE.innerHTML = etapas.map(function () { return '<i></i>'; }).join('');
    
    if (linhaUrl && form.elements.linha && etapas.length > 1 && $('input[name="linha"]', etapas[0])) i = 1;
    function mostra(k, focar) {
      i = Math.max(0, Math.min(N - 1, k));
      etapas.forEach(function (et, j) { et.hidden = j !== i; });
      if (conta) conta.textContent = String(i + 1);
      if (barraE) $$('i', barraE).forEach(function (s, j) { s.className = j < i ? 'feito' : (j === i ? 'atual' : ''); });
      if (focar) {
        var tit = $('.etapa-titulo,legend', etapas[i]);
        if (tit) { if (!tit.hasAttribute('tabindex')) tit.setAttribute('tabindex', '-1'); try { tit.focus({ preventScroll: true }); } catch (e) { tit.focus(); } }
        var topoForm = form.getBoundingClientRect().top + window.scrollY - (topo ? topo.offsetHeight : 0) - 16;
        if (window.scrollY > topoForm) window.scrollTo({ top: topoForm, behavior: reduzido ? 'auto' : 'smooth' });
      }
    }
    mostra(i, false);
    $$('[data-etapa-proxima]', form).forEach(function (b) { b.addEventListener('click', function () { if (validar(etapas[i])) mostra(i + 1, true); }); });
    $$('[data-etapa-voltar]', form).forEach(function (b) { b.addEventListener('click', function () { mostra(i - 1, true); }); });
    
    var ponteiro = false;
    form.addEventListener('pointerdown', function (e) { ponteiro = !!(e.target.closest && e.target.closest('.opcao')); });
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'radio' && t.closest('[data-avanca]') && ponteiro && i < N - 1) {
        ponteiro = false; marca(t, '');
        var de = i;   
        setTimeout(function () { if (i === de) mostra(de + 1, true); }, reduzido ? 0 : 260);
      }
      if (t.getAttribute('aria-invalid')) marca(t, mensagem(t));
    });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < N - 1) { e.preventDefault(); if (validar(etapas[i])) mostra(i + 1, true); }
    });
    form.__mostra = function (campo) { var k = etapas.indexOf(campo.closest('.etapa')); if (k >= 0) mostra(k, false); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (i < N - 1) { if (validar(etapas[i])) mostra(i + 1, true); return; }
      
      for (var k = 0; k < N; k++) {
        var et = etapas[k], escondida = et.hidden; et.hidden = false;
        var ok = validar(et); et.hidden = escondida;
        if (!ok) { mostra(k, true); validar(etapas[k]); return; }
      }
      envia(form, $('button[type="submit"]', form));
    });
  });

  
  $$('[data-ano]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  atualizaTopo(); barra();
  window.addEventListener('load', function () { atualizaTopo(); barra(); });

  window.ISC = { enviarLead: enviarLead, validar: validar, linkWhats: linkWhats, aplicaWhats: aplicaWhats, utm: utm, linhas: LINHAS };
})();



(function(){
  var seta = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  function todos(raiz, sel){
    var lista = Array.prototype.slice.call(raiz.querySelectorAll ? raiz.querySelectorAll(sel) : []);
    if (raiz.matches && raiz.matches(sel)) lista.unshift(raiz);
    return lista;
  }
  function dica(el, texto){
    var antes = el.previousElementSibling;
    if (antes && antes.classList.contains('matriz-dica')) return;
    var d = document.createElement('p');
    d.className = 'matriz-dica';
    Array.prototype.forEach.call(el.classList, function(c){ if (/^mt-\d$/.test(c)) d.classList.add(c); });
    d.innerHTML = texto + ' ' + seta;
    el.parentNode.insertBefore(d, el);
  }
  function rolagem(el, rotulo){
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', rotulo);
  }
  function iscMobile(raiz){
    raiz = raiz || document;
    todos(raiz, 'table.consulta').forEach(function(tabela){
      if (tabela.closest('.table-wrap.matriz') || tabela.__isc) return;
      tabela.__isc = 1;
      var cab = Array.prototype.map.call(tabela.querySelectorAll('thead th'), function(th, i){
        return th.textContent.replace(/\s+/g, ' ').trim() || ('Coluna ' + (i + 1));
      });
      var linhas = Array.prototype.slice.call(tabela.querySelectorAll('tbody tr'));
      if (!cab.length) {
        var chaveValor = linhas.length && linhas.every(function(tr){ return tr.querySelectorAll(':scope > td, :scope > th').length === 2; });
        if (chaveValor) tabela.classList.add('vira-cartao', 'chave-valor');
        return;
      }
      tabela.classList.add('vira-cartao');
      linhas.forEach(function(tr){
        var i = 0;
        Array.prototype.forEach.call(tr.children, function(celula){
          if (!celula.matches('td, th')) return;
          if (!celula.hasAttribute('data-label')) celula.setAttribute('data-label', cab[i] || 'Informação');
          i += Number(celula.getAttribute('colspan') || 1);
        });
      });
    });
    todos(raiz, '.table-wrap.matriz').forEach(function(wrap){
      var cap = wrap.querySelector('caption');
      rolagem(wrap, cap ? cap.textContent.trim() : 'Tabela com rolagem lateral');
      dica(wrap, 'Deslize para ver a tabela inteira');
    });
    todos(raiz, '.carrossel, .fita').forEach(function(faixa){
      rolagem(faixa, faixa.getAttribute('data-rotulo') || (faixa.classList.contains('fita') ? 'Quadros do vídeo, com rolagem lateral' : 'Lâminas do carrossel, com rolagem lateral'));
      dica(faixa, faixa.classList.contains('fita') ? 'Deslize para ver todos os quadros' : 'Deslize para ver todas as lâminas');
    });
  }
  window.iscMobile = iscMobile;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ iscMobile(document); });
  else iscMobile(document);
})();

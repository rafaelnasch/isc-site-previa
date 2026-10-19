
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };

  
  var reduzido = mm('(prefers-reduced-motion: reduce)');
  var automatizado = !!navigator.webdriver;
  var conexao = navigator.connection || {};
  var economia = !!conexao.saveData || /(^|-)2g$/.test(conexao.effectiveType || '');
  var pausado = false;
  try { pausado = localStorage.getItem('isc_movimento') === 'pausado'; } catch (e) {  }
  if (automatizado) html.classList.add('automatizado');
  if (pausado) html.classList.add('movimento-pausado');
  var temSDA = false;
  try { temSDA = !!(window.CSS && CSS.supports('animation-timeline: view()')); } catch (e) {  }
  var animar = !reduzido && !automatizado;
  if (animar && temSDA) html.classList.add('sda');

  
  var videos = [];
  function aplicaPausa() {
    html.classList.toggle('movimento-pausado', pausado);
    $$('[data-pausa]').forEach(function (b) {
      b.setAttribute('aria-pressed', pausado ? 'true' : 'false');
      var t = b.querySelector('span'); if (t) t.textContent = pausado ? 'Retomar movimento' : 'Pausar movimento';
    });
    videos.forEach(function (v) { if (pausado) { try { v.pause(); } catch (e) {  } } else if (v.__visivel) tocar(v); });
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pausa]');
    if (!b) return;
    pausado = !pausado;
    try { if (pausado) localStorage.setItem('isc_movimento', 'pausado'); else localStorage.removeItem('isc_movimento'); } catch (er) {  }
    aplicaPausa();
  });

  
  var PONTUACAO = /^[.,;:!?)\]»”’…]+$/;
  function divide(el) {
    if (el.__dividido) return;
    el.__dividido = true;
    var nos = [];
    (function anda(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) nos.push(c);
        else if (c.nodeType === 1 && !/^(BR|SVG|IMG)$/.test(c.tagName)) anda(c);
      }
    })(el);
    nos.forEach(function (t) {
      var partes = t.nodeValue.split(/(\s+)/), frag = doc.createDocumentFragment(), primeiro = true;
      partes.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(' ')); primeiro = false; return; }
        var ext = doc.createElement('span'); ext.className = 'rl-p';
        var inn = doc.createElement('span'); inn.className = 'rl-i'; inn.textContent = p;
        ext.appendChild(inn);
        
        var ant = t.previousSibling;
        if (primeiro && PONTUACAO.test(p) && ant && ant.nodeType === 1) {
          var nw = doc.createElement('span'); nw.style.whiteSpace = 'nowrap';
          ant.parentNode.insertBefore(nw, ant); nw.appendChild(ant); nw.appendChild(ext);
          primeiro = false; return;
        }
        frag.appendChild(ext); primeiro = false;
      });
      if (t.parentNode) t.parentNode.replaceChild(frag, t);
    });
    numera(el);
    el.classList.add('rl-pronto');
  }
  function numera(el) {
    var linha = -1, topo = null;
    $$('.rl-p', el).forEach(function (p) {
      var y = p.offsetTop;
      if (topo === null || Math.abs(y - topo) > 4) { linha++; topo = y; }
      p.firstChild.style.setProperty('--l', linha);
    });
    el.style.setProperty('--rl-linhas', linha + 1);
  }
  var titulos = $$('[data-revela="linhas"]');
  if (animar) {
    titulos.forEach(divide);
    var rLarg = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - rLarg) < 40) return; rLarg = window.innerWidth;
      titulos.forEach(function (el) { if (el.__dividido) numera(el); });
    });
  }

  
  var entram = $$('[data-entra],[data-revela="linhas"]');
  if (animar && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    entram.forEach(function (el) {
      
      if (el.closest('.abertura')) { requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); }); return; }
      io.observe(el);
    });
    setTimeout(function () { entram.forEach(function (el) { el.classList.add('in'); }); }, 6000);   
  } else {
    entram.forEach(function (el) { el.classList.add('in'); });
  }

  
  var movel = function () { return mm('(max-width: 820px)'); };
  var podeVideo = !reduzido && !automatizado && !economia;
  function fonte(v) {
    var m = movel();
    if (m && v.hasAttribute('data-so-computador')) return null;
    var webm = (m && v.getAttribute('data-webm-movel')) || v.getAttribute('data-webm');
    var mp4 = (m && v.getAttribute('data-mp4-movel')) || v.getAttribute('data-mp4');
    return { webm: webm, mp4: mp4 };
  }
  function carrega(v) {
    if (v.__carregado) return true;
    var f = fonte(v); if (!f || (!f.webm && !f.mp4)) return false;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (par) {
      if (!f[par[0]]) return;
      var s = doc.createElement('source'); s.src = f[par[0]]; s.type = par[1]; v.appendChild(s);
    });
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.addEventListener('playing', function () {
      v.classList.add('tocando');
      var a = v.closest('.area'); if (a) a.classList.add('tocando');
    });
    v.load();
    v.__carregado = true;
    return true;
  }
  function tocar(v) {
    if (pausado || !podeVideo) return;
    if (!carrega(v)) return;
    var p = v.play(); if (p && p.catch) p.catch(function () {  });
  }
  var loops = $$('video[data-loop]');
  if (loops.length) html.classList.add('tem-video');
  if (podeVideo && loops.length && 'IntersectionObserver' in window) {
    var comeca = function () {
      var iov = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          var v = en.target; v.__visivel = en.isIntersecting;
          if (en.isIntersecting) tocar(v); else if (v.__carregado) { try { v.pause(); } catch (e) {  } }
        });
      }, { threshold: 0.05 });
      loops.forEach(function (v) { videos.push(v); iov.observe(v); });
    };
    if (doc.readyState === 'complete') setTimeout(comeca, 120);
    else window.addEventListener('load', function () { setTimeout(comeca, 120); });
  }
  doc.addEventListener('visibilitychange', function () {
    videos.forEach(function (v) { if (doc.hidden) { try { v.pause(); } catch (e) {  } } else if (v.__visivel) tocar(v); });
  });

  
  var plx = $$('[data-parallax]');
  if (animar && !temSDA && plx.length && 'IntersectionObserver' in window) {
    html.classList.add('parallax-js');
    var vis = [];
    var iop = new IntersectionObserver(function (es) {
      es.forEach(function (en) { var i = vis.indexOf(en.target); if (en.isIntersecting && i < 0) vis.push(en.target); if (!en.isIntersecting && i >= 0) vis.splice(i, 1); });
      pedePlx();
    });
    plx.forEach(function (el) { iop.observe(el); });
    var pedido = 0;
    var pedePlx = function () { if (!pedido) pedido = requestAnimationFrame(function () {
      pedido = 0;
      if (pausado) return;
      var vh = window.innerHeight;
      vis.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (vh - r.top) / (vh + r.height);
        el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
      });
    }); };
    window.addEventListener('scroll', pedePlx, { passive: true });
    window.addEventListener('resize', pedePlx);
  }

  
  $$('[data-passeio]').forEach(function (sec) {
    var trilho = sec.querySelector('.passeio-trilho'); if (!trilho) return;
    var itens = $$('.passeio-item', trilho);
    var conta = sec.querySelector('[data-passeio-n]');
    var dist = 0, ativo = false, quadro = 0;
    function mede() {
      var deve = animar && mm('(min-width: 1025px)') && itens.length > 1;
      if (!deve) {
        if (ativo) { sec.classList.remove('passeio--fixo'); sec.style.removeProperty('--passeio-altura'); trilho.style.removeProperty('--passeio-x'); ativo = false; }
        return;
      }
      sec.classList.add('passeio--fixo'); ativo = true;
      
      dist = Math.max(0, Math.ceil(trilho.getBoundingClientRect().width - doc.documentElement.clientWidth));
      sec.style.setProperty('--passeio-altura', (window.innerHeight + dist) + 'px');
      anda();
    }
    function anda() {
      quadro = 0;
      if (!ativo) return;
      var topo = sec.getBoundingClientRect().top;
      var p = dist ? Math.max(0, Math.min(1, -topo / dist)) : 0;
      trilho.style.setProperty('--passeio-x', (-p * dist).toFixed(1) + 'px');
      if (conta) {
        var n = Math.min(itens.length, Math.max(1, Math.round(p * (itens.length - 1)) + 1));
        conta.textContent = (n < 10 ? '0' : '') + n;
      }
    }
    window.addEventListener('scroll', function () { if (ativo && !quadro) quadro = requestAnimationFrame(anda); }, { passive: true });
    var t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(mede, 120); });
    $$('img', trilho).forEach(function (im) { if (!im.complete) im.addEventListener('load', mede, { once: true }); });
    mede();
    
    trilho.addEventListener('scroll', function () {
      if (ativo || !conta) return;
      var w = itens[0].getBoundingClientRect().width || 1;
      var n = Math.min(itens.length, Math.round(trilho.scrollLeft / w) + 1);
      conta.textContent = (n < 10 ? '0' : '') + n;
    }, { passive: true });
  });

  
  $$('[data-processo]').forEach(function (sec) {
    var passos = $$('.processo-passo', sec);
    var num = sec.querySelector('[data-processo-num]'), nome = sec.querySelector('[data-processo-nome]');
    var trilha = $$('.processo-trilha i', sec);
    if (!passos.length || !('IntersectionObserver' in window)) return;
    if (animar) sec.classList.add('processo--vivo');   
    function marca(i) {
      passos.forEach(function (p, j) { p.classList.toggle('ativo', j === i); });
      trilha.forEach(function (t, j) { t.classList.toggle('feito', j <= i); });
      var p = passos[i];
      if (num) num.textContent = p.getAttribute('data-passo') || String(i + 1);
      if (nome) { var h = p.querySelector('h3'); nome.textContent = h ? h.textContent : ''; }
    }
    marca(0);
    var iop2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) marca(passos.indexOf(en.target)); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    passos.forEach(function (p) { iop2.observe(p); });
  });

  
  $$('[data-quadros]').forEach(function (sec) {
    var itens = $$('.quadros-item', sec), conta = sec.querySelector('[data-quadros-n]');
    if (!animar || itens.length < 2) return;
    sec.classList.add('quadros--fixo');
    var atual = -1, q = 0;
    function mostra(i) {
      if (i === atual) return; atual = i;
      itens.forEach(function (it, j) { it.classList.toggle('atual', j === i); });
      if (conta) conta.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    }
    function anda() {
      q = 0;
      var r = sec.getBoundingClientRect(), curso = r.height - window.innerHeight;
      var p = curso > 0 ? Math.max(0, Math.min(.9999, -r.top / curso)) : 0;
      mostra(Math.floor(p * itens.length));
    }
    sec.style.setProperty('--quadros-n', itens.length);
    window.addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(anda); }, { passive: true });
    window.addEventListener('resize', anda);
    anda();
  });

  
  if (mm('(hover: hover) and (pointer: fine)') && !reduzido) {
    $$('[data-luz]').forEach(function (el) {
      var q = 0, ev = null;
      el.addEventListener('pointermove', function (e) {
        ev = e; if (q) return;
        q = requestAnimationFrame(function () {
          q = 0; var r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
          el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
        });
      });
    });
    if (podeVideo) $$('.area video[data-vinheta]').forEach(function (v) {
      var a = v.closest('.area'); if (!a) return;
      videos.push(v);
      a.addEventListener('pointerenter', function () { v.__visivel = true; tocar(v); });
      a.addEventListener('pointerleave', function () { v.__visivel = false; try { v.pause(); } catch (e) {  } a.classList.remove('tocando'); v.classList.remove('tocando'); });
    });
  }

  aplicaPausa();
  window.ISCmotion = { divide: divide, reduzido: reduzido, pausado: function () { return pausado; } };
})();


const iforms = (() => {
  'use strict';
  let seq = 0;
  const temDoc = typeof document !== 'undefined';
  const el$ = e => (typeof e === 'string' ? (temDoc ? document.getElementById(e) : null) : e);
  const f = v => (Math.round(v * 100) / 100).toString();
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const RAD = Math.PI / 180;

  
  const PALETAS = {
    marfim: { traco: '#462214', ponto: '#5E3118', apoio: '#6B645B', fio: '#B9AD98', fundo: '#F5F0E6', titulo: '#121314' },
    preto: { traco: '#D39A1F', ponto: '#D39A1F', apoio: '#A8A198', fio: '#5A554E', fundo: '#121314', titulo: '#FFFFFF' }
  };
  PALETAS.noite = Object.assign({}, PALETAS.preto, { fundo: '#1B1C1E' });
  PALETAS.branco = Object.assign({}, PALETAS.marfim, { fundo: '#FFFFFF' });
  PALETAS.areia = Object.assign({}, PALETAS.marfim, { fundo: '#EBE3D3' });
  const VARS = [['traco', '--f-fio-destaque'], ['ponto', '--f-ponto'], ['apoio', '--f-apoio'], ['fio', '--dado-3'], ['fundo', '--f-fundo'], ['titulo', '--f-titulo']];
  function hex(v) {
    v = String(v || '').trim();
    let m;
    if (/^#[0-9a-f]{3}$/i.test(v)) return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7).toUpperCase();
    m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (m) return '#' + [m[1], m[2], m[3]].map(n => ('0' + Math.max(0, Math.min(255, Math.round(+n))).toString(16)).slice(-2)).join('').toUpperCase();
    return null;
  }
  function cores(el, o) {
    if (o && o.campo && PALETAS[o.campo]) return Object.assign({}, PALETAS[o.campo]);
    const c = Object.assign({}, PALETAS.marfim);
    try {
      const cs = getComputedStyle(el);
      VARS.forEach(par => { const h = hex(cs.getPropertyValue(par[1])); if (h) c[par[0]] = h; });
    } catch (err) {  }
    return c;
  }

  
  function naPeca(el, o) {
    if (o.peca === false) return null;
    if (+o.peca) return { px: +o.peca, base: 1080, fio: 2.5, ponto: 18, rot: 26 };
    try {
      const peca = el.closest && el.closest('.peca');
      const mock = peca && peca.closest('.mock');
      if (!mock) return null;
      const cs = getComputedStyle(mock);
      const base = parseFloat(cs.getPropertyValue('--base')) || 1080;
      const mw = mock.getBoundingClientRect().width, w = el.clientWidth;
      if (!(mw > 0 && w > 0)) return null;
      const fio = parseFloat(cs.getPropertyValue('--pc-fio')) || 2;
      return { px: w * base / mw, base, fio: Math.max(1.5, fio * 1.25), ponto: parseFloat(cs.getPropertyValue('--pc-ponto')) || 18, rot: parseFloat(cs.getPropertyValue('--pc-rotulo')) || 26 };
    } catch (err) { return null; }
  }
  function medida(el, o) {
    const p = naPeca(el, o);
    if (!p) return { w1: 1.5, w2: 1, k: 1, ns: ' vector-effect="non-scaling-stroke"', p: null };
    const u = 120 / p.px;                          
    return { w1: p.fio * u, w2: p.fio * 0.6 * u, k: Math.min(1, (p.ponto / 2 * u) / 5), ns: '', p };
  }

  
  function kit(c, m) {
    const linha = (d, cor, w, extra) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${f(w || m.w1)}" stroke-linecap="round" stroke-linejoin="round"${m.ns}${extra || ''}/>`;
    const circ = (cx, cy, r, cor, w, extra) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${cor}" stroke-width="${f(w || m.w1)}"${m.ns}${extra || ''}/>`;
    const oco = (cx, cy, r, cor) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * m.k)}" fill="${c.fundo}" stroke="${cor}" stroke-width="${f(m.w1)}"${m.ns} data-a="p"/>`;
    const ponto = (cx, cy, r, cor) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * m.k)}" fill="${cor || c.ponto}" data-a="p"/>`;
    const pino = (cx, cy, r, cor) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * m.k)}" fill="${cor}"/>`;
    const arco = (cx, cy, r, a0, a1) => {
      const x0 = cx + r * Math.cos(a0 * RAD), y0 = cy + r * Math.sin(a0 * RAD);
      const x1 = cx + r * Math.cos(a1 * RAD), y1 = cy + r * Math.sin(a1 * RAD);
      const grande = ((a1 - a0) % 360 + 360) % 360 > 180 ? 1 : 0;
      return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 ${grande} 1 ${f(x1)} ${f(y1)}`;
    };
    const naOrbita = (cx, cy, r, a) => [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)];
    return { linha, circ, oco, ponto, pino, arco, naOrbita };
  }

  
  const formas = {
    
    fio: (c, o, m, K) => {
      const h = o.orientacao === 'horizontal' || o.horizontal === true;
      const d = h ? 'M16 60H104' : 'M60 16V104';
      return K.linha(d, c.traco, m.w1 * 1.34) + (o.ponto === false ? '' : (h ? K.ponto(16, 60, 4) : K.ponto(60, 16, 4)));
    },
    
    ponto: (c, o, m, K) => K.circ(60, 60, 40, c.fio, m.w2) + K.ponto(60, 60, 8),
    
    orbita: (c, o, m, K) => {
      const p = K.naOrbita(60, 60, 42, -112);
      return K.linha(K.arco(60, 60, 42, -96, 52), c.traco) + K.linha(K.arco(60, 60, 42, 72, 232), c.traco) + K.ponto(p[0], p[1], 5);
    },
    
    elo: (c, o, m, K) => K.linha('M38 30C38 58 82 62 82 90', c.traco) + K.oco(82, 90, 4.5, c.traco) + K.ponto(38, 30, 5.5),
    
    grade: (c, o, m, K) => {
      const n = Math.max(5, Math.min(9, Math.round(o.n || 7)));
      const dst = Array.isArray(o.destaque) ? o.destaque : [n - 3, 2];
      const dc = Math.max(0, Math.min(n - 1, dst[0])), dl = Math.max(0, Math.min(n - 1, dst[1]));
      const p0 = 20, passo = 80 / (n - 1);
      const xd = p0 + dc * passo, yd = p0 + dl * passo;
      let s = '';
      if (o.mira !== false) s += K.linha(`M${f(p0 - 8)} ${f(yd)}H${f(p0 + 88)}M${f(xd)} ${f(p0 - 8)}V${f(p0 + 88)}`, c.fio, m.w2);
      for (let l = 0; l < n; l++) for (let k = 0; k < n; k++) {
        if (k === dc && l === dl) continue;
        s += K.pino(p0 + k * passo, p0 + l * passo, 1.35, c.apoio);
      }
      return s + K.circ(xd, yd, 9 * m.k, c.traco, m.w2) + K.ponto(xd, yd, 4.2);
    },
    
    camadas: (c, o, m, K) => K.circ(60, 60, 46, c.fio, m.w2) + K.circ(60, 60, 32, c.apoio, m.w2) + K.circ(60, 60, 18, c.traco) + K.ponto(60, 60, 5),
    
    percurso: (c, o, m, K) => {
      const n = Math.max(3, Math.min(5, Math.round(o.passos || (o.rotulos && o.rotulos.length) || 3)));
      const d = o.destaque == null ? 0 : Math.max(0, Math.min(n - 1, +o.destaque));
      const x = i => 16 + i * 88 / (n - 1);
      let s = K.linha('M16 60H104', c.fio, m.w2);
      if (d > 0) s += K.linha(`M16 60H${f(x(d))}`, c.traco);
      for (let i = 0; i < n; i++) s += i === d ? K.circ(x(i), 60, 11 * m.k, c.fio, m.w2) + K.ponto(x(i), 60, 6) : K.oco(x(i), 60, 3.6, c.traco);
      return s;
    },
    
    equilibrio: (c, o, m, K) => K.linha('M60 28V96', c.traco, m.w1 * 1.34) + K.linha('M24 46H96', c.apoio, m.w2) + K.linha('M46 96H74', c.fio, m.w2) + K.ponto(24, 46, 5.5) + K.oco(96, 46, 5.5, c.traco),
    
    integrado: (c, o, m, K) => K.circ(47, 51, 25, c.apoio, m.w2) + K.circ(73, 51, 25, c.apoio, m.w2) + K.circ(60, 73, 25, c.traco) + K.ponto(60, 58.5, 4.5),
    
    tempo: (c, o, m, K) => {
      const p = K.naOrbita(60, 60, 40, 315);
      return K.linha(K.arco(60, 60, 40, 135, 45), c.fio, m.w2) + K.linha(K.arco(60, 60, 40, 135, 315), c.traco) + K.ponto(p[0], p[1], 5.5);
    },
    
    cortina: (c, o, m, K) => {
      let s = '';
      for (let i = 0; i < 11; i++) {
        const x = 14 + i * 9.2, dx = Math.sin(i * 1.7) * 2.2;
        s += K.linha(`M${f(x)} 18C${f(x + dx)} 48 ${f(x - dx)} 80 ${f(x + dx * 0.5)} ${f(100 + Math.sin(i * 2.3) * 5)}`, i % 5 === 2 ? c.traco : c.apoio, i % 5 === 2 ? m.w1 : m.w2);
      }
      return s + K.linha('M8 16H112', c.fio, m.w2);
    },
    
    prancha: (c, o, m, K) => K.linha('M20 18H100', c.traco, m.w1 * 1.34) + `<rect x="20" y="28" width="80" height="80" fill="none" stroke="${c.apoio}" stroke-width="${f(m.w2)}"${m.ns}/>` +
      `<rect x="30" y="38" width="60" height="60" fill="none" stroke="${c.fio}" stroke-width="${f(m.w1)}"${m.ns}/>` + K.ponto(100, 18, 3.2)
  };
  const APELIDO = { s: 'elo', ligacao: 'elo', 'ligação': 'elo', relacao: 'elo', anel: 'orbita', 'órbita': 'orbita', precisao: 'grade', 'precisão': 'grade',
    pontos: 'grade', concentrico: 'camadas', integral: 'camadas', jornada: 'percurso', etapas: 'percurso', divisor: 'fio', foco: 'ponto', 'equilíbrio': 'equilibrio' };

  
  const MONT = "font-family:'Montserrat',system-ui,sans-serif", GILDA = "font-family:'Gilda Display','Didot','Times New Roman',serif";
  let medidor = null;
  function mede(txt, estilo) {
    try {
      if (!temDoc || !document.body) throw 0;
      if (!medidor || !medidor.isConnected) {
        const NS = 'http://www.w3.org/2000/svg';
        medidor = document.createElementNS(NS, 'svg');
        medidor.setAttribute('aria-hidden', 'true');
        medidor.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none';
        medidor.appendChild(document.createElementNS(NS, 'text'));
        document.body.appendChild(medidor);
      }
      const t = medidor.firstChild;
      t.setAttribute('style', estilo); t.textContent = String(txt);
      const w = t.getComputedTextLength();
      if (w) return w;
    } catch (err) {  }
    const tam = parseFloat((estilo.match(/font-size:([\d.]+)/) || [0, 12])[1]);
    return String(txt).length * tam * 0.62;
  }
  function larguraDe(t) {
    let w = 0;
    try { w = t.clientWidth; } catch (err) { w = 0; }
    return w > 0 ? w : 600;
  }
  function divisor(t, c, o, m) {
    const p = m.p, W = p ? p.px : larguraDe(t);
    const esp = p ? p.fio : 1, r = p ? p.ponto / 2 : 4, H = Math.max(16, r * 2 + 8), y = H / 2;
    const ponto = o.ponto === false ? '' : `<circle cx="${f(r)}" cy="${f(y)}" r="${f(r)}" fill="${c.ponto}" data-a="p"/>`;
    const x0 = o.ponto === false ? 0 : r * 2 + (p ? p.ponto : 8);
    return { vb: `0 0 ${f(W)} ${f(H)}`, s: `<path d="M${f(x0)} ${f(y)}H${f(W)}" stroke="${c.traco}" stroke-width="${f(esp)}" fill="none"/>` + ponto };
  }
  function quebra(txt, estilo, maxW) {
    const pal = String(txt || '').split(/\s+/).filter(Boolean);
    if (!pal.length) return [];
    const linhas = [];
    let atual = pal[0];
    for (let i = 1; i < pal.length; i++) {
      const tenta = atual + ' ' + pal[i];
      if (mede(tenta, estilo) <= maxW) atual = tenta; else { linhas.push(atual); atual = pal[i]; }
    }
    linhas.push(atual);
    return linhas;
  }
  function percursoRotulado(t, c, o, m) {
    const p = m.p;
    const rot = o.rotulos.map(String), n = Math.max(2, Math.min(6, rot.length));
    const subs = Array.isArray(o.subs) ? o.subs.map(x => String(x || '')) : [];
    const d = o.destaque == null ? 0 : Math.max(0, Math.min(n - 1, +o.destaque));
    
    const W = p ? p.px : larguraDe(t);
    const e = p ? p.rot / 11 : 1;
    const tr = 11 * e, tn = 28 * e, ts = 13 * e, ls = 2.2 * e, esp = p ? p.fio : 1.5, rp = (p ? p.ponto / 2 : 6), ro = rp * 0.62;
    const est = (peso, tam, fam, esp2) => `${fam};font-weight:${peso};font-size:${f(tam)}px` + (esp2 ? `;letter-spacing:${f(esp2)}px` : '');
    const eRot = est(500, tr, MONT, ls), eSub = est(400, ts, MONT), eNum = est(400, tn, GILDA);
    const maior = Math.max(...rot.map(r => mede(r.toUpperCase(), eRot)));
    const horizontal = W / n >= Math.max(maior + 20 * e, 110 * e);
    const nw = n2 => (n2 < 10 ? '0' : '') + n2;
    const txt = (x, y, conteudo, estilo, cor, anc) => `<text x="${f(x)}" y="${f(y)}"${anc ? ` text-anchor="${anc}"` : ''} fill="${cor}" style="${estilo}">${esc(conteudo)}</text>`;
    const marca = (x, y, i) => (i === d
      ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rp * 1.9)}" fill="none" stroke="${c.fio}" stroke-width="${f(esp * 0.7)}" data-a="p"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(rp)}" fill="${c.ponto}" data-a="p"/>`
      : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(ro)}" fill="${c.fundo}" stroke="${c.traco}" stroke-width="${f(esp)}" data-a="p"/>`);
    const lhS = ts * 1.45;
    let s = '', H;
    if (horizontal) {
      const col = W / n, y = tn + 22 * e, xs = i => col * i + col / 2;
      s += `<path d="M${f(xs(0))} ${f(y)}H${f(xs(n - 1))}" stroke="${c.fio}" stroke-width="${f(esp * 0.7)}" fill="none"/>`;
      if (d > 0) s += `<path d="M${f(xs(0))} ${f(y)}H${f(xs(d))}" stroke="${c.traco}" stroke-width="${f(esp)}" fill="none"/>`;
      let fundo = 0;
      for (let i = 0; i < n; i++) {
        s += txt(xs(i), tn * 0.8, nw(i + 1), eNum, i === d ? c.ponto : c.apoio, 'middle');
        s += marca(xs(i), y, i);
        let yy = y + rp * 1.9 + 24 * e;
        s += txt(xs(i) + ls / 2, yy, rot[i].toUpperCase(), eRot, i === d ? c.titulo : c.apoio, 'middle');
        quebra(subs[i], eSub, col - 20 * e).forEach(ln => { yy += lhS; s += txt(xs(i), yy, ln, eSub, c.apoio, 'middle'); });
        fundo = Math.max(fundo, yy);
      }
      H = fundo + 8 * e;
    } else {
      const x = rp * 1.9 + 2, tx = x + rp * 1.9 + 18 * e;
      const numW = mede('00', eNum.replace(`font-size:${f(tn)}px`, `font-size:${f(tn * 0.8)}px`)) + 14 * e;
      const blocos = rot.map((r, i) => quebra(subs[i], eSub, W - tx - numW));
      const altura = i => Math.max(tr, tr + (blocos[i].length ? 6 * e + blocos[i].length * lhS : 0));
      const passoMin = 58 * e;
      const ys = [];
      let y = rp * 1.9 + 2;
      for (let i = 0; i < n; i++) { ys.push(y); y += Math.max(passoMin, altura(i) + 30 * e); }
      s += `<path d="M${f(x)} ${f(ys[0])}V${f(ys[n - 1])}" stroke="${c.fio}" stroke-width="${f(esp * 0.7)}" fill="none"/>`;
      if (d > 0) s += `<path d="M${f(x)} ${f(ys[0])}V${f(ys[d])}" stroke="${c.traco}" stroke-width="${f(esp)}" fill="none"/>`;
      for (let i = 0; i < n; i++) {
        const yy = ys[i];
        s += marca(x, yy, i);
        s += txt(tx, yy + tn * 0.28, nw(i + 1), est(400, tn * 0.8, GILDA), i === d ? c.ponto : c.apoio);
        s += txt(tx + numW, yy + tr * 0.36, rot[i].toUpperCase(), eRot, i === d ? c.titulo : c.apoio);
        let ly = yy + tr * 0.36 + 6 * e;
        blocos[i].forEach(ln => { ly += lhS; s += txt(tx + numW, ly, ln, eSub, c.apoio); });
      }
      H = ys[n - 1] + Math.max(rp * 1.9 + 2, altura(n - 1) + 4 * e);
    }
    return { vb: `0 0 ${f(W)} ${f(H)}`, s };
  }

  
  const agora = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : 0);
  function semMovimento() {
    try {
      if (typeof navigator !== 'undefined' && navigator.webdriver) return true;   
      return !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('print').matches;
    }
    catch (err) { return true; }
  }
  let io = null;
  function animaQuando(t, o) {
    if (o.animar === false || api.animar === false || !temDoc || semMovimento()) return;
    if (typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) return;
    if (t.__ifT != null) { const dt = agora() - t.__ifT; if (dt < 1000) anima(t, dt); return; }
    if (!io) io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.__ifT = agora();
      anima(en.target, 0);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    if (!t.__ifObs) { t.__ifObs = 1; io.observe(t); }
  }
  function anima(t, desde) {
    const svg = t.firstElementChild;
    if (!svg) return;
    try {
      const a = svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 640, easing: 'ease-out', fill: 'backwards' });
      if (desde) a.currentTime = desde;
      let i = 0;
      Array.prototype.forEach.call(svg.querySelectorAll('[data-a="p"]'), n => {
        n.style.transformBox = 'fill-box'; n.style.transformOrigin = '50% 50%';
        const k = n.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 460, delay: 360 + Math.min(i++, 8) * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        if (desde) k.currentTime = desde;
      });
    } catch (err) {  }
  }

  
  const registro = new Set();
  let ro = null, espera = 0;
  const larguras = new WeakMap();
  function observa(t) {
    if (!ro && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(es => {
        let mudou = false;
        es.forEach(en => { const w = Math.round(en.contentRect.width); if (larguras.get(en.target) !== w) { larguras.set(en.target, w); mudou = true; } });
        if (!mudou) return;
        clearTimeout(espera); espera = setTimeout(redesenhar, 120);
      });
    }
    if (ro && !larguras.has(t)) { larguras.set(t, Math.round(t.clientWidth || 0)); ro.observe(t); }
  }
  function desenho(t, nome, o) {
    const c = cores(t, o), m = medida(t, o), K = kit(c, m);
    if (nome === 'fio' && o.divisor) return divisor(t, c, o, m);
    if (nome === 'percurso' && Array.isArray(o.rotulos) && o.rotulos.length) return percursoRotulado(t, c, o, m);
    return { vb: '0 0 120 120', s: formas[nome](c, o, m, K) };
  }
  function wrap(e, nome, o) {
    const t = el$(e); if (!t) return null;
    if (!t.__ifId) t.__ifId = 'if' + (++seq);
    const r = desenho(t, nome, o);
    const a11y = o.aria ? `role="img" aria-label="${esc(o.aria)}"` : 'aria-hidden="true"';
    t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="${t.__ifId}" data-iforms="${nome}" viewBox="${r.vb}" ${a11y} focusable="false" style="width:100%;height:auto;display:block;overflow:visible">${r.s}</svg>`;
    t.__iforms = { nome, opts: o };
    registro.add(t);
    observa(t);
    animaQuando(t, o);
    return t.firstChild;
  }

  const api = {};
  Object.keys(formas).forEach(nome => { api[nome] = (e, o) => wrap(e, nome, o || {}); });
  const nomeDe = n => (formas[n] ? n : (APELIDO[n] || n));
  function render(e, nome, o) {
    const n = nomeDe(nome);
    if (formas[n]) return wrap(e, n, o || {});
    if (typeof console !== 'undefined') console.error('iforms: forma desconhecida "' + nome + '"');
    return null;
  }
  
  function svg(nome, o) {
    o = o || {};
    const n = nomeDe(nome);
    if (!formas[n]) return '';
    const c = Object.assign({}, PALETAS[o.campo] || PALETAS.marfim);
    const lado = Math.round(+o.tamanho || 480), u = 120 / lado;
    const m = { w1: 2.5 * u, w2: 1.5 * u, k: Math.min(1, (9 * u) / 5), ns: '', p: null };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 120 120">` + formas[n](c, o, m, kit(c, m)).replace(/ data-a="p"/g, '') + '</svg>';
  }
  function montar(raiz) {
    if (!temDoc) return;
    (raiz || document).querySelectorAll('[data-iforms]').forEach(el => {
      if (el.__iformsMontado || el.tagName.toLowerCase() === 'svg') return;
      const v = el.getAttribute('data-iforms').trim();
      let cfg = { forma: v };
      if (v.charAt(0) === '{') { try { cfg = JSON.parse(v); } catch (err) { console.error('iforms: data-iforms não é JSON válido', el); return; } }
      el.__iformsMontado = 1;
      render(el, cfg.forma, cfg);
    });
  }
  function redesenhar() {
    registro.forEach(t => {
      if (!t.isConnected) { registro.delete(t); return; }
      const c = t.__iforms;
      if (c) wrap(t, c.nome, c.opts);
    });
  }
  if (typeof window !== 'undefined' && temDoc) {
    window.addEventListener('beforeprint', () => {
      registro.forEach(t => { try { const s = t.firstElementChild; if (s && s.getAnimations) s.getAnimations({ subtree: true }).forEach(a => a.finish()); } catch (err) {  } });
      redesenhar();
    });
    try { if (document.fonts) document.fonts.ready.then(() => { registro.forEach(t => { const c = t.__iforms; if (c && c.opts && c.opts.rotulos) wrap(t, c.nome, c.opts); }); }); } catch (err) {  }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => montar());
    else montar();
  }
  return Object.assign(api, { render, montar, redesenhar, svg, paletas: PALETAS, formas: Object.keys(formas), animar: true, version: '1.1' });
})();
if (typeof window !== 'undefined') window.iforms = iforms;

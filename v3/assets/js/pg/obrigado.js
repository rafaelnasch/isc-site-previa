
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };

  
  var caixa = doc.querySelector('.ob-fio'), v = caixa && caixa.querySelector('video[data-fio]');
  var conexao = navigator.connection || {};
  var pode = v && !mm('(prefers-reduced-motion: reduce)') && !navigator.webdriver && !conexao.saveData && !/(^|-)2g$/.test(conexao.effectiveType || '') &&
    !html.classList.contains('movimento-pausado') && caixa.offsetWidth > 0;
  try { if (localStorage.getItem('isc_movimento') === 'pausado') pode = false; } catch (e) {  }
  if (pode) {
    caixa.classList.add('ob-fio--anima');
    var desiste = function () { caixa.classList.remove('ob-fio--anima'); };
    var seguro = setTimeout(desiste, 4000);
    v.addEventListener('playing', function () { clearTimeout(seguro); caixa.classList.add('ob-fio--tocando'); });
    var comeca = function () {
      [['data-webm', 'video/webm'], ['data-mp4', 'video/mp4']].forEach(function (p) {
        var s = doc.createElement('source'); s.src = v.getAttribute(p[0]); s.type = p[1]; v.appendChild(s);
      });
      v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
      v.load();
      var p = v.play(); if (p && p.catch) p.catch(desiste);
    };
    if (doc.readyState === 'complete') setTimeout(comeca, 250); else window.addEventListener('load', function () { setTimeout(comeca, 250); });
  }

  
  function pronto() {
    var I = window.ISC; if (!I) return;
    var q = null; try { q = new URLSearchParams(location.search); } catch (e) {  }
    var linha = q ? (q.get('linha') || '').toLowerCase() : '';
    if (!I.linhas[linha]) linha = '';
    var tipo = q ? q.get('tipo') || '' : '';
    var frase = doc.querySelector('[data-obrigado-frase]');
    var whats = doc.querySelector('[data-obrigado-whats]');
    var passos = doc.querySelector('[data-obrigado-passos]');
    
    var deRegen = tipo === 'lista'; if (!tipo) { try { deRegen = /^\/regen(\.html)?$/.test(new URL(doc.referrer).pathname); } catch (e) {  } }
    if (linha === 'academy' || tipo === 'academy') {
      frase.textContent = 'Seu nome está na lista da ISC Academy. Assim que a próxima turma tiver data, o programa chega no e-mail que você deixou.';
      if (passos) passos.hidden = true;
      var consulta = doc.querySelector('[data-obrigado-consulta]'); if (consulta) consulta.hidden = true;
      var enquanto = doc.querySelector('[data-obrigado-enquanto]'); if (enquanto) enquanto.hidden = true;
      var barra = doc.querySelector('.barra-cta'); if (barra) barra.hidden = true;   
    } else if (linha === 'acompanhamento-online' || (linha === 'regen' && deRegen) || (tipo === 'lista' && linha)) {
      frase.textContent = linha === 'regen'
        ? 'Seu nome está na lista do ISC REGEN, para lesão de tendão, ligamento ou cartilagem. A equipe chama você pelo número que você deixou.'
        : 'Seu nome está na lista do acompanhamento online. Assim que ele abrir, a equipe avisa você pelo número que você deixou.';
      if (passos) passos.hidden = true;
    } else if (linha && linha !== 'benessere') {
      frase.textContent = 'A equipe do Instituto vai chamar você no WhatsApp que você deixou, ou ligar, para combinar a sua primeira consulta sobre ' + I.linhas[linha] + '. A mensagem chega como Instituto ISC.';
    } else if (linha === 'benessere') {
      frase.textContent = 'A equipe da Benessere vai chamar você no número que você deixou para conferir o seu plano de saúde e combinar o dia da acupuntura.';
      var p1 = passos && passos.querySelectorAll('li p')[0];
      if (p1) p1.textContent = 'A equipe da Benessere chama você no número que você deixou.';
      var p2 = passos && passos.querySelectorAll('li p')[1];
      if (p2) p2.textContent = 'Na conversa, ela confere o seu plano de saúde e combina com você o dia e o horário.';
    }
    if (whats) { whats.setAttribute('data-whats-linha', linha); I.aplicaWhats(whats.parentNode); }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(pronto, 0); });
  else setTimeout(pronto, 0);
})();

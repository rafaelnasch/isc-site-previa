
(function () {
  'use strict';
  Array.prototype.slice.call(document.querySelectorAll('video[data-uma-vez]')).forEach(function (v) {
    v.addEventListener('play', function () { v.loop = false; });
    v.addEventListener('ended', function () {
      try { v.pause(); } catch (e) {  }
      v.play = function () { return { catch: function () {} }; };   
    });
  });
  
  Array.prototype.slice.call(document.querySelectorAll('a[data-assunto][href="#agendar"]')).forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.getElementById('integ-servico');
      if (sel) sel.value = a.getAttribute('data-assunto');
    });
  });
})();

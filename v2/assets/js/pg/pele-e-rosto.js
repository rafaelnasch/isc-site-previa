
(function () {
  'use strict';
  var v = document.querySelector('.abertura video[data-vinheta-uma]');
  if (!v) return;
  v.addEventListener('playing', function () { v.loop = false; });
  v.addEventListener('ended', function () {
    v.classList.add('vinheta-fim');
    v.play = function () { return Promise.resolve(); };
  });
})();

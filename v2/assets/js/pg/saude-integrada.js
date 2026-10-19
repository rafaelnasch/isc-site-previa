
(function () {
  'use strict';
  Array.prototype.slice.call(document.querySelectorAll('video[data-uma-vez]')).forEach(function (v) {
    v.addEventListener('play', function () { v.loop = false; });
    v.addEventListener('ended', function () {
      try { v.pause(); } catch (e) {  }
      v.play = function () { return { catch: function () {} }; };   
    });
  });
})();

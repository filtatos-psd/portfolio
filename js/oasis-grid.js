/* ===== SECTION BACKGROUND: OASIS GRID =====
   Same engine as 02 // OASIS_GRID in background.html: an ascii density
   field that thickens around the cursor and turns yellow where it peaks.
   Used behind the home hero title and behind the about window.
*/

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var CHARS = " .:-=+*#%@";
  var GREY = "#888888";
  var YELLOW = "#faff00";
  var STEP = 12;

  var mouse = { x: -1000, y: -1000 };
  var engines = [];

  function trackPointer(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }

  window.addEventListener("mousemove", trackPointer);
  window.addEventListener("pointermove", trackPointer);

  function setup(id) {
    var canvas = document.getElementById(id);
    if (!canvas) {
      return;
    }
    engines.push({
      canvas: canvas,
      ctx: canvas.getContext("2d"),
      section: canvas.closest(".page")
    });
  }

  setup("hero-oasis");
  setup("about-oasis");

  if (!engines.length) {
    return;
  }

  function resizeEngine(engine) {
    var rect = engine.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      return;
    }
    engine.canvas.width = Math.round(rect.width);
    engine.canvas.height = Math.round(rect.height);
    engine.ctx.font = '10px "Space Mono", monospace';
  }

  function resizeAll() {
    engines.forEach(resizeEngine);
  }

  window.addEventListener("resize", resizeAll);
  window.addEventListener("hashchange", function () {
    requestAnimationFrame(resizeAll);
  });

  if ("ResizeObserver" in window) {
    var observer = new ResizeObserver(resizeAll);
    engines.forEach(function (engine) {
      observer.observe(engine.canvas);
    });
  }

  function draw(engine, time) {
    var canvas = engine.canvas;
    var ctx = engine.ctx;
    var w = canvas.width;
    var h = canvas.height;
    var rect = canvas.getBoundingClientRect();
    var mx = mouse.x - rect.left;
    var my = mouse.y - rect.top;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    ctx.font = '10px "Space Mono", monospace';

    for (var x = 0; x < w; x += STEP) {
      for (var y = 0; y < h; y += STEP) {
        var dx = x - mx;
        var dy = y - my;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var noise = Math.sin(x * 0.01 + y * 0.01 + time * 0.001);
        var val = Math.floor(
          Math.max(0, Math.min(9, (1 - dist / 150) * 10 + noise * 2))
        );
        var char = CHARS.charAt(val);
        if (char === " ") {
          continue;
        }
        ctx.fillStyle = val > 7 ? YELLOW : GREY;
        ctx.fillText(char, x, y);
      }
    }
  }

  function loop(time) {
    requestAnimationFrame(loop);

    if (document.hidden) {
      return;
    }

    engines.forEach(function (engine) {
      if (engine.section && engine.section.hidden) {
        return;
      }
      if (!engine.canvas.width || !engine.canvas.height) {
        resizeEngine(engine);
        if (!engine.canvas.width || !engine.canvas.height) {
          return;
        }
      }
      draw(engine, time);
    });
  }

  resizeAll();
  requestAnimationFrame(loop);
})();

/* ===== SECTION BACKGROUND: pixel soil wave + sprout =====
   Like main_inspo_for_background.html (+ dither wave idea from
   inspo_for_background_3.html). Only site colors + site mono font.
   One shared rAF loop, draws only the visible section, pauses on hidden.
*/

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var DENSITY = ["@", "#", "&", "%", "*", "+", "=", "-", ":", ".", " "];
  var BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  // Pixel sprout timeline: stem -> leaves -> bud -> flower (like the inspo bloom)
  // c: s = stem blue, l = leaf pink, b = bud yellow, f = flower pink, y = center yellow
  var SPROUT = [
    { dx: 0, dy: 0, t: 0.05, c: "s" },
    { dx: 0, dy: -1, t: 0.10, c: "s" },
    { dx: 0, dy: -2, t: 0.15, c: "s" },
    { dx: 0, dy: -3, t: 0.20, c: "s" },
    { dx: 0, dy: -4, t: 0.25, c: "s" },
    { dx: 0, dy: -5, t: 0.30, c: "s" },
    { dx: 0, dy: -6, t: 0.35, c: "s" },
    { dx: 0, dy: -7, t: 0.40, c: "s" },
    { dx: -1, dy: -4, t: 0.50, c: "l" },
    { dx: -2, dy: -5, t: 0.55, c: "l" },
    { dx: -3, dy: -5, t: 0.60, c: "l" },
    { dx: -2, dy: -4, t: 0.62, c: "l" },
    { dx: 1, dy: -5, t: 0.52, c: "l" },
    { dx: 2, dy: -6, t: 0.57, c: "l" },
    { dx: 3, dy: -6, t: 0.62, c: "l" },
    { dx: 2, dy: -5, t: 0.64, c: "l" },
    { dx: -1, dy: -8, t: 0.75, c: "f" },
    { dx: 1, dy: -8, t: 0.75, c: "f" },
    { dx: 0, dy: -9, t: 0.80, c: "f" },
    { dx: -1, dy: -10, t: 0.85, c: "f" },
    { dx: 1, dy: -10, t: 0.85, c: "f" },
    { dx: 0, dy: -11, t: 0.90, c: "y" },
    { dx: 0, dy: -13, t: 0.98, c: "b" }
  ];

  var COLORS = {
    s: "#0022ff", // stem blue
    l: "#ff00e5", // leaves pink
    f: "#ff00e5", // petals pink
    y: "#faff00", // center yellow
    b: "#faff00"  // bud yellow
  };

  function makeState(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) {
      return null;
    }
    var canvas = document.createElement("canvas");
    canvas.className = "matrix-canvas";
    canvas.setAttribute("aria-hidden", "true");
    section.insertBefore(canvas, section.firstChild);
    var ctx = canvas.getContext("2d");
    return {
      section: section,
      canvas: canvas,
      ctx: ctx,
      W: 0,
      H: 0,
      cols: 0,
      rows: 0,
      cell: 16,
      t: Math.random() * 100,
      bornAt: performance.now(),
      visible: false
    };
  }

  var states = [makeState("page-recall"), makeState("page-contact")].filter(Boolean);
  if (!states.length) {
    return;
  }

  function resizeState(st) {
    var rect = st.section.getBoundingClientRect();
    // Hidden sections report 0; keep last size and retry on hashchange
    if (rect.width < 2 || rect.height < 2) {
      return;
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    st.cell = rect.width < 640 ? 20 : 16;
    st.W = rect.width;
    st.H = rect.height;
    st.canvas.width = Math.round(rect.width * dpr);
    st.canvas.height = Math.round(rect.height * dpr);
    st.canvas.style.width = rect.width + "px";
    st.canvas.style.height = rect.height + "px";
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    st.ctx.font = st.cell + 'px "Space Mono", monospace';
    st.ctx.textBaseline = "top";
    st.cols = Math.ceil(rect.width / st.cell);
    st.rows = Math.ceil(rect.height / st.cell);
  }

  function resizeAll() {
    states.forEach(resizeState);
  }

  window.addEventListener("resize", resizeAll);
  window.addEventListener("hashchange", function () {
    // Sections change size when unhidden; measure after layout
    requestAnimationFrame(resizeAll);
  });

  // Follow section size changes (minimize/restore, fonts, layout shifts)
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function () {
      resizeAll();
    });
    states.forEach(function (st) {
      ro.observe(st.section);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          states.forEach(function (st) {
            if (st.section === entry.target) {
              st.visible = entry.isIntersecting;
              if (entry.isIntersecting) {
                resizeState(st);
              }
            }
          });
        });
      },
      { threshold: 0.05 }
    );
    states.forEach(function (st) {
      io.observe(st.section);
    });
  } else {
    states.forEach(function (st) {
      st.visible = true;
    });
  }

  function flow(x, y, t) {
    return (
      Math.sin(x * 0.3 + t) +
      Math.cos(y * 0.25 - t * 1.2) +
      Math.sin((x + y) * 0.12 + t * 0.5)
    );
  }

  function drawState(st) {
    var ctx = st.ctx;
    var W = st.W;
    var H = st.H;
    if (!W || !H) {
      return;
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    var cols = st.cols;
    var rows = st.rows;
    var cell = st.cell;
    var t = st.t;

    var elapsed = (performance.now() - st.bornAt) / 1000;
    var progress = Math.min(elapsed / 14, 1);

    // Secret section is viewport-locked: keep the soil higher up
    var isRecall = st.section.id === "page-recall";
    var soilF = isRecall ? 0.63 : 0.68;

    var baseSoil = Math.floor(rows * soilF);
    var rootX = Math.floor(cols / 2);

    var surfaceAtRoot = baseSoil;
    var c;
    for (c = 0; c < cols; c++) {
      var surf = Math.floor(
        baseSoil + Math.sin(c * 0.1 + t * 0.9) * 2 + Math.cos(c * 0.05) * 2
      );
      if (c === rootX) {
        surfaceAtRoot = surf;
      }
      for (var y = surf; y < rows; y++) {
        var depth = y - surf;
        var f = flow(c, y, t);
        var idx = Math.floor(depth * 0.5 + f * 1.5 + 3);
        idx = Math.max(0, Math.min(idx, DENSITY.length - 2));

        // Dithered edge like inspo_for_background_3.html
        var intensity = Math.max(0, 1 - depth / 14) + f * 0.08;
        var thr = BAYER[y % 4][c % 4] / 16 - 0.5;
        if (intensity + thr < 0.42) {
          continue;
        }

        var accent = (c * 7 + y * 13) % 41 === 0;
        if (accent) {
          ctx.fillStyle =
            (c + y) % 2 === 0 ? "rgba(255,0,229,0.5)" : "rgba(250,255,0,0.45)";
        } else if (depth < 2) {
          ctx.fillStyle = "rgba(255,255,255,0.20)";
        } else if (depth < 6) {
          ctx.fillStyle = "rgba(255,255,255,0.10)";
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
        }
        ctx.fillText(DENSITY[idx], c * cell, y * cell);
      }
    }

    // Pixel sprout growing from the soil (rooted at the soil line,
    // which sits higher in the locked secret section)
    if (progress > 0) {
      for (var i = 0; i < SPROUT.length; i++) {
        var b = SPROUT[i];
        if (progress < b.t) {
          continue;
        }
        var sway = 0;
        if (b.dy < -4) {
          sway = Math.round(Math.sin(t * 2 + b.dy * 0.4) * 0.6);
        }
        var px = (rootX + b.dx + sway) * cell;
        var py = (surfaceAtRoot + b.dy) * cell;
        ctx.fillStyle = COLORS[b.c] || "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  resizeAll();

  function loop() {
    states.forEach(function (st) {
      if (st.visible && !st.section.hidden && !document.hidden) {
        st.t += 1 / 60;
        drawState(st);
      }
    });
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

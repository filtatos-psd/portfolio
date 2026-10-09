/* ===== HELPERS ===== */

function getPageFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "work" || hash === "about" || hash === "contact" || hash === "recall" || hash === "start") {
    return hash === "start" ? "recall" : hash;
  }
  return "home";
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function formatIndex(number) {
  return "P_" + padTwo(number);
}

function displayOrDash(value) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.join(" / ");
  }
  return value;
}

/* ===== NAVIGATION & ROUTING ===== */

function setActiveNav(pageName) {
  const links = document.querySelectorAll(".site-nav a");
  links.forEach(function (link) {
    const target = link.getAttribute("href").replace("#", "");
    link.classList.toggle("is-active", target === pageName);
  });
  var label = pageName.toUpperCase();
  if (pageName === "recall") {
    label = "RE:CALL";
  }
  document.getElementById("footer-page").textContent = label;
}

function showPage(pageName) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(function (page) {
    page.hidden = page.id !== "page-" + pageName;
  });
  // Clear any leftover inline-hide from older window code so windows are visible,
  // and expand minimized windows so the page content is shown on navigation
  var activePage = document.getElementById("page-" + pageName);
  if (activePage) {
    activePage.querySelectorAll(".os-window").forEach(function (w) {
      if (w.style.display === "none") {
        w.style.display = "";
      }
      if (w.classList.contains("is-minimized")) {
        w.classList.remove("is-minimized");
        var minBtn = w.querySelector(".minimize-btn");
        if (minBtn) {
          minBtn.textContent = "_";
          minBtn.setAttribute("aria-label", "Minimize");
        }
      }
      // The secret window always opens pristine: big, centered, expanded,
      // like right after maximize. Clear any dragged/floating leftovers.
      if (w.id === "recall-window") {
        w.classList.remove("is-floating", "dragging");
        w.style.position = "";
        w.style.left = "";
        w.style.top = "";
        w.style.width = "";
        w.style.margin = "";
        w.style.transform = "";
        w.style.zIndex = "";
        if (w._ph && w._ph.parentNode) {
          w._ph.parentNode.removeChild(w._ph);
        }
        w._ph = null;
        return;
      }
      // Keep floating windows inside the viewport after navigation
      if (w.style.position === "fixed") {
        var r = w.getBoundingClientRect();
        var maxX = Math.max(0, document.documentElement.clientWidth - r.width);
        var maxY = Math.max(72, document.documentElement.clientHeight - 40 - r.height);
        w.style.left = Math.max(0, Math.min(r.left, maxX)) + "px";
        w.style.top = Math.max(72, Math.min(r.top, maxY)) + "px";
      }
    });
  }
  setActiveNav(pageName);
  closeMobileMenu();
  window.scrollTo(0, 0);
}

function handleRoute() {
  showPage(getPageFromHash());
}

function closeMobileMenu() {
  document.body.classList.remove("menu-open");
  const toggle = document.getElementById("menu-toggle");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
}

function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  toggle.addEventListener("click", function () {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

/* ===== OS WINDOW MANAGEMENT =====
   Two buttons only: minimize (_) toggles to maximize (□), close (×) goes home.
   Windows are draggable by their header, like inspo_for_windows-os.html.
*/

let highestZIndex = 50;

function setupOSWindows() {
  const wins = document.querySelectorAll(".os-window");

  wins.forEach(function (winEl) {
    const header = winEl.querySelector(".os-window-header");
    const minimizeBtn = winEl.querySelector(".minimize-btn");
    const closeBtn = winEl.querySelector(".close-btn");
    if (!header) {
      return;
    }

    // Bring to front on click
    winEl.addEventListener("mousedown", function () {
      winEl.style.zIndex = ++highestZIndex;
    });

    // Dragging (pointer events cover mouse + touch).
    // Uses position:fixed + viewport coords so there is no jump/teleport.
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    function placeFixed() {
      const rect = winEl.getBoundingClientRect();
      // Placeholder keeps the original spot in the layout so the page
      // (grid, banner, section height, site scroll, background) does not move.
      // The secret section manages its own fixed height, so it needs none.
      if (!winEl._ph && !winEl.closest("#page-recall")) {
        const ph = document.createElement("div");
        ph.className = "os-window-placeholder";
        ph.setAttribute("aria-hidden", "true");
        ph.style.width = rect.width + "px";
        ph.style.height = rect.height + "px";
        ph.style.margin = getComputedStyle(winEl).margin;
        winEl.parentNode.insertBefore(ph, winEl);
        winEl._ph = ph;
        // Double guarantee for the yellow DESIGNER ARTIST banner:
        // freeze its height so it can never shrink while the window floats
        const layout = winEl.closest(".about-layout");
        const banner = layout ? layout.querySelector(".about-banner") : null;
        if (banner) {
          banner.style.minHeight = banner.getBoundingClientRect().height + "px";
        }
      }
      winEl.style.position = "fixed";
      winEl.style.margin = "0";
      winEl.style.transform = "none";
      winEl.style.left = rect.left + "px";
      winEl.style.top = rect.top + "px";
      winEl.style.width = rect.width + "px";
      winEl.style.zIndex = ++highestZIndex;
      winEl.classList.add("is-floating");
    }

    // Keep a floating window fully inside the viewport (header/footer aware)
    function clampIntoView() {
      if (winEl.style.position !== "fixed") {
        return;
      }
      const rect = winEl.getBoundingClientRect();
      const maxX = Math.max(0, document.documentElement.clientWidth - rect.width);
      const maxY = Math.max(72, document.documentElement.clientHeight - 40 - rect.height);
      const x = Math.max(0, Math.min(rect.left, maxX));
      const y = Math.max(72, Math.min(rect.top, maxY));
      winEl.style.left = x + "px";
      winEl.style.top = y + "px";
    }

    header.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".win-btn")) {
        return;
      }
      dragging = true;
      placeFixed();
      winEl.classList.add("dragging");

      const rect = winEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialX = rect.left;
      initialY = rect.top;

      if (header.setPointerCapture && e.pointerId !== undefined) {
        try {
          header.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      e.preventDefault();
    });

    header.addEventListener("pointermove", function (e) {
      if (!dragging) {
        return;
      }
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newX = initialX + dx;
      let newY = initialY + dy;

      const maxX = document.documentElement.clientWidth - winEl.offsetWidth;
      const maxY = document.documentElement.clientHeight - winEl.offsetHeight - 40;
      const minY = 72;

      newX = Math.max(0, Math.min(newX, Math.max(0, maxX)));
      newY = Math.max(minY, Math.min(newY, Math.max(minY, maxY)));

      winEl.style.left = newX + "px";
      winEl.style.top = newY + "px";
    });

    function endDrag() {
      if (!dragging) {
        return;
      }
      dragging = false;
      winEl.classList.remove("dragging");
    }

    header.addEventListener("pointerup", endDrag);
    header.addEventListener("pointercancel", endDrag);

    // Minimize toggles to maximize (same button, icon swaps)
    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const isRecall = !!winEl.closest("#page-recall");
        const layout = winEl.closest(".about-layout");
        // Fix position first so the collapsed bar stays where the window was
        if (!isRecall && winEl.style.position !== "fixed") {
          placeFixed();
        }
        // Freeze the whole about grid height while collapsed so the yellow
        // banner can never shrink; release on restore (placeholder still holds it)
        if (layout && !isRecall) {
          if (!winEl.classList.contains("is-minimized")) {
            layout.style.minHeight = layout.getBoundingClientRect().height + "px";
          } else {
            layout.style.minHeight = "";
          }
        }
        const minimized = winEl.classList.toggle("is-minimized");
        minimizeBtn.textContent = minimized ? "□" : "_";
        minimizeBtn.setAttribute("aria-label", minimized ? "Maximize" : "Minimize");
        if (!minimized) {
          clampIntoView();
        }
      });
    }

    // Close goes back to homepage
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        window.location.hash = "#home";
      });
    }
  });

  // On browser resize/rotation, release the frozen banner height while the
  // about window is back in its natural (static) state, so nothing goes stale
  window.addEventListener("resize", function () {
    document.querySelectorAll(".about-layout").forEach(function (layout) {
      const win = layout.querySelector(".os-window");
      const banner = layout.querySelector(".about-banner");
      if (!banner) {
        return;
      }
      if (win && (win.style.position === "fixed" || win.classList.contains("is-minimized"))) {
        return;
      }
      layout.style.minHeight = "";
      banner.style.minHeight = "";
    });
  });
}

/* ===== HOME ===== */

function fillHome() {
  document.getElementById("logo-text").textContent = SITE.handle;
  document.getElementById("home-kicker").textContent = SITE.handle + " / portfolio";
  document.getElementById("home-role").textContent = SITE.title;
  document.getElementById("home-tagline").textContent = SITE.tagline;
  document.getElementById("home-status").textContent = SITE.status;
  document.getElementById("home-location").textContent = SITE.location;
  document.getElementById("home-handle").textContent = "@" + SITE.handle.replace(/^@/, "");
  document.getElementById("footer-handle").textContent = "@" + SITE.handle.replace(/^@/, "");
}

function createProjectCard(project, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "project-card";
  card.setAttribute("data-project-id", project.id);

  card.innerHTML =
    '<div class="project-card-image">' +
      '<img src="' + project.cover + '" alt="' + project.title + '" loading="lazy">' +
    "</div>" +
    '<div class="project-card-body">' +
      '<div class="project-card-index">' + formatIndex(index + 1) + " // file</div>" +
      '<h2 class="project-card-title">' + project.title + "</h2>" +
      '<div class="project-card-meta">' +
        "<div>> Year: " + displayOrDash(project.year) + "</div>" +
        "<div>> Tags: " + displayOrDash(project.tags) + "</div>" +
      "</div>" +
    "</div>";

  card.addEventListener("click", function () {
    openLightbox(project, 0);
  });

  return card;
}

function renderProjectGrid(containerId, projects) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  projects.forEach(function (project, index) {
    container.appendChild(createProjectCard(project, index));
  });
}

function fillWork() {
  renderWorkColumns("work-grid", PROJECTS);
  renderProjectGrid("home-preview-grid", PROJECTS.slice(0, 3));
}

function createProjectColumn(project, index) {
  const column = document.createElement("div");
  column.className = "project-column";
  column.setAttribute("data-project-id", project.id);
  column.style.cursor = "pointer";

  column.innerHTML =
    '<div class="project-meta">' +
      '<span>PROJECT // ' + formatIndex(index + 1) + '</span>' +
      '<span>STATUS: ' + (project.year === "2026" ? "LIVE" : "ARCHIVED") + '</span>' +
    '</div>' +
    '<div class="project-image">' +
      '<img src="' + project.cover + '" alt="' + project.title + '" loading="lazy">' +
    '</div>' +
    '<div class="project-title-container">' +
      '<div class="project-id">' + (project.year || "—") + '</div>' +
      '<h2 class="project-title">' + project.title + '</h2>' +
    '</div>';

  column.addEventListener("click", function () {
    openLightbox(project, 0);
  });

  return column;
}

function renderWorkColumns(containerId, projects) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  // Strict rows of 3, like before; every row expands uniformly on hover
  for (let i = 0; i < projects.length; i += 3) {
    const row = document.createElement("div");
    row.className = "work-row";
    projects.slice(i, i + 3).forEach(function (project, offset) {
      row.appendChild(createProjectColumn(project, i + offset));
    });
    container.appendChild(row);
  }
}

/* ===== ABOUT ===== */

function fillAbout() {
  document.getElementById("about-text").textContent = SITE.about;
  const list = document.getElementById("skills-list");
  list.innerHTML = "";
  SITE.skills.forEach(function (skill) {
    const item = document.createElement("li");
    item.textContent = skill;
    list.appendChild(item);
  });
}

/* ===== CONTACT ===== */

function fillContact() {
  const emailLink = document.getElementById("contact-email");
  emailLink.href = "mailto:" + SITE.email;
  emailLink.textContent = SITE.email;

  const instagramLink = document.getElementById("contact-instagram");
  instagramLink.href = SITE.instagramUrl;
  instagramLink.textContent = SITE.instagramHandle;
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("form-name").value.trim();
    const email = document.getElementById("form-email").value.trim();
    const message = document.getElementById("form-message").value.trim();

    const subject = encodeURIComponent("Portfolio message from " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\n" + message
    );

    window.location.href = "mailto:" + SITE.email + "?subject=" + subject + "&body=" + body;

    status.hidden = false;
    status.textContent = "Your email app should open with the message ready to send.";
  });
}

/* ===== PROJECT VIEWER ===== */

var lightboxState = {
  project: null,
  imageIndex: 0
};

function openLightbox(project, imageIndex) {
  lightboxState.project = project;
  lightboxState.imageIndex = imageIndex || 0;
  updateLightbox();
  document.getElementById("lightbox").hidden = false;
}

function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  lightboxState.project = null;
}

function updateLightbox() {
  const project = lightboxState.project;
  const imagePath = project.images[lightboxState.imageIndex];
  document.getElementById("lightbox-image").src = imagePath;
  document.getElementById("lightbox-image").alt = project.title;
  document.getElementById("lightbox-title").textContent = project.title;
  document.getElementById("lightbox-meta").textContent =
    displayOrDash(project.year) + "  ·  " + displayOrDash(project.tags);
}

function stepLightbox(direction) {
  if (!lightboxState.project) {
    return;
  }
  const total = lightboxState.project.images.length;
  lightboxState.imageIndex = (lightboxState.imageIndex + direction + total) % total;
  updateLightbox();
}

function setupLightbox() {
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", function () {
    stepLightbox(-1);
  });
  document.getElementById("lightbox-next").addEventListener("click", function () {
    stepLightbox(1);
  });

  document.getElementById("lightbox").addEventListener("click", function (event) {
    if (event.target.id === "lightbox") {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (document.getElementById("lightbox").hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
    }
    if (event.key === "ArrowRight") {
      stepLightbox(1);
    }
  });
}

/* ===== CLOCK ===== */

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    padTwo(now.getHours()) + ":" + padTwo(now.getMinutes()) + ":" + padTwo(now.getSeconds());
}

/* ===== START ===== */

function init() {
  fillHome();
  fillWork();
  fillAbout();
  fillContact();
  setupContactForm();
  setupLightbox();
  setupMobileMenu();
  setupOSWindows();
  handleRoute();
  updateClock();
  setInterval(updateClock, 1000);
  window.addEventListener("hashchange", handleRoute);
}

init();

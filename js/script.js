/* ===== HELPERS ===== */

function getPageFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "work" || hash === "about" || hash === "contact") {
    return hash;
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
  document.getElementById("footer-page").textContent = pageName.toUpperCase();
}

function showPage(pageName) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(function (page) {
    page.hidden = page.id !== "page-" + pageName;
  });
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
        "<div>&gt; Year: " + displayOrDash(project.year) + "</div>" +
        "<div>&gt; Tags: " + displayOrDash(project.tags) + "</div>" +
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
  renderProjectGrid("work-grid", PROJECTS);
  renderProjectGrid("home-preview-grid", PROJECTS.slice(0, 3));
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
  handleRoute();
  updateClock();
  setInterval(updateClock, 1000);
  window.addEventListener("hashchange", handleRoute);
}

init();

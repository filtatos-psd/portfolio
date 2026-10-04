/* ===== START PAGE: MEMORY GAME =====
   Opened from the footer button (#start). A classic memory / concentration
   game where every card pair is one of the projects from js/data.js.
   7 projects -> 14 cards (each project appears twice).

   The footer button shows "START" normally and turns into "BACK" while
   this page is open, so the person can leave the same way they came in.
*/

const START_HASH = "#start";

const boardEl = document.getElementById("memory-board");
const movesEl = document.getElementById("memory-moves");
const statusEl = document.getElementById("memory-status");
const footerButton = document.getElementById("footer-start");

const CARD_COLORS = ["card-pink", "card-yellow", "card-blue"];

let lockBoard = false;
let firstCard = null;
let secondCard = null;
let moves = 0;
let matchedCount = 0;
let pendingTimeout = null;
let lastOutsideHash = "#home";

/* ===== HELPERS ===== */

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function randomColorClass() {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}

function buildDeck() {
  const pairs = PROJECTS.flatMap(function (project) {
    return [
      { projectId: project.id, title: project.title, cover: project.cover },
      { projectId: project.id, title: project.title, cover: project.cover }
    ];
  });
  return shuffle(pairs);
}

/* ===== RENDER ===== */

function createCard(card, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "memory-card";
  button.setAttribute("data-project-id", card.projectId);
  button.setAttribute("aria-label", "Memory card " + (index + 1));

  button.innerHTML =
    '<span class="memory-card-inner">' +
      '<span class="memory-card-face memory-card-back ' + randomColorClass() + '">?</span>' +
      '<span class="memory-card-face memory-card-front">' +
        '<img src="' + card.cover + '" alt="' + card.title + '" loading="lazy">' +
      "</span>" +
    "</span>";

  button.addEventListener("click", function () {
    handleCardClick(button);
  });

  return button;
}

function renderBoard() {
  clearTimeout(pendingTimeout);
  lockBoard = false;
  firstCard = null;
  secondCard = null;
  moves = 0;
  matchedCount = 0;

  movesEl.textContent = "MOVES: 0";
  statusEl.textContent = "";
  statusEl.hidden = true;

  boardEl.innerHTML = "";
  buildDeck().forEach(function (card, index) {
    boardEl.appendChild(createCard(card, index));
  });
}

/* ===== GAME LOGIC ===== */

function handleCardClick(button) {
  if (lockBoard || button === firstCard || button.classList.contains("is-matched")) {
    return;
  }

  button.classList.add("is-flipped");

  if (!firstCard) {
    firstCard = button;
    return;
  }

  secondCard = button;
  lockBoard = true;
  moves += 1;
  movesEl.textContent = "MOVES: " + moves;

  const isMatch = firstCard.getAttribute("data-project-id") === secondCard.getAttribute("data-project-id");

  if (isMatch) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    matchedCount += 1;
    resetTurn();

    if (matchedCount === PROJECTS.length) {
      statusEl.textContent = "ALL MATCHED IN " + moves + " MOVES";
      statusEl.hidden = false;
    }
  } else {
    pendingTimeout = setTimeout(function () {
      firstCard.classList.remove("is-flipped");
      secondCard.classList.remove("is-flipped");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

/* ===== ROUTE / FOOTER BUTTON ===== */

function syncWithRoute() {
  const open = window.location.hash === START_HASH;
  footerButton.classList.toggle("is-active", open);

  if (open) {
    footerButton.textContent = "BACK";
    footerButton.setAttribute("href", lastOutsideHash);
    renderBoard();
  } else {
    footerButton.textContent = "START";
    footerButton.setAttribute("href", START_HASH);
    lastOutsideHash = window.location.hash || "#home";
    clearTimeout(pendingTimeout);
  }
}

window.addEventListener("hashchange", syncWithRoute);
syncWithRoute();

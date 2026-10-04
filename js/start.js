/* ===== START PAGE: MEMORY GAME =====
   Opened from the footer button (#start). A classic memory / concentration
   game where every card pair is one of the projects from js/data.js.
   Every project adds 2 cards (one pair) automatically.

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

/* How many grid columns to use, based on how many cards there are.
   Grows as you add more projects, so it never gets too cramped.
   Edit the numbers on the left to change when it switches to more columns. */
function getColumnCount(totalCards) {
  if (totalCards <= 16) return 4; // up to 8 projects
  if (totalCards <= 25) return 5; // up to ~12 projects
  if (totalCards <= 30) return 6; // up to 15 projects
  if (totalCards <= 35) return 7; // up to ~17 projects
  return 7 + Math.ceil((totalCards - 35) / 10); // +1 column every 5 more projects
}

/* Gives every card a back color (pink / yellow / blue), spread out evenly
   and never placing two of the same color next to each other. */
function assignCardColors(count) {
  const base = Math.floor(count / CARD_COLORS.length);
  const extra = count % CARD_COLORS.length;
  const remaining = {};
  CARD_COLORS.forEach(function (color, index) {
    remaining[color] = base + (index < extra ? 1 : 0);
  });

  const result = [];
  let previous = null;

  for (let i = 0; i < count; i += 1) {
    let choices = CARD_COLORS.filter(function (color) {
      return remaining[color] > 0 && color !== previous;
    });
    if (choices.length === 0) {
      choices = CARD_COLORS.filter(function (color) {
        return remaining[color] > 0;
      });
    }
    const maxCount = Math.max.apply(null, choices.map(function (color) { return remaining[color]; }));
    const best = choices.filter(function (color) { return remaining[color] === maxCount; });
    const pick = best[Math.floor(Math.random() * best.length)];

    result.push(pick);
    remaining[pick] -= 1;
    previous = pick;
  }

  return result;
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

function createCard(card, index, colorClass) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "memory-card";
  button.setAttribute("data-project-id", card.projectId);
  button.setAttribute("aria-label", "Memory card " + (index + 1));

  button.innerHTML =
    '<span class="memory-card-inner">' +
      '<span class="memory-card-face memory-card-back ' + colorClass + '">?</span>' +
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

  const deck = buildDeck();
  const colors = assignCardColors(deck.length);

  boardEl.style.gridTemplateColumns = "repeat(" + getColumnCount(deck.length) + ", 1fr)";
  boardEl.innerHTML = "";
  deck.forEach(function (card, index) {
    boardEl.appendChild(createCard(card, index, colors[index]));
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

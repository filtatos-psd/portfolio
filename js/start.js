/* ===== START PAGE =====
   Opened from the START button in the footer (#start).
   1. A Paintbrush picture with a red 10 second countdown on the grass.
   2. When the countdown ends the picture glitches and disappears.
   3. A rotating 3D cat (FBX model) takes its place.

   Files used (all inside the assets/start folder):
   - deadinternettheory.png  the Paintbrush picture
   - cat.fbx                 the 3D model
   - cat_texture.jpg         the texture of the model

   Change the values below to adjust the behavior.
*/

const START_HASH = "#start";
const COUNTDOWN_SECONDS = 10;
const GLITCH_MS = 900;
const MODEL_URL = "assets/start/cat.fbx";
const TEXTURE_URL = "assets/start/cat_texture.jpg";
const SPIN_SPEED = 1.6; // turns of the cat, in radians per second

const stage = document.getElementById("start-stage");
const image = document.getElementById("start-image");
const countdownEl = document.getElementById("start-countdown");
const canvas = document.getElementById("start-canvas");
const caption = document.getElementById("start-caption");
const windowTitle = document.getElementById("start-window-title");
const footerButton = document.getElementById("footer-start");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let runId = 0;
let countdownTimer = null;
let glitchTimer = null;
let viewerPromise = null;
let pageIsOpen = false;

/* ===== HELPERS ===== */

function padTwo(value) {
  return String(value).padStart(2, "0");
}

function clearTimers() {
  clearInterval(countdownTimer);
  clearTimeout(glitchTimer);
  countdownTimer = null;
  glitchTimer = null;
}

/* ===== 3D VIEWER ===== */

async function createViewer() {
  const THREE = await import("three");
  const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);

  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(80, 140, 160);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xff00e5, 1.1);
  rimLight.position.set(-140, 60, -120);
  scene.add(rimLight);

  // The model file points to a 4096px texture on the original computer.
  // Any image request made by the model is redirected to the smaller texture in assets/start.
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(function (url) {
    return /\.(png|jpe?g|tga|bmp)$/i.test(url) ? TEXTURE_URL : url;
  });

  const model = await new Promise(function (resolve, reject) {
    new FBXLoader(manager).load(MODEL_URL, resolve, undefined, reject);
  });

  // Put the middle of the cat at the center of a pivot, so it spins around itself.
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const pivot = new THREE.Group();
  pivot.add(model);
  scene.add(pivot);

  const spinRadius = Math.hypot(size.x, size.z) / 2;
  const halfHeight = size.y / 2;

  // The model has a small animation (the mouth). Play it in a loop.
  const mixer = new THREE.AnimationMixer(model);
  model.animations.forEach(function (clip) {
    mixer.clipAction(clip).play();
  });

  const clock = new THREE.Clock();
  let frameId = null;

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;

    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distance = 1.3 * Math.max(spinRadius / (tanHalf * camera.aspect), halfHeight / tanHalf);
    camera.position.set(0, distance * 0.16, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function loop() {
    frameId = requestAnimationFrame(loop);
    const delta = clock.getDelta();
    mixer.update(delta);
    pivot.rotation.y += delta * SPIN_SPEED;
    renderer.render(scene, camera);
  }

  new ResizeObserver(resize).observe(stage);

  return {
    play: function () {
      resize();
      clock.getDelta();
      if (frameId === null) {
        loop();
      }
    },
    pause: function () {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}

function getViewer() {
  if (!viewerPromise) {
    viewerPromise = createViewer().catch(function (error) {
      console.error("3D viewer failed:", error);
      viewerPromise = null;
      throw error;
    });
  }
  return viewerPromise;
}

function pauseViewer() {
  if (viewerPromise) {
    viewerPromise.then(function (viewer) {
      viewer.pause();
    }).catch(function () {});
  }
}

/* ===== STATES ===== */

function resetStage() {
  clearTimers();
  pauseViewer();
  stage.classList.remove("is-glitching", "is-revealed");
  image.hidden = false;
  countdownEl.hidden = false;
  countdownEl.classList.remove("is-urgent");
  countdownEl.textContent = padTwo(COUNTDOWN_SECONDS);
  canvas.hidden = true;
  windowTitle.textContent = "UNTITLED.BMP";
  caption.textContent = "> _";
}

async function revealCat(currentRun) {
  stage.classList.remove("is-glitching");
  stage.classList.add("is-revealed");
  image.hidden = true;
  countdownEl.hidden = true;
  canvas.hidden = false;
  windowTitle.textContent = "CAT.EXE";
  caption.textContent = "> loading...";

  try {
    const viewer = await getViewer();
    if (currentRun !== runId) {
      return;
    }
    viewer.play();
    caption.textContent = "> cat.fbx // running";
  } catch (error) {
    if (currentRun !== runId) {
      return;
    }
    caption.textContent = "> signal lost // could not load the model";
  }
}

function finishCountdown(currentRun) {
  clearInterval(countdownTimer);
  countdownEl.textContent = "00";
  countdownEl.classList.add("is-urgent");
  stage.classList.add("is-glitching");

  glitchTimer = setTimeout(function () {
    if (currentRun === runId) {
      revealCat(currentRun);
    }
  }, reduceMotion ? 0 : GLITCH_MS);
}

function startCountdown() {
  runId += 1;
  const currentRun = runId;
  resetStage();

  // Start loading the 3D model while the countdown runs, so it is ready at 00.
  getViewer().catch(function () {});

  const endTime = performance.now() + COUNTDOWN_SECONDS * 1000;

  countdownTimer = setInterval(function () {
    const remaining = Math.ceil((endTime - performance.now()) / 1000);
    if (remaining <= 0) {
      finishCountdown(currentRun);
      return;
    }
    countdownEl.textContent = padTwo(remaining);
    countdownEl.classList.toggle("is-urgent", remaining <= 3);
  }, 100);
}

function stopStart() {
  runId += 1;
  resetStage();
}

/* ===== ROUTE ===== */

function syncWithRoute() {
  const open = window.location.hash === START_HASH;
  footerButton.classList.toggle("is-active", open);

  if (open && !pageIsOpen) {
    pageIsOpen = true;
    startCountdown();
  } else if (!open && pageIsOpen) {
    pageIsOpen = false;
    stopStart();
  }
}

// Clicking START while already on the page restarts the countdown.
footerButton.addEventListener("click", function () {
  if (window.location.hash === START_HASH) {
    startCountdown();
  }
});

window.addEventListener("hashchange", syncWithRoute);
syncWithRoute();

const scenes = [...document.querySelectorAll(".scene")];
const sceneDots = document.getElementById("sceneDots");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const music = document.getElementById("bgMusic");
const sceneIntro = document.getElementById("sceneIntro");
const giftBox = document.getElementById("giftBox");
const prevMemoryBtn = document.getElementById("prevMemoryBtn");
const nextMemoryBtn = document.getElementById("nextMemoryBtn");
const envelope = document.getElementById("envelope");
const finalBtn = document.getElementById("finalBtn");
const musicBtn = document.getElementById("musicBtn");
const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeLightbox = document.getElementById("closeLightbox");
const wishCard = document.getElementById("wishCard");

let sceneIndex = 0;
let lastScrollAt = 0;
let touchStartY = 0;
let memoryTimer = 0;

scenes.forEach((scene, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", scene.dataset.label);
  dot.addEventListener("click", () => showScene(index));
  sceneDots.appendChild(dot);
});

function showScene(target, scrollToScene = true) {
  const nextIndex = typeof target === "number" ? target : scenes.findIndex((scene) => scene.id === target);
  sceneIndex = Math.max(0, nextIndex);
  scenes.forEach((scene, index) => scene.classList.toggle("active", index === sceneIndex));
  [...sceneDots.children].forEach((dot, index) => dot.classList.toggle("active", index === sceneIndex));
  progressBar.style.width = `${((sceneIndex + 1) / scenes.length) * 100}%`;
  backBtn.disabled = sceneIndex === 0;
  if (sceneIndex === scenes.length - 1) confettiBurst(260);
  if (scrollToScene) scenes[sceneIndex].scrollIntoView({ behavior: "smooth", block: "start" });
}

showScene(0, false);
startMusicAutomatically();

function startMusicAutomatically() {
  tryMusic();
  document.addEventListener("DOMContentLoaded", tryMusic, { once: true });
  window.addEventListener("load", tryMusic, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && music.paused) tryMusic();
  });

  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, tryMusic, { once: true, passive: true });
  });
}

function tryMusic() {
  if (music.currentTime < 3) music.currentTime = 3;
  music.play()
    .then(() => {
      musicBtn.textContent = "II";
      musicBtn.setAttribute("aria-label", "Pause music");
    })
    .catch(() => {
      musicBtn.textContent = "M";
    });
}

function startSurprise() {
  tryMusic();
  showScene("sceneGift");
}

sceneIntro.addEventListener("click", startSurprise);
sceneIntro.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") startSurprise();
});

backBtn.addEventListener("click", () => {
  if (sceneIndex > 0) showScene(sceneIndex - 1);
});

function syncSceneToScroll() {
  const viewportCenter = innerHeight / 2;
  let closestIndex = 0;
  let closestDistance = Infinity;
  scenes.forEach((scene, index) => {
    const rect = scene.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  if (closestIndex !== sceneIndex) showScene(closestIndex, false);
}

window.addEventListener("scroll", syncSceneToScroll, { passive: true });

function scrollScene(direction) {
  const now = Date.now();
  if (now - lastScrollAt < 620) return;
  const nextIndex = Math.max(0, Math.min(scenes.length - 1, sceneIndex + direction));
  if (nextIndex === sceneIndex) return;
  lastScrollAt = now;
  showScene(nextIndex);
}

musicBtn.addEventListener("click", () => {
  if (music.paused) {
    tryMusic();
  } else {
    music.pause();
    musicBtn.textContent = "M";
    musicBtn.setAttribute("aria-label", "Play music");
  }
});

function openGift() {
  giftBox.classList.add("open");
  confettiBurst();
  memoryIndex = 0;
  loadMemory();
  setTimeout(() => {
    showScene("sceneMemory");
    startMemoryAutoplay();
  }, 1200);
}

giftBox.addEventListener("click", openGift);
giftBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") openGift();
});

const memories = [
  ["images/photo1.jpeg", "Chapter 1", "From this little girl...", "...to the beautiful person who makes my world brighter."],
  ["images/photo2.jpeg", "Chapter 2", "Even late-night calls feel special", "Because every moment with you becomes a memory I want to keep forever."],
  ["images/photo3.jpeg", "Chapter 3", "My favorite face", "You make even ordinary days feel soft, peaceful and beautiful."],
  ["images/photo4.jpeg", "Chapter 4", "Sunshine in one picture", "Every time I see you, the world feels a little warmer."],
  ["images/photo5.jpeg", "Chapter 5", "My beautiful Angel", "I hope you achieve every height you dream of. I will always be there for you."]
];

let memoryIndex = 0;

function stopMemoryAutoplay() {
  clearTimeout(memoryTimer);
}

function startMemoryAutoplay() {
  stopMemoryAutoplay();
  memoryTimer = setTimeout(() => {
    if (memoryIndex >= memories.length - 1) {
      showScene("sceneLetter");
      return;
    }
    memoryIndex += 1;
    loadMemory(1);
    startMemoryAutoplay();
  }, 2000);
}

function loadMemory(direction = 1) {
  const [image, kicker, title, line] = memories[memoryIndex];
  document.getElementById("memoryImage").src = image;
  document.getElementById("memoryKicker").textContent = kicker;
  document.getElementById("memoryTitle").textContent = title;
  document.getElementById("memoryLine").textContent = line;
  document.getElementById("memoryCounter").textContent = `${String(memoryIndex + 1).padStart(2, "0")} / ${String(memories.length).padStart(2, "0")}`;
  prevMemoryBtn.disabled = memoryIndex === 0;
  nextMemoryBtn.textContent = memoryIndex === memories.length - 1 ? "Open letter" : "Next memory";

  const card = document.querySelector(".memory-card");
  card.style.setProperty("--slide", `${direction * 18}px`);
  card.classList.remove("fade-in");
  void card.offsetWidth;
  card.classList.add("fade-in");
}

prevMemoryBtn.addEventListener("click", () => {
  if (memoryIndex > 0) {
    memoryIndex -= 1;
    loadMemory(-1);
    startMemoryAutoplay();
  }
});

nextMemoryBtn.addEventListener("click", () => {
  if (memoryIndex >= memories.length - 1) {
    showScene("sceneLetter");
  } else {
    memoryIndex += 1;
    loadMemory(1);
    startMemoryAutoplay();
  }
});

loadMemory();

const letter = `Happy Birthday Angelu.

Thank you for coming into my life. You have brought so much happiness, warmth and love into my world.

I always want to see you achieve great heights and accomplish every dream that you have. No matter what happens, I will always be there for you.

I hope your day is filled with love, laughter and beautiful memories. You deserve all the happiness in the world.

I love you.

- Jishal`;

let typed = false;

function openLetter() {
  envelope.classList.add("open");
  if (!typed) {
    typed = true;
    typeText(letter, document.getElementById("typedLetter"), 22, () => setTimeout(() => showScene("sceneGallery"), 1100));
  }
}

envelope.addEventListener("click", openLetter);
envelope.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") openLetter();
});

function typeText(text, element, speed, done) {
  let cursor = 0;
  const timer = setInterval(() => {
    element.textContent = text.slice(0, cursor);
    cursor += 1;
    if (cursor > text.length) {
      clearInterval(timer);
      if (done) done();
    }
  }, speed);
}

galleryGrid.addEventListener("click", (event) => {
  const figure = event.target.closest("figure");
  if (!figure) return;
  const image = figure.querySelector("img");
  lightboxImage.src = image.src;
  lightboxCaption.textContent = figure.dataset.caption;
  if (typeof lightbox.showModal === "function") lightbox.showModal();
});

closeLightbox.addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

finalBtn.addEventListener("click", () => showScene("sceneFinal"));

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${(event.clientX / innerWidth) * 100}%`);
  document.documentElement.style.setProperty("--y", `${(event.clientY / innerHeight) * 100}%`);
});

const hc = document.getElementById("heartsCanvas");
const hctx = hc.getContext("2d");
const cc = document.getElementById("confettiCanvas");
const cctx = cc.getContext("2d");
let hearts = [];
let confetti = [];

function resize() {
  hc.width = innerWidth;
  hc.height = innerHeight;
  cc.width = innerWidth;
  cc.height = innerHeight;
}

addEventListener("resize", resize);
resize();

function heartPath(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * .3);
  ctx.bezierCurveTo(x - size, y - size * .4, x - size * 1.4, y + size * .4, x, y + size);
  ctx.bezierCurveTo(x + size * 1.4, y + size * .4, x + size, y - size * .4, x, y + size * .3);
}

function animateHearts() {
  hctx.clearRect(0, 0, hc.width, hc.height);
  if (Math.random() < .08) {
    hearts.push({
      x: Math.random() * hc.width,
      y: hc.height + 30,
      size: 8 + Math.random() * 18,
      speed: .5 + Math.random() * 1.3,
      alpha: .22 + Math.random() * .5
    });
  }

  hearts.forEach((heart) => {
    heart.y -= heart.speed;
    heart.x += Math.sin(heart.y * .015) * .45;
    hctx.save();
    hctx.globalAlpha = heart.alpha;
    hctx.fillStyle = Math.random() > .985 ? "#ffd166" : "#ff5c9c";
    hctx.shadowColor = "#ff2f82";
    hctx.shadowBlur = 18;
    heartPath(hctx, heart.x, heart.y, heart.size);
    hctx.fill();
    hctx.restore();
  });

  hearts = hearts.filter((heart) => heart.y > -60);
  requestAnimationFrame(animateHearts);
}

function confettiBurst(count = 180) {
  for (let index = 0; index < count; index += 1) {
    confetti.push({
      x: cc.width / 2,
      y: cc.height / 2,
      vx: (Math.random() - .5) * 12,
      vy: (Math.random() - .85) * 12,
      size: 4 + Math.random() * 8,
      rotate: Math.random() * 6.28,
      color: ["#ff3e88", "#ffd166", "#ffffff", "#55d6c2", "#f72585"][Math.floor(Math.random() * 5)]
    });
  }
}

function animateConfetti() {
  cctx.clearRect(0, 0, cc.width, cc.height);
  confetti.forEach((piece) => {
    piece.vy += .16;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotate += .12;
    cctx.save();
    cctx.translate(piece.x, piece.y);
    cctx.rotate(piece.rotate);
    cctx.fillStyle = piece.color;
    cctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.6);
    cctx.restore();
  });
  confetti = confetti.filter((piece) => piece.y < cc.height + 40);
  requestAnimationFrame(animateConfetti);
}

animateHearts();
animateConfetti();

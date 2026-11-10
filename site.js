const nav = document.querySelector(".masthead-inner");
const menuButton = nav.querySelector(".menu-toggle");
const navLinks = nav.querySelector(".nav-links");
nav.classList.add("enhanced");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
});
navLinks.addEventListener("click", event => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || menuButton.getAttribute("aria-expanded") !== "true") return;
  closeMenu();
  menuButton.focus();
});
document.addEventListener("click", event => {
  if (!nav.contains(event.target)) closeMenu();
});

const canvas = document.querySelector("#stars");
const context = canvas.getContext("2d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

if (context) {
  let width;
  let height;
  let backdrop;
  let stars;
  let frame;
  let shootingStar;
  let nextShootingStar;

  function resizeSky() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    backdrop = context.createRadialGradient(width * .18, height * .1, 0, width * .18, height * .1, Math.max(width, height) * 1.1);
    backdrop.addColorStop(0, "#241a52");
    backdrop.addColorStop(.42, "#120d33");
    backdrop.addColorStop(1, "#060414");
    const count = Math.max(150, Math.min(440, Math.round(width * height / 1700)));
    stars = Array.from({length: count}, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: .4 + Math.random() ** 2 * 1.3,
      brightness: .23 + Math.random() * .63,
      phase: Math.random() * 2 * Math.PI,
      speed: .6 + Math.random() * 1.6,
      color: Math.random() < .14 ? "190, 203, 255" : "245, 240, 255"
    }));
    shootingStar = null;
    nextShootingStar = performance.now() + 4500;
    cancelAnimationFrame(frame);
    drawSky(performance.now());
  }

  function drawSky(time) {
    context.fillStyle = backdrop;
    context.fillRect(0, 0, width, height);
    const seconds = time / 1000;

    for (const star of stars) {
      const twinkle = reduceMotion.matches ? 1 : .78 + .22 * Math.sin(seconds * star.speed + star.phase);
      context.fillStyle = `rgba(${star.color}, ${star.brightness * twinkle})`;
      context.beginPath();
      context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      context.fill();
    }

    if (reduceMotion.matches) return;

    if (time > nextShootingStar) {
      shootingStar = { time, x: width * (.22 + Math.random() * .6), y: height * (.08 + Math.random() * .35) };
      nextShootingStar = time + 5500 + Math.random() * 4500;
    }
    if (shootingStar) {
      const progress = (time - shootingStar.time) / 750;
      if (progress < 1) {
        const x = shootingStar.x + 195 * progress;
        const y = shootingStar.y + 89 * progress;
        const tail = context.createLinearGradient(x - 87, y - 40, x, y);
        tail.addColorStop(0, "transparent");
        tail.addColorStop(1, `rgba(205, 197, 255, ${Math.sin(progress * Math.PI) * .8})`);
        context.strokeStyle = tail;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(x - 87, y - 40);
        context.lineTo(x, y);
        context.stroke();
      } else {
        shootingStar = null;
      }
    }
    frame = requestAnimationFrame(drawSky);
  }

  resizeSky();
  addEventListener("resize", resizeSky);
  reduceMotion.addEventListener("change", resizeSky);
}

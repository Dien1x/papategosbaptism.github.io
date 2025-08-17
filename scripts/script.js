// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1) {
      e.preventDefault();
      document
        .querySelector(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const container = document.querySelector("body"); // container holding scrollable content
const hero = document.querySelector(".wealcoming_image img");
let fadeEnd = window.innerHeight * 1.5; 

// Update fadeEnd on window resize
window.addEventListener("resize", () => {
  fadeEnd = window.innerHeight * 1.5;
  console.log("fadeEnd updated:", fadeEnd);
});

container.addEventListener("scroll", () => {
  const scrollY = container.scrollTop;
  const fadeStart = 0;
  let opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
  if (opacity < 0) opacity = 0;
  hero.style.opacity = opacity;
});


// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ====== SEATING ======
const SEATING = {
  "ΔΗΜΗΤΡΙΟΣ ΜΑΤΑΦΙΑΣ": "Τραπέζι 1",
  "ΕΛΕΝΗ ΚΟΥΡΤΗ": "Τραπέζι 3",
  "ΒΑΣΙΛΗΣ ΠΑΠΑΤΕΓΟΣ": "Τραπέζι 2",
  "ΕΥΑΓΓΕΛΙΑ ΜΑΛΑΜΑ": "Τραπέζι 5",
};
const seatSearch = document.getElementById("seatSearch");
const seatResult = document.getElementById("seatResult");
seatSearch.addEventListener("input", () => {
  const name = seatSearch.value.trim().toLowerCase();
  let found = "";
  for (const [k, v] of Object.entries(SEATING)) {
    if (k.toLowerCase() === name) {
      found = `${k}: <strong>${v}</strong>`;
      break;
    }
  }
  seatResult.innerHTML =
    found ||
    '<span class="muted">Παρακαλώ εισάγετε πλήρες και ακριβές όνομα και επώνυμο με κεφαλαία γράμματα.</span>';
});

// ====== GALLERY ======
const GALLERY = [
  "assets/gallery/eevee-pokemon-4k-wallpaper-uhdpaper.com-101@2@a.jpg",
  "assets/gallery/eevee-pokemon-4k-wallpaper-uhdpaper.com-93@2@a.jpg",
  "assets/gallery/gengar-gastly-graveyard-pokemon-4k-wallpaper-uhdpaper.com-396@3@b.jpg",
  "assets/gallery/pexels-jplenio-1118873.jpg",
  "assets/gallery/wallpaperflare.com_wallpaper.jpg",
];
const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightImg = lightbox.querySelector("img");
galleryGrid.innerHTML = GALLERY.map(
  (src) => `<img src="${src}" alt="Gallery photo"/>`
).join("");
galleryGrid.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    lightImg.src = e.target.src;
    lightbox.classList.add("open");
  }
});
lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
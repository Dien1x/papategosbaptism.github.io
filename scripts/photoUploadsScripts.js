// ===== CONFIG =====
const REQUIRE_APPROVAL = false; // set to false to auto-approve uploads
const CLOUDINARY_CLOUD_NAME = "dznoiv1vf";
const CLOUDINARY_UNSIGNED_PRESET = "ngmtkuac";

// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYoXsUdZ5Y1Oavwc0hg_kT6_23yFAu7VE",
  authDomain: "mywishpriject.firebaseapp.com",
  projectId: "mywishpriject",
  storageBucket: "mywishpriject.firebasestorage.app",
  messagingSenderId: "14036030221",
  appId: "1:14036030221:web:e9f104aca9f1e8df071644",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const uploadsCol = collection(db, "uploads");

// ===== HELPERS =====
function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ===== ELEMENTS =====
const uploadForm = document.getElementById("uploadForm");
const gallery = document.getElementById("gallery");

// ===== UPLOAD HANDLER =====
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rawName = document.getElementById("uploaderName").value;
  const files = document.getElementById("fileInput").files;
  if (!files.length) return;

  const prettyName = normalizeName(rawName);

  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UNSIGNED_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    await addDoc(uploadsCol, {
      uploaderName: prettyName,
      url: data.secure_url,
      type: file.type.startsWith("video") ? "video" : "image",
      ts: Date.now(),
      approved: !REQUIRE_APPROVAL
    });
  }

  uploadForm.reset();
  if (REQUIRE_APPROVAL) alert("Uploaded! Waiting for approval.");
});

// ===== GALLERY RENDER =====
function renderGallery(items) {
  // Group by uploader name
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.uploaderName]) acc[item.uploaderName] = [];
    acc[item.uploaderName].push(item);
    return acc;
  }, {});

  gallery.innerHTML = Object.entries(grouped)
    .map(([name, uploads]) => `
      <div class="uploader-group">
        <h3>${name}</h3>
        <div class="gallery">
          ${uploads.map(u => 
            u.type === "image"
              ? `<img src="${u.url}" alt="Upload" data-lightbox>`
              : `<video src="${u.url}" controls></video>`
          ).join('')}
        </div>
      </div>
    `).join('');

  initLightbox(); // initialize lightbox for new images
}

// ===== LIVE LISTENER =====
const q = query(uploadsCol, orderBy("ts", "desc"));
onSnapshot(q, (snapshot) => {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const approvedItems = items.filter(i => i.approved);
  renderGallery(approvedItems);
});

// ===== LIGHTBOX =====
function initLightbox() {
  const lightbox = document.getElementById("lightbox") || createLightbox();
  document.querySelectorAll('img[data-lightbox]').forEach(img => {
    img.onclick = () => {
      lightbox.innerHTML = `<img src="${img.src}">`;
      lightbox.classList.add("open");
    };
  });
}

function createLightbox() {
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.className = "lightbox";
  lb.onclick = () => lb.classList.remove("open");
  document.body.appendChild(lb);
  return lb;
}

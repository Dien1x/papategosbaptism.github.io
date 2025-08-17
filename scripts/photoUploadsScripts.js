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
const galleryContent = document.getElementById("galleryContent");

// ===== DYNAMIC FORMS =====
function renderUploadForm() {
  galleryContent.innerHTML = `
    <h2>Ανεβάστε τις Φωτογραφίες/Βίντεο σας ✨</h2>
    <form id="uploadForm">
      <input id="uploaderName" type="text" placeholder="Your Name" required />
      <input id="fileInput" type="file" accept="image/*,video/*" multiple required />
      <button type="submit">Upload</button>
    </form>
  `;
  const uploadForm = document.getElementById("uploadForm");
  uploadForm.addEventListener("submit", handleUpload);
}

function renderGalleryContainer() {
  galleryContent.innerHTML = `
    <h2>Βιβλιοθήκη Εικόνων</h2>
    <div id="gallery" class="grid"></div>
  `;
}

// ===== UPLOAD HANDLER =====
async function handleUpload(e) {
  e.preventDefault();
  const rawName = document.getElementById("uploaderName").value;
  const files = document.getElementById("fileInput").files;
  if (!files.length) return;

  const prettyName = normalizeName(rawName);
  const uploadsCol = collection(db, "uploads");

  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UNSIGNED_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    const url = data.secure_url;

    await addDoc(uploadsCol, {
      uploaderName: prettyName,
      url,
      type: file.type.startsWith("video") ? "video" : "image",
      ts: Date.now(),
      approved: !REQUIRE_APPROVAL
    });
  }

  e.target.reset();
  if (REQUIRE_APPROVAL) alert("Uploaded! Waiting for approval.");
}

// ===== GALLERY RENDER =====
function renderGallery(items) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = items
    .map(
      (item) => `
      <div class="card">
        <strong>${item.uploaderName}</strong>
        ${
          item.type === "image"
            ? `<img src="${item.url}" alt="Upload">`
            : `<video src="${item.url}" controls></video>`
        }
      </div>
    `
    )
    .join("");
}

// ===== LIVE LISTENER (Only Approved) =====
function setupLiveGallery() {
  const uploadsCol = collection(db, "uploads");
  const q = query(uploadsCol, orderBy("ts", "desc"));
  onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const approvedItems = items.filter(i => i.approved);
    renderGallery(approvedItems);
  });
}

// ===== INITIAL SETUP =====
document.getElementById('uploadButton').addEventListener('click', renderUploadForm);
document.getElementById('watchGallery').addEventListener('click', () => {
  renderGalleryContainer();
  setupLiveGallery();
});

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

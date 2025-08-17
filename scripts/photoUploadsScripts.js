// ===== CONFIG =====
const REQUIRE_APPROVAL = true; // set to false to auto-approve uploads

/* Gallery upload and rendering script */

 // ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

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
const uploadsCol = collection(db, "uploads");

// ===== UPLOAD HANDLER =====
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rawName = document.getElementById("uploaderName").value;
  const files = document.getElementById("fileInput").files;
  if (!files.length) return;

  const prettyName = normalizeName(rawName);

  for (let file of files) {
    const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

await addDoc(uploadsCol, {
  uploaderName: prettyName,
  url,
  type: file.type.startsWith("video") ? "video" : "image",
  ts: Date.now(),
  approved: !REQUIRE_APPROVAL // if no approval needed, mark true
});
  }

  uploadForm.reset();
  if (REQUIRE_APPROVAL) alert("Uploaded! Waiting for approval.");
});

// ===== GALLERY RENDER =====
function renderGallery(items) {
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
const q = query(uploadsCol, orderBy("ts", "desc"));
onSnapshot(q, (snapshot) => {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const approvedItems = items.filter(i => i.approved);
  renderGallery(approvedItems);
});

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

document.getElementById('uploadButton').addEventListener('click', function() {
    const content = document.getElementById('galleryContent');
    content.innerHTML = `
  <h2>Ανεβάστε τις Φωτογραφίες σας ✨</h2>

  <form id="uploadForm">
    <input id="uploaderName" type="text" placeholder="Your Name" required />
    <input id="fileInput" type="file" accept="image/*,video/*" multiple required />
    <button type="submit">Upload</button>
  </form>
    `;
    content.className = 'upload-content';
});

document.getElementById('watchGallery').addEventListener('click', function() {
    const content = document.getElementById('galleryContent');
    content.innerHTML = `
  <h2>Βιβλιοθήκη Εικόνων</h2>
  <div id="gallery" class="grid"></div>
    `;
    content.className = 'gallery-content';
});

const buttons = document.querySelectorAll('.menu-buttons .btn');
buttons.forEach(btn => {
  btn.addEventListener('click', function() {
    buttons.forEach(b => b.classList.remove('active')); // Remove from all
    this.classList.add('active'); // Add to clicked
  });
});
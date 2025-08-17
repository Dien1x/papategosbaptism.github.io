// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
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

const mediaGrid = document.getElementById("mediaGrid");
const filterSelect = document.getElementById("filterSelect");

let allItems = []; // keep snapshot data

// ===== LIVE LISTENER =====
function setupAdminGallery() {
  const uploadsCol = collection(db, "uploads");
  const q = query(uploadsCol, orderBy("ts", "desc"));
  onSnapshot(q, snapshot => {
    allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    applyFilter();
  });
}

// ===== APPLY FILTER =====
function applyFilter() {
  const filter = filterSelect.value;
  let filtered = allItems;

  if (filter === "pending") {
    filtered = allItems.filter(item => !item.approved);
  } else if (filter === "approved") {
    filtered = allItems.filter(item => item.approved);
  }

  renderAdminGallery(filtered);
}

// ===== RENDER =====
function renderAdminGallery(items) {
  mediaGrid.innerHTML = items.map(item => `
    <div class="media-card" data-id="${item.id}">
      <strong>${item.uploaderName}</strong>
      ${item.type === "image"
        ? `<img src="${item.url}" alt="upload">`
        : `<video src="${item.url}" controls></video>`
      }
      <div class="actions">
        <button class="btn ${item.approved ? "unapprove" : "approve"}">
          ${item.approved ? "Unapprove ❌" : "Approve ✅"}
        </button>
        <a href="${item.url}" download class="btn download">Download</a>
      </div>
    </div>
  `).join("");

  // Attach listeners
  document.querySelectorAll(".approve").forEach(btn =>
    btn.addEventListener("click", () => toggleApproval(btn, true))
  );
  document.querySelectorAll(".unapprove").forEach(btn =>
    btn.addEventListener("click", () => toggleApproval(btn, false))
  );
}

// ===== TOGGLE APPROVAL =====
async function toggleApproval(btn, approve) {
  const card = btn.closest(".media-card");
  const id = card.dataset.id;

  const ref = doc(db, "uploads", id);
  await updateDoc(ref, { approved: approve });

  // UI will auto-refresh thanks to onSnapshot
  // No need to manually move items
}

// ===== INIT =====
filterSelect.addEventListener("change", applyFilter);
setupAdminGallery();

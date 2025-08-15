// ====== GUESTBOOK (localStorage) ======

// Import from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYoXsUdZ5Y1Oavwc0hg_kT6_23yFAu7VE",
  authDomain: "mywishpriject.firebaseapp.com",
  projectId: "mywishpriject",
  storageBucket: "mywishpriject.firebasestorage.app",
  messagingSenderId: "14036030221",
  appId: "1:14036030221:web:e9f104aca9f1e8df071644",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const wishForm = document.getElementById("wishForm");
const wishList = document.getElementById("wishList");
const wishesCol = collection(db, "wishes");

function renderWishes(wishes) {
  wishList.innerHTML =
    wishes
      .map(
        (w) => `
          <div class="card pad">
            <strong>${w.name}</strong>
            <div class="muted">${
              w.ts?.seconds
                ? new Date(w.ts.seconds * 1000).toLocaleDateString()
                : ""
            }</div>
            <div style="margin-top:6px;">${w.text}</div>
          </div>
        `
      )
      .join("") ||
    '<p class="muted">Δεν υπάρχουν ευχές ακόμη. Γίνετε ο πρώτος! ✨</p>';
}

const q = query(wishesCol, orderBy("ts", "desc"));
onSnapshot(q, (snapshot) => {
  const wishes = snapshot.docs.map((doc) => doc.data());
  renderWishes(wishes);
});

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const row = {
    name: document.getElementById("wName").value.trim(),
    text: document.getElementById("wText").value.trim(),
    ts: serverTimestamp(),
  };
  if (!row.name || !row.text) return;
  await addDoc(wishesCol, row);
  wishForm.reset();
});

// ====== DOWNLOAD WISHES AS JSON ======

document.getElementById("download-wishes").addEventListener("click", async () => {
    const snapshot = await getDocs(q);
    const wishes = snapshot.docs.map(doc => doc.data());
    
    let text = "Name\tDate\tWish\n";
    wishes.forEach(w => {
        text += `${w.name}\t${w.ts?.toDate().toLocaleDateString()}\t${w.text}\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wishes.txt"; // could be .csv too
    a.click();

    URL.revokeObjectURL(url);

});

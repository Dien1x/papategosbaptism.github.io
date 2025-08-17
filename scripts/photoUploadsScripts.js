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
  orderBy,
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
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ===== ELEMENTS =====
const galleryContent = document.getElementById("galleryContent");

// ===== DYNAMIC FORMS =====
function renderUploadForm() {
  galleryContent.innerHTML = `
    <h2>Ανεβάστε τις Φωτογραφίες/Βίντεο σας ✨</h2>
    <form id="uploadForm">
      <input id="uploaderName" type="text" placeholder="Όνομα Αποστολέα" required />
      <input id="fileInput" type="file" accept="image/*,video/*" multiple required />
      <button class="btn" type="submit">Upload</button>
    </form>
  `;
  document
    .getElementById("uploadForm")
    .addEventListener("submit", handleUpload);
}

function renderGalleryContainer() {
  galleryContent.innerHTML = `
    <div id="gallery"></div>
  `;
}

// ===== UPLOAD HANDLER =====
async function handleUpload(e) {
  e.preventDefault();

  const uploadBtn = e.target.querySelector("button[type='submit']");
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  const rawName = document.getElementById("uploaderName").value;
  const files = document.getElementById("fileInput").files;
  if (!files.length) {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
    return;
  }

  const prettyName = normalizeName(rawName);
  const uploadsCol = collection(db, "uploads");

  // Clear any old progress bars
  const oldBars = document.querySelectorAll(".upload-progress");
  oldBars.forEach(b => b.remove());

  try {
    for (let file of files) {
      // Create progress bar
      const progressContainer = document.createElement("div");
      progressContainer.className = "upload-progress";
      progressContainer.innerHTML = `
        <span>${file.name}</span>
        <progress value="0" max="100"></progress>
      `;
      galleryContent.appendChild(progressContainer);
      const progressBar = progressContainer.querySelector("progress");

      // Use XMLHttpRequest to track progress
      await new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UNSIGNED_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            progressBar.value = percent;
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const url = data.secure_url;
            await addDoc(uploadsCol, {
              uploaderName: prettyName,
              url,
              type: file.type.startsWith("video") ? "video" : "image",
              ts: Date.now(),
              approved: !REQUIRE_APPROVAL
            });
            resolve();
          } else {
            reject(`Upload failed: ${xhr.statusText}`);
          }
        };

        xhr.onerror = () => reject("Upload failed due to network error");
        xhr.send(formData);
      });
    }

    e.target.reset();

    // Upload complete message
    const msg = document.createElement("div");
    msg.textContent = "All uploads complete! 🎉";
    msg.style.color = "green";
    galleryContent.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);

  } catch (err) {
    alert(err);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
  }
}


// ===== GALLERY RENDER =====
function renderGallery(items) {
  const gallery = document.getElementById("gallery");

  // Group by uploader name
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.uploaderName]) acc[item.uploaderName] = [];
    acc[item.uploaderName].push(item);
    return acc;
  }, {});

  gallery.innerHTML = Object.entries(grouped)
    .map(
      ([name, uploads]) => `
      <div class="uploader-group">
        <h3>${name}</h3>
        <div class="gallery">
          ${uploads
            .map((u) =>
              u.type === "image"
                ? `<img src="${u.url}" alt="Upload" data-lightbox>`
                : `<video src="${u.url}" controls data-lightbox></video>`
            )
            .join("")}
        </div>
      </div>
    `
    )
    .join("");

  initLightbox();
}

// ===== LIVE LISTENER =====
function setupLiveGallery() {
  const uploadsCol = collection(db, "uploads");
  const q = query(uploadsCol, orderBy("ts", "desc"));
  onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const approvedItems = items.filter((i) => i.approved);
    renderGallery(approvedItems);
  });
}

// ===== LIGHTBOX =====
function initLightbox() {
  let lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className = "lightbox";
    lightbox.onclick = () => {
      const video = lightbox.querySelector("video");
      if (video) video.pause();
      lightbox.classList.remove("open");
    };
    document.body.appendChild(lightbox);
  }

  // Images
  document.querySelectorAll("img[data-lightbox]").forEach((img) => {
    img.onclick = () => {
      lightbox.innerHTML = `<img src="${img.src}">`;
      lightbox.classList.add("open");
    };
  });

  // Videos
  document.querySelectorAll("video[data-lightbox]").forEach((videoEl) => {
    videoEl.onclick = (e) => {
      e.stopPropagation();

      if (window.innerWidth <= 420) {
        // small screens, play/pause inline
        if (videoEl.paused) videoEl.play();
        else videoEl.pause();
        return;
      }

      lightbox.innerHTML = `<video src="${videoEl.src}" controls autoplay></video>`;
      lightbox.classList.add("open");

      const videoInLightbox = lightbox.querySelector("video");
      videoInLightbox.onclick = (ev) => {
        ev.stopPropagation();
        if (videoInLightbox.paused) videoInLightbox.play();
        else videoInLightbox.pause();
      };
    };
  });
}

// ===== INITIAL SETUP =====
document
  .getElementById("uploadButton")
  .addEventListener("click", renderUploadForm);
document.getElementById("watchGallery").addEventListener("click", (e) => {
  renderGalleryContainer();
  setupLiveGallery();
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

/* Active button styles */
const buttons = document.querySelectorAll('#uploadButton, #watchGallery');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove 'active' from all buttons
    buttons.forEach(b => b.classList.remove('active'));
    // Add 'active' to the clicked button
    btn.classList.add('active');
  });
});
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
        <div class="upload-section">
            <h2>Ανεβάστε τις φωτογραφίες σας</h2>
            <input type="file" multiple>
            <!-- Add more upload UI here -->
        </div>
    `;
    content.className = 'upload-content';
});

document.getElementById('watchGallery').addEventListener('click', function() {
    const content = document.getElementById('galleryContent');
    content.innerHTML = `
        <div class="gallery-section">
            <h2>Βιβλιοθήκη Φωτογραφιών</h2>
            <!-- Add gallery UI here -->
        </div>
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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Map usernames to fake emails
const adminUsers = {
  "dienix": "admin1.fake@example.com",
  "admin2": "admin2.fake@example.com"
};

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
const auth = getAuth(app);

const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// Login function
async function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    errorMsg.textContent = "Please enter username and password";
    return;
  }

  const email = adminUsers[username.toLowerCase()];
  if (!email) {
    errorMsg.textContent = "Username not found";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem("adminUser", username);
    window.location.href = "admin.html";
  } catch (err) {
    errorMsg.textContent = "Invalid username or password";
  }
}

// Attach click event
loginBtn.addEventListener("click", login);

// Trigger login on Enter key for both fields
function triggerLoginOnEnter(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    loginBtn.click();
  }
}
usernameInput.addEventListener("keydown", triggerLoginOnEnter);
passwordInput.addEventListener("keydown", triggerLoginOnEnter);
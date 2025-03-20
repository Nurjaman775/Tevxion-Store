// Mock user database
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "kasir", password: "kasir123", role: "cashier" },
  { username: "user", password: "user123", role: "customer" },
];

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Get users from localStorage (including registered users)
  const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const defaultUsers = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "kasir", password: "kasir123", role: "cashier" },
    { username: "user", password: "user123", role: "customer" },
  ];

  const allUsers = [...defaultUsers, ...savedUsers];
  const user = allUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Store user session
    sessionStorage.setItem(
      "currentUser",
      JSON.stringify({
        username: user.username,
        role: user.role,
      })
    );

    // Redirect based on role
    switch (user.role) {
      case "admin":
        window.location.href = "../dashboard/admin.html";
        break;
      case "cashier":
        window.location.href = "../dashboard/cashier.html";
        break;
      case "customer":
        window.location.href = "../toko-belanja/index.html";
        break;
    }
  } else {
    alert("Username atau password salah!");
  }
  return false;
}

// Firebase configuration - use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Google Sign-In
function initGoogleSignIn() {
  const googleSignInBtn = document.getElementById("googleSignIn");
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);

        // Create user object
        const user = {
          username: result.user.email,
          fullName: result.user.displayName,
          email: result.user.email,
          role: "customer",
          googleId: result.user.uid,
        };

        // Store in localStorage
        const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
        if (!existingUsers.some((u) => u.email === user.email)) {
          existingUsers.push(user);
          localStorage.setItem("users", JSON.stringify(existingUsers));
        }

        // Set session
        sessionStorage.setItem("currentUser", JSON.stringify(user));

        // Redirect
        window.location.href = "../toko-belanja/index.html";
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert("Login gagal: " + error.message);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }
  initGoogleSignIn();
});

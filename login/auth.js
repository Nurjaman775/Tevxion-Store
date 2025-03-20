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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUxLj5zaO2nQFyumOqPyjQr7U0IgbZg3U",
  authDomain: "tevxion-store.firebaseapp.com",
  projectId: "tevxion-store",
  storageBucket: "tevxion-store.firebasestorage.app",
  messagingSenderId: "808872571173",
  appId: "1:808872571173:web:555bb550726af3f5eceacc",
  measurementId: "G-5191P7DRST",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Google Sign-In
function initGoogleSignIn() {
  const googleSignInBtn = document.getElementById("googleSignIn");
  googleSignInBtn.addEventListener("click", handleGoogleSignIn);
}

// Handle Google Sign-In
async function handleGoogleSignIn() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    const user = {
      username: result.user.email,
      fullName: result.user.displayName,
      email: result.user.email,
      role: "customer",
      googleId: result.user.uid,
    };

    // Store user in local storage
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    if (!existingUsers.some((u) => u.email === user.email)) {
      existingUsers.push(user);
      localStorage.setItem("users", JSON.stringify(existingUsers));
    }

    // Set session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Redirect to products page
    window.location.href = "../toko-belanja/index.html";
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    alert("Failed to sign in with Google. Please try again.");
  }
}

// Initialize when document is loaded
document.addEventListener("DOMContentLoaded", initGoogleSignIn);

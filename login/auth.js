import config from "./config.js";

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

// Initialize Google Sign-In
function initGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: config.google.clientId,
    callback: handleGoogleSignIn,
    auto_select: false,
    ux_mode: "popup",
    context: "signin",
    error_callback: (error) => {
      console.error("Google Sign-In Error:", error);
      alert("Failed to initialize Google Sign-In. Please try again.");
    },
  });

  google.accounts.id.renderButton(document.getElementById("googleSignIn"), {
    theme: "outline",
    size: "large",
  });
}

// Handle Google Sign-In
async function handleGoogleSignIn(response) {
  try {
    // Verify Google token and get user info
    const { credential } = response;

    // Create user object from Google data
    const user = {
      username: response.email,
      fullName: response.name,
      email: response.email,
      role: "customer",
      googleId: response.sub,
    };

    // Store user in local storage
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    if (!existingUsers.some((u) => u.email === user.email)) {
      existingUsers.push(user);
      localStorage.setItem("users", JSON.stringify(existingUsers));
    }

    // Set session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Redirect based on return URL or to products page
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl");
      window.location.href = returnUrl;
    } else {
      window.location.href = "/toko-belanja/index.html";
    }
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    alert("Failed to sign in with Google. Please try again.");
  }
}

// Add Google Sign-In script
document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = initGoogleSignIn;
  document.head.appendChild(script);
});

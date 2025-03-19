function checkAuth() {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "/login/login.html";
    return;
  }

  // Verify correct dashboard access
  const currentPath = window.location.pathname;
  if (
    (user.role === "admin" && !currentPath.includes("admin.html")) ||
    (user.role === "cashier" && !currentPath.includes("cashier.html"))
  ) {
    window.location.href = "/login/login.html";
  }
}

function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "/login/login.html";
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", checkAuth);

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

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../login/login.html";
    return;
  }

  // Redirect if wrong role
  const page = window.location.pathname;
  if (page.includes("admin.html") && currentUser.role !== "admin") {
    window.location.href = "../login/login.html";
  } else if (page.includes("cashier.html") && currentUser.role !== "cashier") {
    window.location.href = "../login/login.html";
  }
});

function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "../login/login.html";
}

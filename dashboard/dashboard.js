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

function attachButtonListeners() {
  // Logout button
  document.querySelectorAll('[onclick="logout()"]').forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        logout();
      }
    };
  });

  // Navigation buttons
  document.querySelectorAll(".sidebar a").forEach((link) => {
    if (!link.hasAttribute("onclick")) {
      link.onclick = (e) => {
        const href = link.getAttribute("href");
        if (href === "#") {
          e.preventDefault();
          alert("Feature coming soon!");
        }
      };
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  attachButtonListeners();
});

document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
});

function checkAuthStatus() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const navLinks = document.querySelector(".nav-links");
  const loginRegisterBtns = document.querySelectorAll(
    ".btn-login, .btn-register"
  );
  const userProfileBtn = document.getElementById("userProfileBtn");

  if (currentUser) {
    // User is logged in
    loginRegisterBtns.forEach((btn) => (btn.style.display = "none"));

    // Create profile button
    const profileLink = document.createElement("li");
    profileLink.innerHTML = `
            <div class="user-profile">
                <span class="username">${currentUser.username}</span>
                <div class="profile-dropdown">
                    <a href="../dashboard/profile.html">My Profile</a>
                    <a href="../toko-belanja/index.html">My Cart</a>
                    <a href="#" onclick="handleLogout()">Logout</a>
                </div>
            </div>
        `;
    navLinks.appendChild(profileLink);
  }
}

function handleLogout() {
  sessionStorage.removeItem("currentUser");
  window.location.reload();
}

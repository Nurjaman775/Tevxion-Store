function loadProfile() {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "../login/login.html";
    return;
  }

  const profileData =
    JSON.parse(localStorage.getItem("users")).find(
      (u) => u.username === user.username
    ) || user;

  // Set profile info
  document.querySelector(".profile-avatar").textContent =
    user.username[0].toUpperCase();
  document.getElementById("fullName").textContent =
    profileData.fullName || user.username;
  document.getElementById("username").textContent = user.username;
  document.getElementById("role").textContent = user.role;
  document.getElementById("email").textContent = profileData.email || "Not set";
  document.getElementById("whatsapp").textContent =
    profileData.whatsapp || "Not set";
}

function updateProfile(event) {
  event.preventDefault();
  // Profile update logic here
  // ...
}

document.addEventListener("DOMContentLoaded", loadProfile);

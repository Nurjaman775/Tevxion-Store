function validateName(name) {
  // Empty check
  if (!name.trim()) return "Nama tidak boleh kosong";

  // Only letters and spaces
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return "Nama hanya boleh mengandung huruf (a-z) dan spasi";
  }

  // Proper case validation (each word must start with capital letter)
  const words = name.split(" ");
  const properCase = words.every(
    (word) =>
      word.length > 0 &&
      word[0] === word[0].toUpperCase() &&
      word.slice(1) === word.slice(1).toLowerCase()
  );

  if (!properCase) {
    return "Gunakan format Proper Case (contoh: John Doe)";
  }

  return "";
}

function validateUsername(username) {
  if (!username.trim()) return "Username tidak boleh kosong";

  const usernameRegex = /^[a-z0-9]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return "Username hanya boleh mengandung huruf kecil dan angka (3-20 karakter)";
  }
  return "";
}

function validatePassword(password) {
  if (!password) return "Password tidak boleh kosong";
  if (password.length < 6 || password.length > 20) {
    return "Password harus antara 6-20 karakter";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!passwordRegex.test(password)) {
    return "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka";
  }

  return "";
}

function validateWhatsApp(whatsapp) {
  if (!whatsapp.trim()) return "Nomor WhatsApp tidak boleh kosong";

  const whatsappRegex = /^628[0-9]{8,11}$/;
  if (!whatsappRegex.test(whatsapp)) {
    return "Nomor WhatsApp harus diawali 628 dan berisi 11-14 digit angka";
  }
  return "";
}

function validateConfirmPassword(confirmPassword) {
  const password = document.getElementById("password").value;
  if (confirmPassword.trim() === "") return "";

  if (confirmPassword !== password) {
    return "Password tidak cocok!";
  }
  return "";
}

// Tampilkan error pada masing-masing input
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorDiv =
    input.parentElement.querySelector(".error-message") ||
    document.createElement("div");

  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  if (!input.parentElement.querySelector(".error-message")) {
    input.parentElement.appendChild(errorDiv);
  }

  input.style.borderColor = message ? "#ff2770" : "#45f3ff";
  errorDiv.style.display = message ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", function () {
  // Objek input beserta fungsi validasinya
  const inputs = {
    fullName: { validate: validateName },
    username: { validate: validateUsername },
    whatsapp: { validate: validateWhatsApp },
    password: { validate: validatePassword },
    confirm_password: { validate: validateConfirmPassword },
  };

  // Menambahkan event listener untuk validasi real-time
  for (const [id, { validate }] of Object.entries(inputs)) {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", function () {
        const error = validate(this.value);
        showError(id, error);
      });
    }
  }
});

function handleRegister(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const username = document.getElementById("username").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  // Validasi saat submit
  const nameError = validateName(fullName);
  if (nameError) {
    showError("fullName", nameError);
    return false;
  }

  const usernameError = validateUsername(username);
  if (usernameError) {
    showError("username", usernameError);
    return false;
  }

  const whatsappError = validateWhatsApp(whatsapp);
  if (whatsappError) {
    showError("whatsapp", whatsappError);
    return false;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    showError("password", passwordError);
    return false;
  }

  const confirmPasswordError = validateConfirmPassword(confirmPassword);
  if (confirmPasswordError) {
    showError("confirm_password", confirmPasswordError);
    return false;
  }

  // Cek apakah username sudah digunakan
  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
  if (existingUsers.some((user) => user.username === username)) {
    showError("username", "Username sudah digunakan!");
    return false;
  }

  // Simpan user baru dan alihkan ke halaman login
  const newUser = {
    fullName,
    username,
    whatsapp,
    password,
    role: "customer",
  };

  existingUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(existingUsers));
  alert("Registrasi berhasil! Silakan login untuk melanjutkan.");
  window.location.href = "../login/login.html";
  return false;
}

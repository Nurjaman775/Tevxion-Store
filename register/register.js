function validateName(name) {
  // Check if name contains only letters and spaces
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return "Name can only contain letters and spaces";
  }

  // Check proper case (each word should start with capital letter)
  const words = name.split(" ");
  const properCase = words.every(
    (word) =>
      word.length > 0 &&
      word[0] === word[0].toUpperCase() &&
      word.slice(1) === word.slice(1).toLowerCase()
  );

  if (!properCase) {
    return "Name must be in proper case (e.g., John Doe)";
  }

  return "";
}

function validateUsername(username) {
  const usernameRegex = /^[a-z0-9]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return "Username must be 3-20 characters long and contain only lowercase letters and numbers";
  }
  return "";
}

function validatePassword(password) {
  if (password.length < 6 || password.length > 20) {
    return "Password must be 6-20 characters long";
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  return "";
}

function validateWhatsApp(whatsapp) {
  const whatsappRegex = /^628[0-9]{9,12}$/;
  if (!whatsappRegex.test(whatsapp)) {
    return "WhatsApp number must start with 628 and be 11-14 digits long";
  }
  return "";
}

function handleRegister(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const username = document.getElementById("username").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  // Validate each field
  const nameError = validateName(fullName);
  if (nameError) {
    alert(nameError);
    return false;
  }

  const usernameError = validateUsername(username);
  if (usernameError) {
    alert(usernameError);
    return false;
  }

  const whatsappError = validateWhatsApp(whatsapp);
  if (whatsappError) {
    alert(whatsappError);
    return false;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    alert(passwordError);
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return false;
  }

  // If all validations pass, create new user
  const newUser = {
    fullName,
    username,
    whatsapp,
    password,
    role: "customer",
  };

  // Get existing users or initialize empty array
  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

  // Check if username already exists
  if (existingUsers.some((user) => user.username === username)) {
    alert("Username already exists!");
    return false;
  }

  existingUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(existingUsers));

  alert("Registration successful! Please login to continue.");
  window.location.href = "/login/login.html";
  return false;
}

// Add real-time validation feedback
document.addEventListener("DOMContentLoaded", function () {
  const inputs = {
    fullName: document.getElementById("fullName"),
    username: document.getElementById("username"),
    whatsapp: document.getElementById("whatsapp"),
    password: document.getElementById("password"),
  };

  const validationFunctions = {
    fullName: validateName,
    username: validateUsername,
    whatsapp: validateWhatsApp,
    password: validatePassword,
  };

  for (const [field, input] of Object.entries(inputs)) {
    input.addEventListener("input", function () {
      const error = validationFunctions[field](this.value);
      this.style.borderColor = error ? "#ff2770" : "#45f3ff";

      // Remove previous error message if exists
      const existingError = this.parentElement.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      // Add new error message if validation fails
      if (error) {
        const errorElement = document.createElement("span");
        errorElement.className = "error-message";
        errorElement.textContent = error;
        errorElement.style.color = "#ff2770";
        errorElement.style.fontSize = "0.75em";
        this.parentElement.appendChild(errorElement);
      }
    });
  }
});

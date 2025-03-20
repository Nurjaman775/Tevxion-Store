class AuthManager {
  static getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("currentUser"));
  }

  static setCurrentUser(user) {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
  }

  static logout() {
    sessionStorage.removeItem("currentUser");
    window.location.href = "/login/login.html";
  }

  static isLoggedIn() {
    return !!this.getCurrentUser();
  }

  static checkAuthAndRedirect() {
    if (!this.isLoggedIn()) {
      sessionStorage.setItem("returnUrl", window.location.href);
      window.location.href = "/login/login.html";
      return false;
    }
    return true;
  }
}

class CartManager {
  static saveToLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getFromLocal() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  static clearCart() {
    localStorage.removeItem("cart");
  }
}

// Error handling utility
function handleError(error, fallbackMessage = "An error occurred") {
  console.error(error);
  return {
    success: false,
    message: error.message || fallbackMessage,
  };
}

// Form validation utility
function validateForm(form, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = form[field]?.value;
    if (rule.required && !value) {
      errors[field] = `${field} is required`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  }
  return errors;
}

// API request utility
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

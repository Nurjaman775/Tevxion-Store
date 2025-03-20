class ShopManager {
  constructor() {
    this.products = [];
    this.cart = [];
    this.currentPage = 1;
    this.ITEMS_PER_PAGE = 10;
    this.isCartOpen = false;  // Add this

    this.initializeElements();
    this.loadCart();
    this.attachEventListeners();
    this.fetchProducts();
  }

  async fetchProducts() {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      this.products = data.map((item) => ({
        id: item.id,
        name: item.title,
        price: Math.round(item.price * 15000),
        category: item.category,
        material: this.getRandomMaterial(), // Add material
        date: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30
        ).toISOString(), // Random date within last 30 days
        image: item.image,
        description: item.description,
        stock: 5,
      }));

      this.filteredProducts = [...this.products];
      this.displayProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
      this.productsContainer.innerHTML =
        '<p class="error">Gagal memuat produk</p>';
    }
  }

  getRandomMaterial() {
    const materials = [
      "Plastic",
      "Metal",
      "Glass",
      "Carbon Fiber",
      "Aluminum",
      "Stainless Steel",
    ];
    return materials[Math.floor(Math.random() * materials.length)];
  }

  initializeElements() {
    // Initialize DOM elements
    this.productsContainer = document.querySelector(".products-container");
    this.cartCount = document.querySelector(".cart-count");
    this.cartTotal = document.querySelector(".cart-sticky .cart-total");
    this.searchInput = document.getElementById("searchInput");
    this.sortSelect = document.getElementById("sortBy");
    this.categorySelect = document.getElementById("filterCategory");
    this.cartSticky = document.querySelector(".cart-sticky");
    this.cartIcon = this.cartSticky.querySelector(".cart-icon");
    this.loadCartFromCookies(); // Add this line
    this.materialSelect = document.getElementById("materialSelect");
    this.dateSelect = document.getElementById("dateSelect");
  }

  filterProducts() {
    let filtered = [...this.products];
    const searchTerm = this.searchInput?.value.toLowerCase() || "";
    const sortBy = this.sortSelect?.value || "";
    const category = this.categorySelect?.value || "";
    const material = this.materialSelect?.value || "";
    const dateRange = this.dateSelect?.value || "";

    // Keyword search
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.material.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    // Material filter
    if (material) {
      filtered = filtered.filter((product) => product.material === material);
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((product) => new Date(product.date) >= cutoff);
    }

    // Sorting
    switch (sortBy) {
      case "priceAsc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "dateDesc":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "dateAsc":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.displayProducts();
    this.updateFilterStats();
  }

  updateFilterStats() {
    const stats = document.getElementById("filterStats");
    if (stats) {
      const total = this.products.length;
      const filtered = this.filteredProducts.length;
      stats.textContent = `Menampilkan ${filtered} dari ${total} produk`;
      stats.style.display = filtered < total ? "block" : "none";
    }
  }

  updatePriceLabel() {
    this.priceValue.textContent = `Rp ${this.priceRange.value.toLocaleString()}`;
  }

  attachEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.filterProducts());
    }
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", () => this.filterProducts());
    }
    if (this.categorySelect) {
      this.categorySelect.addEventListener("change", () =>
        this.filterProducts()
      );
    }
    if (this.materialSelect) {
      this.materialSelect.addEventListener("change", () =>
        this.filterProducts()
      );
    }
    if (this.dateSelect) {
      this.dateSelect.addEventListener("change", () => this.filterProducts());
    }

    if (this.cartSticky) {
      this.cartSticky.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleCart();
      });

      // Close cart when clicking outside
      document.addEventListener("click", (e) => {
        if (this.isCartOpen && !e.target.closest(".cart-dropdown")) {
          this.closeCart();
        }
      });
    }

    // Improve button feedback
    document.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        if (this.disabled) {
          e.preventDefault();
          return;
        }

        // Add visual feedback
        this.classList.add("clicked");
        setTimeout(() => this.classList.remove("clicked"), 200);

        // Prevent double clicks
        if (!this.classList.contains("quantity-btn")) {
          this.disabled = true;
          setTimeout(() => (this.disabled = false), 500);
        }
      });
    });
  }

  displayProducts() {
    const start = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const paginatedProducts = this.filteredProducts.slice(
      start,
      start + this.ITEMS_PER_PAGE
    );

    this.productsContainer.innerHTML = `
      ${this.renderProducts(paginatedProducts)}
      ${this.renderPagination()}
    `;

    this.attachProductListeners();
  }

  checkAuth() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!user) {
      // Store current URL to redirect back after login
      sessionStorage.setItem("returnUrl", window.location.href);
      return false;
    }
    return true;
  }

  handleCheckout() {
    if (!this.checkAuth()) {
      // Save cart to cookies before redirecting to login
      this.saveCartToCookies();
      alert("Silakan login terlebih dahulu untuk melakukan checkout");
      window.location.href = "../login/login.html";
      return;
    }

    // Update product stock
    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    this.showReceipt();
  }

  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);

    // Check if product exists and has stock
    if (!product) return;
    if (product.stock === 0) {
      this.showCartNotification("Produk tidak tersedia");
      return;
    }

    const existingItem = this.cart.find((item) => item.id === productId);

    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity >= product.stock) {
        this.showCartNotification("Stok produk tidak mencukupi");
        return;
      }
      existingItem.quantity++;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock,
      });
    }

    this.saveCartToSession();
    this.saveCartToCookies();
    this.updateCartDisplay();
    this.displayProducts(); // Refresh to update buttons
    this.showCartNotification("Produk ditambahkan ke keranjang");
  }

  removeFromCart(productId) {
    const itemIndex = this.cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      if (this.cart[itemIndex].quantity > 1) {
        this.cart[itemIndex].quantity--;
      } else {
        this.cart.splice(itemIndex, 1);
      }

      this.saveCartToSession();
      this.saveCartToCookies();
      this.updateCartDisplay();
      this.displayProducts(); // Refresh to update buttons
      this.showCartNotification("Produk dihapus dari keranjang");
    }
  }

  saveCartToSession() {
    sessionStorage.setItem("cart", JSON.stringify(this.cart));
  }

  loadCart() {
    this.cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    this.updateCartDisplay();
  }

  saveCartToCookies() {
    const cartData = JSON.stringify({
      items: this.cart,
      total: this.calculateTotal(),
      lastUpdated: new Date().toISOString(),
    });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Cookie expires in 7 days

    document.cookie = `tevxionCart=${encodeURIComponent(
      cartData
    )};expires=${expiryDate.toUTCString()};path=/;SameSite=Strict`;
  }

  loadCartFromCookies() {
    try {
      const cookieValue = this.getCookie("tevxionCart");
      if (cookieValue) {
        const cartData = JSON.parse(decodeURIComponent(cookieValue));
        this.cart = cartData.items || [];
        this.updateCartDisplay();
      }
    } catch (error) {
      console.error("Error loading cart from cookies:", error);
      this.cart = [];
    }
  }

  clearCartCookies() {
    document.cookie =
      "tevxionCart=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }

  getCookie(name) {
    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split("=")[1] : null;
  }

  calculateTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  renderProducts(products) {
    if (products.length === 0) {
      return '<p class="error">Tidak ada produk yang ditemukan</p>';
    }

    return products
      .map((product) => {
        const cartItem = this.cart.find((item) => item.id === product.id);
        const isInCart = Boolean(cartItem);
        const isOutOfStock = product.stock === 0;

        return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <h3>${product.name}</h3>
          <p class="price">Rp ${product.price.toLocaleString()}</p>
          <div class="product-details">
            <p class="material">Material: ${product.material}</p>
            <p class="date">Added: ${new Date(product.date).toLocaleDateString(
              "id-ID"
            )}</p>
          </div>
          <p class="stock ${isOutOfStock ? "out-of-stock" : ""}">
            Stok: ${product.stock}
          </p>
          <div class="button-group">
            ${
              isOutOfStock
                ? `
              <button class="cart-btn disabled" disabled>
                <i class="fas fa-cart-plus"></i> Stok Habis
              </button>
            `
                : isInCart
                ? `
              <div class="cart-controls" data-id="${product.id}">
                <button class="cart-btn quantity-btn minus-btn" data-id="${
                  product.id
                }">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${cartItem.quantity}</span>
                <button class="cart-btn quantity-btn plus-btn" data-id="${
                  product.id
                }" 
                  ${cartItem.quantity >= product.stock ? "disabled" : ""}>
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            `
                : `
              <button class="cart-btn add-to-cart" data-id="${product.id}" 
                title="Tambah ke Keranjang">
                <i class="fas fa-cart-plus"></i>
              </button>
            `
            }
            <button class="buy-btn" data-id="${product.id}"
              ${isOutOfStock ? "disabled" : ""}>
              <i class="fas fa-shopping-bag"></i> Beli
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  renderPagination() {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.ITEMS_PER_PAGE
    );

    let buttons = "";
    if (totalPages > 1) {
      buttons += `
        <button class="page-btn" ${this.currentPage === 1 ? "disabled" : ""} 
          onclick="shop.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button>
      `;

      for (let i = 1; i <= totalPages; i++) {
        buttons += `
          <button class="page-btn ${this.currentPage === i ? "active" : ""}" 
            onclick="shop.changePage(${i})">${i}</button>
        `;
      }

      buttons += `
        <button class="page-btn" ${
          this.currentPage === totalPages ? "disabled" : ""
        } 
          onclick="shop.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
    }

    return `<div class="pagination">${buttons}</div>`;
  }

  changePage(page) {
    this.currentPage = page;
    this.displayProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateCartDisplay() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.calculateTotal();

    // Update all cart count elements
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = totalItems;
    });

    // Update cart total price
    const cartTotal = document.querySelector(".cart-total");
    if (cartTotal) {
      cartTotal.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
    }

    // Add bump animation
    const cartIcon = document.querySelector(".cart-icon");
    if (cartIcon) {
      cartIcon.classList.add("cart-bump");
      setTimeout(() => cartIcon.classList.remove("cart-bump"), 300);
    }

    // Save cart state
    this.saveCartToSession();
    this.saveCartToCookies();
  }

  showReceipt() {
    const modal = document.getElementById("receiptModal");
    if (!modal) {
      console.error("Receipt modal not found");
      return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || {
      username: "Guest",
    };
    const now = new Date();
    const invoiceNumber = `INV/${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase()}`;

    // Calculate totals with tax
    const subtotal = this.calculateTotal();
    const tax = Math.round(subtotal * 0.11); // 11% tax
    const total = subtotal + tax;

    // Generate receipt items HTML
    const itemsHtml = this.cart
      .map(
        (item) => `
      <div class="receipt-item">
        <div class="receipt-item-header">${item.name}</div>
        <div class="receipt-item-details">
          <span>${item.quantity} x Rp ${item.price.toLocaleString(
          "id-ID"
        )}</span>
          <span>Rp ${(item.price * item.quantity).toLocaleString(
            "id-ID"
          )}</span>
        </div>
      </div>
    `
      )
      .join("");

    // Update receipt content with detailed calculations
    modal.querySelector(".receipt-items").innerHTML = `
      <div style="margin-bottom: 3mm">
        <div>No. Invoice: ${invoiceNumber}</div>
        <div>Kasir: ${currentUser.username}</div>
        <div>Tanggal: ${now.toLocaleString("id-ID")}</div>
      </div>
      <div class="receipt-divider"></div>
      ${itemsHtml}
      <div class="receipt-divider"></div>
    `;

    modal.querySelector(".receipt-summary").innerHTML = `
      <div class="receipt-item-details">
        <span>Subtotal:</span>
        <span>Rp ${subtotal.toLocaleString("id-ID")}</span>
      </div>
      <div class="receipt-item-details">
        <span>PPN (11%):</span>
        <span>Rp ${tax.toLocaleString("id-ID")}</span>
      </div>
      <div class="receipt-total">
        <span>TOTAL:</span>
        <span>Rp ${total.toLocaleString("id-ID")}</span>
      </div>
    `;

    modal.style.display = "flex";
  }

  showCartNotification(message) {
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
      setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 2000);
    }, 100);
  }

  attachProductListeners() {
    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const productId = parseInt(e.currentTarget.dataset.id);
        this.addToCart(productId);
      };
    });

    // Buy buttons
    document.querySelectorAll(".buy-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const productId = parseInt(e.currentTarget.dataset.id);
        this.handleBuyNow(productId);
      };
    });

    // Quantity controls
    document.querySelectorAll(".minus-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const productId = parseInt(e.currentTarget.dataset.id);
        this.removeFromCart(productId);
      };
    });

    document.querySelectorAll(".plus-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const productId = parseInt(e.currentTarget.dataset.id);
        this.addToCart(productId);
      };
    });

    // Filter controls
    document
      .getElementById("materialSelect")
      ?.addEventListener("change", () => this.filterProducts());
    document
      .getElementById("dateSelect")
      ?.addEventListener("change", () => this.filterProducts());
  }

  handleBuyNow(productId) {
    this.addToCart(productId);
    this.handleCheckout();
  }

  // Optional: Method to merge cart data when user logs in
  mergeCartWithCookies() {
    const cookieCart = this.loadCartFromCookies();
    if (cookieCart && cookieCart.length > 0) {
      cookieCart.forEach((cookieItem) => {
        const existingItem = this.cart.find(
          (item) => item.id === cookieItem.id
        );
        if (existingItem) {
          existingItem.quantity = Math.min(
            existingItem.quantity + cookieItem.quantity,
            existingItem.maxStock
          );
        } else {
          this.cart.push(cookieItem);
        }
      });
      this.updateCartDisplay();
      this.saveCartToCookies();
    }
  }

  // Cookie utility methods
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Add loading state handling
  showLoading(button) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
  }

  hideLoading(button) {
    button.innerHTML = button.dataset.originalText;
    button.disabled = false;
  }

  toggleCart() {
    if (this.cart.length === 0) {
      alert("Keranjang belanja kosong");
      return;
    }
    
    if (!this.isCartOpen) {
      this.showCartDropdown();
    } else {
      this.closeCart();
    }
  }

  showCartDropdown() {
    let cartDropdown = document.querySelector(".cart-dropdown");
    if (!cartDropdown) {
      cartDropdown = document.createElement("div");
      cartDropdown.className = "cart-dropdown";
      document.body.appendChild(cartDropdown);
    }

    cartDropdown.innerHTML = `
      <div class="cart-header">
        <h3>Keranjang Belanja</h3>
        <span>${this.cart.length} item</span>
      </div>
      <div class="cart-items">
        ${this.cart.map(item => `
          <div class="cart-item">
            <img src="${this.products.find(p => p.id === item.id)?.image}" alt="${item.name}">
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">
                ${item.quantity}x Rp ${item.price.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="cart-actions">
        <button class="btn-cancel" onclick="shop.closeCart()">Batal</button>
        <button class="btn-checkout" onclick="shop.handleCheckout()">Checkout</button>
      </div>
    `;

    setTimeout(() => cartDropdown.classList.add("show"), 10);
    this.isCartOpen = true;
  }

  closeCart() {
    const cartDropdown = document.querySelector(".cart-dropdown");
    if (cartDropdown) {
      cartDropdown.classList.remove("show");
      setTimeout(() => cartDropdown.remove(), 300);
    }
    this.isCartOpen = false;
  }
}

// Global instance for pagination access
let shop;

// Initialize shop
document.addEventListener("DOMContentLoaded", () => {
  shop = new ShopManager();
});

// Receipt modal functions
function printReceipt() {
  window.print();
}

function closeReceipt() {
  const modal = document.getElementById("receiptModal");
  if (modal) {
    modal.style.display = "none";
    // Clear cart after printing
    shop.clearCartCookies();
    shop.cart = [];
    shop.updateCartDisplay();
  }
}

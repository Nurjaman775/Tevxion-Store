class ShopManager {
  constructor() {
    this.products = [];
    this.cart = [];
    this.currentPage = 1;
    this.ITEMS_PER_PAGE = 10;
    this.filteredProducts = [];

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
        date: new Date().toISOString(),
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

  initializeElements() {
    // Initialize DOM elements
    this.productsContainer = document.querySelector(".products-container");
    this.cartCount = document.querySelector(".cart-count");
    this.cartTotal = document.querySelector(".cart-sticky .cart-total");
    // ...existing element initializations...
  }

  attachEventListeners() {
    // Search and filter events
    this.searchInput.addEventListener("input", () => this.filterProducts());
    this.sortSelect.addEventListener("change", () => this.filterProducts());
    this.categorySelect.addEventListener("change", () => this.filterProducts());

    // Cart events
    this.cartSticky.addEventListener("click", () => {
      if (this.cart.length > 0) this.showReceipt();
      else alert("Keranjang belanja kosong");
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

  // ... Implement other methods (filterProducts, addToCart, showReceipt, etc.) ...
}

// Initialize shop
document.addEventListener("DOMContentLoaded", () => {
  const shop = new ShopManager();
});

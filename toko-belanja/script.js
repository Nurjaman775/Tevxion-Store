// Replace static products array with API integration
let products = [];
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// Add API fetch function
async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();
    // Transform API data to match our format
    products = data.map((item) => ({
      id: item.id,
      name: item.title,
      price: Math.round(item.price * 15000), // Convert USD to IDR
      category: item.category,
      date: new Date().toISOString(),
      image: item.image,
      description: item.description,
      stock: 5, // Default stock
    }));
    filteredProducts = [...products];
    displayProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    productsContainer.innerHTML =
      '<p class="error">Failed to load products</p>';
  }
}

// Modify displayProducts function
function displayProducts() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  productsContainer.innerHTML = `
        ${paginatedProducts
          .map(
            (product) => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" />
                </div>
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString()}</p>
                <p class="stock">Stok: ${product.stock}</p>
                <div class="button-group">
                    ${getCartButton(product)}
                    <button class="buy-btn">
                        <i class="fas fa-shopping-bag"></i> Beli
                    </button>
                </div>
            </div>
        `
          )
          .join("")}
        ${renderPagination()}
    `;

  attachButtonListeners();
}

// Add pagination renderer
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return `
        <div class="pagination">
            <button class="page-btn" ${currentPage === 1 ? "disabled" : ""} 
                onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            ${Array.from({ length: totalPages }, (_, i) => i + 1)
              .map(
                (page) => `
                    <button class="page-btn ${
                      currentPage === page ? "active" : ""
                    }" 
                        onclick="changePage(${page})">
                        ${page}
                    </button>
                `
              )
              .join("")}
            
            <button class="page-btn" ${
              currentPage === totalPages ? "disabled" : ""
            } 
                onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

// Add page change handler
function changePage(page) {
  if (page < 1 || page > Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
    return;
  currentPage = page;
  displayProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Modify DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
  const cartButtons = document.querySelectorAll(".cart-btn");
  const buyButtons = document.querySelectorAll(".buy-btn");
  const cartCount = document.querySelector(".cart-count");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortBy");
  const categorySelect = document.getElementById("filterCategory");
  const productsContainer = document.querySelector(".products-container");
  const cartSticky = document.querySelector(".cart-sticky");
  const cartTotal = document.querySelector(".cart-sticky .cart-total");

  // Load cart from session storage
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  updateCartCount();
  let filteredProducts = [...products];

  // Search functionality
  searchInput.addEventListener("input", filterProducts);
  sortSelect.addEventListener("change", filterProducts);
  categorySelect.addEventListener("change", filterProducts);

  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    const categoryValue = categorySelect.value;

    filteredProducts = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryValue === "" || product.category === categoryValue;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortValue) {
      case "priceAsc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "dateDesc":
        filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "dateAsc":
        filteredProducts.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
    }
    displayProducts();
  }

  fetchProducts(); // Initial fetch of products

  function getCartButton(product) {
    const existingItem = cart.find((item) => item.id === product.id);

    if (product.stock === 0) {
      return `<button class="cart-btn disabled" disabled>
                <i class="fas fa-cart-plus"></i>
            </button>`;
    }

    if (existingItem) {
      return `<div class="in-cart-badge">
                <i class="fas fa-check"></i> In Cart (${existingItem.quantity})
            </div>`;
    }

    return `<button class="cart-btn">
            <i class="fas fa-cart-plus"></i>
        </button>`;
  }

  function attachButtonListeners() {
    const cartButtons = document.querySelectorAll(".cart-btn");
    const buyButtons = document.querySelectorAll(".buy-btn");

    cartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const product = button.closest(".product-card");
        const productData = {
          id: parseInt(product.dataset.id),
          name: product.querySelector("h3").textContent,
          price: product.querySelector(".price").textContent,
          image: product.querySelector("img").src,
        };

        addToCart(productData);
        alert("Produk ditambahkan ke keranjang!");
      });
    });

    buyButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const user = JSON.parse(sessionStorage.getItem("currentUser"));
        if (!user) {
          if (
            confirm(
              "Anda harus login untuk melakukan pembelian. Apakah anda sudah memiliki akun?"
            )
          ) {
            window.location.href = "/login/login.html";
          } else {
            window.location.href = "/register/register.html";
          }
          return;
        }
        alert("Terima kasih telah membeli produk ini!");
      });
    });
  }

  function updateCartCount() {
    const counts = document.querySelectorAll(".cart-count");
    counts.forEach((count) => (count.textContent = cart.length));

    // Update cart total
    const total = calculateTotal();
    cartTotal.textContent = `Rp ${total.toLocaleString()}`;
  }

  function calculateTotal() {
    return cart.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^\d]/g, ""));
      return sum + price * (item.quantity || 1);
    }, 0);
  }

  function showReceipt() {
    const modal = document.getElementById("receiptModal");
    const receiptItems = document.querySelector(".receipt-items");
    const receiptSummary = document.querySelector(".receipt-summary");
    const receiptDate = document.querySelector(".receipt-date");

    // Group items by name and sum quantities
    const groupedItems = cart.reduce((acc, item) => {
      const name = item.name;
      if (!acc[name]) {
        acc[name] = {
          price: parseInt(item.price.replace(/[^\d]/g, "")),
          quantity: 0,
        };
      }
      acc[name].quantity += item.quantity || 1;
      return acc;
    }, {});

    // Generate receipt items HTML
    let itemsHTML = "";
    for (const [name, data] of Object.entries(groupedItems)) {
      const subtotal = data.price * data.quantity;
      itemsHTML += `
                <div class="receipt-item">
                    <div>${name}</div>
                    <div>${
                      data.quantity
                    } x Rp ${data.price.toLocaleString()}</div>
                    <div>Rp ${subtotal.toLocaleString()}</div>
                </div>
            `;
    }

    // Calculate total
    const total = calculateTotal();
    const tax = Math.round(total * 0.11); // 11% tax
    const grandTotal = total + tax;

    // Update receipt content
    receiptDate.textContent = new Date().toLocaleString();
    receiptItems.innerHTML = itemsHTML;
    receiptSummary.innerHTML = `
            <div>Subtotal: Rp ${total.toLocaleString()}</div>
            <div>PPN (11%): Rp ${tax.toLocaleString()}</div>
            <div><strong>Total: Rp ${grandTotal.toLocaleString()}</strong></div>
        `;

    modal.style.display = "flex";
  }

  function closeReceipt() {
    document.getElementById("receiptModal").style.display = "none";
  }

  function printReceipt() {
    window.print();
  }

  function addToCart(productData) {
    const product = products.find((p) => p.id === productData.id);
    const existingItem = cart.find((item) => item.id === product.id);

    if (product.stock === 0) {
      alert("Sorry, this item is out of stock");
      return;
    }

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("Cannot add more items. Stock limit reached!");
        return;
      }
      existingItem.quantity++;
    } else {
      cart.push({
        ...productData,
        quantity: 1,
      });
    }
    product.stock--;
    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayProducts();
  }

  function removeFromCart(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      const item = cart[itemIndex];
      const product = products.find((p) => p.id === productId);
      product.stock += item.quantity;
      cart.splice(itemIndex, 1);
      sessionStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      displayProducts();
    }
  }

  // Update cart sticky click handler
  cartSticky.addEventListener("click", () => {
    if (cart.length > 0) {
      showReceipt();
    } else {
      alert("Your cart is empty");
    }
  });

  // Initial display
  displayProducts();
});

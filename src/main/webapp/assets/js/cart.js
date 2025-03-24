const cartItems = [
    {
      id: 1,
      name: "Áo thun thời trang",
      price: 150000,
      quantity: 1,
      size: "M",
      color: "Xanh",
      availableSizes: ["S", "M", "L", "XL"],
      availableColors: [
        { name: "Xanh", code: "#3498db" },
        { name: "Đỏ", code: "#e74c3c" },
        { name: "Đen", code: "#2c3e50" },
      ],
      image:
        "https://i1.sndcdn.com/artworks-ZbfKdYZBs6IDWBhJ-YxgJhQ-t500x500.jpg",
      selected: true, // Thêm thuộc tính selected
    },
    {
      id: 2,
      name: "Quần jeans cao cấp",
      price: 250000,
      quantity: 2,
      size: "L",
      color: "Đen",
      availableSizes: ["M", "L", "XL"],
      availableColors: [
        { name: "Xanh", code: "#2980b9" },
        { name: "Đen", code: "#2c3e50" },
        { name: "Xám", code: "#7f8c8d" },
      ],
      image:
        "https://i1.sndcdn.com/artworks-ZbfKdYZBs6IDWBhJ-YxgJhQ-t500x500.jpg",
      selected: true, // Thêm thuộc tính selected
    },
  ];

  function formatPrice(price) {
    return price.toLocaleString("vi-VN") + " VNĐ";
  }

  function updateCart() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    let subtotal = 0;
    let selectedCount = 0;

    cartItems.forEach((item) => {
      if (item.selected) {
        subtotal += item.price * item.quantity;
        selectedCount++;
      }
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item d-flex align-items-center";
      itemElement.innerHTML = `
                <div class="cart-item-select me-3">
                    <input type="checkbox" class="item-checkbox" data-id="${
                      item.id
                    }" ${
        item.selected ? "checked" : ""
      } onchange="toggleItem(${item.id})">
                </div>
                <div class="cart-item-image me-3">
                    <img src="${
                      item.image
                    }" class="img-fluid product-img" alt="${item.name}">
                </div>
                <div class="cart-item-details flex-grow-1">
                    <h5 class="mb-1">${item.name}</h5>
                    <small class="text-muted">Đơn giá: ${formatPrice(
                      item.price
                    )}</small>
                </div>
                <div class="cart-item-options me-3">
                    <select class="form-select size-select" onchange="updateSize(${
                      item.id
                    }, this.value)">
                        ${item.availableSizes
                          .map(
                            (size) =>
                              `<option value="${size}" ${
                                size === item.size ? "selected" : ""
                              }>${size}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="cart-item-options me-3">
                    <div class="color-container">
                        <select class="form-select color-select" onchange="updateColor(${
                          item.id
                        }, this.value)">
                            ${item.availableColors
                              .map(
                                (color) =>
                                  `<option value="${color.name}" ${
                                    color.name === item.color
                                      ? "selected"
                                      : ""
                                  }>${color.name}</option>`
                              )
                              .join("")}
                        </select>
                        <span class="color-box" style="background-color: ${
                          item.availableColors.find(
                            (c) => c.name === item.color
                          ).code
                        }"></span>
                    </div>
                </div>
                <div class="cart-item-quantity me-3">
                    <div class="quantity-controls">
                        <button class="btn btn-outline-primary" onclick="updateQuantity(${
                          item.id
                        }, -1)">-</button>
                        <span class="px-2">${item.quantity}</span>
                        <button class="btn btn-outline-primary" onclick="updateQuantity(${
                          item.id
                        }, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-total me-3">
                    <span class="fw-bold">${formatPrice(
                      item.price * item.quantity
                    )}</span>
                </div>
                <div class="cart-item-action">
                    <button class="btn btn-danger btn-sm" onclick="removeItem(${
                      item.id
                    })">Xóa</button>
                </div>
            `;
      cartContainer.appendChild(itemElement);
    });

    document.getElementById("subtotal").textContent = formatPrice(subtotal);
    document.getElementById("shipping").textContent = formatPrice(30000);
    document.getElementById("total").textContent = formatPrice(
      subtotal + 30000
    );
    document.getElementById("cartCount").textContent = selectedCount;

    // Cập nhật trạng thái checkbox "Chọn tất cả"
    const selectAllCheckbox = document.getElementById("select-all");
    selectAllCheckbox.checked = cartItems.every((item) => item.selected);
  }

  function toggleItem(itemId) {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      item.selected = !item.selected;
      updateCart();
    }
  }

  function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById("select-all");
    cartItems.forEach(
      (item) => (item.selected = selectAllCheckbox.checked)
    );
    updateCart();
  }

  function updateQuantity(itemId, change) {
    const item = cartItems.find((item) => item.id === itemId);
    if (
      item &&
      item.quantity + change > 0 &&
      item.quantity + change <= 10
    ) {
      item.quantity += change;
      updateCart();
    }
  }

  function updateSize(itemId, newSize) {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      item.size = newSize;
      updateCart();
    }
  }

  function updateColor(itemId, newColor) {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      item.color = newColor;
      updateCart();
    }
  }

  function removeItem(itemId) {
    const index = cartItems.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      cartItems.splice(index, 1);
      updateCart();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateCart();

    document
      .getElementById("profileIcon")
      .addEventListener("click", function () {
        window.location.href = "/src/main/webapp/pages/profile.html";
      });
    document
      .getElementById("cartIcon")
      .addEventListener("click", function () {
        window.location.href = "/src/main/webapp/pages/cart.html";
      });
  });


  function loadComponent(id, file, callback) {
    fetch(file)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById(id).innerHTML = data;
        if (callback) callback(); // Gọi callback sau khi tải xong
      })
      .catch((error) => console.error("Lỗi khi tải component:", error));
  }

  // Tải header xong thì mới gọi loadCategories() và loadFeaturedProducts()
  loadComponent(
    "header",
    "/src/main/webapp/components/header.html",
    function () {
      setupLogin(); // Gọi hàm thiết lập đăng nhập sau khi header được tải
      loadCategories();
      loadFeaturedProducts();
    }
  );

  // Tải footer bình thường
  loadComponent("footer", "/src/main/webapp/components/footer.html");

  function setupLogin() {
    const loginForm = document.getElementById("loginForm");
    const profileIcon = document.getElementById("profileIcon");
    const cartIcon = document.getElementById("cartIcon");
    const loginBtn = document.querySelector(".btn-outline-primary");
    const registerBtn = document.querySelector(".btn-primary");

    let isLoggedIn = false;

    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        isLoggedIn = true;
        loginBtn.classList.add("d-none");
        registerBtn.classList.add("d-none");
        profileIcon.classList.remove("d-none");
        cartIcon.classList.remove("d-none");

        bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        ).hide();
        alert("Đăng nhập thành công! (Chức năng giả lập)");
      });
    }

    if (profileIcon) {
      profileIcon.addEventListener("click", function () {
        if (isLoggedIn) {
          window.location.href = "/src/main/webapp/pages/profile.html";
        }
      });
    }

    if (cartIcon) {
      cartIcon.addEventListener("click", function () {
        if (isLoggedIn) {
          window.location.href = "/src/main/webapp/pages/cart.html";
        }
      });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert(
          "Đăng ký thành công! Vui lòng đăng nhập. (Chức năng giả lập)"
        );
        bootstrap.Modal.getInstance(
          document.getElementById("registerModal")
        ).hide();
      });
    }
  }

  // Load header và chạy header.js sau khi header được chèn
loadComponent("header", "/src/main/webapp/components/header.html", function () {
    const script = document.createElement("script");
    script.src = "/src/main/webapp/assets/js/header.js";
    script.onload = function () {
        console.log("header.js đã load xong và chạy setupLogin");
    };
    document.body.appendChild(script);
  });
  loadComponent("footer", "/src/main/webapp/components/footer.html");
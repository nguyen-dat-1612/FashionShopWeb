// cart.js - Phiên bản hoàn chỉnh với API
document.addEventListener("DOMContentLoaded", function() {
  initCart();
});

// Biến lưu trữ tất cả sản phẩm
let allProducts = [];

// Hàm khởi tạo giỏ hàng
async function initCart() {
  try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("userId") || "{}");
      
      if (!token || !userId) {
          showErrorMessage("Vui lòng đăng nhập để xem giỏ hàng");
          return;
      }

      // Load tất cả sản phẩm trước
      await loadAllProducts();
      
      // Sau đó load giỏ hàng
      const cartData = await fetchCartData(userId);
      
      if (cartData && cartData.length > 0) {
          renderCartItems(cartData);
          updateCartSummary(cartData);
      } else {
          renderEmptyCart();
      }
  } catch (error) {
      console.error("Lỗi khi khởi tạo giỏ hàng:", error);
      showErrorMessage("Có lỗi xảy ra khi tải giỏ hàng");
  }
}

// Hàm load tất cả sản phẩm
async function loadAllProducts() {
  try {
      const response = await fetch('http://localhost:8080/api/products');
      const result = await response.json();
      
      if (result.code === 200) {
          allProducts = result.data;
      } else {
          throw new Error(result.message || "Không thể lấy danh sách sản phẩm");
      }
  } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      throw error;
  }
}

// Hàm lấy dữ liệu giỏ hàng từ API
async function fetchCartData(userId) {
  try {
      const response = await fetch(`http://localhost:8080/api/carts?userId=${userId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 200) {
          return result.data;
      } else {
          throw new Error(result.message || "Không thể lấy dữ liệu giỏ hàng");
      }
  } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
      throw error;
  }
}

// Hàm hiển thị giỏ hàng trống
function renderEmptyCart() {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = `
      <div class="text-center py-5">
          <i class="bi bi-cart-x" style="font-size: 3rem; color: #6c757d;"></i>
          <h4 class="mt-3">Giỏ hàng của bạn đang trống</h4>
          <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm</p>
          <a href="/src/main/webapp/pages/products.html" class="btn btn-primary mt-3">Tiếp tục mua sắm</a>
      </div>
  `;
  
  document.querySelector(".summary-card").style.display = "none";
}

// Hàm hiển thị các sản phẩm trong giỏ hàng
function renderCartItems(cartItems) {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";
  
  cartItems.forEach(item => {
      const variant = item.productVariant;
      const product = findProductByVariant(variant.id);
      
      if (!product) {
          console.error(`Không tìm thấy sản phẩm cho variant ${variant.id}`);
          return;
      }
      
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item d-flex align-items-center mb-3 p-3 border rounded";
      itemElement.dataset.productId = product.id;
      itemElement.dataset.variantId = variant.id;
      
      // Lấy tất cả biến thể của sản phẩm này
      const allVariants = product.productVariantList || [];
      
      // Lấy danh sách màu sắc và kích thước có sẵn
      const availableColors = [...new Set(allVariants.map(v => v.color))];
      const availableSizes = [...new Set(allVariants.map(v => v.size))];
      
      itemElement.innerHTML = `
          <div class="cart-item-select me-3">
              <input type="checkbox" class="item-checkbox" data-id="${item.id}" checked 
                     onchange="toggleItemSelection(${item.id})">
          </div>
          <div class="cart-item-image me-3">
              <img src="${variant.image || product.img || 'https://via.placeholder.com/100'}" 
                   class="img-fluid product-img" alt="${product.name}" style="width: 100px;">
          </div>
          <div class="cart-item-details flex-grow-1">
              <h5 class="mb-1">${product.name}</h5>
              
              <div class="mb-2">
                  <label class="me-2">Màu:</label>
                  <select class="form-select color-select d-inline-block w-auto" 
                          onchange="updateVariant(${item.id}, this.value, 'color')">
                      ${availableColors.map(color => `
                          <option value="${color}" ${color === variant.color ? 'selected' : ''}>
                              ${color}
                          </option>
                      `).join('')}
                  </select>
              </div>
              
              <div class="mb-2">
                  <label class="me-2">Size:</label>
                  <select class="form-select size-select d-inline-block w-auto" 
                          onchange="updateVariant(${item.id}, this.value, 'size')">
                      ${availableSizes.map(size => `
                          <option value="${size}" ${size === variant.size ? 'selected' : ''}>
                              ${size}
                          </option>
                      `).join('')}
                  </select>
              </div>
              
              <small class="text-muted">Đơn giá: ${formatPrice(variant.price)}</small>
          </div>
          <div class="cart-item-quantity me-3">
              <div class="quantity-controls">
                  <button class="btn btn-outline-primary" onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                  <span class="px-2">${item.quantity}</span>
                  <button class="btn btn-outline-primary" onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
              </div>
          </div>
          <div class="cart-item-total me-3">
              <span class="fw-bold">${formatPrice(item.totalPrice)}</span>
          </div>
          <div class="cart-item-action">
              <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.id})">Xóa</button>
          </div>
      `;
      
      cartContainer.appendChild(itemElement);
  });
}

// Hàm tìm sản phẩm theo variantId
function findProductByVariant(variantId) {
  return allProducts.find(product => 
      product.productVariantList?.some(v => v.id === variantId)
  );
}

// Hàm cập nhật biến thể (màu/size)
async function updateVariant(cartItemId, newValue, type) {
  try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("userId") || "{}");
      
      // Lấy thông tin giỏ hàng hiện tại
      const currentCart = await fetchCartData(userId);
      const cartItem = currentCart.find(item => item.id === cartItemId);
      
      if (!cartItem) {
          throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
      }
      
      // Tìm sản phẩm và biến thể mới
      const product = findProductByVariant(cartItem.productVariant.id);
      const newVariant = product.productVariantList.find(v => 
          (type === 'color' ? v.color === newValue : true) &&
          (type === 'size' ? v.size === newValue : true) &&
          (type === 'color' ? v.size === cartItem.productVariant.size : true) &&
          (type === 'size' ? v.color === cartItem.productVariant.color : true)
      );
      
      if (!newVariant) {
          throw new Error("Không tìm thấy biến thể phù hợp");
      }
      
      // Gọi API cập nhật giỏ hàng
      const response = await fetch('http://localhost:8080/api/carts/update', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              id: cartItemId,
              productVariant_id: newVariant.id,
              quantity: cartItem.quantity
          })
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200) {
          showSuccessMessage("Đã cập nhật sản phẩm");
          initCart(); // Tải lại giỏ hàng
      } else {
          throw new Error(result.message || "Lỗi khi cập nhật sản phẩm");
      }
  } catch (error) {
      console.error("Lỗi khi cập nhật biến thể:", error);
      showErrorMessage(error.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
  }
}

// Hàm cập nhật số lượng sản phẩm
async function updateCartItemQuantity(itemId, change) {
  try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("userId") || "{}");
      
      // Lấy thông tin giỏ hàng hiện tại
      const currentCart = await fetchCartData(userId);
      const cartItem = currentCart.find(item => item.id === itemId);
      
      if (!cartItem) {
          throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
      }
      
      const newQuantity = cartItem.quantity + change;
      
      // Kiểm tra số lượng hợp lệ (1-10)
      if (newQuantity < 1 || newQuantity > 10) {
          showErrorMessage("Số lượng phải từ 1 đến 10");
          return;
      }
      
      // Gọi API cập nhật số lượng
      const response = await fetch('http://localhost:8080/api/carts/update', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              id: itemId,
              productVariant_id: cartItem.productVariant.id,
              quantity: newQuantity
          })
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200) {
          showSuccessMessage("Đã cập nhật số lượng sản phẩm");
          initCart(); // Tải lại giỏ hàng
      } else {
          throw new Error(result.message || "Lỗi khi cập nhật số lượng");
      }
  } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      showErrorMessage(error.message || "Có lỗi xảy ra khi cập nhật số lượng");
  }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
async function removeCartItem(itemId) {
  try {
      if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
          return;
      }
      
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8080/api/carts/delete?id=${itemId}&typeProduct=normal`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200) {
          showSuccessMessage("Đã xóa sản phẩm khỏi giỏ hàng");
          initCart(); // Tải lại giỏ hàng
      } else {
          throw new Error(result.message || "Lỗi khi xóa sản phẩm");
      }
  } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      showErrorMessage(error.message || "Có lỗi xảy ra khi xóa sản phẩm");
  }
}

// Hàm cập nhật tổng quan giỏ hàng
function updateCartSummary(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingFee = 30000; // Phí vận chuyển cố định
  const total = subtotal + shippingFee;
  
  document.getElementById("subtotal").textContent = formatPrice(subtotal);
  document.getElementById("shipping").textContent = formatPrice(shippingFee);
  document.getElementById("total").textContent = formatPrice(total);
  
  // Cập nhật số lượng sản phẩm trên icon giỏ hàng
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = totalItems;
}

// Hàm định dạng giá tiền
function formatPrice(price) {
  return price.toLocaleString("vi-VN") + " VNĐ";
}

// Hàm hiển thị thông báo (có thể thay bằng Toastify/Swal nếu cần)
function showSuccessMessage(message) {
  alert("✓ " + message);
}

function showErrorMessage(message) {
  alert("✗ " + message);
}
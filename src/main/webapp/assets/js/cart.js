// cart.js - Phiên bản cập nhật theo API mới
document.addEventListener("DOMContentLoaded", function() {
  initCart();
});

// Biến lưu trữ tất cả sản phẩm
let allProducts = [];

// Hàm khởi tạo giỏ hàng
async function initCart() {
  try {
    // Kiểm tra tham số selectItem từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectItemId = urlParams.get('selectItem');
    
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId") || "{}");
    
    if (!token || !userId) {
      showErrorMessage("Vui lòng đăng nhập để xem giỏ hàng");
      return;
    }

    // Load giỏ hàng
    const cartData = await fetchCartData(userId);
    
    if (cartData && cartData.length > 0) {
      renderCartItems(cartData);
      updateCartSummary(cartData);
      
      // Nếu có tham số selectItem, chọn sản phẩm tương ứng
      if (selectItemId) {
        selectSpecificItem(cartData, selectItemId);
      }
    } else {
      renderEmptyCart();
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo giỏ hàng:", error);
    showErrorMessage("Có lỗi xảy ra khi tải giỏ hàng");
  }
}
// Hàm chọn sản phẩm cụ thể
function selectSpecificItem(cartData, selectItemId) {
  // Tìm sản phẩm cần chọn
  const itemToSelect = cartData.find(item => 
    item.productVariant && 
    item.productVariant.id.toString() === selectItemId.toString()
  );
  
  if (itemToSelect) {
    // Lấy tất cả các checkbox
    const checkboxes = document.querySelectorAll('.item-checkbox');
    
    checkboxes.forEach(checkbox => {
      const itemId = checkbox.getAttribute('data-id');
      // Chỉ chọn sản phẩm có variantId trùng với selectItemId
      checkbox.checked = (itemId === itemToSelect.id.toString());
      
      // Highlight sản phẩm được chọn
      if (checkbox.checked) {
        const itemElement = checkbox.closest('.cart-item');
        itemElement.classList.add('selected-highlight');
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    // Cập nhật lại tổng tiền
    toggleItemSelection();
  }
}

// Hàm hiển thị item mua ngay
function renderBuyNowItem(item) {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";
  
  const itemElement = document.createElement("div");
  itemElement.className = "cart-item d-flex align-items-center mb-3 p-3 border rounded";
  itemElement.dataset.cartItemId = item.id;
  itemElement.dataset.variantId = item.productVariant.id;
  
  itemElement.innerHTML = `
    <div class="cart-item-select me-3">
      <input type="checkbox" class="item-checkbox" data-id="${item.id}" checked 
             onchange="toggleItemSelection(${item.id})">
    </div>
    <div class="cart-item-image me-3">
      <img src="${item.productVariant.image || 'https://via.placeholder.com/100'}" 
           class="img-fluid product-img" alt="Sản phẩm" style="width: 100px;">
    </div>
    <div class="cart-item-details flex-grow-1">
      <h5 class="mb-1">${item.productVariant.name || 'Sản phẩm'}</h5>
      
      <div class="mb-2">
        <span class="me-2">Màu: ${item.productVariant.color}</span>
        <span>Size: ${item.productVariant.size}</span>
      </div>
      
      <small class="text-muted">Đơn giá: ${formatPrice(item.productVariant.price)}</small>
    </div>
    <div class="cart-item-quantity me-3">
      <div class="quantity-controls">
        <button class="btn btn-outline-primary" onclick="changeBuyNowQuantity(-1)">-</button>
        <span class="px-2" id="buyNowQuantity">${item.quantity}</span>
        <button class="btn btn-outline-primary" onclick="changeBuyNowQuantity(1)">+</button>
      </div>
    </div>
    <div class="cart-item-total me-3">
      <span class="fw-bold">${formatPrice(item.totalPrice)}</span>
    </div>
  `;
  
  cartContainer.appendChild(itemElement);
  
  // Hiện thị thẻ tóm tắt
  document.querySelector(".summary-card").style.display = "block";
}

// Hàm thay đổi số lượng cho mua ngay
function changeBuyNowQuantity(change) {
  const quantityElement = document.getElementById("buyNowQuantity");
  let quantity = parseInt(quantityElement.textContent) + change;
  
  if (quantity < 1) quantity = 1;
  if (quantity > 10) quantity = 10;
  
  quantityElement.textContent = quantity;
  
  // Cập nhật localStorage
  const buyNowItem = JSON.parse(localStorage.getItem("buyNowItem"));
  buyNowItem.quantity = quantity;
  buyNowItem.totalPrice = buyNowItem.productVariant.price * quantity;
  localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
  
  // Cập nhật tổng tiền
  updateCartSummary([buyNowItem]);
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
      <a href="/src/main/webapp/pages/home.html" class="btn btn-primary mt-3">Tiếp tục mua sắm</a>
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
    
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item d-flex align-items-center mb-3 p-3 border rounded";
    itemElement.dataset.cartItemId = item.id;
    itemElement.dataset.variantId = variant.id;
    
    // Mặc định tất cả sản phẩm đều được chọn
    itemElement.innerHTML = `
      <div class="cart-item-select me-3">
        <input type="checkbox" class="item-checkbox" data-id="${item.id}" checked 
               onchange="toggleItemSelection(${item.id})">
      </div>
      <div class="cart-item-image me-3">
        <img src="${variant.image || 'https://via.placeholder.com/100'}" 
             class="img-fluid product-img" alt="Sản phẩm" style="width: 100px;">
      </div>
      <div class="cart-item-details flex-grow-1">
        <h5 class="mb-1">${variant.name || `Sản phẩm #${variant.id}`}</h5>
        <div class="mb-2">
          <span class="me-2">Màu: ${variant.color}</span>
          <span>Size: ${variant.size}</span>
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


// Hàm cập nhật số lượng sản phẩm
async function updateCartItemQuantity(itemId, change) {
  try {
    console.log('[DEBUG] Bắt đầu cập nhật giỏ hàng, itemId:', itemId, 'change:', change);
    
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId") || "null");
    
    console.log('[DEBUG] Token:', token);
    console.log('[DEBUG] UserId:', userId);

    // Lấy thông tin giỏ hàng hiện tại
    const currentCart = await fetchCartData(userId);
    console.log('[DEBUG] Giỏ hàng hiện tại:', currentCart);
    
    const cartItem = currentCart.find(item => item.id === itemId);
    
    if (!cartItem) {
      throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
    }
    
    const newQuantity = cartItem.quantity + change;
    console.log('[DEBUG] Số lượng hiện tại:', cartItem.quantity, 'Số lượng mới:', newQuantity);
    
    // Kiểm tra số lượng hợp lệ (1-10)
    if (newQuantity < 1 || newQuantity > 10) {
      showErrorMessage("Số lượng phải từ 1 đến 10");
      return;
    }
    
    // Chuẩn bị dữ liệu gửi đi
    const requestBody = {
      cartId: cartItem.id,
      quantity: newQuantity,
      userId: userId
    };
    
    console.log('[DEBUG] Dữ liệu chuẩn bị gửi:', requestBody);
    
    // Gọi API cập nhật số lượng
    const response = await fetch('http://localhost:8080/api/carts/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('[DEBUG] Phản hồi từ server - Status:', response.status);
    
    if (!response.ok) {
      // Thử đọc thông tin lỗi chi tiết từ server
      let errorDetail = {};
      try {
        errorDetail = await response.json();
        console.error('[DEBUG] Chi tiết lỗi từ server:', errorDetail);
      } catch (e) {
        console.error('[DEBUG] Không thể parse thông tin lỗi');
      }
      
      throw new Error(`Lỗi HTTP ${response.status}: ${errorDetail.message || 'Không có thông tin chi tiết'}`);
    }
    
    const result = await response.json();
    console.log('[DEBUG] Kết quả cập nhật:', result);
    
    if (result.code === 200) {
      showSuccessMessage("Đã cập nhật số lượng sản phẩm");
      initCart(); // Tải lại giỏ hàng
    } else {
      throw new Error(result.message || "Lỗi khi cập nhật số lượng");
    }
  } catch (error) {
    console.error("[DEBUG] Lỗi chi tiết:", error);
    showErrorMessage(error.message || "Có lỗi xảy ra khi cập nhật số lượng");
  }
}

async function removeCartItem(itemId) {
  console.log('[DEBUG] Bắt đầu xóa cart item với ID:', itemId);
  try {
    // 1. Hiển thị hộp thoại xác nhận trước khi xóa
    // confirm() sẽ trả về true nếu người dùng bấm OK, false nếu bấm Cancel
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      console.log('[DEBUG] Người dùng đã hủy thao tác xóa');
      return; // Thoát hàm nếu người dùng không xác nhận
    }

    // 2. Lấy token xác thực từ localStorage
    // Token thường được lưu khi người dùng đăng nhập thành công
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    console.log('[DEBUG] Bắt đầu xóa cart item với ID:', itemId);

    // 3. Gọi API xóa item khỏi giỏ hàng
    // Endpoint: /api/carts/delete với method DELETE
    // Truyền tham số qua query string: id (itemId) và typeProduct=normal
    const response = await fetch(`http://localhost:8080/api/carts/delete?id=${itemId}&typeProduct=main`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` // Gửi token trong header Authorization
      }
    });

    console.log('[DEBUG] Response status:', response.status);

    // 4. Kiểm tra response từ server
    if (!response.ok) {
      // Nếu response không thành công (status không trong khoảng 200-299)
      const errorData = await response.json().catch(() => null); // Cố gắng đọc lỗi chi tiết từ server
      console.error('[DEBUG] Chi tiết lỗi từ server:', errorData);
      throw new Error(errorData?.message || `Lỗi HTTP! Status: ${response.status}`);
    }

    // 5. Parse dữ liệu JSON từ response
    const result = await response.json();
    console.log('[DEBUG] Kết quả trả về từ server:', result);

    // 6. Kiểm tra mã trạng thái từ server
    if (result.code === 200) {
      // Nếu thành công (code 200)
      showSuccessMessage("Đã xóa sản phẩm khỏi giỏ hàng");
      
      // 7. Load lại giỏ hàng để cập nhật giao diện
      initCart(); 
    } else {
      // Nếu server trả về code lỗi
      throw new Error(result.message || "Lỗi khi xóa sản phẩm");
    }
  } catch (error) {
    // 8. Xử lý các lỗi có thể xảy ra
    console.error("Lỗi chi tiết:", {
      message: error.message,
      stack: error.stack,
      itemId: itemId
    });
    
    // Hiển thị thông báo lỗi cho người dùng
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
  const cartCountElement = document.getElementById("cartCount");
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Hàm định dạng giá tiền
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Hàm hiển thị thông báo
function showSuccessMessage(message) {
  const toast = document.createElement("div");
  toast.className = "alert alert-success position-fixed top-0 end-0 m-3";
  toast.style.zIndex = "9999";
  toast.innerHTML = `✓ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showErrorMessage(message) {
  const toast = document.createElement("div");
  toast.className = "alert alert-danger position-fixed top-0 end-0 m-3";
  toast.style.zIndex = "9999";
  toast.innerHTML = `✗ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Hàm chọn/bỏ chọn sản phẩm (cần thêm vào HTML)
function toggleItemSelection(itemId) {
  const itemElement = document.querySelector(`.cart-item[data-cart-item-id="${itemId}"]`);
  if (itemElement) {
    const checkbox = itemElement.querySelector('.item-checkbox');
    if (checkbox.checked) {
      itemElement.classList.add('selected-highlight');
    } else {
      itemElement.classList.remove('selected-highlight');
    }
  }
  
  // Tính lại tổng tiền
  const selectedItems = document.querySelectorAll('.item-checkbox:checked');
  let subtotal = 0;
  
  selectedItems.forEach(checkbox => {
    const itemElement = checkbox.closest('.cart-item');
    const priceText = itemElement.querySelector('.cart-item-total span').textContent;
    const price = parseFloat(priceText.replace(/[^\d]/g, ""));
    subtotal += price;
  });
  
  const shippingFee = 30000;
  const total = subtotal + shippingFee;
  
  document.getElementById("subtotal").textContent = formatPrice(subtotal);
  document.getElementById("total").textContent = formatPrice(total);
}


// Hàm chọn tất cả sản phẩm (cần thêm vào HTML)
function toggleSelectAll() {
  const selectAll = document.getElementById("select-all");
  const checkboxes = document.querySelectorAll(".item-checkbox");
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
  
  // Gọi hàm toggleItemSelection để cập nhật tổng tiền
  toggleItemSelection();
}

// Hàm xử lý khi người dùng nhấn nút "Đặt Hàng"
function proceedToCheckout() {
  try {
    // Kiểm tra có phải chế độ mua ngay không
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get('buyNow') === 'true';
    
    if (isBuyNow) {
      const buyNowItem = JSON.parse(localStorage.getItem("buyNowItem"));
      if (!buyNowItem) {
        showErrorMessage("Không tìm thấy thông tin sản phẩm");
        return;
      }
      
      // Lưu vào selectedCartItems để trang checkout xử lý
      localStorage.setItem("selectedCartItems", JSON.stringify([buyNowItem]));
      localStorage.setItem("isBuyNow", "true");
      
      // Chuyển đến trang thanh toán
      window.location.href = "/src/main/webapp/pages/checkout.html";
      return;
    }
    
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId") || "null");
    
    if (!token || !userId) {
      showErrorMessage("Vui lòng đăng nhập để tiếp tục thanh toán");
      return;
    }
    
    // Lấy tất cả các checkbox đã được tích
    const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
    
    // Kiểm tra xem có sản phẩm nào được chọn không
    if (selectedCheckboxes.length === 0) {
      showErrorMessage("Vui lòng chọn ít nhất một sản phẩm để đặt hàng");
      return;
    }
    
    // Thu thập cartItem của các sản phẩm được chọn
    const selectedCartItems = [];
    
    selectedCheckboxes.forEach(checkbox => {
      const cartId = parseInt(checkbox.getAttribute("data-id"));
      const cartItemElement = document.querySelector(`.cart-item[data-cart-item-id="${cartId}"]`);
      
      if (cartItemElement) {
        // Lấy thông tin từ element
        const variantId = parseInt(cartItemElement.dataset.variantId);
        const quantity = parseInt(cartItemElement.querySelector(".cart-item-quantity span").textContent);
        const totalPrice = parseFloat(
          cartItemElement.querySelector(".cart-item-total span").textContent
            .replace(/[^\d]/g, "") // Loại bỏ tất cả ký tự không phải số
        );
        
        // Thêm vào mảng các item được chọn
        selectedCartItems.push({
          id: cartId,
          productVariant: {
            id: variantId,
            color: cartItemElement.querySelector(".cart-item-details .me-2").textContent.replace("Màu: ", ""),
            size: cartItemElement.querySelector(".cart-item-details span:last-child").textContent.replace("Size: ", ""),
            price: totalPrice / quantity,
            image: cartItemElement.querySelector(".product-img").src
          },
          quantity: quantity,
          totalPrice: totalPrice
        });
      }
    });
    
    console.log("[DEBUG] Các item cart được chọn:", selectedCartItems);
    
    // Lưu danh sách cart items vào localStorage
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedCartItems));
    
    // Vẫn lưu cả ID để đối chiếu nếu cần
    const selectedCartIds = selectedCartItems.map(item => item.id);
    localStorage.setItem("selectedCartIds", JSON.stringify(selectedCartIds));
    
    // Chuyển hướng đến trang thanh toán
    window.location.href = "/src/main/webapp/pages/checkout.html";
  } catch (error) {
    console.error("Lỗi khi chuyển đến trang thanh toán:", error);
    showErrorMessage("Có lỗi xảy ra khi xử lý đơn hàng");
  }
}

// Load header và chạy header.js sau khi header được chèn
function loadComponent(id, file, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(id).innerHTML = data;
      if (callback) callback();
    })
    .catch((error) => console.error("Lỗi khi tải component:", error));
}

// Load các component
loadComponent("header", "/src/main/webapp/components/header.html", function () {
  const script = document.createElement("script");
  script.src = "/src/main/webapp/assets/js/header.js";
  script.onload = function () {
      console.log("header.js đã load xong và chạy setupLogin");
  };
  document.body.appendChild(script);
});
loadComponent("footer", "/src/main/webapp/components/footer.html");
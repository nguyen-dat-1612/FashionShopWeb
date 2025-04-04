
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
// Hàm tải component
function loadComponent(id, file, callback) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(id).innerHTML = data;
      if (callback) callback();
    })
    .catch((error) => console.error("Lỗi khi tải component:", error));
}

// Hàm lấy thông tin sản phẩm từ API
async function fetchProduct(productId) {
  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Không thể lấy dữ liệu sản phẩm');
    }
    
    const data = await response.json();
    return data.data || {
      id: productId,
      name: "Sản phẩm không tồn tại",
      price: "0.00",
      stock_quantity: 0,
      rating: 0,
      sold: 0,
      description: "Không thể tải thông tin sản phẩm",
      thumbnail: "https://via.placeholder.com/150?text=Product+Not+Found",
      status: "OUT_OF_STOCK",
      productVariantList: []
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
    return {
      id: productId,
      name: "Lỗi kết nối",
      price: "0.00",
      stock_quantity: 0,
      rating: 0,
      sold: 0,
      description: "Không thể kết nối đến server",
      thumbnail: "https://via.placeholder.com/150?text=Connection+Error",
      status: "OUT_OF_STOCK",
      productVariantList: []
    };
  }
}

// Hàm chọn tùy chọn
function toggleOption(selectedBtn, container) {
  const buttons = container.getElementsByTagName("button");
  for (let btn of buttons) btn.classList.remove("active");
  selectedBtn.classList.add("active");
}

// Hàm tạo các lựa chọn màu sắc
function createColorOptions(variants) {
  const colorOptions = document.getElementById("colorOptions");
  const uniqueColors = [...new Set(variants.map(v => v.color))];
  
  uniqueColors.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.textContent = color;
    btn.onclick = function() {
      toggleOption(this, colorOptions);
      updateSizeOptions(color, variants);
    };
    colorOptions.appendChild(btn);
  });
  
  // Kích hoạt màu đầu tiên nếu có
  if (uniqueColors.length > 0) {
    colorOptions.firstChild.click();
  }
}

// Hàm cập nhật lựa chọn kích thước dựa trên màu đã chọn
function updateSizeOptions(selectedColor, variants) {
  const sizeOptions = document.getElementById("sizeOptions");
  sizeOptions.innerHTML = "";
  
  const sizesForColor = variants
    .filter(v => v.color === selectedColor)
    .map(v => v.size);
  
  const uniqueSizes = [...new Set(sizesForColor)];
  
  uniqueSizes.forEach(size => {
    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.textContent = size;
    btn.onclick = function() {
      toggleOption(this, sizeOptions);
      updateSelectedVariant(selectedColor, size, variants);
    };
    sizeOptions.appendChild(btn);
  });
  
  // Kích hoạt size đầu tiên nếu có
  if (uniqueSizes.length > 0) {
    sizeOptions.firstChild.click();
  }
}

// Hàm cập nhật variant đã chọn
function updateSelectedVariant(color, size, variants) {
  const selectedVariant = variants.find(v => v.color === color && v.size === size);
  if (selectedVariant) {
    // Cập nhật hình ảnh nếu có
    if (selectedVariant.image) {
      document.getElementById("productImage").src = 
        selectedVariant.image.startsWith('http') 
          ? selectedVariant.image 
          : `http://localhost:8080/images/${selectedVariant.image}`;
    }
    
    // Cập nhật số lượng tồn kho
    document.getElementById("productStock").textContent = 
      `Số lượng còn: ${selectedVariant.quantity}`;
  }
}

// Xử lý khi DOM được tải
document.addEventListener("DOMContentLoaded", async function () {
    // Lấy thông tin sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id")) || 6; // Mặc định là sản phẩm có id 6
    
    // Lấy dữ liệu sản phẩm từ API
    const product = await fetchProduct(productId);

    // Hiển thị thông tin sản phẩm cơ bản
    document.getElementById("productImage").src = product.thumbnail.startsWith('http') 
      ? product.thumbnail 
      : `http://localhost:8080/images/${product.thumbnail}`;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = `${product.price} VNĐ`;
    document.getElementById("productStock").textContent = `Số lượng còn: ${product.stock_quantity}`;
    document.getElementById("productRating").textContent = 
      `Đánh giá: ${product.rating}/5 (${product.sold} lượt mua)`;
    document.getElementById("productDescription").textContent = product.description;

    // Tạo các lựa chọn màu sắc và kích thước nếu có variant
    if (product.productVariantList && product.productVariantList.length > 0) {
      createColorOptions(product.productVariantList);
    } else {
      // Ẩn phần chọn màu/kích thước nếu không có variant
      document.querySelector('.option-group').style.display = 'none';
    }

    // Xử lý tăng giảm số lượng
    const quantityInput = document.getElementById("quantity");
    const maxQuantity = product.productVariantList?.length > 0 
      ? Math.max(...product.productVariantList.map(v => v.quantity))
      : product.stock_quantity;
    
    document.getElementById("decreaseQty").onclick = () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) quantityInput.value = value - 1;
    };
    
    document.getElementById("increaseQty").onclick = () => {
      let value = parseInt(quantityInput.value);
      if (value < maxQuantity) quantityInput.value = value + 1;
    };

  // Thêm vào giỏ hàng
  document.getElementById("addToCartBtn").onclick = async () => {
    try {
      // Kiểm tra đăng nhập
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("userId") || "{}");
      
      if (!token || !userId) {
        throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      }

      // Lấy thông tin sản phẩm đã chọn
      const selectedColor = document.querySelector('.color-options .active')?.textContent?.trim();
      const selectedSize = document.querySelector('.size-options .active')?.textContent?.trim();
      const quantity = parseInt(quantityInput.value) || 1;
      
      // Validate dữ liệu
      if (!selectedColor || !selectedSize) {
        throw new Error('Vui lòng chọn đầy đủ màu và kích thước');
      }
      
      if (isNaN(quantity)) {
        throw new Error('Số lượng không hợp lệ');
      }

      // Tìm productVariant_id tương ứng
      const selectedVariant = product.productVariantList?.find(v => 
        v.color?.trim() === selectedColor && 
        v.size?.trim() === selectedSize
      );
      
      if (!selectedVariant) {
        throw new Error('Không tìm thấy sản phẩm với màu và kích thước đã chọn');
      }

      // Gọi API thêm vào giỏ hàng
      const response = await fetch('http://localhost:8080/api/carts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId.toString(),
          quantity: quantity,
          productVariant_id: selectedVariant.id,
          cartDiscountDetails: []
        })
      });

      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Lỗi khi thêm vào giỏ hàng');
      }

      // Cập nhật UI
      updateCartCount(quantity);
      showSuccessMessage(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
      
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      showErrorMessage(error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  // Hàm hỗ trợ cập nhật số lượng giỏ hàng
  function updateCartCount(addedQuantity = 1) {
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
      const currentCount = parseInt(cartCountElement.textContent) || 0;
      cartCountElement.textContent = currentCount + addedQuantity;
    }
  }

  // Hàm hiển thị thông báo thành công (phiên bản không dùng SweetAlert)
  function showSuccessMessage(message) {
    // Sử dụng Toastify nếu đã import
    if (typeof Toastify !== 'undefined') {
      Toastify({
        text: message,
        duration: 3000,
        style: { background: "#4CAF50" }
      }).showToast();
    } 
    // Hoặc sử dụng alert thông thường
    else {
      alert("✓ " + message);
    }
  }

  // Hàm hiển thị thông báo lỗi (phiên bản không dùng SweetAlert)
  function showErrorMessage(message) {
    // Sử dụng Toastify nếu đã import
    if (typeof Toastify !== 'undefined') {
      Toastify({
        text: message,
        duration: 3000,
        style: { background: "#f44336" }
      }).showToast();
    } 
    // Hoặc sử dụng alert thông thường
    else {
      alert("✗ " + message);
    }
  }

  document.getElementById("buyNowBtn").onclick = async () => {
    console.log("=== BUY NOW BUTTON CLICKED ===");
    try {
        // Kiểm tra đăng nhập
        console.log("Checking login status...");
        const token = localStorage.getItem("token");
        const userId = JSON.parse(localStorage.getItem("userId") || "null");
        console.log("Login status:", { token: token ? "Exists" : "Missing", userId });
        
        if (!token || !userId) {
            console.log("User not logged in. Redirecting to login page...");
            showErrorMessage("Vui lòng đăng nhập để tiếp tục mua hàng");
            window.location.href = "/src/main/webapp/pages/login.html";
            return;
        }

        // Lấy thông tin sản phẩm đã chọn
        console.log("Getting selected product information...");
        const selectedColor = document.querySelector('.color-options .active')?.textContent?.trim();
        const selectedSize = document.querySelector('.size-options .active')?.textContent?.trim();
        const quantity = parseInt(quantityInput.value) || 1;
        console.log("Selected product details:", { selectedColor, selectedSize, quantity });

        // Xác thực dữ liệu
        if (!selectedColor || !selectedSize) {
            console.log("ERROR: Color or size not selected");
            showErrorMessage('Vui lòng chọn đầy đủ màu sắc và kích thước');
            return;
        }

        // Tìm sản phẩmVariant_id tương ứng
        console.log("Finding product variant with selected options...");
        console.log("Available variants:", product.productVariantList);
        const selectedVariant = product.productVariantList?.find(v => 
            v.color?.trim() === selectedColor && 
            v.size?.trim() === selectedSize
        );
        console.log("Selected variant:", selectedVariant);
        
        if (!selectedVariant) {
            console.log("ERROR: No variant found with selected color and size");
            showErrorMessage('Không tìm thấy sản phẩm có màu và kích thước được chọn');
            return;
        }

        // Gọi API để lấy giỏ hàng hiện tại
        console.log("Fetching current cart items...");
        let cartItems = [];
        try {
            const cartUrl = `http://localhost:8080/api/carts?userId=${userId}`;
            console.log("Cart API endpoint:", cartUrl);
            const response = await fetch(cartUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("Cart API response status:", response.status);
            if (!response.ok) {
                console.error("Cart API error response:", response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Cart API response data:", result);
            
            if (result.code === 200) {
                cartItems = result.data || [];
                console.log("Current cart items:", cartItems);
            } else {
                console.error("Cart API returned error code:", result.code, result.message);
                throw new Error(result.message || "Không thể lấy dữ liệu giỏ hàng");
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
            throw error;
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        console.log("Checking if item already exists in cart...");
        const existingItem = cartItems.find(item => 
            item.productVariant && item.productVariant.id === selectedVariant.id
        );
        console.log("Existing item in cart:", existingItem);

        // Tạo object sản phẩm để lưu vào localStorage
        console.log("Creating product data object...");
        const productData = {
            id: existingItem ? existingItem.id : Date.now(),
            productVariant: {
                id: selectedVariant.id,
                color: selectedColor,
                size: selectedSize,
                price: parseFloat(product.price),
                image: selectedVariant.image || product.thumbnail,
                name: product.name
            },
            quantity: quantity,
            totalPrice: parseFloat(product.price) * quantity
        };
        console.log("Product data created:", productData);

        if (existingItem) {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
            console.log("Item exists in cart, updating quantity...");
            try {
                // const newQuantity = existingItem.quantity + quantity;
                const newQuantity = quantity;
                console.log("New quantity will be:", newQuantity);
                
                // Kiểm tra số lượng hợp lệ (1-10)
                if (newQuantity < 1 || newQuantity > 10) {
                    console.log("ERROR: Invalid quantity (must be 1-10):", newQuantity);
                    showErrorMessage("Số lượng phải từ 1 đến 10");
                    return;
                }
                
                // Chuẩn bị dữ liệu gửi đi
                const requestBody = {
                    cartId: existingItem.id,
                    quantity: newQuantity,
                    userId: userId
                };
                console.log("Update cart request body:", requestBody);
                
                // Gọi API cập nhật số lượng
                console.log("Calling update cart API...");
                const response = await fetch('http://localhost:8080/api/carts/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });
                
                console.log("Update cart API response status:", response.status);
                if (!response.ok) {
                    console.error("Update cart API error response:", response);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("Update cart API response data:", result);
                
                if (result.code !== 200) {
                    console.error("Update cart API returned error code:", result.code, result.message);
                    throw new Error(result.message || 'Lỗi khi cập nhật giỏ hàng');
                }

                // Cập nhật số lượng mới
                productData.quantity = newQuantity;
                productData.totalPrice = parseFloat(product.price) * newQuantity;
                console.log("Updated product data:", productData);
                
            } catch (error) {
                console.error("Lỗi khi cập nhật giỏ hàng:", error);
                throw error;
            }
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            console.log("Item does not exist in cart, creating new cart item...");
            const createCartRequestBody = {
                user_id: userId.toString(),
                quantity: quantity,
                productVariant_id: selectedVariant.id,
                cartDiscountDetails: []
            };
            console.log("Create cart request body:", createCartRequestBody);
            
            console.log("Calling create cart API...");
            const response = await fetch('http://localhost:8080/api/carts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createCartRequestBody)
            });

            console.log("Create cart API response status:", response.status);
            const result = await response.json();
            console.log("Create cart API response data:", result);
            
            if (result.code !== 200) {
                console.error("Create cart API returned error code:", result.code, result.message);
                throw new Error(result.message || 'Lỗi khi thêm vào giỏ hàng');
            }

            // Cập nhật ID mới từ server
            productData.id = result.data.id;
            console.log("Updated product data with server ID:", productData);
        }

        // Lưu thông tin sản phẩm vào localStorage
        console.log("Saving selected cart item to localStorage...");
        localStorage.setItem("selectedCartItem", JSON.stringify(productData));
        console.log("Successfully saved to localStorage");
        
        // Chuyển hướng đến trang giỏ hàng với tham số selectItem
        console.log("Redirecting to cart page...");
        window.location.href = `/src/main/webapp/pages/cart.html?selectItem=${selectedVariant.id}`;
        console.log("=== BUY NOW PROCESS COMPLETED SUCCESSFULLY ===");
    } catch (error) {
        console.error("=== BUY NOW ERROR ===", error);
        showErrorMessage(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
    }
};
});

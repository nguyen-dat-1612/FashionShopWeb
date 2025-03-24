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
  
  // Dữ liệu giả lập API
  const mockApi = {
    products: [
      {
        id: 1,
        name: "Áo Thun Trắng",
        price: "250.000 VNĐ",
        stock: 50,
        rating: 4.5,
        reviews: 120,
        description: "Áo thun trắng chất liệu cotton cao cấp, thoáng mát và thoải mái khi mặc.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        colors: ["Trắng", "Đen", "Xám"],
        sizes: ["S", "M", "L", "XL"],
      },
      {
        id: 2,
        name: "Quần Jeans Xanh",
        price: "450.000 VNĐ",
        stock: 30,
        rating: 4.7,
        reviews: 85,
        description: "Quần jeans xanh phong cách hiện đại, phù hợp với nhiều dịp.",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
        colors: ["Xanh Đậm", "Xanh Nhạt"],
        sizes: ["28", "30", "32", "34"],
      },
      {
        id: 3,
        name: "Giày Sneaker Đen",
        price: "800.000 VNĐ",
        stock: 20,
        rating: 4.8,
        reviews: 200,
        description: "Giày sneaker đen thời thượng, bền bỉ và êm ái.",
        image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3",
        colors: ["Đen", "Trắng"],
        sizes: ["39", "40", "41", "42"],
      },
      {
        id: 4,
        name: "Mũ Lưỡi Trai",
        price: "150.000 VNĐ",
        stock: 100,
        rating: 4.3,
        reviews: 50,
        description: "Mũ lưỡi trai phong cách trẻ trung, dễ phối đồ.",
        image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3",
        colors: ["Đen", "Xám", "Nâu"],
        sizes: ["One Size"],
      },
    ],
  };
  
  // Hàm chọn tùy chọn
  function toggleOption(selectedBtn, container) {
    const buttons = container.getElementsByTagName("button");
    for (let btn of buttons) btn.classList.remove("active");
    selectedBtn.classList.add("active");
  }
  
  // Hàm cập nhật lựa chọn cho sản phẩm chính trong deal
  function updateMainSelectedOptions(mainSelectedColor, mainSelectedSize) {
    document.getElementById("mainSelectedOptions").textContent = 
      `Đã chọn: ${mainSelectedColor} - ${mainSelectedSize}`;
  }
  
  // Hàm cập nhật lựa chọn cho sản phẩm phụ trong deal
  function updateBundleSelectedOptions(item, selectedBundleColor, selectedBundleSize) {
    item.querySelector(".selected-options").textContent = 
      `Đã chọn: ${selectedBundleColor} - ${selectedBundleSize}`;
  }
  
  // Hàm cập nhật giá deal
  function updateDealPrice(mainPrice, checkboxes, comboTotal, comboDiscount) {
    let totalPrice = mainPrice;
    let totalDiscount = 0;
  
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const dealPrice = parseInt(checkbox.dataset.price);
        const originalPrice = parseInt(checkbox.dataset.original);
        totalPrice += dealPrice;
        totalDiscount += originalPrice - dealPrice;
      }
    });
  
    comboTotal.textContent = totalPrice.toLocaleString("vi-VN") + " VNĐ";
    comboDiscount.textContent = totalDiscount.toLocaleString("vi-VN") + " VNĐ";
  }
  
  // Xử lý khi DOM được tải
  document.addEventListener("DOMContentLoaded", function () {
    // Lấy thông tin sản phẩm
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id")) || 1;
    const product = mockApi.products.find((p) => p.id === productId);
  
    if (product) {
      // Hiển thị thông tin sản phẩm
      document.getElementById("productImage").src = product.image;
      document.getElementById("productName").textContent = product.name;
      document.getElementById("productPrice").textContent = product.price;
      document.getElementById("productStock").textContent = `Số lượng còn: ${product.stock}`;
      document.getElementById("productRating").textContent = 
        `Đánh giá: ${product.rating}/5 (${product.reviews} lượt đánh giá)`;
      document.getElementById("productDescription").textContent = product.description;
  
      let selectedColor = product.colors[0];
      let selectedSize = product.sizes[0];
  
      // Tạo tùy chọn màu sắc
      const colorOptions = document.getElementById("colorOptions");
      product.colors.forEach((color, index) => {
        const btn = document.createElement("button");
        btn.className = "color-btn";
        btn.textContent = color;
        if (index === 0) btn.classList.add("active");
        btn.onclick = () => {
          toggleOption(btn, colorOptions);
          selectedColor = color;
        };
        colorOptions.appendChild(btn);
      });
  
      // Tạo tùy chọn kích thước
      const sizeOptions = document.getElementById("sizeOptions");
      product.sizes.forEach((size, index) => {
        const btn = document.createElement("button");
        btn.className = "size-btn";
        btn.textContent = size;
        if (index === 0) btn.classList.add("active");
        btn.onclick = () => {
          toggleOption(btn, sizeOptions);
          selectedSize = size;
        };
        sizeOptions.appendChild(btn);
      });
  
      // Xử lý tăng giảm số lượng
      const quantityInput = document.getElementById("quantity");
      document.getElementById("decreaseQty").onclick = () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) quantityInput.value = value - 1;
      };
      document.getElementById("increaseQty").onclick = () => {
        let value = parseInt(quantityInput.value);
        if (value < product.stock) quantityInput.value = value + 1;
      };
  
      // Thêm vào giỏ hàng
      document.getElementById("addToCartBtn").onclick = () => {
        let cartCount = parseInt(document.getElementById("cartCount").textContent);
        cartCount += parseInt(quantityInput.value);
        document.getElementById("cartCount").textContent = cartCount;
        document.getElementById("cartIcon").classList.remove("d-none");
        alert(`Đã thêm ${quantityInput.value} ${product.name} (${selectedColor}, ${selectedSize}) vào giỏ hàng!`);
      };
  
      // Mua ngay
      document.getElementById("buyNowBtn").onclick = () => {
        const cartItem = [{
          id: product.id,
          name: product.name,
          price: parseInt(product.price.replace(".", "").replace(" VNĐ", "")),
          quantity: parseInt(quantityInput.value),
          color: selectedColor,
          size: selectedSize,
          image: product.image,
        }];
        localStorage.setItem("cartItems", JSON.stringify(cartItem));
        alert(`Đặt mua ${quantityInput.value} ${product.name} (${selectedColor}, ${selectedSize}) thành công! (Chức năng giả lập)`);
        window.location.href = "/src/main/webapp/pages/checkout.html";
      };
    }
  
    // Xử lý deal sản phẩm
    const mainPrice = 180000;
    const comboTotal = document.getElementById("comboTotal");
    const comboDiscount = document.getElementById("comboDiscount");
  
    const mainItem = document.querySelector(".main-item");
    const mainColorOptions = mainItem.querySelectorAll(".color-option");
    const mainSizeOptions = mainItem.querySelectorAll(".size-option");
    let mainSelectedColor = mainColorOptions[0]?.textContent || "Đỏ";
    let mainSelectedSize = mainSizeOptions[0]?.textContent || "S";
  
    mainColorOptions.forEach((btn, index) => {
      if (index === 0) btn.classList.add("active");
      btn.onclick = () => {
        toggleOption(btn, mainItem.querySelector(".color-options"));
        mainSelectedColor = btn.textContent;
        updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);
      };
    });
  
    mainSizeOptions.forEach((btn, index) => {
      if (index === 0) btn.classList.add("active");
      btn.onclick = () => {
        toggleOption(btn, mainItem.querySelector(".size-options"));
        mainSelectedSize = btn.textContent;
        updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);
      };
    });
  
    updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);
  
    const checkboxes = document.querySelectorAll(".deal-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => updateDealPrice(mainPrice, checkboxes, comboTotal, comboDiscount));
  
      const dealItem = checkbox.closest(".deal-item");
      const colorOptions = dealItem.querySelectorAll(".color-option");
      const sizeOptions = dealItem.querySelectorAll(".size-option");
      let selectedBundleColor = colorOptions[0]?.textContent || "Đen";
      let selectedBundleSize = sizeOptions[0]?.textContent || "S";
  
      colorOptions.forEach((btn, index) => {
        if (index === 0) btn.classList.add("active");
        btn.onclick = () => {
          toggleOption(btn, dealItem.querySelector(".color-options"));
          selectedBundleColor = btn.textContent;
          updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
        };
      });
  
      sizeOptions.forEach((btn, index) => {
        if (index === 0) btn.classList.add("active");
        btn.onclick = () => {
          toggleOption(btn, dealItem.querySelector(".size-options"));
          selectedBundleSize = btn.textContent;
          updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
        };
      });
  
      updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
    });
  
    // Xử lý nút thêm combo vào giỏ hàng
    document.getElementById("addComboBtn").onclick = () => {
      const selectedItems = Array.from(checkboxes)
        .filter((cb) => cb.checked)
        .map((cb) => {
          const dealItem = cb.closest(".deal-item");
          const name = dealItem.querySelector(".deal-name").textContent.replace("🎨", "").trim();
          const options = dealItem.querySelector(".selected-options").textContent;
          return `${name} (${options.replace("Đã chọn: ", "")})`;
        });
      const mainOptions = document.getElementById("mainSelectedOptions").textContent;
      const message = selectedItems.length > 0
        ? `Đã thêm deal: Bộ quần áo đá bóng Arsenal (${mainOptions.replace("Đã chọn: ", "")}) + ${selectedItems.join(", ")} vào giỏ hàng!`
        : `Đã thêm deal: Bộ quần áo đá bóng Arsenal (${mainOptions.replace("Đã chọn: ", "")}) vào giỏ hàng!`;
      alert(message);
    };
  });

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

// // Hàm tải component
// function loadComponent(id, file, callback) {
//   fetch(file)
//     .then((response) => response.text())
//     .then((data) => {
//       document.getElementById(id).innerHTML = data;
//       if (callback) callback();
//     })
//     .catch((error) => console.error("Lỗi khi tải component:", error));
// }

// // Hàm lấy thông tin sản phẩm từ API
// async function fetchProduct(productId) {
//   try {
//       const response = await fetch(`https://your-api-endpoint.com/products/${productId}`);
//       if (!response.ok) {
//           throw new Error('Không thể lấy dữ liệu sản phẩm');
//       }
//       return await response.json();
//   } catch (error) {
//       console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
//       // Fallback: Trả về sản phẩm mặc định hoặc thông báo lỗi
//       return {
//           id: productId,
//           name: "Sản phẩm không tồn tại",
//           price: "0 VNĐ",
//           stock: 0,
//           rating: 0,
//           reviews: 0,
//           description: "Không thể tải thông tin sản phẩm",
//           image: "https://via.placeholder.com/500?text=Product+Not+Found",
//           colors: [],
//           sizes: []
//       };
//   }
// }

// // Hàm chọn tùy chọn
// function toggleOption(selectedBtn, container) {
//   const buttons = container.getElementsByTagName("button");
//   for (let btn of buttons) btn.classList.remove("active");
//   selectedBtn.classList.add("active");
// }

// // Hàm cập nhật lựa chọn cho sản phẩm chính trong deal
// function updateMainSelectedOptions(mainSelectedColor, mainSelectedSize) {
//   document.getElementById("mainSelectedOptions").textContent = 
//     `Đã chọn: ${mainSelectedColor} - ${mainSelectedSize}`;
// }

// // Hàm cập nhật lựa chọn cho sản phẩm phụ trong deal
// function updateBundleSelectedOptions(item, selectedBundleColor, selectedBundleSize) {
//   item.querySelector(".selected-options").textContent = 
//     `Đã chọn: ${selectedBundleColor} - ${selectedBundleSize}`;
// }

// // Hàm cập nhật giá deal
// function updateDealPrice(mainPrice, checkboxes, comboTotal, comboDiscount) {
//   let totalPrice = mainPrice;
//   let totalDiscount = 0;

//   checkboxes.forEach((checkbox) => {
//       if (checkbox.checked) {
//           const dealPrice = parseInt(checkbox.dataset.price);
//           const originalPrice = parseInt(checkbox.dataset.original);
//           totalPrice += dealPrice;
//           totalDiscount += originalPrice - dealPrice;
//       }
//   });

//   comboTotal.textContent = totalPrice.toLocaleString("vi-VN") + " VNĐ";
//   comboDiscount.textContent = totalDiscount.toLocaleString("vi-VN") + " VNĐ";
// }

// // Xử lý khi DOM được tải
// document.addEventListener("DOMContentLoaded", async function () {
//   // Lấy thông tin sản phẩm từ URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const productId = parseInt(urlParams.get("id")) || 1;
  
//   // Lấy dữ liệu sản phẩm từ API
//   const product = await fetchProduct(productId);

//   // Hiển thị thông tin sản phẩm
//   document.getElementById("productImage").src = product.image;
//   document.getElementById("productName").textContent = product.name;
//   document.getElementById("productPrice").textContent = product.price;
//   document.getElementById("productStock").textContent = `Số lượng còn: ${product.stock}`;
//   document.getElementById("productRating").textContent = 
//       `Đánh giá: ${product.rating}/5 (${product.reviews} lượt đánh giá)`;
//   document.getElementById("productDescription").textContent = product.description;

//   let selectedColor = product.colors[0] || "Mặc định";
//   let selectedSize = product.sizes[0] || "Mặc định";

//   // Tạo tùy chọn màu sắc
//   const colorOptions = document.getElementById("colorOptions");
//   product.colors.forEach((color, index) => {
//       const btn = document.createElement("button");
//       btn.className = "color-btn";
//       btn.textContent = color;
//       if (index === 0) btn.classList.add("active");
//       btn.onclick = () => {
//           toggleOption(btn, colorOptions);
//           selectedColor = color;
//       };
//       colorOptions.appendChild(btn);
//   });

//   // Tạo tùy chọn kích thước
//   const sizeOptions = document.getElementById("sizeOptions");
//   product.sizes.forEach((size, index) => {
//       const btn = document.createElement("button");
//       btn.className = "size-btn";
//       btn.textContent = size;
//       if (index === 0) btn.classList.add("active");
//       btn.onclick = () => {
//           toggleOption(btn, sizeOptions);
//           selectedSize = size;
//       };
//       sizeOptions.appendChild(btn);
//   });

//   // Xử lý tăng giảm số lượng
//   const quantityInput = document.getElementById("quantity");
//   document.getElementById("decreaseQty").onclick = () => {
//       let value = parseInt(quantityInput.value);
//       if (value > 1) quantityInput.value = value - 1;
//   };
//   document.getElementById("increaseQty").onclick = () => {
//       let value = parseInt(quantityInput.value);
//       if (value < product.stock) quantityInput.value = value + 1;
//   };

//   // Thêm vào giỏ hàng
//   document.getElementById("addToCartBtn").onclick = () => {
//       let cartCount = parseInt(document.getElementById("cartCount").textContent);
//       cartCount += parseInt(quantityInput.value);
//       document.getElementById("cartCount").textContent = cartCount;
//       document.getElementById("cartIcon").classList.remove("d-none");
      
//       // Gửi dữ liệu lên API giỏ hàng
//       fetch('https://your-api-endpoint.com/cart', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//               productId: product.id,
//               quantity: parseInt(quantityInput.value),
//               color: selectedColor,
//               size: selectedSize
//           })
//       })
//       .then(response => response.json())
//       .then(data => {
//           alert(`Đã thêm ${quantityInput.value} ${product.name} (${selectedColor}, ${selectedSize}) vào giỏ hàng!`);
//       })
//       .catch(error => {
//           console.error('Lỗi khi thêm vào giỏ hàng:', error);
//           alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
//       });
//   };

//   // Mua ngay
//   document.getElementById("buyNowBtn").onclick = () => {
//       fetch('https://your-api-endpoint.com/orders', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//               productId: product.id,
//               quantity: parseInt(quantityInput.value),
//               color: selectedColor,
//               size: selectedSize
//           })
//       })
//       .then(response => response.json())
//       .then(data => {
//           alert(`Đặt mua ${quantityInput.value} ${product.name} (${selectedColor}, ${selectedSize}) thành công!`);
//           window.location.href = "/src/main/webapp/pages/checkout.html?orderId=" + data.orderId;
//       })
//       .catch(error => {
//           console.error('Lỗi khi đặt hàng:', error);
//           alert('Có lỗi xảy ra khi đặt hàng');
//       });
//   };

//   // Xử lý deal sản phẩm (phần này có thể giữ nguyên hoặc cũng kết nối API)
//   const mainPrice = 180000;
//   const comboTotal = document.getElementById("comboTotal");
//   const comboDiscount = document.getElementById("comboDiscount");

//   const mainItem = document.querySelector(".main-item");
//   const mainColorOptions = mainItem.querySelectorAll(".color-option");
//   const mainSizeOptions = mainItem.querySelectorAll(".size-option");
//   let mainSelectedColor = mainColorOptions[0]?.textContent || "Đỏ";
//   let mainSelectedSize = mainSizeOptions[0]?.textContent || "S";

//   mainColorOptions.forEach((btn, index) => {
//       if (index === 0) btn.classList.add("active");
//       btn.onclick = () => {
//           toggleOption(btn, mainItem.querySelector(".color-options"));
//           mainSelectedColor = btn.textContent;
//           updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);
//       };
//   });

//   mainSizeOptions.forEach((btn, index) => {
//       if (index === 0) btn.classList.add("active");
//       btn.onclick = () => {
//           toggleOption(btn, mainItem.querySelector(".size-options"));
//           mainSelectedSize = btn.textContent;
//           updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);
//       };
//   });

//   updateMainSelectedOptions(mainSelectedColor, mainSelectedSize);

//   const checkboxes = document.querySelectorAll(".deal-checkbox");
//   checkboxes.forEach((checkbox) => {
//       checkbox.addEventListener("change", () => updateDealPrice(mainPrice, checkboxes, comboTotal, comboDiscount));

//       const dealItem = checkbox.closest(".deal-item");
//       const colorOptions = dealItem.querySelectorAll(".color-option");
//       const sizeOptions = dealItem.querySelectorAll(".size-option");
//       let selectedBundleColor = colorOptions[0]?.textContent || "Đen";
//       let selectedBundleSize = sizeOptions[0]?.textContent || "S";

//       colorOptions.forEach((btn, index) => {
//           if (index === 0) btn.classList.add("active");
//           btn.onclick = () => {
//               toggleOption(btn, dealItem.querySelector(".color-options"));
//               selectedBundleColor = btn.textContent;
//               updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
//           };
//       });

//       sizeOptions.forEach((btn, index) => {
//           if (index === 0) btn.classList.add("active");
//           btn.onclick = () => {
//               toggleOption(btn, dealItem.querySelector(".size-options"));
//               selectedBundleSize = btn.textContent;
//               updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
//           };
//       });

//       updateBundleSelectedOptions(dealItem, selectedBundleColor, selectedBundleSize);
//   });

//   // Xử lý nút thêm combo vào giỏ hàng
//   document.getElementById("addComboBtn").onclick = () => {
//       const selectedItems = Array.from(checkboxes)
//           .filter((cb) => cb.checked)
//           .map((cb) => {
//               const dealItem = cb.closest(".deal-item");
//               const name = dealItem.querySelector(".deal-name").textContent.replace("🎨", "").trim();
//               const options = dealItem.querySelector(".selected-options").textContent;
//               return `${name} (${options.replace("Đã chọn: ", "")})`;
//           });
//       const mainOptions = document.getElementById("mainSelectedOptions").textContent;
//       const message = selectedItems.length > 0
//           ? `Đã thêm deal: Bộ quần áo đá bóng Arsenal (${mainOptions.replace("Đã chọn: ", "")}) + ${selectedItems.join(", ")} vào giỏ hàng!`
//           : `Đã thêm deal: Bộ quần áo đá bóng Arsenal (${mainOptions.replace("Đã chọn: ", "")}) vào giỏ hàng!`;
//       alert(message);
//   };
// });

// // Load header và chạy header.js sau khi header được chèn
// loadComponent("header", "/src/main/webapp/components/header.html", function () {
//   const script = document.createElement("script");
//   script.src = "/src/main/webapp/assets/js/header.js";
//   script.onload = function () {
//       console.log("header.js đã load xong và chạy setupLogin");
//   };
//   document.body.appendChild(script);
// });
// loadComponent("footer", "/src/main/webapp/components/footer.html");
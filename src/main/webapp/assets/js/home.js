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
  
// src/main/webapp/assets/js/home.js
document.addEventListener("DOMContentLoaded", async function () {
  await loadCategories();
  await loadFeaturedProducts();
});

async function loadCategories() {
    try {
        const response = await fetch("http://localhost:8080/api/categories");
        const result = await response.json();
        
        if (result.code === 200) {
            const categories = result.data;
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = categories.map(category => `
                <div class="category-card">
                    <h3>${category.name}</h3>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
    }
}

/**
 * Hàm tải danh sách sản phẩm nổi bật từ API và hiển thị lên giao diện
 * @throws {Error} - Bắt và xử lý các lỗi có thể xảy ra trong quá trình thực thi
 */
async function loadFeaturedProducts() {
  try {
      console.log('[DEBUG] Bắt đầu tải danh sách sản phẩm nổi bật');
      
      // 1. Gọi API lấy danh sách sản phẩm
      const apiUrl = "http://localhost:8080/api/products";
      console.log('[DEBUG] Đang gọi API:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      // 2. Kiểm tra HTTP status code
      console.log('[DEBUG] HTTP Status:', response.status);
      if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Không đọc được nội dung lỗi');
          console.error('[DEBUG] Chi tiết lỗi từ API:', {
              status: response.status,
              statusText: response.statusText,
              body: errorBody
          });
          throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // 3. Parse dữ liệu JSON từ response
      const result = await response.json();
      console.log('[DEBUG] Dữ liệu nhận được từ API:', result);
      
      // 4. Kiểm tra mã trạng thái từ server
      if (result.code === 200) {
          console.log('[DEBUG] Số lượng sản phẩm nhận được:', result.data?.length || 0);
          const featuredProducts = result.data || [];
          
          // 5. Lấy container hiển thị sản phẩm
          const productList = document.getElementById("products-list");
          if (!productList) {
              console.error('[DEBUG] Không tìm thấy element có ID "products-list"');
              return;
          }
          
          // 6. Xóa nội dung cũ trước khi render mới
          productList.innerHTML = "";
          
          // 7. Render từng sản phẩm
          featuredProducts.forEach((product, index) => {
              console.log(`[DEBUG] Đang xử lý sản phẩm #${index + 1}:`, product);
              
              // 7.2. Xử lý giá - định dạng tiền tệ
              const priceFormatted = product.price 
                  ? parseInt(product.price).toLocaleString() + ' VNĐ'
                  : 'Liên hệ';
              
              // 7.3. Xử lý thương hiệu
              const brandName = product.brand?.name || "Không rõ thương hiệu";
              
              // 7.4. Tạo HTML cho từng sản phẩm
              const productCard = `
                  <div class="product-card" 
                       onclick="window.location.href='/src/main/webapp/pages/product-detail.html?id=${product.id}'"
                       data-product-id="${product.id}">
                
                    
                       <img
                            src="${product.thumbnail || '/src/main/webapp/assets/images/default-product.png'}"
                            alt="${product.name || 'Product image'}"
                            data-product-image="${product.id}"
                        />
                      <h5>${product.name || 'Tên sản phẩm không có'}</h5>
                      <p>${priceFormatted}</p>
                      <small>${brandName}</small>
                  </div>
              `;
              
              // 7.5. Thêm sản phẩm vào danh sách
              productList.innerHTML += productCard;
          });
          
          console.log('[DEBUG] Đã render xong danh sách sản phẩm');
      } else {
          // Xử lý khi server trả về code lỗi
          console.error('[DEBUG] API trả về mã lỗi:', {
              code: result.code,
              message: result.message
          });
          throw new Error(result.message || "Lỗi API: Không lấy được danh sách sản phẩm");
      }
  } catch (error) {
      // 8. Xử lý lỗi tổng thể
      console.error('[DEBUG] Lỗi trong quá trình tải sản phẩm:', {
          error: error,
          message: error.message,
          stack: error.stack
      });
      
      // Hiển thị thông báo lỗi trên UI (nếu cần)
      const productList = document.getElementById("products-list");
      if (productList) {
          productList.innerHTML = `
              <div class="error-message">
                  <p>Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.</p>
                  <small>${error.message}</small>
              </div>
          `;
      }
  } finally {
      console.log('[DEBUG] Kết thúc quá trình tải sản phẩm nổi bật');
  }
}

function loadComponent(id, file, callback) {
  fetch(file)
      .then((response) => response.text())
      .then((data) => {
          document.getElementById(id).innerHTML = data;
          if (callback) callback();
      })
      .catch((error) => console.error("Lỗi khi tải component:", error));
}

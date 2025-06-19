loadComponent("header", "/src/main/webapp/components/header.html", function () {
    const script = document.createElement("script");
    script.src = "/src/main/webapp/assets/js/header.js";
    script.onload = function () {
        console.log("header.js đã load xong và chạy setupLogin");
    };
    document.body.appendChild(script);
});
loadComponent("footer", "/src/main/webapp/components/footer.html");

function loadComponent(id, file, callback) {
  fetch(file)
      .then((response) => response.text())
      .then((data) => {
          document.getElementById(id).innerHTML = data;
          if (callback) callback();
      })
      .catch((error) => console.error("Lỗi khi tải component:", error));
}


document.addEventListener("DOMContentLoaded", async function () {
    console.log('[DEBUG] Bắt đầu khởi tạo trang kết quả tìm kiếm');

    // Load kết quả tìm kiếm
    await loadSearchResults();
});

/**
 * Hàm lấy thông tin sản phẩm từ API
 * @param {number} productId - ID sản phẩm
 * @returns {Promise<Object>} - Đối tượng sản phẩm hoặc fallback nếu lỗi
 */
async function fetchProduct(productId) {
    try {
        console.log('[DEBUG] Đang lấy chi tiết sản phẩm ID:', productId);
        const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[DEBUG] Chi tiết sản phẩm ID:', productId, data);

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
        console.error('[DEBUG] Lỗi khi lấy dữ liệu sản phẩm ID:', productId, error);
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

/**
 * Hàm tải kết quả tìm kiếm từ API và gọi chi tiết sản phẩm
 * @throws {Error} - Bắt và xử lý các lỗi trong quá trình thực thi
 */
async function loadSearchResults() {
    try {
        console.log('[DEBUG] Bắt đầu tải kết quả tìm kiếm');

        // 1. Lấy keyword từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('keyword')?.trim() || '';
        console.log('[DEBUG] Từ khóa tìm kiếm:', keyword);

        // 2. Hiển thị keyword trên UI
        const keywordElement = document.getElementById('searchKeyword');
        if (keywordElement) {
            keywordElement.textContent = keyword || 'Không có từ khóa';
        }

        // 3. Kiểm tra nếu không có keyword
        const resultsContainer = document.getElementById('searchResultsList');
        const spinner = document.querySelector('.loading-spinner');
        if (!keyword) {
            resultsContainer.innerHTML = '<p class="no-results">Vui lòng nhập từ khóa tìm kiếm.</p>';
            return;
        }

        // 4. Hiển thị spinner
        if (spinner) spinner.style.display = 'block';

        // 5. Gọi API tìm kiếm
        const searchApiUrl = `http://localhost:8080/api/products/search?keyword=${encodeURIComponent(keyword)}`;
        console.log('[DEBUG] Đang gọi API tìm kiếm:', searchApiUrl);

        const searchResponse = await fetch(searchApiUrl);
        console.log('[DEBUG] HTTP Status (Search):', searchResponse.status);

        if (!searchResponse.ok) {
            const errorBody = await searchResponse.text().catch(() => 'Không đọc được nội dung lỗi');
            console.error('[DEBUG] Chi tiết lỗi từ API tìm kiếm:', {
                status: searchResponse.status,
                statusText: searchResponse.statusText,
                body: errorBody
            });
            throw new Error(`Lỗi HTTP (Search): ${searchResponse.status} - ${searchResponse.statusText}`);
        }

        // 6. Parse dữ liệu JSON từ API tìm kiếm
        const searchResult = await searchResponse.json();
        console.log('[DEBUG] Dữ liệu từ API tìm kiếm:', searchResult);

        // 7. Xử lý dữ liệu tìm kiếm
        if (searchResult.code === 200 && searchResult.data) {
            // Chuyển data thành mảng để xử lý thống nhất
            const searchItems = Array.isArray(searchResult.data)
                ? searchResult.data
                : [searchResult.data]; // Chuyển đối tượng đơn thành mảng 1 phần tử
            console.log('[DEBUG] Số lượng sản phẩm tìm thấy:', searchItems.length);

            // 8. Gọi API chi tiết sản phẩm cho từng ID
            const products = [];
            for (const item of searchItems) {
                if (item.id) {
                    const product = await fetchProduct(item.id);
                    if (product.name !== "Sản phẩm không tồn tại" && product.name !== "Lỗi kết nối") {
                        products.push(product);
                    }
                }
            }

            // 9. Xóa nội dung cũ
            resultsContainer.innerHTML = '';

            // 10. Render kết quả
            if (products.length > 0) {
                products.forEach((product, index) => {
                    console.log(`[DEBUG] Đang xử lý sản phẩm #${index + 1}:`, product);

                    // Định dạng giá
                    const priceFormatted = product.price
                        ? parseFloat(product.price).toLocaleString('vi-VN') + ' VNĐ'
                        : 'Liên hệ';

                    // Xử lý thương hiệu
                    const brandName = product.brand?.name || 'Không rõ thương hiệu';

                    // Xử lý thumbnail
                    const thumbnailUrl = product.thumbnail.startsWith('http')
                        ? product.thumbnail
                        : `http://localhost:8080/images/${product.thumbnail || 'default-product.png'}`;

                    // Tạo HTML cho product card
                    const productCard = `
                        <div class="col-md-4 col-sm-6 col-12 mb-4">
                            <div class="product-card"
                                 onclick="window.location.href='/src/main/webapp/pages/product-detail.html?id=${product.id}'"
                                 data-product-id="${product.id}">
                                <img src="${thumbnailUrl}"
                                     alt="${product.name || 'Hình ảnh sản phẩm'}"
                                     data-product-image="${product.id}"/>
                                <h5>${product.name || 'Tên sản phẩm không có'}</h5>
                                <p>${priceFormatted}</p>
                                <small>${brandName}</small>
                            </div>
                        </div>
                    `;
                    resultsContainer.innerHTML += productCard;
                });
            } else {
                resultsContainer.innerHTML = '<p class="no-results">Không tìm thấy sản phẩm nào.</p>';
            }
        } else {
            console.log('[DEBUG] Không tìm thấy sản phẩm nào');
            resultsContainer.innerHTML = '<p class="no-results">Không tìm thấy sản phẩm nào.</p>';
        }

        console.log('[DEBUG] Đã render xong kết quả tìm kiếm');
    } catch (error) {
        console.error('[DEBUG] Lỗi trong quá trình tải kết quả tìm kiếm:', {
            error: error,
            message: error.message,
            stack: error.stack
        });

        // Hiển thị thông báo lỗi trên UI
        const resultsContainer = document.getElementById('searchResultsList');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>Đã xảy ra lỗi khi tải kết quả tìm kiếm. Vui lòng thử lại sau.</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    } finally {
        // Ẩn spinner
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'none';
        console.log('[DEBUG] Kết thúc quá trình tải kết quả tìm kiếm');
    }
}
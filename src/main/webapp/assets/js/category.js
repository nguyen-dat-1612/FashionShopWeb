import CONFIG from '/src/main/webapp/config.js';

const API_BASE_URL = `http://${CONFIG.BASE_URL}/api/categories`;

document.addEventListener("DOMContentLoaded", () => fetchProducts());

async function fetchProducts() {
    const productsContainer = document.getElementById("category-list");

    console.log("Fetching categories from:", API_BASE_URL);

    try {
        const response = await fetch(API_BASE_URL);
        console.log("Response received:", response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Kiểm tra xem API có trả về danh sách sản phẩm hợp lệ không
        if (!data || !Array.isArray(data.data)) {
            console.error("Invalid product data:", data);
            throw new Error("Invalid product data format");
        }

        const categories = data.data; // Lấy danh sách loại sản phẩmphẩm

        const truncateText = (text, maxLength) => {
            return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
        };
        // Render sản phẩm lên giao diện
        productsContainer.innerHTML = categories.map(category => {

            const categoryName = truncateText(category.name, 25); // Giới hạn 25 ký tự
            
            return `
                <div class="col-md-4">
                    <div class="category-card">
                        <img src="https://product.hstatic.net/200000195587/product/ao-thun-bo-doi_d2094e7037d348c98b25252f1d805530_master.jpg" alt="Nhu cc" class="img-fluid rounded">
                        <h3>${categoryName}</h3>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading products:", error);
        productsContainer.innerHTML = `<p class="text-danger text-center">Failed to load products. Please try again later.</p>`;
    }
}
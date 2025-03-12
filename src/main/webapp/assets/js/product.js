import CONFIG from '/src/main/webapp/config.js';

const API_BASE_URL = `http://${CONFIG.BASE_URL}/api/products`;
const CART_API_URL = `http://${CONFIG.BASE_URL}/api/carts/create`;
const USER_ID = "2c2cbdde-703f-4e9e-a035-2322197ed221"; // Thay bằng user_id thực tế

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupCartEventListener();
});

// Hàm lấy danh sách sản phẩm từ API và hiển thị lên giao diện
async function fetchProducts() {
    const productsContainer = document.getElementById("products-list");

    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.data)) {
            throw new Error("Invalid product data format");
        }

        const products = data.data;

        const truncateText = (text, maxLength) => {
            return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
        };

        // Render danh sách sản phẩm
        productsContainer.innerHTML = products.map(product => {
            const productImage = product.thumbnail || "https://product.hstatic.net/200000195587/product/ao-thun-bo-doi_d2094e7037d348c98b25252f1d805530_master.jpg";
            const productPrice = parseFloat(product.price) || 0;
            const productName = truncateText(product.name, 25);

            return `
                <div class="col-md-3">
                    <a href="productdetails.html" class="text-decoration-none text-dark">
                        <div class="card product-card">
                            <img src="${productImage}" class="card-img-top" alt="${product.name}">
                            <div class="card-body">
                                <h5 class="card-title">${productName}</h5>
                                <p class="card-text">$${productPrice.toFixed(2)}</p>
                                <button class="btn btn-primary w-100 add-to-cart" 
                                    data-id="${product.id}" 
                                    data-name="${product.name}" 
                                    data-price="${productPrice}" 
                                    data-image="${productImage}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading products:", error);
        productsContainer.innerHTML = `<p class="text-danger text-center">Failed to load products. Please try again later.</p>`;
    }
}

// Hàm lắng nghe sự kiện "Add to Cart"
function setupCartEventListener() {
    document.getElementById("products-list").addEventListener("click", function(event) {
        if (event.target.classList.contains("add-to-cart")) {
            const productId = event.target.getAttribute("data-id");
            const productName = event.target.getAttribute("data-name");
            const productPrice = event.target.getAttribute("data-price");
            const productImage = event.target.getAttribute("data-image");

            const product = {
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage
            };

            addToCart(product);
        }
    });
}

// Hàm gọi API để thêm sản phẩm vào giỏ hàng
async function addToCart(product) {
    const cartData = {
        user_id: USER_ID,
        quantity: 1,
        cartDiscountDetails: [
            {
                productVariant_id: parseInt(product.id), // Chuyển id sang số nếu cần
                bundleDiscount_id: 0,
                quantity: 1
            }
        ],
        productVariant_id: 0

    };

    try {
        const response = await fetch(CART_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cartData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${product.name} has been added to cart!`);
        } else {
            throw new Error(result.message || "Failed to add product to cart.");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add product to cart. Please try again.");
    }
}
// Dữ liệu giả lập API
const mockApi = {
    products: [
        { id: 1, name: "Bộ quần áo đá bóng Arsenal", originalPrice: 180000, price: 180000, discount: 0, image: "https://product.hstatic.net/200000195587/product/ao-thun-bo-doi_d2094e7037d348c98b25252f1d805530_master.jpg", colors: ["Đen", "Trắng"], sizes: ["S", "M", "L", "XL"] },
        { id: 2, name: "Quần short nam thể thao", originalPrice: 200000, price: 100000, discount: 50, image: "https://product.hstatic.net/200000195587/product/ao-thun-bo-doi_d2094e7037d348c98b25252f1d805530_master.jpg", colors: ["Đen", "Xám"], sizes: ["S", "M", "L"] }
    ]
};

document.addEventListener("DOMContentLoaded", function() {
    const mainProduct = mockApi.products[0];
    const bundleItems = document.getElementById("bundleItems");
    const comboTotal = document.getElementById("comboTotal");
    const comboDiscount = document.getElementById("comboDiscount");

    // Hiển thị sản phẩm chính
    document.getElementById("mainProductImage").src = mainProduct.image;
    document.getElementById("mainProductName").textContent = mainProduct.name;
    document.getElementById("mainProductPrice").textContent = mainProduct.price.toLocaleString() + " VNĐ";

    // Hiển thị sản phẩm đi kèm
    mockApi.products.slice(1).forEach(product => {
        const dealItem = document.createElement("div");
        dealItem.className = "deal-item";
        dealItem.innerHTML = `
            <input type="checkbox" class="deal-checkbox">
            <img src="${product.image}" alt="${product.name}">
            <div class="deal-info">
                <p class="deal-name">${product.name} <button class="open-popup">🎨</button></p>
                <p class="deal-label">Deal Sốc <span>-${product.discount}%</span></p>
                <p class="original-price">${product.originalPrice.toLocaleString()} VNĐ</p>
                <p class="deal-price"><strong>${product.price.toLocaleString()} VNĐ</strong></p>
                <div class="option-hover">
                    <div class="color-options">
                        <label>Màu sắc:</label>
                        ${product.colors.map(color => `<button class="color-option">${color}</button>`).join("")}
                    </div>
                    <div class="size-options">
                        <label>Kích thước:</label>
                        ${product.sizes.map(size => `<button class="size-option">${size}</button>`).join("")}
                    </div>
                </div>
            </div>
        `;
        bundleItems.appendChild(dealItem);

        // Xử lý hover và chọn tùy chọn
        const optionHover = dealItem.querySelector(".option-hover");
        const colorOptions = optionHover.querySelectorAll(".color-option");
        const sizeOptions = optionHover.querySelectorAll(".size-option");

        colorOptions.forEach(btn => {
            btn.addEventListener("click", () => {
                colorOptions.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });

        sizeOptions.forEach(btn => {
            btn.addEventListener("click", () => {
                sizeOptions.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });
    });

    // Xử lý logic khi chọn sản phẩm đi kèm
    let totalPrice = mainProduct.price;
    let totalDiscount = 0;

    document.querySelectorAll(".deal-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const dealItem = this.closest(".deal-item");
            const price = parseInt(dealItem.querySelector(".deal-price strong").textContent.replace(/[^0-9]/g, ""));
            const originalPrice = parseInt(dealItem.querySelector(".original-price").textContent.replace(/[^0-9]/g, ""));
            const discount = originalPrice - price;

            if (this.checked) {
                totalPrice += price;
                totalDiscount += discount;
            } else {
                totalPrice -= price;
                totalDiscount -= discount;
            }

            comboTotal.textContent = totalPrice.toLocaleString() + " VNĐ";
            comboDiscount.textContent = totalDiscount.toLocaleString() + " VNĐ";
        });
    });

    // Xử lý nút "Bấm để mua deal sốc"
    document.getElementById("addComboBtn").addEventListener("click", function() {
        const checkedItems = document.querySelectorAll(".deal-checkbox:checked");
        if (checkedItems.length > 0 || confirm("Bạn có muốn mua deal sốc với sản phẩm chính không?")) {
            let cartCount = parseInt(document.getElementById("cartCount").textContent);
            cartCount += 1 + checkedItems.length; // Sản phẩm chính + số sản phẩm đi kèm được chọn
            document.getElementById("cartCount").textContent = cartCount;
            document.getElementById("cartIcon").classList.remove("d-none");
            alert(`Đã thêm ${1 + checkedItems.length} sản phẩm vào giỏ hàng!`);
        }
    });
});
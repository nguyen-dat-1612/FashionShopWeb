document.addEventListener("DOMContentLoaded", function() {

     // Kiểm tra đăng nhập
     const token = localStorage.getItem("token");
     const userId = JSON.parse(localStorage.getItem("userId") || "null");
     
     if (!token || !userId) {
        alert("Vui lòng đăng nhập để đặt hàng");
        window.location.href = "/src/main/webapp/pages/home.html";
        return;
     }

    // Lấy thông tin chi tiết các cart items từ localStorage
    const selectedCartItems = JSON.parse(localStorage.getItem('selectedCartItems') || "[]");
    const selectedCartIds = JSON.parse(localStorage.getItem('selectedCartIds') || "[]");
    
    console.log("Các cart items được chọn từ trang giỏ hàng:", selectedCartItems);
    console.log("Các cartId được chọn từ trang giỏ hàng:", selectedCartIds);
    
    // Nếu không có dữ liệu cart items, nhưng có cart IDs
    if (selectedCartItems.length === 0 && selectedCartIds.length > 0) {
        // Tạo thông báo cho người dùng
        alert("Cần tải lại thông tin giỏ hàng. Đang chuyển hướng về trang giỏ hàng...");
        window.location.href = "/src/main/webapp/pages/cart.html";
        return;
    }
    
    const cartItems = selectedCartItems.length > 0 ? selectedCartItems : [];
    const shippingFee = 30000; // Phí ship cố định
    let discount = 0;

    // Hiển thị danh sách sản phẩm
    const orderItems = document.getElementById("orderItems");
    orderItems.innerHTML = ""; // Xóa nội dung cũ
    
    cartItems.forEach(item => {
        const variant = item.productVariant;
        const itemElement = document.createElement("div");
        itemElement.className = "order-item";
        itemElement.innerHTML = `
            <img src="${variant.image || 'https://via.placeholder.com/100'}" alt="Sản phẩm #${variant.id}">
            <div class="item-details">
                <p class="item-name">Sản phẩm #${variant.id}</p>
                <p>Màu: ${variant.color} - Kích thước: ${variant.size}</p>
                <p>Số lượng: ${item.quantity}</p>
                <p>Đơn giá: ${formatPrice(variant.price)}</p>
            </div>
            <div class="item-price">${formatPrice(item.totalPrice)}</div>
        `;
        orderItems.appendChild(itemElement);
    });

    // // Thêm hiển thị debug info
    // if (selectedCartIds.length > 0) {
    //     const debugElement = document.createElement("div");
    //     debugElement.className = "debug-info";
    //     debugElement.style.background = "#f8f9fa";
    //     debugElement.style.padding = "10px";
    //     debugElement.style.marginBottom = "15px";
    //     debugElement.style.borderRadius = "5px";
    //     debugElement.innerHTML = `
    //         <h6>Debug Info (sẽ bỏ ở production)</h6>
    //         <p>Selected Cart IDs: ${JSON.stringify(selectedCartIds)}</p>
    //     `;
    //     orderItems.prepend(debugElement);
    // }

    // Tính toán và hiển thị tổng tiền
    function updateOrderSummary() {
        const subTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalPrice = subTotal + shippingFee - discount;

        document.getElementById("subTotal").textContent = formatPrice(subTotal);
        document.getElementById("shippingFee").textContent = formatPrice(shippingFee);
        document.getElementById("discount").textContent = formatPrice(discount);
        document.getElementById("totalPrice").textContent = formatPrice(totalPrice);
    }
    updateOrderSummary();

    // Xử lý mã giảm giá
    document.getElementById("applyDiscount").addEventListener("click", function() {
        const code = document.getElementById("discountCode").value.trim();
        if (code === "SAVE10") {
            discount = 30000; // Giảm 50.000 VNĐ
            alert("Áp dụng mã giảm giá thành công!");
        } else if (code) {
            alert("Mã giảm giá không hợp lệ!");
            discount = 0;
        }
        updateOrderSummary();
    });

    document.getElementById("confirmOrder").addEventListener("click", async function() {
        console.group("=== ORDER CONFIRMATION PROCESS STARTED ===");
        
        // Log input values
        const phone = document.getElementById("phone").value;
        const address = document.getElementById("address").value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        const voucherCode = document.getElementById("discountCode").value.trim() || null;
        
        if (!phone || !address) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
            console.groupEnd();
            return;
        }
    
        try {
            // Tạo order request
            const orderRequest = {
                cartId: selectedCartIds,
                date: new Date().toISOString(),
                address: address,
                phone: phone,
                voucherCode: voucherCode,
                paymentMethod: paymentMethod.toUpperCase()
            };
    
            // Gọi API đặt hàng
            const response = await fetch('http://localhost:8080/api/orders/create?userId=' + userId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(orderRequest)
            });
    
            // Kiểm tra response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
            }
    
            const result = await response.json();
            
            // Xóa dữ liệu giỏ hàng
            localStorage.removeItem('selectedCartIds');
            localStorage.removeItem('selectedCartItems');
            
            // Hiển thị modal lựa chọn
            showOrderSuccessModal(result.data.orderId);
            
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert('Đã xảy ra lỗi khi đặt hàng: ' + error.message);
        } finally {
            console.groupEnd();
        }
    });
    
    // Hàm hiển thị modal thành công
    function showOrderSuccessModal(orderId) {
        // Tạo modal HTML
        const modalHTML = `
            <div class="modal fade" id="orderSuccessModal" tabindex="-1" aria-labelledby="orderSuccessModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderSuccessModalLabel">Đặt hàng thành công!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-3">
                                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                            </div>
                            <p>Mã đơn hàng của bạn: <strong>${orderId}</strong></p>
                            <p>Cảm ơn bạn đã đặt hàng tại Fashion Style!</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-outline-secondary" id="goToHomeBtn">
                                <i class="bi bi-house-door"></i> Về trang chủ
                            </button>
                            <button type="button" class="btn btn-primary" id="viewOrderBtn">
                                <i class="bi bi-receipt"></i> Xem đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Thêm modal vào DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Hiển thị modal
        const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        modal.show();
        
        // Xử lý sự kiện nút
        document.getElementById('goToHomeBtn').addEventListener('click', function() {
            window.location.href = "/src/main/webapp/pages/home.html";
        });
        
        document.getElementById('viewOrderBtn').addEventListener('click', function() {
            window.location.href = `/src/main/webapp/pages/order-details.html?orderId=${orderId}`;
        });
        
        // Xóa modal khi đóng
        document.getElementById('orderSuccessModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Hàm định dạng giá tiền
    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }
    
});

function loadComponent(id, file, callback) {
    fetch(file)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch((error) => console.error("Lỗi khi tải component:", error));
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
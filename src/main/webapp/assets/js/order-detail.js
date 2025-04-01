document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId"));
    
    if (!token || !userId) {
        alert('Vui lòng đăng nhập để xem chi tiết đơn hàng');
        window.location.href = "/src/main/webapp/pages/home.html";
        return;
    }

    // Lấy orderId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        showError('Không tìm thấy đơn hàng');
        return;
    }

    // Load chi tiết đơn hàng
    loadOrderDetails(orderId, userId, token);

    // Xử lý sự kiện sidebar
    setupSidebarLinks();
});

function loadOrderDetails(orderId, userId, token) {
    showLoading();
    
    fetch(`http://localhost:8080/api/orders/${userId}/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || `Lỗi HTTP: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200) {
            displayOrderDetails(data.data, userId, token);  // Thêm userId và token
        } else {
            throw new Error(data.message || 'Lỗi từ server');
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi:", error);
        showError(error.message);
    });
}

function displayOrderDetails(order, userId, token) {  // Thêm params userId và token
    // Hiển thị thông tin cơ bản
    document.getElementById("order-id").textContent = order.id;
    document.getElementById("order-date").textContent = formatDate(order.date);
    document.getElementById("order-status").textContent = getStatusText(order.status);
    document.getElementById("order-total").textContent = formatPrice(order.total_price);

    // Hiển thị danh sách sản phẩm
    const tbody = document.getElementById("order-items");
    tbody.innerHTML = "";
    
    order.orderDetails.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <img src="${item.productVariant.image}" alt="Product image" width="50">
                    <span>${item.productVariant.id}</span>
                </div>
            </td>
            <td>${item.productVariant.size || 'N/A'}</td>
            <td>${item.productVariant.color || 'N/A'}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(item.price * item.quantity)}</td>
        `;
        tbody.appendChild(row);
    });

    // Hiển thị nút hủy đơn hàng nếu trạng thái là PENDING
    const cancelSection = document.getElementById("cancel-order-section");
    cancelSection.innerHTML = "";
    
    if (order.status === "PENDING") {
        const cancelButton = document.createElement("button");
        cancelButton.className = "btn-cancel";
        cancelButton.textContent = "Hủy đơn hàng";
        cancelButton.onclick = () => cancelOrder(order.id, userId, token);
        cancelSection.appendChild(cancelButton);
    }
}

function cancelOrder(orderId, userId, token) {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    
    fetch(`http://localhost:8080/api/orders/${userId}/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || `Lỗi HTTP: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200) {
            alert("Đơn hàng đã được hủy thành công!");
            // Thay vì reload, chuyển hướng về trang orders.html
            window.location.href = '/src/main/webapp/pages/orders.html';
        } else {
            throw new Error(data.message || 'Lỗi khi hủy đơn hàng');
        }
    })
    .catch(error => {
        console.error("Lỗi khi hủy đơn hàng:", error);
        alert(error.message);
    });
}


// Các hàm helper
function showLoading() {
    document.getElementById("order-items").innerHTML = '<tr><td colspan="6">Đang tải...</td></tr>';
}

function showError(message) {
    document.querySelector(".main-content").innerHTML = `
        <div class="error">${message}</div>
        <button class="btn-back" onclick="window.location.href='/src/main/webapp/pages/orders.html'">Quay lại</button>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        "PENDING": "Đang chờ",
        "CONFIRMED": "Đã xác nhận",
        "DELIVERING": "Đang giao",
        "DELIVERED": "Đã giao",
        "CANCELLED": "Đã hủy"
    };
    return statusMap[status] || status;
}

function setupSidebarLinks() {
    const sidebarLinks = {
        "profile": "/src/main/webapp/pages/profile.html",
        "changePassword": "/src/main/webapp/pages/change-password.html",
        "logout": "/src/main/webapp/pages/logout.html"
    };

    Object.keys(sidebarLinks).forEach(id => {
        document.getElementById(id)?.addEventListener("click", () => {
            window.location.href = sidebarLinks[id];
        });
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId"));
    
    if (!token || !userId) {
        showNotification('error', 'Thông báo', 'Vui lòng đăng nhập để xem chi tiết đơn hàng', () => {
            window.location.href = "/src/main/webapp/pages/home.html";
        });
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

    // Setup modal events
    setupModalEvents();
});

function setupModalEvents() {
    // Đóng modal khi click vào nút đóng
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('notification-modal').style.display = 'none';
    });

    // Đóng modal khi click bên ngoài modal
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('notification-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showNotification(type, title, message, confirmCallback = null, showCancelButton = false) {
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');
    const successIcon = document.querySelector('.success-icon');
    const errorIcon = document.querySelector('.error-icon');

    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Show/hide icons based on type
    if (type === 'success') {
        successIcon.style.display = 'flex';
        errorIcon.style.display = 'none';
    } else {
        successIcon.style.display = 'none';
        errorIcon.style.display = 'flex';
    }

    // Set up confirm button
    confirmBtn.onclick = function() {
        modal.style.display = 'none';
        if (confirmCallback) confirmCallback();
    };

    // Show/hide cancel button
    if (showCancelButton) {
        cancelBtn.style.display = 'block';
        cancelBtn.onclick = function() {
            modal.style.display = 'none';
        };
    } else {
        cancelBtn.style.display = 'none';
    }

    // Show modal
    modal.style.display = 'block';
}

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
            console.log(data.data);  // In ra dữ liệu chi tiết đơn hàng
            displayOrderDetails(data.data, userId, token);
        } else {
            throw new Error(data.message || 'Lỗi từ server');
        }
    })
    .catch(error => {
        console.error("Chi tiết lỗi:", error);
        showError(error.message);
    });
}

function displayOrderDetails(order, userId, token) {
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
    // Hiển thị modal xác nhận
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    modalTitle.textContent = 'XÁC NHẬN HỦY ĐƠN HÀNG';
    modalMessage.textContent = 'Bạn có chắc muốn hủy đơn hàng này?';
    
    // Hiển thị nút Hủy
    cancelBtn.style.display = 'block';
    
    // Xử lý sự kiện nút Xác nhận
    confirmBtn.onclick = function() {
        modal.style.display = 'none';
        
        // Gọi API hủy đơn hàng
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
                // Hiển thị thông báo thành công
                modalTitle.textContent = 'THÔNG BÁO';
                modalMessage.textContent = 'Đơn hàng đã được hủy thành công!';
                cancelBtn.style.display = 'none';
                
                confirmBtn.onclick = function() {
                    window.location.href = '/src/main/webapp/pages/orders.html';
                }
                
                modal.style.display = 'block';
            } else {
                throw new Error(data.message || 'Lỗi khi hủy đơn hàng');
            }
        })
        .catch(error => {
            console.error("Lỗi khi hủy đơn hàng:", error);
            
            // Hiển thị thông báo lỗi
            modalTitle.textContent = 'THÔNG BÁO';
            modalMessage.textContent = error.message;
            cancelBtn.style.display = 'none';
            
            confirmBtn.onclick = function() {
                modal.style.display = 'none';
            }
            
            modal.style.display = 'block';
        });
    };
    
    // Xử lý sự kiện nút Hủy
    cancelBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // Hiển thị modal
    modal.style.display = 'block';
}

// Đóng modal khi click vào nút đóng
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('notification-modal').style.display = 'none';
});

// Đóng modal khi click bên ngoài modal
window.addEventListener('click', function(event) {
    const modal = document.getElementById('notification-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
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
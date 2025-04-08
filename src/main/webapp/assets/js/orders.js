document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userId"));
    
    if (!token || !userId) {
        alert('Vui lòng đăng nhập để xem đơn hàng');
        window.location.href = "/src/main/webapp/pages/home.html";
        return;
    }

    // const cleanUserId = userId.replace(/"/g, ''); // Loại bỏ dấu ngoặc kép nếu có
    const ordersList = document.getElementById('orders-list');
    
    // Mặc định load đơn hàng PENDING khi trang được tải
    loadOrdersByStatus('PENDING');

    // Xử lý sự kiện click cho các nút filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Cập nhật trạng thái active cho nút được click
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Lấy trạng thái từ data-status và load đơn hàng
            const status = this.dataset.status;
            loadOrdersByStatus(status);
        });
    });

    // Hàm load đơn hàng theo trạng thái
    function loadOrdersByStatus(status) {
        showLoading();
        
        fetch(`http://localhost:8080/api/orders/${userId}?status=${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải đơn hàng');
            return response.json();
        })
        .then(data => {
            if (data.code === 200) {
                console.log(data.data);  // In ra dữ liệu đơn hàng
                displayOrders(data.data);
            } else {
                throw new Error(data.message || 'Lỗi không xác định');
            }
        })
        .catch(error => {
            showError(error.message);
            console.error('Error:', error);
        });
    }

    // Hàm hiển thị đơn hàng
    function displayOrders(orders) {
        if (!orders || orders.length === 0) {
            ordersList.innerHTML = '<p>Không có đơn hàng nào.</p>';
            return;
        }

        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <span class="order-id">Đơn hàng #${order.id}</span>
                        <span class="order-date">${formatDate(order.date)}</span>
                    </div>
                    <span class="order-status ${getStatusClass(order.status)}">
                        ${getStatusText(order.status)}
                    </span>
                </div>
                <div class="order-summary">
                    <span class="order-total">${formatPrice(order.total_price)}</span>
                    <span class="order-items-count">${order.orderDetails.length} sản phẩm</span>
                </div>
            `;
            
            orderCard.addEventListener('click', () => {
                window.location.href = `/src/main/webapp/pages/order-detail.html?id=${order.id}`;
            });
            
            ordersList.appendChild(orderCard);
        });
    }

    // Các hàm helper
    function showLoading() {
        ordersList.innerHTML = '<div class="loading">Đang tải đơn hàng...</div>';
    }
    
    function showError(message) {
        ordersList.innerHTML = `<div class="error">${message}</div>`;
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
    
    function getStatusClass(status) {
        return `status-${status.toLowerCase()}`;
    }
});
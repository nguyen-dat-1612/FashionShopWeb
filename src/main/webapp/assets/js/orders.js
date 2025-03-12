// orders.js
// Giả lập dữ liệu từ API
const fetchOrdersData = async () => {
    // Thay bằng API thật của bạn nếu cần
    const data = [
        {
            orderId: "DH001",
            date: "2025-03-10",
            total: 450000,
            status: "pending",
            items: [
                { name: "Áo thun trắng", quantity: 2, price: 150000 },
                { name: "Quần jeans xanh", quantity: 1, price: 150000 }
            ]
        },
        {
            orderId: "DH002",
            date: "2025-03-09",
            total: 800000,
            status: "shipped",
            items: [
                { name: "Giày sneaker đen", quantity: 1, price: 800000 }
            ]
        },
        {
            orderId: "DH003",
            date: "2025-03-08",
            total: 1200000,
            status: "delivered"
        },
        {
            orderId: "DH004",
            date: "2025-03-07",
            total: 800000,
            status: "cancelled"
        }
    ];
    return data;
};

// Hàm hiển thị danh sách đơn hàng
const displayOrders = (orders) => {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    orders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.date}</td>
            <td>${order.total.toLocaleString('vi-VN')} VNĐ</td>
            <td><span class="status ${order.status}">${getStatusText(order.status)}</span></td>
            <td><a href="/src/main/webapp/pages/order-detail.html?id=${order.orderId}" class="detail-btn">Xem chi tiết</a></td>
        `;
        ordersList.appendChild(row);
    });
};

// Chuyển đổi trạng thái sang tiếng Việt
const getStatusText = (status) => {
    switch(status) {
        case "pending": return "Đang xử lý";
        case "shipped": return "Đang giao";
        case "delivered": return "Đã giao";
        case "cancelled": return "Đã hủy";
        default: return "Không xác định";
    }
};

// Lọc đơn hàng theo trạng thái
const filterOrders = (orders, status) => {
    if (status === "all") return orders;
    return orders.filter(order => order.status === status);
};

// Tải dữ liệu khi trang được tải
window.onload = async () => {
    const ordersData = await fetchOrdersData();
    displayOrders(ordersData);

    // Thêm chức năng lọc
    const filterSelect = document.getElementById("order-status-filter");
    filterSelect.addEventListener("change", (e) => {
        const filteredOrders = filterOrders(ordersData, e.target.value);
        displayOrders(filteredOrders);
    });
};
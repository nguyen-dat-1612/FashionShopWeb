 // Dữ liệu giả lập
 const mockCart = [
    {
        id: 1,
        name: "Áo Thun Trắng",
        price: 250000,
        quantity: 1,
        color: "Trắng",
        size: "M",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
    },
    {
        id: 2,
        name: "Quần Jeans Xanh",
        price: 450000,
        quantity: 2,
        color: "Xanh Đậm",
        size: "32",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d"
    }
];

document.addEventListener("DOMContentLoaded", function() {
    // Lấy dữ liệu từ localStorage hoặc dùng mockCart nếu không có
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || mockCart;
    const shippingFee = 30000; // Phí ship cố định
    let discount = 0;

    // Hiển thị danh sách sản phẩm
    const orderItems = document.getElementById("orderItems");
    cartItems.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "order-item";
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <p>Màu: ${item.color} - Kích thước: ${item.size}</p>
                <p>Số lượng: ${item.quantity}</p>
            </div>
            <div class="item-price">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</div>
        `;
        orderItems.appendChild(itemElement);
    });

    // Tính toán và hiển thị tổng tiền
    function updateOrderSummary() {
        const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalPrice = subTotal + shippingFee - discount;

        document.getElementById("subTotal").textContent = subTotal.toLocaleString('vi-VN') + " VNĐ";
        document.getElementById("shippingFee").textContent = shippingFee.toLocaleString('vi-VN') + " VNĐ";
        document.getElementById("discount").textContent = discount.toLocaleString('vi-VN') + " VNĐ";
        document.getElementById("totalPrice").textContent = totalPrice.toLocaleString('vi-VN') + " VNĐ";
    }
    updateOrderSummary();

    // Xử lý mã giảm giá (giả lập)
    document.getElementById("applyDiscount").addEventListener("click", function() {
        const code = document.getElementById("discountCode").value.trim();
        if (code === "SAVE10") {
            discount = 50000; // Giảm 50.000 VNĐ
            alert("Áp dụng mã giảm giá thành công!");
        } else if (code) {
            alert("Mã giảm giá không hợp lệ!");
            discount = 0;
        }
        updateOrderSummary();
    });

    // Xử lý xác nhận đặt hàng
    document.getElementById("confirmOrder").addEventListener("click", function() {
        const fullName = document.getElementById("fullName").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const address = document.getElementById("address").value;
        const notes = document.getElementById("notes").value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        if (fullName && phone && address) {
            const orderDetails = cartItems.map(item => 
                `${item.name} (${item.color} - ${item.size}) x ${item.quantity}`
            ).join("\n");
            const totalPrice = parseInt(document.getElementById("totalPrice").textContent.replace(/\D/g, ''));
            alert(`Đặt hàng thành công!\nHọ tên: ${fullName}\nSĐT: ${phone}\nEmail: ${email || 'Không có'}\nĐịa chỉ: ${address}\nGhi chú: ${notes || 'Không có'}\nPhương thức thanh toán: ${paymentMethod}\nSản phẩm:\n${orderDetails}\nTổng tiền: ${totalPrice.toLocaleString('vi-VN')} VNĐ`);
            localStorage.removeItem('cartItems');
            window.location.href = "http://127.0.0.1:5500/src/main/webapp/pages/cart.html";


        } else {
            alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
        }
    });
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
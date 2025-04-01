// Giả lập dữ liệu từ API (dùng cho trang profile)
const fetchUserData = async () => {
    const data = {
        customerId: "KH23010122277",
        fullName: "Nguyễn Thành Đạt",
        displayName: "Nguyễn Thành Đạt",
        gender: "Nam",
        phone: "0377398266",
        email: "nguyendatpvdqpn@gmail.com",
        height: 155,
        weight: 50,
        deliveryInfo: "458 Lê Văn Sỹ, Quận 3, TP.HCM",
        avatar: "https://via.placeholder.com/150",
        phoneVerified: false,
        emailVerified: true
    };
    return data;
};

// Hàm cập nhật dữ liệu lên giao diện (dùng cho trang profile)
const updateProfileInfo = (userData) => {
    document.getElementById("customer-id").textContent = userData.customerId;
    document.getElementById("full-name").value = userData.fullName;
    document.getElementById("display-name").value = userData.displayName;
    document.getElementById("gender").value = userData.gender;
    document.getElementById("phone").value = userData.phone;
    document.getElementById("email").value = userData.email;
    document.getElementById("height").value = userData.height;
    document.getElementById("weight").value = userData.weight;
    document.getElementById("height-value").textContent = `${userData.height}cm`;
    document.getElementById("weight-value").textContent = `${userData.weight}kg`;
    document.getElementById("delivery-info").value = userData.deliveryInfo;
    document.getElementById("avatar-img").src = userData.avatar;

    const phoneStatus = document.querySelector("#phone + .status");
    const emailStatus = document.querySelector("#email + .status");
    phoneStatus.textContent = userData.phoneVerified ? "Đã xác minh" : "Xác minh ngay";
    phoneStatus.classList.toggle("verified", userData.phoneVerified);
    phoneStatus.classList.toggle("not-verified", !userData.phoneVerified);
    emailStatus.textContent = userData.emailVerified ? "Đã xác minh" : "Xác minh ngay";
    emailStatus.classList.toggle("verified", userData.emailVerified);
    emailStatus.classList.toggle("not-verified", !userData.emailVerified);
};

// Xử lý sự kiện nhấp vào sidebar
window.onload = () => {
    const sidebarItems = document.querySelectorAll('.sidebar ul li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.textContent === 'MẬT KHẨU') {
                window.location.href = 'change-password.html';
            } else if (item.textContent === 'THÔNG TIN CÁ NHÂN') {
                window.location.href = 'profile.html';
            }
            // Xóa class active và thêm vào item được nhấp
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Xử lý trang profile nếu đang ở đó
    if (document.getElementById('customer-id')) {
        fetchUserData().then(updateProfileInfo);

        const saveBtn = document.querySelector(".save-btn");
        saveBtn.addEventListener("click", () => {
            alert("Thông tin đã được lưu! (Chức năng giả lập)");
        });

        const editBtn = document.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => {
            const newAvatar = prompt("Nhập URL ảnh mới:");
            if (newAvatar) {
                document.getElementById("avatar-img").src = newAvatar;
            }
        });
    }

    // Xử lý trang thay đổi mật khẩu nếu đang ở đó
    if (document.getElementById('save-password')) {
        const savePasswordBtn = document.getElementById('save-password');
        savePasswordBtn.addEventListener('click', () => {
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const message = document.getElementById('message');

            if (!oldPassword || !newPassword || !confirmPassword) {
                message.textContent = 'Vui lòng điền đầy đủ thông tin!';
                message.style.display = 'block';
                return;
            }

            if (newPassword !== confirmPassword) {
                message.textContent = 'Mật khẩu mới không khớp!';
                message.style.display = 'block';
                return;
            }

            // Giả lập lưu mật khẩu (thay bằng API thật)
            message.textContent = 'Mật khẩu đã được thay đổi thành công!';
            message.style.color = '#28a745';
            message.style.display = 'block';
            setTimeout(() => {
                message.style.display = 'none';
                document.getElementById('old-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }, 2000);
        });
    }
};


// Hàm đăng xuất toàn diện
async function logout() {
    try {
        const token = localStorage.getItem("token");
        
        // Gọi API logout backend (nếu có)
        if (token) {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        // Xóa toàn bộ dữ liệu người dùng
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userAccount");
        
        // Chuyển hướng về trang chủ
        window.location.href = "/src/main/webapp/pages/home.html";
        
    } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
        // Vẫn xóa dữ liệu dù API có lỗi
        localStorage.clear();
        window.location.href = "/src/main/webapp/pages/home.html";
    }
}
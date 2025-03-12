// Giả lập dữ liệu từ API
const fetchUserData = async () => {
    // Thay thế bằng API thật của bạn
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
        phoneVerified: false,
        emailVerified: true,
        avatar: "https://cdn-icons-png.flaticon.com/512/6858/6858504.png" // Hình ảnh mẫu
    };
    return data;
};

// Hàm cập nhật dữ liệu lên giao diện
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

    // Cập nhật trạng thái xác minh
    const phoneStatus = document.querySelector("#phone + .status");
    const emailStatus = document.querySelector("#email + .status");
    phoneStatus.textContent = userData.phoneVerified ? "Đã xác minh" : "Xác minh ngay";
    phoneStatus.classList.toggle("verified", userData.phoneVerified);
    phoneStatus.classList.toggle("not-verified", !userData.phoneVerified);
    emailStatus.textContent = userData.emailVerified ? "Đã xác minh" : "Xác minh ngay";
    emailStatus.classList.toggle("verified", userData.emailVerified);
    emailStatus.classList.toggle("not-verified", !userData.emailVerified);
};

// Tải dữ liệu khi trang được tải
window.onload = async () => {
    const userData = await fetchUserData();
    updateProfileInfo(userData);

    // Thêm chức năng lưu thay đổi (giả lập)
    const saveBtn = document.querySelector(".save-btn");
    saveBtn.addEventListener("click", () => {
        alert("Thông tin đã được lưu! (Chức năng giả lập)");
    });

    // Thêm chức năng chỉnh sửa ảnh (giả lập)
    const editBtn = document.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
        const newAvatar = prompt("Nhập URL ảnh mới:");
        if (newAvatar) {
            document.getElementById("avatar-img").src = newAvatar;
        }
    });
};
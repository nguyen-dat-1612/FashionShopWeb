// Hàm cập nhật giao diện sau đăng xuất
function updateLoginUI(isLoggedIn, loginBtn, registerBtn, profileIcon, cartIcon) {
    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'block';
    if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : 'block';
    if (profileIcon) profileIcon.style.display = isLoggedIn ? 'block' : 'none';
    if (cartIcon) cartIcon.style.display = isLoggedIn ? 'block' : 'none';
}

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

// Gắn sự kiện cho nút đăng xuất
document.getElementById("logout").addEventListener("click", logout);
async function fetchUserData() {
    try {
        console.log("[1] Bắt đầu lấy dữ liệu người dùng");
        
        const token = localStorage.getItem("token");
        console.log("[2] Token từ localStorage:", token);
        
        if (!token) {
            console.warn("[3] Không tìm thấy token, chuyển hướng đến trang login");
            window.location.href = "/src/main/webapp/pages/home.html";
            return;
        }

        // Sửa ở đây: thêm .replace() để loại bỏ dấu ngoặc kép nếu có
        let userId = localStorage.getItem("userId");
        if (userId) {
            userId = userId.replace(/^"+|"+$/g, ''); // Loại bỏ dấu " ở đầu và cuối
        }
        console.log("[4] UserID sau khi xử lý:", userId);
        
        if (!userId) {
            console.error("[5] Không tìm thấy userId hợp lệ");
            return;
        }

        console.log("[6] Chuẩn bị gọi API với URL:", `http://localhost:8080/api/users/${userId}`);
        
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Sử dụng biến token đã lấy trước đó
            }
        });

        console.log("[7] Phản hồi từ API - Status:", response.status, response.statusText);
        
        if (!response.ok) {
            const errorResponse = await response.json(); // Sửa thành .json() thay vì .text()
            console.error("[8] Chi tiết lỗi từ API:", errorResponse);
            throw new Error(`Lỗi khi lấy dữ liệu người dùng: ${errorResponse.message || response.statusText}`);
        }

        const apiResponse = await response.json();
        console.log("[9] Dữ liệu nhận được từ API:", apiResponse);
        
        return apiResponse.data;
    } catch (error) {
        console.error("[10] Lỗi trong quá trình xử lý:", error);
        console.warn("[11] Trả về dữ liệu mẫu do có lỗi xảy ra");
        
        // Trả về dữ liệu mẫu nếu API lỗi
        return {
            "id": "b70668cc-cea2-4139-b2ed-65b387cee67b",
            "img": null,
            "fullname": "Det",
            "email": "nguyendatthcspv@gmail.com",
            "phone": "0377398266",
            "address": "PVDPDP",
            "birthday": null,
            "gender": "true"
        };
    }
}
// Hàm cập nhật dữ liệu lên giao diện
function updateProfileInfo(userData) {
    document.getElementById("user-id").textContent = userData.id || "null";
    document.getElementById("fullname").value = userData.fullname || "null";
    document.getElementById("gender").value = userData.gender || "null";
    document.getElementById("phone").value = userData.phone || "null";
    document.getElementById("email").value = userData.email || "null";
    document.getElementById("address").value = userData.address || "null";
    document.getElementById("birthday").value = userData.birthday || "null";
    
    // Cập nhật avatar nếu có
    if (userData.img) {
        document.getElementById("avatar-img").src = userData.img;
    }
}

// Tải dữ liệu khi trang được tải
window.onload = async () => {
    const userData = await fetchUserData();
    updateProfileInfo(userData);
    
    // Mặc định cho phép chỉnh sửa luôn (không cần nút chỉnh sửa riêng)
    toggleEditMode(true);

    // Xử lý sự kiện cho nút lưu thay đổi
    const saveBtn = document.querySelector(".save-btn");
    saveBtn.addEventListener("click", async () => {
        try {
            const userId = localStorage.getItem("userId").replace(/^"+|"+$/g, '');
            
            const updatedData = {
                fullname: document.getElementById("fullname").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                address: document.getElementById("address").value,
                gender: document.getElementById("gender").value,
                birthday: document.getElementById("birthday").value
            };

            const updatedUser = await updateUser(userId, updatedData);
            updateProfileInfo(updatedUser);
            
            showAlert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error.message);
            showAlert("Cập nhật thất bại!");
        }
    });

    // Thêm chức năng chỉnh sửa ảnh (tạm thời chỉ là alert)
    const editAvatarBtn = document.querySelector(".edit-btn");
    editAvatarBtn.addEventListener("click", () => {
        alert("Chức năng chỉnh sửa ảnh sẽ được cập nhật sau!");
    });
};

// Hàm cập nhật thông tin người dùng
async function updateUser(userId, updatedData) {
    try {
        console.log("[UpdateUser] Bắt đầu cập nhật thông tin người dùng");
        console.log("[UpdateUser] UserID:", userId);
        console.log("[UpdateUser] Dữ liệu cập nhật:", updatedData);
        
        const token = localStorage.getItem("token");
        console.log("[UpdateUser] Token:", token);
        
        if (!token) {
            console.warn("[UpdateUser] Không tìm thấy token, chuyển hướng đến trang login");
            window.location.href = "/src/main/webapp/pages/home.html";
            return;
        }

        console.log("[UpdateUser] Chuẩn bị gọi API PATCH:", `http://localhost:8080/api/users/${userId}/update`);
        
        const response = await fetch(`http://localhost:8080/api/users/${userId}/update`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        console.log("[UpdateUser] Phản hồi từ API - Status:", response.status, response.statusText);
        
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("[UpdateUser] Chi tiết lỗi từ API:", errorResponse);
            showAlert("Cập nhật thông tin thất bại");
            throw new Error(errorResponse.message || "Cập nhật thông tin thất bại");
        }

        const apiResponse = await response.json();
        console.log("[UpdateUser] Dữ liệu nhận được từ API sau cập nhật:", apiResponse);
        
        return apiResponse.data;
    } catch (error) {
        console.error("[UpdateUser] Lỗi trong quá trình cập nhật:", error);
        throw error;
    }
}

function showAlert(message, duration = 3500) {
    const alertElement = document.getElementById("loginAlert");
    
    // Cập nhật nội dung với icon
    alertElement.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>' + message;
    
    // Hiển thị với hiệu ứng
    alertElement.classList.remove("d-none");
    setTimeout(() => {
      alertElement.classList.add("show");
    }, 10); // Delay nhẹ để chạy transition
    
    // Ẩn sau khoảng thời gian
    setTimeout(() => {
      alertElement.classList.remove("show");
      setTimeout(() => {
        alertElement.classList.add("d-none");
      }, 300); // Đợi hiệu ứng opacity hoàn tất
    }, duration);
  }

// Hàm bật/tắt chế độ chỉnh sửa
function toggleEditMode(isEditMode) {
    const inputs = document.querySelectorAll('.profile-info input, .profile-info select');
    inputs.forEach(input => {
        input.readOnly = !isEditMode;
        input.disabled = !isEditMode;
    });
}

// Hàm cập nhật dữ liệu lên giao diện
function updateProfileInfo(userData) {
    document.getElementById("user-id").textContent = userData.id || "null";
    document.getElementById("fullname").value = userData.fullname || "null";
    document.getElementById("gender").value = userData.gender || "null";
    document.getElementById("phone").value = userData.phone || "null";
    document.getElementById("email").value = userData.email || "null";
    document.getElementById("address").value = userData.address || "null";
    document.getElementById("birthday").value = userData.birthday || "null";
    
    if (userData.img) {
        document.getElementById("avatar-img").src = userData.img;
    }
}
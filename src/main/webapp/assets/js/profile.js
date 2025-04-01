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
            window.location.href = "/src/main/webapp/pages/login.html";
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

    // Thêm chức năng lưu thay đổi (tạm thời chỉ là alert)
    const saveBtn = document.querySelector(".save-btn");
    saveBtn.addEventListener("click", () => {
        alert("Chức năng lưu thay đổi sẽ được cập nhật sau!");
    });

    // Thêm chức năng chỉnh sửa ảnh (tạm thời chỉ là alert)
    const editBtn = document.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
        alert("Chức năng chỉnh sửa ảnh sẽ được cập nhật sau!");
    });
};
console.log("header.js bắt đầu chạy");

// Khai báo các biến toàn cục cần thiết
let loginBtn, registerBtn, profileIcon, cartIcon;

setupLogin();

function setupLogin() {
    console.log("Hàm setupLogin được gọi");
    
    // Lấy các phần tử DOM
    const loginForm = document.getElementById("loginForm");
    profileIcon = document.getElementById("profileIcon");
    cartIcon = document.getElementById("cartIcon");
    loginBtn = document.querySelector(".btn-outline-primary");
    registerBtn = document.querySelector(".btn-primary");

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    console.log("Trạng thái đăng nhập ban đầu:", isLoggedIn);
    
    if (isLoggedIn) {
        console.log("Người dùng đã đăng nhập, lấy thông tin tài khoản...");
        updateLoginUI(isLoggedIn);
        fetchUserAccount();
    } else {
        console.log("Người dùng chưa đăng nhập, ẩn các phần tử liên quan đến tài khoản");
        updateLoginUI(isLoggedIn);
    }

    // Xử lý sự kiện đăng nhập
    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    // Xử lý sự kiện click profile
    if (profileIcon) {
        profileIcon.addEventListener("click", handleProfileClick);
    }

    // Xử lý sự kiện click giỏ hàng
    if (cartIcon) {
        cartIcon.addEventListener("click", handleCartClick);
    }

    // Xử lý sự kiện đăng ký
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegisterSubmit);
    }
}

// Xử lý submit form đăng ký

async function handleRegisterSubmit(e) {
    e.preventDefault();
    console.log('Form đăng ký được submit');

    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const registerMessage = document.getElementById('registerMessage');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (!registerForm || !registerBtn) {
        console.error('Không tìm thấy các phần tử cần thiết');
        return;
    }

    try {
        // ========== VALIDATION ==========
        // Kiểm tra mật khẩu trùng khớp
        if (passwordInput.value !== confirmPasswordInput.value) {
            throw new Error('Mật khẩu xác nhận không khớp');
        }

        // Kiểm tra các trường bắt buộc
        if (!registerForm.checkValidity()) {
            registerForm.classList.add('was-validated');
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }

        // ========== LẤY DỮ LIỆU FORM ==========
        const formData = {
            fullname: document.getElementById('registerFullname').value,
            email: document.getElementById('registerEmail').value,
            password: passwordInput.value,
            phone: document.getElementById('registerPhone').value,
            address: document.getElementById('registerAddress').value,
            gender: document.querySelector('input[name="registerGender"]:checked').value,
            birthday: document.getElementById('registerBirthday').value
            
        };
        
        // ========== UI LOADING STATE ==========
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';
        
        if (registerMessage) {
            registerMessage.style.display = 'none';
        }

        // ========== GỬI REQUEST ==========
        const response = await fetch('http://localhost:8080/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại, vui lòng thử lại');
        }

        // ========== XỬ LÝ THÀNH CÔNG ==========
        console.log('Đăng ký thành công:', data);
        
        showMessage('success', 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
        
        //Reset form sau 2 giây
        setTimeout(() => {
            registerForm.reset();
            registerForm.classList.remove('was-validated');
            
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (modal) modal.hide();
            
            if (registerMessage) {
                registerMessage.style.display = 'none';
            }
        }, 4000);

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        
        showMessage('danger', error.message);
    } finally {
        // Khôi phục trạng thái nút
        registerBtn.disabled = false;
        registerBtn.textContent = 'Đăng Ký';
    }
}
function showMessage(type, text) {
    if (!registerMessage) return;
    registerMessage.textContent = text;
    registerMessage.className = `alert alert-${type}`;
    registerMessage.style.display = 'block';
}
// Xử lý submit form đăng nhập
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Lấy các phần tử DOM
    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");
    
    // Reset trạng thái
    loginForm.classList.remove('was-validated');
    loginMessage.classList.add('d-none');
    
    // Kiểm tra dữ liệu đầu vào
    if (!loginEmail.value || !loginPassword.value) {
        loginForm.classList.add('was-validated');
        return;
    }
    
    try {
        // Hiển thị trạng thái loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';
        
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                username: loginEmail.value, 
                password: loginPassword.value 
            }),
            credentials: "include"
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Đăng nhập thất bại");
        }
        
        if (result.code === 200) {
            // Đăng nhập thành công
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", result.data);
            
            // Cập nhật giao diện
            updateLoginUI(true);
            
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            modal.hide();
            
            // Lấy thông tin user
            await fetchUserInfo(result.data);
        } else {
            throw new Error(result.message || "Đăng nhập thất bại");
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        
        // Hiển thị thông báo lỗi
        loginMessage.textContent = error.message;
        loginMessage.classList.remove('d-none');
        
        // Cuộn lên đầu form để người dùng thấy lỗi
        loginMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
        // Khôi phục trạng thái nút submit
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Đăng Nhập';
    }
}
// Xử lý click vào profile
function handleProfileClick() {
    console.log("Click vào profile icon");
    if (localStorage.getItem("isLoggedIn") === "true") {
        console.log("Chuyển hướng đến trang profile");
        window.location.href = "/src/main/webapp/pages/profile.html";
    } else {
        showToast("Vui lòng đăng nhập để xem trang cá nhân", "info");
    }
}
// Xử lý click vào giỏ hàng
function handleCartClick() {
    console.log("Click vào cart icon");
    if (localStorage.getItem("isLoggedIn") === "true") {
        console.log("Chuyển hướng đến trang giỏ hàng");
        window.location.href = "/src/main/webapp/pages/cart.html";
    } else {
        showToast("Vui lòng đăng nhập để xem giỏ hàng", "info");
    }
}
// Lấy thông tin user từ API
async function fetchUserInfo(token) {
    try {
        // Thử các endpoint khác nhau để lấy thông tin user
        const endpoints = [
            "/api/users/me",
            "/api/users/account",
            "/api/user/info"
        ];
        
        let lastError;
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://localhost:8080${endpoint}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                
                if (!response.ok) continue;
                
                const result = await response.json();
                console.log("Thông tin user từ API:", result);
                
                if (result.code === 200 || result.id) {
                    const userData = result.data || result;
                    localStorage.setItem("userId", JSON.stringify(userData.id));
                    updateUserProfileUI(userData);
                    return userData;
                }
            } catch (error) {
                lastError = error;
                console.log(`Endpoint ${endpoint} không khả dụng:`, error);
                continue;
            }
        }
        
        throw lastError || new Error("Không thể lấy thông tin user từ bất kỳ endpoint nào");
    } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        throw error;
    }
}

// Lấy thông tin tài khoản
async function fetchUserAccount() {
    console.log("Gọi hàm fetchUserAccount");
    try {
        const token = localStorage.getItem("token");
        console.log("Token hiện tại:", token);
        
        if (!token) {
            console.log("Không có token, đăng xuất");
            logoutUser();
            return;
        }

        const userData = await fetchUserInfo(token);
        if (!userData) {
            logoutUser();
        }
    } catch (error) {
        console.error("Error fetching user account:", error);
        if (error.message.includes("Unauthorized") || error.message.includes("Invalid token")) {
            logoutUser();
        }
    }
}

// Đăng xuất người dùng
function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userAccount");
    updateLoginUI(false);
    console.log("Đã đăng xuất người dùng");
}

// Cập nhật giao diện với thông tin người dùng
function updateUserProfileUI(userData) {
    console.log("Cập nhật giao diện với thông tin người dùng:", userData);
    
    // Hiển thị tên người dùng
    const userNameElement = document.getElementById("userNameDisplay");
    if (userNameElement) {
        userNameElement.textContent = userData.fullname || userData.username || "Tài khoản";
        console.log("Đã cập nhật tên người dùng:", userNameElement.textContent);
    }
    
    // Cập nhật avatar
    const userAvatar = document.getElementById("userAvatar");
    if (userAvatar) {
        userAvatar.src = userData.img || userData.avatar || "https://via.placeholder.com/40";
        userAvatar.alt = userData.fullname || userData.username || "Avatar";
        console.log("Đã cập nhật avatar:", userAvatar.src);
    }
}

// Cập nhật giao diện đăng nhập
function updateLoginUI(isLoggedIn) {
    console.log("Cập nhật giao diện đăng nhập, trạng thái:", isLoggedIn);
    
    if (isLoggedIn) {
        console.log("Ẩn nút đăng nhập/đăng ký, hiển thị profile và cart");
        loginBtn?.classList.add("d-none");
        registerBtn?.classList.add("d-none");
        profileIcon?.classList.remove("d-none");
        cartIcon?.classList.remove("d-none");
        
        // Cập nhật thông tin người dùng
        const userData = JSON.parse(localStorage.getItem("userAccount") || "{}");
        updateUserProfileUI(userData);
    } else {
        console.log("Hiển thị nút đăng nhập/đăng ký, ẩn profile và cart");
        loginBtn?.classList.remove("d-none");
        registerBtn?.classList.remove("d-none");
        profileIcon?.classList.add("d-none");
        cartIcon?.classList.add("d-none");
    }
}

// Hiển thị thông báo
function showToast(message, type = "info") {
    console.log(`Toast [${type}]: ${message}`);
    // Triển khai hiển thị thông báo phù hợp với hệ thống của bạn
    // Ví dụ sử dụng Toastify, Bootstrap Toast, hoặc alert đơn giản
    alert(`${type.toUpperCase()}: ${message}`);
}
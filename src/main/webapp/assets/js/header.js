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
        fetchUserAccount();
    }
    updateLoginUI(isLoggedIn);

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

// Xử lý submit form đăng nhập
async function handleLoginSubmit(e) {
    e.preventDefault();
    console.log("Form đăng nhập được submit");

    const username = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    console.log("Thông tin đăng nhập:", { username, password });

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Kết quả đăng nhập từ API:", result);

        if (result.code === 200) {
            console.log("Đăng nhập thành công, lưu thông tin vào localStorage");
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", result.data);
            
            try {
                const userData = await fetchUserInfo(result.data);
                if (userData) {
                    updateLoginUI(true);
                    const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
                    modal.hide();
                    showToast("Đăng nhập thành công!", "success");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin user:", error);
                showToast("Đăng nhập thành công nhưng không lấy được thông tin người dùng", "warning");
            }
        } else {
            console.log("Đăng nhập thất bại:", result.message);
            showToast(`Đăng nhập thất bại: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        showToast("Có lỗi xảy ra, vui lòng thử lại!", "error");
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

// Xử lý submit form đăng ký
async function handleRegisterSubmit(e) {
    e.preventDefault();
    console.log("Form đăng ký được submit");

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    console.log("Thông tin đăng ký:", { email, password, confirmPassword });

    if (password !== confirmPassword) {
        console.log("Mật khẩu không khớp");
        showToast("Mật khẩu không khớp!", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Kết quả đăng ký từ API:", result);

        if (result.code === 200) {
            console.log("Đăng ký thành công");
            showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
            bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
        } else {
            console.log("Đăng ký thất bại:", result.message);
            showToast(`Đăng ký thất bại: ${result.message}`, "error");
        }
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        showToast("Có lỗi xảy ra, vui lòng thử lại!", "error");
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
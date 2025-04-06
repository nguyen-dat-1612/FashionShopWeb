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

// // Thiết lập sự kiện đăng ký 
// function setupRegister() {
//     console.log('Thiết lập sự kiện đăng ký');
    
//     const registerForm = document.getElementById('registerForm');
//     const passwordInput = document.getElementById('registerPassword');
//     const confirmPasswordInput = document.getElementById('confirmPassword');
//     const passwordError = document.getElementById('passwordError');
//     const registerMessage = document.getElementById('registerMessage');
    
//     // Kiểm tra sự tồn tại của các phần tử
//     if (!registerForm) {
//         console.error('Không tìm thấy form đăng ký');
//         return;
//     }
    
//     // Kiểm tra mật khẩu trùng khớp khi nhập
//     if (confirmPasswordInput && passwordInput) {
//         confirmPasswordInput.addEventListener('input', validatePassword);
//         passwordInput.addEventListener('input', validatePassword);
//     }
    
//     // Xử lý sự kiện submit form
//     registerForm.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         // Validate trước khi submit
//         if (!validateForm()) {
//             return;
//         }
        
//         // Lấy dữ liệu từ form
//         const formData = getFormData();
        
//         // Gửi dữ liệu (có thể là AJAX call)
//         submitRegistration(formData);
//     });
    
//     function validatePassword() {
//         if (passwordInput.value !== confirmPasswordInput.value) {
//             if (passwordError) {
//                 passwordError.style.display = 'block';
//             }
//             confirmPasswordInput.setCustomValidity('Mật khẩu không khớp');
//             return false;
//         } else {
//             if (passwordError) {
//                 passwordError.style.display = 'none';
//             }
//             confirmPasswordInput.setCustomValidity('');
//             return true;
//         }
//     }
    
//     function validateForm() {
//         // Kiểm tra tất cả các trường bắt buộc
//         if (!registerForm.checkValidity()) {
//             registerForm.classList.add('was-validated');
//             return false;
//         }
        
//         // Kiểm tra mật khẩu
//         if (!validatePassword()) {
//             return false;
//         }
        
//         // Thêm các validation khác nếu cần
//         return true;
//     }
    
//     function getFormData() {
//         return {
//             fullname: document.getElementById('registerFullname').value,
//             email: document.getElementById('registerEmail').value,
//             password: passwordInput.value,
//             phone: document.getElementById('registerPhone').value,
//             address: document.getElementById('registerAddress').value,
//             gender: document.querySelector('input[name="registerGender"]:checked').value,
//             birthday: document.getElementById('registerBirthday').value
//         };
//     }
// }
// // Gắn sự kiện mới
// registerForm.addEventListener('submit', function(e) {
//     console.log('Sự kiện submit được kích hoạt');
//     handleRegisterSubmit(e).catch(error => {
//         console.error('Lỗi khi xử lý đăng ký:', error);
//     });
// });
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
        
        // Hiển thị thông báo
        if (registerMessage) {
            registerMessage.textContent = 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.';
            registerMessage.className = 'alert alert-success';
            registerMessage.style.display = 'block';
        }
        
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
        }, 10001000);

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        
        // Hiển thị thông báo lỗi
        if (registerMessage) {
            registerMessage.textContent = error.message;
            registerMessage.className = 'alert alert-danger';
            registerMessage.style.display = 'block';
        }
    } finally {
        // Khôi phục trạng thái nút
        registerBtn.disabled = false;
        registerBtn.textContent = 'Đăng Ký';
    }
}
// Xử lý submit form đăng nhập
async function handleLoginSubmit(e) {
    e.preventDefault();
    console.log("%c Form đăng nhập được submit", "background: #ddd; color: #333; padding: 2px; border-radius: 2px;");

    // Kiểm tra và log DOM elements
    const loginEmailElement = document.getElementById("loginEmail");
    const loginPasswordElement = document.getElementById("loginPassword");
    
    if (!loginEmailElement) {
        console.error("Không tìm thấy element loginEmail");
        showToast("Lỗi: Không tìm thấy trường email", "error");
        return;
    }
    
    if (!loginPasswordElement) {
        console.error("Không tìm thấy element loginPassword");
        showToast("Lỗi: Không tìm thấy trường mật khẩu", "error");
        return;
    }

    const username = loginEmailElement.value;
    const password = loginPasswordElement.value;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username) {
        console.warn("Email/username trống");
        showToast("Vui lòng nhập email/username", "warning");
        return;
    }
    
    if (!password) {
        console.warn("Mật khẩu trống");
        showToast("Vui lòng nhập mật khẩu", "warning");
        return;
    }
    
    console.log("Thông tin đăng nhập:", { 
        username, 
        password: password ? "***" : "trống",
        usernameLength: username.length,
        passwordLength: password.length
    });

    try {
        console.time("API request time");
        console.log("Đang gửi request đến:", "http://localhost:8080/api/auth/login");
        console.log("Dữ liệu gửi đi:", JSON.stringify({ username, password: "***" }));
        
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include" // Thêm để xử lý cookie nếu cần
        });
        
        console.timeEnd("API request time");
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries([...response.headers]));
        
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}, Text: ${response.statusText}`);
            
            // Cố gắng đọc lỗi từ response body nếu có
            try {
                const errorBody = await response.text();
                console.error("Response body:", errorBody);
                
                try {
                    const errorJson = JSON.parse(errorBody);
                    console.error("Phân tích lỗi từ JSON:", errorJson);
                    throw new Error(`Lỗi từ server: ${errorJson.message || JSON.stringify(errorJson)}`);
                } catch (jsonError) {
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
                }
            } catch (bodyError) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        
        let result;
        try {
            const rawText = await response.text();
            console.log("Raw response text:", rawText);
            
            try {
                result = JSON.parse(rawText);
                console.log("Kết quả đăng nhập từ API:", result);
            } catch (jsonError) {
                console.error("Lỗi khi parse JSON:", jsonError);
                console.error("Text nhận được:", rawText);
                throw new Error("Server trả về dữ liệu không phải JSON hợp lệ");
            }
        } catch (textError) {
            console.error("Lỗi khi đọc response text:", textError);
            throw new Error("Không thể đọc dữ liệu phản hồi từ server");
        }

        if (result.code === 200) {
            console.log("%c Đăng nhập thành công! ", "background: #4CAF50; color: white; padding: 2px; border-radius: 2px;");
            console.log("Token nhận được:", result.data ? `${result.data.substring(0, 10)}...` : "không có");
            
            if (!result.data) {
                console.warn("Token trống hoặc không tồn tại trong kết quả");
                showToast("Đăng nhập thành công nhưng không nhận được token", "warning");
                return;
            }
            
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", result.data);
            console.log("Đã lưu token vào localStorage");
            
            try {
                console.time("Fetch user info time");
                console.log("Đang lấy thông tin người dùng với token");
                const userData = await fetchUserInfo(result.data);
                console.timeEnd("Fetch user info time");
                
                console.log("Dữ liệu người dùng nhận được:", userData);
                
                if (userData) {
                    console.log("Cập nhật UI đăng nhập");
                    updateLoginUI(true);
                    
                    const modalElement = document.getElementById("loginModal");
                    if (!modalElement) {
                        console.error("Không tìm thấy element loginModal");
                    } else {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (!modal) {
                            console.error("Không thể lấy instance của Bootstrap Modal");
                            console.log("Thử đóng modal bằng jQuery nếu có");
                            try {
                                if (typeof $ !== 'undefined') {
                                    $("#loginModal").modal("hide");
                                    console.log("Đã đóng modal bằng jQuery");
                                }
                            } catch (jqueryError) {
                                console.error("Lỗi khi dùng jQuery:", jqueryError);
                            }
                        } else {
                            modal.hide();
                            console.log("Đã đóng modal đăng nhập");
                        }
                    }
                    
                    // showToast("Đăng nhập thành công!", "success");
                } else {
                    console.warn("userData trống hoặc undefined");
                    // showToast("Đăng nhập thành công nhưng dữ liệu người dùng trống", "warning");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin user:", error);
                console.error("Stack trace:", error.stack);
                // showToast("Đăng nhập thành công nhưng không lấy được thông tin người dùng", "warning");
            }
        } else {
            console.warn("Đăng nhập thất bại:", result);
            console.log("Mã lỗi:", result.code);
            console.log("Thông báo lỗi:", result.message);
            // showToast(`Đăng nhập thất bại: ${result.message || "Không có thông báo lỗi"}`, "error");
        }
    } catch (error) {
        console.error("%c ❌ Lỗi khi đăng nhập: ", "background: #f44336; color: white; padding: 2px; border-radius: 2px;", error);
        console.error("Chi tiết lỗi:", error.message);
        console.error("Stack trace:", error.stack);
        // showToast(`Có lỗi xảy ra: ${error.message}`, "error");
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
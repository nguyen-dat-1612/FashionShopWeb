// src/main/webapp/assets/js/header.js

console.log("header.js bắt đầu chạy");
setupLogin(); // Gọi ngay lập tức vì script được load sau khi header đã có

function setupLogin() {
    const loginForm = document.getElementById("loginForm");
    console.log("loginForm:", loginForm); // Kiểm tra xem form có được tìm thấy không
    const profileIcon = document.getElementById("profileIcon");
    const cartIcon = document.getElementById("cartIcon");
    const loginBtn = document.querySelector(".btn-outline-primary");
    const registerBtn = document.querySelector(".btn-primary");

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    updateLoginUI(isLoggedIn, loginBtn, registerBtn, profileIcon, cartIcon);

    if (loginForm) {
        console.log("Bắt đầu gắn sự kiện submit"); // Xác nhận vào được if
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("Submit event triggered"); // Xác nhận submit chạy

            const username = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            console.log("Username:", username, "Password:", password); // Log giá trị nhập

            try {
                console.log("Gửi request đến API...");
                const response = await fetch("http://localhost:8080/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const result = await response.json();
                console.log("API Response:", result);

                if (result.code === 200) {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("token", result.data.token);
                    localStorage.setItem("user", JSON.stringify(result.data.user));

                    console.log("token",result.data.token );
                    console.log("user",result.data.user );
                    const profileIcon = document.getElementById("profileIcon");
                    const cartIcon = document.getElementById("cartIcon");
                    const loginBtn = document.querySelector(".btn-outline-primary");
                    const registerBtn = document.querySelector(".btn-primary");

                    updateLoginUI(true, loginBtn, registerBtn, profileIcon, cartIcon);

                    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
                    modal.hide();
                    alert("Đăng nhập thành công!");
                } else {
                    alert("Đăng nhập thất bại: " + result.message);
                }
            } catch (error) {
                console.error("Lỗi khi đăng nhập:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại!");
            }
        });
    } else {
        console.log("loginForm không tồn tại trong DOM!");
    }

    // Xử lý click vào profile
    if (profileIcon) {
        profileIcon.addEventListener("click", function () {
            if (localStorage.getItem("isLoggedIn") === "true") {
                window.location.href = "/src/main/webapp/pages/profile.html";
            }
        });
    }

    // Xử lý click vào giỏ hàng
    if (cartIcon) {
        cartIcon.addEventListener("click", function () {
            if (localStorage.getItem("isLoggedIn") === "true") {
                window.location.href = "/src/main/webapp/pages/cart.html";
            }
        });
    }

    // Xử lý form đăng ký (nếu cần)
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Mật khẩu không khớp!");
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
                const result = await response.json();

                if (result.code === 200) {
                    alert("Đăng ký thành công! Vui lòng đăng nhập.");
                    bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
                } else {
                    alert("Đăng ký thất bại: " + result.message);
                }
            } catch (error) {
                console.error("Lỗi khi đăng ký:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại!");
            }
        });
    }
}

// Hàm cập nhật giao diện dựa trên trạng thái đăng nhập
function updateLoginUI(isLoggedIn, loginBtn, registerBtn, profileIcon, cartIcon) {
    if (isLoggedIn) {
        loginBtn?.classList.add("d-none");
        registerBtn?.classList.add("d-none");
        profileIcon?.classList.remove("d-none");
        cartIcon?.classList.remove("d-none");
    } else {
        loginBtn?.classList.remove("d-none");
        registerBtn?.classList.remove("d-none");
        profileIcon?.classList.add("d-none");
        cartIcon?.classList.add("d-none");
    }
}

// Hàm đăng xuất (thêm nếu cần)
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // Tải lại trang để cập nhật giao diện
}
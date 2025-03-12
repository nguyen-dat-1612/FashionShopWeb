import CONFIG from '/src/main/webapp/config.js';

const API_BASE_URL = `http://${CONFIG.BASE_URL}/api/auth/login`;

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("#loginForm");

    function updateAuthUI() {
        const authContainer = document.querySelector("#authContainer");
        
        if (!authContainer) {
            console.error("authContainer not found! Retrying...");
            setTimeout(updateAuthUI, 500); // Đợi 500ms và thử lại
            return;
        }

        const token = localStorage.getItem("accessToken");
        const username = localStorage.getItem("username") || "My Account";

        if (token) {
            authContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        ${username}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="#">Profile</a></li>
                        <li><a class="dropdown-item" href="#">Orders</a></li>
                        <li><a class="dropdown-item" href="#">Settings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item" id="logoutBtn">Logout</button></li>
                    </ul>
                </div>
            `;

            document.querySelector("#logoutBtn").addEventListener("click", logout);
        } else {
            authContainer.innerHTML = `
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
                <button class="btn btn-primary ms-2" data-bs-toggle="modal" data-bs-target="#registerModal">Sign Up</button>
            `;
        }
        console.log("UI updated after login/logout!");
    }

    async function handleLogin(event) {
        event.preventDefault();
        const email = document.querySelector("#loginEmail").value;
        const password = document.querySelector("#loginPassword").value;

        console.log("Attempting login with:", email, password);

        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: email, password }),
            });

            const result = await response.json();
            console.log("Login response:", result);

            if (response.ok && result.code === 200) {
                localStorage.setItem("accessToken", result.data.accessToken);
                localStorage.setItem("refreshToken", result.data.refreshToken);
                localStorage.setItem("username", result.data.username || email);

                updateAuthUI();

                let modal = document.querySelector("#loginModal");
                let modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                modalInstance.hide();
            } else {
                alert(result.message || "Login failed! Please check your credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        }
    }

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        updateAuthUI();
    }

    document.addEventListener("click", function (event) {
        if (event.target.id === "logoutBtn") {
            logout();
        }
    });

    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    // Chỉ gọi updateAuthUI sau khi header đã được nạp
    fetch("/src/main/webapp/pages/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
            updateAuthUI(); // Gọi sau khi header đã nạp xong
        });
});
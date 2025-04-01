// File: /src/main/webapp/assets/js/sidebar.js
document.addEventListener("DOMContentLoaded", function() {
    // Highlight menu hiện tại
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".menu-item").forEach(item => {
        if (item.dataset.target === currentPage) {
            item.classList.add("active");
        }
    });

    // Xử lý chuyển trang
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", function() {
            if (this.id === "logout") {
                localStorage.removeItem("token");
                window.location.href = "/src/main/webapp/pages/login.html";
            } else {
                window.location.href = `/src/main/webapp/pages/${this.dataset.target}`;
            }
        });
    });
});
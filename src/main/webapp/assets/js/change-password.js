document.addEventListener("DOMContentLoaded", function() {
    console.log('Trang đổi mật khẩu đã được tải hoàn toàn');
    
    // Lấy các phần tử DOM cần thiết
    const savePasswordBtn = document.getElementById('save-password');
    const oldPasswordInput = document.getElementById('old-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageElement = document.getElementById('message');

    console.log('Các phần tử DOM đã được lấy:', {
        savePasswordBtn,
        oldPasswordInput,
        newPasswordInput,
        confirmPasswordInput,
        messageElement
    });

    // Xử lý sự kiện click nút Lưu thay đổi
    savePasswordBtn.addEventListener('click', handleChangePassword);
    console.log('Đã gắn sự kiện click cho nút Lưu thay đổi');

    // Xử lý logout nếu có
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.style.cursor = 'pointer';
        logoutButton.addEventListener('click', logout);
        console.log('Đã gắn sự kiện click cho nút Đăng xuất');
    }

    // Hàm xử lý đổi mật khẩu
    async function handleChangePassword() {
        console.log('Bắt đầu xử lý đổi mật khẩu...');
        
        // Kiểm tra đăng nhập
        const token = localStorage.getItem("token");
        const userId = JSON.parse(localStorage.getItem("userId"));
        
        console.log('Thông tin đăng nhập:', { token, userId });

        if (!token || !userId) {
            console.error('Người dùng chưa đăng nhập hoặc phiên đã hết hạn');
            showMessage('Vui lòng đăng nhập để thực hiện thao tác này');
            setTimeout(() => {
                window.location.href = "/src/main/webapp/pages/home.html";
            }, 1500);
            return;
        }

        // Reset message
        resetMessage();

        // Lấy giá trị từ input
        const oldPassword = oldPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        console.log('Giá trị nhập vào:', { oldPassword, newPassword, confirmPassword });

        // Validate input
        if (!validateInputs(oldPassword, newPassword, confirmPassword)) {
            return;
        }

        try {
            console.log('Đang gọi API đổi mật khẩu...');
            
            const apiUrl = `http://localhost:8080/api/users/${userId}/change_password`;
            console.log('URL API:', apiUrl);
            
            const response = await fetch(`http://localhost:8080/api/users/${userId}/change_password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            console.log('Phản hồi từ API:', {
                code: response.code,
                message: response.message
            });

            const result = await response.json();
            console.log('Phản hồi từ API:', result);

            if (response.ok && result.code === 200) {
                console.log('Đổi mật khẩu thành công');
                showMessage("Đổi mật khẩu thành công!", 'success');
                resetForm();
                
                // // Tự động chuyển hướng sau 2 giây
                // setTimeout(() => {
                //     window.location.href = "/src/main/webapp/pages/profile.html";
                // }, 2000);
            } else {
                console.error('Lỗi từ API:', result.code + result.message);
                if (result.code === 1003) {
                    showMessage('Mật khẩu hiện tại không chính xác', 'error');
                } else if (result.code === 401) {
                    showMessage('Bạn không có quyền thực hiện thao tác này', 'error');
                } else if (result.code === 500) {
                    showMessage('Có lỗi xảy ra trên máy chủ', 'error');
                } else {
                    showMessage(result.message || 'Đổi mật khẩu thất bại', 'error');
                }
            }
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            showMessage('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau');
        }
    }

    // Hàm validate input
    function validateInputs(oldPassword, newPassword, confirmPassword) {
        console.log('Bắt đầu validate input...');
        
        if (!oldPassword || !newPassword || !confirmPassword) {
            console.warn('Validation failed: Thiếu thông tin nhập vào');
            showMessage('Vui lòng điền đầy đủ thông tin');
            return false;
        }

        if (newPassword !== confirmPassword) {
            console.warn('Validation failed: Mật khẩu mới không khớp');
            showMessage('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return false;
        }

        if (newPassword.length < 6) {
            console.warn('Validation failed: Mật khẩu quá ngắn');
            showMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }

        if (oldPassword === newPassword) {
            console.warn('Validation failed: Mật khẩu mới giống mật khẩu cũ');
            showMessage('Mật khẩu mới phải khác mật khẩu cũ');
            return false;
        }

        console.log('Validation thành công');
        return true;
    }

    // Hàm reset form
    function resetForm() {
        console.log('Đang reset form...');
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    }

    // Hàm reset message
    function resetMessage() {
        messageElement.style.display = 'none';
        messageElement.textContent = '';
    }

    // Hàm hiển thị thông báo
    function showMessage(message, type = 'error') {
        console.log(`Hiển thị thông báo: ${message} (${type})`);
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        messageElement.style.color = type === 'success' ? '#28a745' : '#dc3545';
    }

    // Hàm đăng xuất
    async function logout() {
        console.log('Bắt đầu quá trình đăng xuất...');
        
        try {
            const token = localStorage.getItem("token");
            console.log('Token hiện tại:', token);
            
            if (token) {
                console.log('Đang gọi API logout...');
                await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('API logout thành công');
            }

            // Xóa toàn bộ dữ liệu người dùng
            console.log('Đang xóa dữ liệu localStorage...');
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userAccount");
            
            console.log('Chuyển hướng về trang chủ...');
            window.location.href = "/src/main/webapp/pages/home.html";
            
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            localStorage.clear();
            window.location.href = "/src/main/webapp/pages/home.html";
        }
    }
});
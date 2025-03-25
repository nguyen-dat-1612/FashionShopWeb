// API Endpoints
const API_BASE_URL = 'http://localhost:8080/api';
const BRANDS_API = `${API_BASE_URL}/brands`;
const CATEGORIES_API = `${API_BASE_URL}/categories`;
const PRODUCTS_API = `${API_BASE_URL}/products/create`;

// DOM Elements
const productForm = document.getElementById('productForm');
const productDesc = document.getElementById('productDesc');
const descCount = document.getElementById('descCount');
const thumbnailInput = document.getElementById('productThumbnail');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const thumbnailName = document.getElementById('thumbnailName');
const imagesInput = document.getElementById('productImages');
const imagesPreview = document.getElementById('imagesPreview');
const imagesName = document.getElementById('imagesName');
const variantsContainer = document.getElementById('variantsContainer');
const addVariantBtn = document.getElementById('addVariantBtn');
const resetBtn = document.getElementById('resetBtn');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');

// Global variables
let brands = [];
let categories = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    loadBrands();
    loadCategories();
    setupEventListeners();
});

// Load brands from API
async function loadBrands() {
    try {
        console.log('Fetching brands from:', BRANDS_API);
        const response = await fetch(BRANDS_API);
        console.log('Brands API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Không thể tải danh sách thương hiệu - Status: ${response.status}`);
        }
        
        const result = await response.json(); // Lấy toàn bộ object
        brands = result.data; // Gán mảng từ thuộc tính 'data'
        console.log('Brands data received:', brands);
        
        const brandSelect = document.getElementById('productBrand');
        
        while (brandSelect.options.length > 1) {
            brandSelect.remove(1);
        }
        
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.name;
            brandSelect.appendChild(option);
        });
        console.log('Brands dropdown populated successfully');
    } catch (error) {
        console.error('Error loading brands:', error.message);
        showNotification('error', `Lỗi: ${error.message}`);
    }
}

// Load categories from API
async function loadCategories() {
    try {
        console.log('Fetching categories from:', CATEGORIES_API);
        const response = await fetch(CATEGORIES_API);
        console.log('Categories API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Không thể tải danh sách danh mục - Status: ${response.status}`);
        }
        
        const result = await response.json(); // Lấy toàn bộ object
        categories = result.data; // Gán mảng từ thuộc tính 'data'
        console.log('Categories data received:', categories);
        
        const categorySelect = document.getElementById('productCategory');
        
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        console.log('Categories dropdown populated successfully');
    } catch (error) {
        console.error('Error loading categories:', error.message);
        showNotification('error', `Lỗi: ${error.message}`);
    }
}
// Setup event listeners
function setupEventListeners() {
    // Character count for description
    productDesc.addEventListener('input', () => {
        descCount.textContent = productDesc.value.length;
        console.log('Description character count updated:', productDesc.value.length);
    });
    
    // Thumbnail preview
    thumbnailInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            thumbnailName.textContent = file.name;
            displayImagePreview(file, thumbnailPreview);
            console.log('Thumbnail selected:', file.name);
        }
    });
    
    // Multiple images preview
    imagesInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            imagesName.textContent = `${files.length} ảnh đã chọn`;
            imagesPreview.innerHTML = '';
            console.log('Multiple images selected:', files.length);
            
            Array.from(files).forEach(file => {
                const previewContainer = document.createElement('div');
                previewContainer.className = 'image-preview';
                
                displayImagePreview(file, previewContainer);
                imagesPreview.appendChild(previewContainer);
            });
        }
    });
    
    // Add variant button
    addVariantBtn.addEventListener('click', addVariant);
    
    // Reset form
    resetBtn.addEventListener('click', resetForm);
    
    // Form submission
    productForm.addEventListener('submit', handleSubmit);
}

// Add new variant
function addVariant() {
    const variantItem = document.createElement('div');
    variantItem.className = 'variant-item';
    
    variantItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Màu sắc</label>
                <input type="text" class="variant-color" placeholder="Ví dụ: Đỏ, Xanh...">
            </div>
            <div class="form-group">
                <label>Kích thước</label>
                <input type="text" class="variant-size" placeholder="Ví dụ: S, M, L...">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Giá</label>
                <input type="number" class="variant-price" min="0" step="1000" placeholder="Nếu khác giá chung">
            </div>
            <div class="form-group">
                <label>Số lượng</label>
                <input type="number" class="variant-quantity" min="1" value="1">
            </div>
        </div>
        <div class="form-group">
            <label>Ảnh biến thể (nếu có)</label>
            <div class="file-upload">
                <input type="file" class="variant-image" accept="image/*">
                <label class="upload-btn">
                    <i class="fas fa-cloud-upload-alt"></i> Chọn ảnh
                </label>
            </div>
        </div>
        <button type="button" class="remove-variant-btn">
            <i class="fas fa-trash"></i> Xóa biến thể
        </button>
    `;
    
    variantsContainer.appendChild(variantItem);
    console.log('New variant added');
    
    // Add event listener to remove button
    const removeBtn = variantItem.querySelector('.remove-variant-btn');
    removeBtn.addEventListener('click', () => {
        variantsContainer.removeChild(variantItem);
        console.log('Variant removed');
    });
    
    // Add event listener for image preview
    const imageInput = variantItem.querySelector('.variant-image');
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create preview container if it doesn't exist
            let previewContainer = variantItem.querySelector('.image-preview');
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'image-preview';
                variantItem.querySelector('.form-group').appendChild(previewContainer);
            }
            
            displayImagePreview(file, previewContainer);
            console.log('Variant image selected:', file.name);
        }
    });
}

// Display image preview
function displayImagePreview(file, container) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        container.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        container.appendChild(img);
        console.log('Image preview displayed for:', file.name);
    };
    
    reader.readAsDataURL(file);
}

// Reset form
function resetForm() {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu đã nhập?')) {
        productForm.reset();
        descCount.textContent = '0';
        thumbnailPreview.innerHTML = '';
        thumbnailName.textContent = 'Chưa chọn ảnh';
        imagesPreview.innerHTML = '';
        imagesName.textContent = 'Chưa chọn ảnh';
        
        // Remove all variants except the first one
        const variantItems = variantsContainer.querySelectorAll('.variant-item');
        variantItems.forEach((item, index) => {
            if (index > 0) {
                variantsContainer.removeChild(item);
            } else {
                // Reset the first variant
                item.querySelector('.variant-color').value = '';
                item.querySelector('.variant-size').value = '';
                item.querySelector('.variant-price').value = '';
                item.querySelector('.variant-quantity').value = '1';
                
                const imageInput = item.querySelector('.variant-image');
                imageInput.value = '';
                
                const preview = item.querySelector('.image-preview');
                if (preview) preview.innerHTML = '';
            }
        });
        console.log('Form reset completed');
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Prepare form data
    const formData = new FormData();
    
    // Basic product info
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', productDesc.value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock_quantity', document.getElementById('productStock').value);
    formData.append('category_id', document.getElementById('productCategory').value);
    formData.append('brand_id', document.getElementById('productBrand').value);
    
    // Thumbnail
    if (thumbnailInput.files[0]) {
        formData.append('thumbnail', thumbnailInput.files[0]);
    }
    
    // Additional images
    if (imagesInput.files.length > 0) {
        Array.from(imagesInput.files).forEach((file, index) => {
            formData.append(`images`, file);
        });
    }
    
    // Variants
    const variantItems = variantsContainer.querySelectorAll('.variant-item');
    const productVariantList = [];
    
    variantItems.forEach(item => {
        const variant = {
            color: item.querySelector('.variant-color').value,
            size: item.querySelector('.variant-size').value,
            price: item.querySelector('.variant-price').value || document.getElementById('productPrice').value,
            quantity: item.querySelector('.variant-quantity').value,
            image: ''
        };
        
        // Handle variant image if exists
        const imageInput = item.querySelector('.variant-image');
        if (imageInput.files[0]) {
            const imageFile = imageInput.files[0];
            const imageName = `variant_${Date.now()}_${imageFile.name}`;
            formData.append('variant_images', imageFile, imageName);
            variant.image = imageName;
        }
        
        productVariantList.push(variant);
    });
    
    formData.append('productVariantList', JSON.stringify(productVariantList));
    
    // Submit form
    console.log('Preparing to submit form data');
    console.log('Form data entries:', [...formData.entries()]);
    
    try {
        console.log('Submitting to:', PRODUCTS_API);
        const response = await fetch(PRODUCTS_API, {
            method: 'POST',
            body: formData
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || `Lỗi khi thêm sản phẩm - Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Product submission successful, result:', result);
        showNotification('success', 'Thêm sản phẩm thành công!');
        resetForm();
    } catch (error) {
        console.error('Error submitting form:', error.message);
        showNotification('error', `Lỗi: ${error.message}`);
    }
}

// Validate form
function validateForm() {
    // Check description length
    if (productDesc.value.length < 100) {
        console.log('Validation failed: Description too short');
        showNotification('error', 'Mô tả phải có ít nhất 100 ký tự');
        return false;
    }
    
    // Check thumbnail
    if (!thumbnailInput.files[0]) {
        console.log('Validation failed: No thumbnail selected');
        showNotification('error', 'Vui lòng chọn ảnh đại diện cho sản phẩm');
        return false;
    }
    
    // Check variants
    const variantItems = variantsContainer.querySelectorAll('.variant-item');
    if (variantItems.length === 0) {
        console.log('Validation failed: No variants added');
        showNotification('error', 'Vui lòng thêm ít nhất một biến thể sản phẩm');
        return false;
    }
    
    console.log('Form validation passed');
    return true;
}

// Show notification
function showNotification(type, message) {
    notification.className = `notification ${type}`;
    notificationMessage.textContent = message;
    notification.classList.add('show');
    console.log(`Notification shown: ${type} - ${message}`);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
// src/main/webapp/assets/js/home.js
document.addEventListener("DOMContentLoaded", async function () {
  await loadCategories();
  await loadFeaturedProducts();
});

async function loadCategories() {
  try {
      const response = await fetch("http://localhost:8080/api/categories");
      const result = await response.json();
      if (result.code === 200) {
          const categories = result.data;
          const categoryList = document.getElementById("category-list");
          categoryList.innerHTML = "";
          categories.forEach((category) => {
              const categoryCard = `
                  <div class="category-card">
                      <h3>${category.name}</h3>
                  </div>
              `;
              categoryList.innerHTML += categoryCard;
          });
      } else {
          console.error("Lỗi API: Không lấy được danh mục sản phẩm");
      }
  } catch (error) {
      console.error("Lỗi khi tải danh mục sản phẩm:", error);
  }
}

async function loadFeaturedProducts() {
  try {
      const response = await fetch("http://localhost:8080/api/products");
      const result = await response.json();
      if (result.code === 200) {
          const featuredProducts = result.data;
          const productList = document.getElementById("products-list");
          productList.innerHTML = "";
          featuredProducts.forEach((product) => {
              const productCard = `
                  <div class="product-card" onclick="window.location.href='/src/main/webapp/pages/product-detail.html?id=${product.id}'">
                      <img src="${product.thumbnail || 'https://via.placeholder.com/150'}" alt="${product.name}">
                      <h5>${product.name}</h5>
                      <p>${parseInt(product.price).toLocaleString()} VNĐ</p>
                      <small>${product.brand ? product.brand.name : "Không rõ thương hiệu"}</small>
                  </div>
              `;
              productList.innerHTML += productCard;
          });
      } else {
          console.error("Lỗi API: Không lấy được danh sách sản phẩm");
      }
  } catch (error) {
      console.error("Lỗi khi tải sản phẩm nổi bật:", error);
  }
}

function loadComponent(id, file, callback) {
  fetch(file)
      .then((response) => response.text())
      .then((data) => {
          document.getElementById(id).innerHTML = data;
          if (callback) callback();
      })
      .catch((error) => console.error("Lỗi khi tải component:", error));
}

// Load header và chạy header.js sau khi header được chèn
loadComponent("header", "/src/main/webapp/components/header.html", function () {
  const script = document.createElement("script");
  script.src = "/src/main/webapp/assets/js/header.js";
  script.onload = function () {
      console.log("header.js đã load xong và chạy setupLogin");
  };
  document.body.appendChild(script);
});
loadComponent("footer", "/src/main/webapp/components/footer.html");
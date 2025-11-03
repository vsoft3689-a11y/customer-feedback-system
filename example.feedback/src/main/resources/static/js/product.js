const API_BASE = "http://localhost:8080/api";

$(function() {
  loadProducts();

  // Load products from API and display in table
  function loadProducts() {
    $.ajax({
      url: `${API_BASE}/products`,
      method: "GET",
      success: function(products) {
        let tbody = $("#productTable tbody");
        if (tbody.length === 0) {
          // If productTable not found, check userProductTable
          tbody = $("#userProductTable tbody");
        }
        tbody.empty();

        if (products.length === 0) {
          tbody.append("<tr><td colspan='7'>No products found.</td></tr>");
          return;
        }

        products.forEach(p => {
          tbody.append(`
            <tr>
              <td>${p.id ?? ''}</td>
              <td>${p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>${p.cost ? p.cost.toFixed(2) : ''}</td>
              <td>${p.discount}</td>
              <td>${p.image ? `<img src="${p.image}" alt="${p.name}" style="max-width: 60px; max-height: 40px;">` : "No Image"}</td>
              <td>${p.id ? `<button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}">Delete</button>` : ''}</td>
            </tr>
          `);
        });
      },
      error: function() {
        alert("Failed to load products");
      }
    });
  }

  // Handle add product form submission (if form exists)
  $("#productForm").submit(function(e) {
    e.preventDefault();
    const product = {
      name: $("#productName").val().trim(),
      price: parseFloat($("#productPrice").val()),
      cost: parseFloat($("#productCost").val()),
      discount: parseInt($("#productDiscount").val()),
      image: $("#productImage").val().trim()
    };

    if (!product.name) return alert("Product name is required");
    if (isNaN(product.price) || product.price < 0) return alert("Valid price is required");
    if (isNaN(product.cost) || product.cost < 0) return alert("Valid cost is required");
    if (isNaN(product.discount) || product.discount < 0 || product.discount > 100) return alert("Discount must be 0-100");

    $.ajax({
      url: `${API_BASE}/products`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(product),
      success: function() {
        alert("Product added successfully");
        $("#productForm")[0].reset();
        loadProducts();
      },
      error: function(xhr) {
        alert(xhr.responseText || "Failed to add product");
      }
    });
  });

  // Handle delete product button click
  $("#productTable").on("click", ".delete-btn", function() {
    const productId = $(this).data("id");
    if (confirm("Delete this product?")) {
      $.ajax({
        url: `${API_BASE}/products/${productId}`,
        method: "DELETE",
        success: function() {
          alert("Product deleted");
          loadProducts();
        },
        error: function() {
          alert("Failed to delete product");
        }
      });
    }
  });
});

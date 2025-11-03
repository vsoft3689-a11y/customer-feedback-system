const API_BASE = "http://localhost:8080/api";

$(function () {
  const currentUser = getCurrentUser();
  const page = window.location.pathname.split("/").pop();

  // Redirect if not admin or not logged in
  if (page === "admin.html" || page === "admin_products.html") {
    if (!currentUser || currentUser.role !== "admin") {
      alert("Please login as admin.");
      window.location = "login.html";
      return;
    }
  }

  // Show admin name
  $("#adminNameDisplay").text(currentUser.name);

  // Logout button
  $("#logoutBtn").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("feedbackUser");
    alert("Logged out");
    window.location = "login.html";
  });

  // PAGE: admin.html - Manage feedbacks
  if (page === "admin.html") {
    loadAllFeedbacks();

    // Update feedback status handler
    $("#feedbackTable").on("click", ".update-status-btn", function () {
      const feedbackId = $(this).data("id");
      const newStatus = $(`#status-${feedbackId}`).val();

      $.ajax({
        url: `${API_BASE}/feedback/update/${feedbackId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: () => {
          alert("Status updated");

          const row = $(this).closest("tr");
          row.find("td.status-col").text(newStatus);
          row.find("td.status-edit-col").html(newStatus);
        },
        error: () => {
          alert("Failed to update status");
        },
      });
    });
  }

  // PAGE: admin_products.html - Manage products
  if (page === "admin_products.html") {
    loadProducts();

    // Show modal for adding product
    $("#addProductBtn").click(() => {
      clearProductForm();
      $("#productModalLabel").text("Add Product");
      $("#productModal").modal("show");
    });

    // Save product (add or edit)
    $("#productForm").submit(function (e) {
      e.preventDefault();

      const id = $("#productId").val();
      const name = $("#productName").val().trim();
      const description = $("#productDescription").val().trim();
      const price = parseFloat($("#productPrice").val());

      if (!name) {
        alert("Product name is required.");
        return;
      }
      if (!description) {
        alert("Description is required.");
        return;
      }
      if (isNaN(price) || price <= 0) {
        alert("Price must be a positive number.");
        return;
      }

      const productData = { name, description, price };

      if (id) {
        // Edit product
        $.ajax({
          url: `${API_BASE}/products/${id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(productData),
          success: () => {
            alert("Product updated successfully");
            $("#productModal").modal("hide");
            loadProducts();
          },
          error: () => {
            alert("Failed to update product");
          },
        });
      } else {
        // Add product
        $.ajax({
          url: `${API_BASE}/products`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(productData),
          success: () => {
            alert("Product added successfully");
            $("#productModal").modal("hide");
            loadProducts();
          },
          error: () => {
            alert("Failed to add product");
          },
        });
      }
    });

    // Edit product button click
    $("#productTable").on("click", ".edit-product-btn", function () {
      const id = $(this).data("id");

      $.ajax({
        url: `${API_BASE}/products/${id}`,
        method: "GET",
        success: (product) => {
          $("#productId").val(product.id);
          $("#productName").val(product.name);
          $("#productDescription").val(product.description);
          $("#productPrice").val(product.price);
          $("#productModalLabel").text("Edit Product");
          $("#productModal").modal("show");
        },
        error: () => {
          alert("Failed to fetch product details");
        },
      });
    });

    // Delete product button click
    $("#productTable").on("click", ".delete-product-btn", function () {
      const id = $(this).data("id");
      if (confirm("Are you sure you want to delete this product?")) {
        $.ajax({
          url: `${API_BASE}/products/${id}`,
          method: "DELETE",
          success: () => {
            alert("Product deleted");
            loadProducts();
          },
          error: () => {
            alert("Failed to delete product");
          },
        });
      }
    });
  }

  // Load all feedbacks (admin.html)
  function loadAllFeedbacks() {
    $.ajax({
      url: `${API_BASE}/feedback/all`,
      method: "GET",
      success: (feedbacks) => {
        const tbody = $("#feedbackTable tbody");
        tbody.empty();
        if (feedbacks.length === 0) {
          tbody.append('<tr><td colspan="6">No feedbacks found.</td></tr>');
          return;
        }

        feedbacks.forEach((fb) => {
          tbody.append(`
            <tr>
              <td>${fb.id}</td>
              <td>${escapeHtml(fb.user.name)}</td>
              <td>${fb.rating}</td>
              <td>${escapeHtml(fb.comment)}</td>
              <td class="status-col">${fb.status || "Pending"}</td>
              <td class="status-edit-col">
                <select class="form-control form-control-sm mb-1" id="status-${fb.id}">
                  <option value="Pending" ${fb.status === "Pending" ? "selected" : ""}>Pending</option>
                  <option value="Resolved" ${fb.status === "Resolved" ? "selected" : ""}>Resolved</option>
                  <option value="Rejected" ${fb.status === "Rejected" ? "selected" : ""}>Rejected</option>
                </select>
                <button class="btn btn-sm btn-primary update-status-btn" data-id="${fb.id}">Update</button>
              </td>
            </tr>
          `);
        });
      },
      error: () => {
        alert("Failed to load feedbacks");
      },
    });
  }

  // Load all products (admin_products.html)
  function loadProducts() {
    $.ajax({
      url: `${API_BASE}/products`,
      method: "GET",
      success: (products) => {
        const tbody = $("#productTable tbody");
        tbody.empty();

        if (products.length === 0) {
          tbody.append('<tr><td colspan="5">No products found.</td></tr>');
          return;
        }

        products.forEach((p) => {
          tbody.append(`
            <tr>
              <td>${p.id}</td>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.description)}</td>
              <td>$${p.price.toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-info edit-product-btn" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-product-btn" data-id="${p.id}">Delete</button>
              </td>
            </tr>
          `);
        });
      },
      error: () => {
        alert("Failed to load products");
      },
    });
  }

  // Clear product form fields
  function clearProductForm() {
    $("#productId").val("");
    $("#productName").val("");
    $("#productDescription").val("");
    $("#productPrice").val("");
  }

  // Get logged in user from localStorage
  function getCurrentUser() {
    const userStr = localStorage.getItem("feedbackUser");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Escape HTML special chars
  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});

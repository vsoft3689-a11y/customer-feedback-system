const API_BASE = "http://localhost:8080/api";

$(function () {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "customer") {
    alert("Please login as user.");
    window.location = "login.html";
    return;
  }

  $("#userNameDisplay").text(currentUser.name);

  loadProducts();
  loadUserFeedbacks(currentUser.id);

  // Logout
  $("#logoutBtn").click(e => {
    e.preventDefault();
    localStorage.removeItem("feedbackUser");
    alert("Logged out");
    window.location = "login.html";
  });

  // Submit feedback form
  $("#feedbackForm").submit(function (e) {
    e.preventDefault();
    const productId = $("#productSelect").val();
    const rating = parseInt($("#ratingInput").val());
    const comment = $("#commentInput").val().trim();

    if (!productId) {
      alert("Please select a product.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }
    if (!comment) {
      alert("Comment is required");
      return;
    }

    $.ajax({
      url: `${API_BASE}/feedback/submit`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ rating, comment, user: { id: currentUser.id }, product: { id: productId } }),
      success() {
        alert("Feedback submitted successfully");
        $("#feedbackForm")[0].reset();
        loadUserFeedbacks(currentUser.id);
      },
      error(xhr) {
        alert(xhr.responseText || "Failed to submit feedback");
      },
    });
  });

  // Delete feedback
  $("#userFeedbackTable").on("click", ".delete-btn", function () {
    const feedbackId = $(this).data("id");
    if (confirm("Are you sure you want to delete this feedback?")) {
      $.ajax({
        url: `${API_BASE}/feedback/delete/${feedbackId}`,
        method: "DELETE",
        success() {
          alert("Deleted successfully");
          loadUserFeedbacks(currentUser.id);
        },
        error() {
          alert("Failed to delete feedback");
        },
      });
    }
  });

  // Load all products for user & fill dropdown
  function loadProducts() {
    $.ajax({
      url: `${API_BASE}/products`,
      method: "GET",
      success(products) {
        const tbody = $("#productsTable tbody");
        const productSelect = $("#productSelect");
        tbody.empty();
        productSelect.empty();
        productSelect.append(`<option value="">-- Select a product --</option>`);

        if (products.length === 0) {
          tbody.append("<tr><td colspan='4'>No products found.</td></tr>");
          return;
        }

        products.forEach((p) => {
          tbody.append(`
            <tr>
              <td>${p.id}</td>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.description)}</td>
              <td>${p.price.toFixed(2)}</td>
            </tr>
          `);
          productSelect.append(`<option value="${p.id}">${escapeHtml(p.name)}</option>`);
        });
      },
      error() {
        alert("Failed to load products");
      },
    });
  }

  // Load feedbacks submitted by this user
  function loadUserFeedbacks(userId) {
    $.ajax({
      url: `${API_BASE}/feedback/user/${userId}`,
      method: "GET",
      success(feedbacks) {
        const tbody = $("#userFeedbackTable tbody");
        tbody.empty();
        if (feedbacks.length === 0) {
          tbody.append("<tr><td colspan='6'>No feedbacks found.</td></tr>");
          return;
        }
        feedbacks.forEach((fb) => {
          tbody.append(`
            <tr>
              <td>${fb.id}</td>
              <td>${escapeHtml(fb.product.name)}</td>
              <td>${fb.rating}</td>
              <td>${escapeHtml(fb.comment)}</td>
              <td>${fb.status || "Pending"}</td>
              <td><button class="btn btn-sm btn-danger delete-btn" data-id="${fb.id}">Delete</button></td>
            </tr>
          `);
        });
      },
      error() {
        alert("Failed to load feedbacks");
      },
    });
  }

  // Helpers
  function getCurrentUser() {
    const userStr = localStorage.getItem("feedbackUser");
    return userStr ? JSON.parse(userStr) : null;
  }

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

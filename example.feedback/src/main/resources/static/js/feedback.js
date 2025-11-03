const API_BASE = "http://localhost:8080/api";

$(function () {
  const user = JSON.parse(localStorage.getItem("feedbackUser")) || { name: "Guest", id: 0 };
  $("#userNameDisplay").text(user.name);

  // Logout
  $("#logoutBtn").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("feedbackUser");
    alert("Logged out");
    window.location = "login.html";
  });

  // Load products for dropdown
  function loadProducts() {
    $.ajax({
      url: `${API_BASE}/products`,
      method: "GET",
      success: function (products) {
        const select = $("#productSelect");
        select.empty().append('<option value="">-- Choose product --</option>');
        products.forEach(p => {
          select.append(`<option value="${p.id}">${p.name}</option>`);
        });
      },
      error: function () {
        alert("Failed to load products.");
      }
    });
  }

  // Load user feedback
  function loadFeedback() {
    $.ajax({
      url: `${API_BASE}/feedback/user/${user.id}`,
      method: "GET",
      success: function (feedbacks) {
        const tbody = $("#feedbackTableBody");
        tbody.empty();

        if (!feedbacks.length) {
          tbody.append('<tr><td colspan="4" class="text-center">No feedback given yet.</td></tr>');
          return;
        }

        feedbacks.forEach(fb => {
          const statusClass = fb.status === "Pending" ? "status-pending" :
            fb.status === "Resolved" ? "status-resolved" : "status-rejected";

          tbody.append(`
            <tr>
              <td>${fb.productName}</td>
              <td>${fb.comment}</td>
              <td>${fb.adminComment || "No comments yet"}</td>
              <td class="${statusClass}">${fb.status}</td>
            </tr>
          `);
        });
      },
      error: function () {
        alert("Failed to load feedback.");
      }
    });
  }

  // Submit feedback
  $("#feedbackForm").submit(function (e) {
    e.preventDefault();

    const productId = $("#productSelect").val();
    const comment = $("#feedbackText").val().trim();

    if (!productId || !comment) {
      alert("Please select a product and write feedback.");
      return;
    }

    const data = {
      userId: user.id,
      productId: parseInt(productId),
      comment: comment,
      status: "Pending"
    };

    $.ajax({
      url: `${API_BASE}/feedback`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function () {
        alert("Feedback submitted. Thank you!");
        $("#feedbackText").val("");
        loadFeedback();
      },
      error: function () {
        alert("Failed to submit feedback.");
      }
    });
  });

  // Initial load
  loadProducts();
  loadFeedback();
});

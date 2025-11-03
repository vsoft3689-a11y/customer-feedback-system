const API_BASE = "http://localhost:8080/api";

$(function () {
  const currentUser = getCurrentUser();
  const page = window.location.pathname.split("/").pop();

  // Redirect logic
  if (page === "login.html" || page === "register.html") {
    if (currentUser) {
      redirectUser(currentUser.role);
      return;
    }
  } else if (page === "user.html") {
    if (!currentUser || currentUser.role !== "customer") {
      alert("Please login as user.");
      window.location = "login.html";
      return;
    }
    initUserPage(currentUser);
  } else if (page === "admin.html") {
    if (!currentUser || currentUser.role !== "admin") {
      alert("Please login as admin.");
      window.location = "login.html";
      return;
    }
    initAdminPage(currentUser);
  }

  // Login form
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    const email = $("#emailInput").val().trim();
    const password = $("#passwordInput").val();

    if (!email || !password) {
      alert("Fill email and password.");
      return;
    }

    $.ajax({
      url: `${API_BASE}/users/login`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),
      success: function (res) {
        localStorage.setItem("feedbackUser", JSON.stringify(res));
        alert("Login successful");
        redirectUser(res.role);
      },
      error: function (xhr) {
        alert(xhr.responseText || "Login failed");
      },
    });
  });

  // Register form
  $("#registerForm").submit(function (e) {
    e.preventDefault();
    const name = $("#nameInput").val().trim();
    const email = $("#emailInput").val().trim();
    const password = $("#passwordInput").val();

    if (name.length < 3) {
      alert("Name must be at least 3 characters.");
      return;
    }
    if (!validateEmail(email)) {
      alert("Invalid email.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    $.ajax({
      url: `${API_BASE}/users/register`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name, email, password }),
      success: function () {
        alert("Registration successful. Please login.");
        window.location = "login.html";
      },
      error: function (xhr) {
        alert(xhr.responseText || "Registration failed");
      },
    });
  });

  // Logout
  $("#logoutBtn").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("feedbackUser");
    alert("Logged out");
    window.location = "login.html";
  });

  // Initialize User Page
  function initUserPage(user) {
    $("#userNameDisplay").text(user.name);
    loadUserFeedbacks(user.id);

    $("#feedbackForm").submit(function (e) {
      e.preventDefault();
      const rating = parseInt($("#ratingInput").val());
      const comment = $("#commentInput").val().trim();

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
        data: JSON.stringify({ rating, comment, user: { id: user.id } }),
        success: function () {
          alert("Feedback submitted successfully");
          $("#ratingInput").val("");
          $("#commentInput").val("");
          loadUserFeedbacks(user.id);
        },
        error: function (xhr) {
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
          success: function () {
            alert("Deleted successfully");
            loadUserFeedbacks(user.id);
          },
          error: function () {
            alert("Failed to delete feedback");
          },
        });
      }
    });

    // Inline edit comment on click
    $("#userFeedbackTable").on("click", ".comment-cell", function () {
      const td = $(this);
      const oldComment = td.text();
      const feedbackId = td.closest("tr").data("id");

      const input = $(`<input type='text' class='form-control form-control-sm' value='${oldComment}'>`);
      td.html(input);
      input.focus();

      input.blur(function () {
        const newComment = input.val().trim();
        if (newComment && newComment !== oldComment) {
          $.ajax({
            url: `${API_BASE}/feedback/update/${feedbackId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ comment: newComment }),
            success: function () {
              alert("Comment updated");
              loadUserFeedbacks(user.id);
            },
            error: function () {
              alert("Failed to update comment");
              td.text(oldComment);
            },
          });
        } else {
          td.text(oldComment);
        }
      });
    });
  }

  function loadUserFeedbacks(userId) {
    $.ajax({
      url: `${API_BASE}/feedback/user/${userId}`,
      method: "GET",
      success: function (feedbacks) {
        const tbody = $("#userFeedbackTable tbody");
        tbody.empty();
        if (feedbacks.length === 0) {
          tbody.append("<tr><td colspan='4'>No feedbacks found.</td></tr>");
          return;
        }
        feedbacks.forEach((fb) => {
          tbody.append(`
            <tr data-id="${fb.id}">
              <td>${fb.rating}</td>
              <td class="comment-cell" style="cursor:pointer;">${escapeHtml(fb.comment)}</td>
              <td class="status-col">${fb.status || "Pending"}</td>
              <td><button class="btn btn-sm btn-danger delete-btn" data-id="${fb.id}">Delete</button></td>
            </tr>
          `);
        });
      },
      error: function () {
        alert("Failed to load feedbacks");
      },
    });
  }

  // Initialize Admin Page
  function initAdminPage(admin) {
    $("#adminNameDisplay").text(admin.name);
    loadAllFeedbacks();

    // When admin clicks Update button to update status
    $("#feedbackTable").on("click", ".update-status-btn", function () {
      const feedbackId = $(this).data("id");
      const selectElem = $(`#status-${feedbackId}`);
      const newStatus = selectElem.val();

      $.ajax({
        url: `${API_BASE}/feedback/update/${feedbackId}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: function () {
          alert("Status updated");

          // Instead of reloading all feedbacks, update this row's status cell to text
          const row = selectElem.closest("tr");
          row.find("td.status-col").text(newStatus);
          // Remove dropdown and button, replace with plain text in that cell
          row.find("td.status-edit-col").html(newStatus);
        },
        error: function () {
          alert("Failed to update status");
        },
      });
    });
  }

  function loadAllFeedbacks() {
    $.ajax({
      url: `${API_BASE}/feedback/all`,
      method: "GET",
      success: function (feedbacks) {
        const tbody = $("#feedbackTable tbody");
        tbody.empty();
        if (feedbacks.length === 0) {
          tbody.append("<tr><td colspan='5'>No feedbacks found.</td></tr>");
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
                <select class="form-select form-select-sm mb-1" id="status-${fb.id}">
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
      error: function () {
        alert("Failed to load feedbacks");
      },
    });
  }

  // Helper functions
  function getCurrentUser() {
    const userStr = localStorage.getItem("feedbackUser");
    return userStr ? JSON.parse(userStr) : null;
  }

  function redirectUser(role) {
    if (role === "admin") {
      window.location = "admin.html";
    } else if (role === "customer") {
      window.location = "user.html";
    } else {
      window.location = "login.html";
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

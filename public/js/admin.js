const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginAlert = document.getElementById("loginAlert");
const formAlert = document.getElementById("formAlert");
const adminNoticeList = document.getElementById("adminNoticeList");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const categoryInput = document.getElementById("category");
const priorityInput = document.getElementById("priority");
const editIdInput = document.getElementById("editId");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showAlert(el, message, type = "error") {
  el.innerHTML = `<div class="alert ${type}">${message}</div>`;
  setTimeout(() => (el.innerHTML = ""), 4000);
}

async function checkSession() {
  const res = await fetch("/api/session");
  const data = await res.json();
  if (data.isAdmin) {
    loginPanel.style.display = "none";
    dashboard.style.display = "block";
    logoutBtn.style.display = "inline-block";
    loadAdminNotices();
  } else {
    loginPanel.style.display = "block";
    dashboard.style.display = "none";
    logoutBtn.style.display = "none";
  }
}

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(loginAlert, data.error || "Login failed");
      return;
    }
    checkSession();
  } catch (err) {
    showAlert(loginAlert, "Something went wrong. Try again.");
  }
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  checkSession();
});

function resetForm() {
  editIdInput.value = "";
  titleInput.value = "";
  contentInput.value = "";
  categoryInput.value = "General";
  priorityInput.value = "normal";
  formTitle.textContent = "Post a New Notice";
  submitBtn.textContent = "Post Notice";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", resetForm);

submitBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const category = categoryInput.value;
  const priority = priorityInput.value;
  const id = editIdInput.value;

  if (!title || !content) {
    showAlert(formAlert, "Title and content are required.");
    return;
  }

  const isEdit = !!id;
  const url = isEdit ? `/api/notices/${id}` : "/api/notices";
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, priority })
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(formAlert, data.error || "Failed to save notice.");
      return;
    }
    showAlert(formAlert, isEdit ? "Notice updated." : "Notice posted.", "success");
    resetForm();
    loadAdminNotices();
  } catch (err) {
    showAlert(formAlert, "Something went wrong.");
  }
});

function startEdit(notice) {
  editIdInput.value = notice.id;
  titleInput.value = notice.title;
  contentInput.value = notice.content;
  categoryInput.value = notice.category;
  priorityInput.value = notice.priority;
  formTitle.textContent = "Edit Notice";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteNotice(id) {
  if (!confirm("Delete this notice? This cannot be undone.")) return;
  const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
  if (res.ok) {
    loadAdminNotices();
  } else {
    showAlert(formAlert, "Failed to delete notice.");
  }
}

async function loadAdminNotices() {
  adminNoticeList.innerHTML = `<p class="empty-state">Loading...</p>`;
  const res = await fetch("/api/notices");
  const notices = await res.json();

  if (!notices.length) {
    adminNoticeList.innerHTML = `<p class="empty-state">No notices yet. Post one above.</p>`;
    return;
  }

  adminNoticeList.innerHTML = notices
    .map(
      (n) => `
    <div class="notice-card ${n.priority === "urgent" ? "urgent" : ""}">
      <div class="meta-row">
        <h3>${escapeHtml(n.title)}</h3>
        <div>
          ${n.priority === "urgent" ? '<span class="badge urgent">Urgent</span> ' : ""}
          <span class="badge">${escapeHtml(n.category)}</span>
        </div>
      </div>
      <div class="content">${escapeHtml(n.content)}</div>
      <div class="footer-row">
        <span>Posted by ${escapeHtml(n.postedBy || "Admin")}</span>
        <div class="actions">
          <button class="btn ghost" onclick='editNoticeHandler(${n.id})'>Edit</button>
          <button class="btn danger" onclick='deleteNotice(${n.id})'>Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  window.__notices = notices;
}

function editNoticeHandler(id) {
  const notice = (window.__notices || []).find((n) => n.id === id);
  if (notice) startEdit(notice);
}

checkSession();

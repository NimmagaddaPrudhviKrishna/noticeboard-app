const noticeList = document.getElementById("noticeList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");
const refreshBtn = document.getElementById("refreshBtn");

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadNotices() {
  noticeList.innerHTML = `<p class="empty-state">Loading notices...</p>`;

  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  if (categoryFilter.value !== "All") params.set("category", categoryFilter.value);
  if (priorityFilter.value !== "All") params.set("priority", priorityFilter.value);

  try {
    const res = await fetch(`/api/notices?${params.toString()}`);
    const notices = await res.json();

    if (!notices.length) {
      noticeList.innerHTML = `<p class="empty-state">No notices found.</p>`;
      return;
    }

    noticeList.innerHTML = notices
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
          <span>Posted by ${escapeHtml(n.postedBy || "Admin")} &middot; ${timeAgo(n.createdAt)}</span>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    noticeList.innerHTML = `<p class="empty-state">Failed to load notices. Please try again.</p>`;
  }
}

let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadNotices, 300);
});
categoryFilter.addEventListener("change", loadNotices);
priorityFilter.addEventListener("change", loadNotices);
refreshBtn.addEventListener("click", loadNotices);

loadNotices();

/* =========================================================
   GSA ADMIN PANEL
   Ghopkhali Sports Arena
   Supabase Version
========================================================= */

const SUPABASE_URL = "https://cmygmswzokyrmgdnuszq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;
let notices = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setCurrentYear();
  setCurrentDate();
  setupNavigation();
  setupButtons();
  setupModal();
  setupLogin();
  setupSidebar();

  checkSession();

});


/* =========================================================
   YEAR
========================================================= */

function setCurrentYear() {

  $$("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

}


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

  const el = $("#currentDate");

  if (!el) return;

  el.textContent = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

  const form = $("#loginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = $("#adminEmail").value.trim();
    const password = $("#adminPassword").value;

    const errorBox = $("#loginError");

    errorBox.textContent = "";

    showLoading(true);

    try {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      currentUser = data.user;

      showAdminPanel();

      await loadDashboard();

      toast(
        "Welcome back!",
        "success"
      );

    } catch (error) {

      console.error("Login error:", error);

      errorBox.textContent =
        error.message || "Login failed.";

    } finally {

      showLoading(false);

    }

  });

}


/* =========================================================
   SESSION CHECK
========================================================= */

async function checkSession() {

  try {

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (session?.user) {

      currentUser = session.user;

      showAdminPanel();

      await loadDashboard();

    } else {

      showLogin();

    }

  } catch (error) {

    console.error(
      "Session error:",
      error
    );

    showLogin();

  }

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_IN" && session?.user) {

      currentUser = session.user;

    }

    if (event === "SIGNED_OUT") {

      currentUser = null;

      showLogin();

    }

  }
);


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

  const loginScreen = $("#loginScreen");
  const adminApp = $("#adminApp");

  if (loginScreen) {
    loginScreen.style.display = "flex";
  }

  if (adminApp) {
    adminApp.style.display = "none";
  }

}


/* =========================================================
   SHOW ADMIN
========================================================= */

function showAdminPanel() {

  const loginScreen = $("#loginScreen");
  const adminApp = $("#adminApp");

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (adminApp) {
    adminApp.style.display = "flex";
  }

  updateAdminProfile();

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function updateAdminProfile() {

  if (!currentUser) return;

  const email =
    currentUser.email || "Administrator";

  const name =
    email.split("@")[0] || "Administrator";

  const nameEl = $("#adminName");
  const avatarEl = $("#adminAvatar");

  if (nameEl) {
    nameEl.textContent = name;
  }

  if (avatarEl) {
    avatarEl.textContent =
      name.charAt(0).toUpperCase();
  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  showLoading(true);

  try {

    await supabaseClient.auth.signOut();

    toast(
      "Signed out successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    toast(
      "Logout failed.",
      "error"
    );

  } finally {

    showLoading(false);

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  $$(".sidebar-link[data-page]").forEach(button => {

    button.addEventListener("click", () => {

      const page =
        button.dataset.page;

      openPage(page);

    });

  });


  $$("[data-page-link]").forEach(button => {

    button.addEventListener("click", () => {

      openPage(
        button.dataset.pageLink
      );

    });

  });

}


async function openPage(page) {

  $$(".sidebar-link[data-page]").forEach(link => {

    link.classList.toggle(
      "active",
      link.dataset.page === page
    );

  });


  $$(".admin-page").forEach(section => {

    section.classList.remove("active");

  });


  const pageId =
    page.replace(/-/g, "") + "Page";

  const pageElement =
    document.getElementById(pageId);


  if (pageElement) {

    pageElement.classList.add("active");

  }


  updatePageTitle(page);


  /* Load page data */

  if (page === "dashboard") {
    await loadDashboard();
  }

  if (page === "notices") {
    await loadNotices();
  }

  if (page === "gallery") {
    await loadGallery();
  }

  if (page === "tournaments") {
    await loadTournaments();
  }

  if (page === "fixtures") {
    await loadFixtures();
  }

  if (page === "leadership") {
    await loadLeadership();
  }

  if (page === "committee") {
    await loadCommittee();
  }

  if (page === "friendly-applications") {
    await loadFriendlyApplications();
  }

  if (page === "membership-applications") {
    await loadMembershipApplications();
  }

}


function updatePageTitle(page) {

  const titles = {

    dashboard: "Dashboard",
    notices: "Notices",
    gallery: "Gallery",
    tournaments: "Tournaments",
    fixtures: "Matches & Fixtures",
    leadership: "Leadership",
    committee: "Committee",
    "friendly-applications":
      "Friendly Match Applications",
    "membership-applications":
      "Membership Applications"

  };

  const title =
    titles[page] || "Dashboard";

  const titleElement =
    $("#pageTitle");

  if (titleElement) {
    titleElement.textContent = title;
  }

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

  const toggle =
    $("#sidebarToggle");

  const sidebar =
    $("#adminSidebar");

  if (!toggle || !sidebar) return;

  toggle.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

  const logoutButton =
    $("#logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      logout
    );

  }


  const refreshButton =
    $("#refreshButton");

  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      async () => {

        await loadDashboard();

        toast(
          "Data refreshed.",
          "success"
        );

      }
    );

  }


  document.addEventListener(
    "click",
    (e) => {

      const button =
        e.target.closest(
          "[data-action]"
        );

      if (!button) return;

      const action =
        button.dataset.action;

      handleAction(action);

    }
  );

}


/* =========================================================
   ACTIONS
========================================================= */

function handleAction(action) {

  if (action === "add-notice") {
    openNoticeModal();
    return;
  }

  if (action === "add-gallery") {
    openSimpleModal(
      "Add Gallery Photo",
      "Gallery management will be connected next."
    );
    return;
  }

  if (action === "add-tournament") {
    openSimpleModal(
      "Add Tournament",
      "Tournament management will be connected next."
    );
    return;
  }

  if (action === "add-fixture") {
    openSimpleModal(
      "Add Match",
      "Fixture management will be connected next."
    );
    return;
  }

  if (action === "add-leader") {
    openSimpleModal(
      "Add Leader",
      "Leadership management will be connected next."
    );
    return;
  }

  if (action === "add-committee") {
    openSimpleModal(
      "Add Committee Member",
      "Committee management will be connected next."
    );
    return;
  }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  await loadNoticeStats();
  await loadRecentActivity();

}


async function loadNoticeStats() {

  try {

    const {
      count,
      error
    } = await supabaseClient
      .from("notices")
      .select("*", {
        count: "exact",
        head: true
      });

    if (error) throw error;

    const total =
      document.getElementById(
        "totalNotices"
      );

    if (total) {
      total.textContent =
        count || 0;
    }

  } catch (error) {

    console.error(
      "Notice stats error:",
      error
    );

  }

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

async function loadRecentActivity() {

  const container =
    $("#recentActivityList");

  if (!container) return;

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("notices")
      .select(
        "id,title,category,published,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="empty-state small-empty">
          <span>◌</span>
          <p>No recent activity yet.</p>
        </div>
      `;

      return;

    }


    container.innerHTML =
      data.map(notice => {

        return `
          <div class="recent-item">

            <div class="recent-item-icon">
              ◉
            </div>

            <div class="recent-item-content">

              <strong>
                ${escapeHTML(notice.title)}
              </strong>

              <span>
                ${escapeHTML(
                  notice.category || "GENERAL"
                )}
                •
                ${formatDate(
                  notice.created_at
                )}
              </span>

            </div>

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "Recent activity error:",
      error
    );

  }

}


/* =========================================================
   NOTICES
========================================================= */

async function loadNotices() {

  const container =
    $("#noticesList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>◌</span>
      <p>Loading notices...</p>
    </div>
  `;


  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("notices")
      .select(
        "id,title,content,category,image_url,published,created_at,updated_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) throw error;

    notices = data || [];

    if (!notices.length) {

      container.innerHTML = `
        <div class="empty-state">
          <span>◉</span>
          <h4>No notices found</h4>
          <p>Create your first notice.</p>
        </div>
      `;

      return;

    }


    container.innerHTML =
      notices.map(renderNotice).join("");

  } catch (error) {

    console.error(
      "Load notices error:",
      error
    );

    container.innerHTML = `
      <div class="empty-state">
        <span>⚠</span>
        <h4>Could not load notices</h4>
        <p>${escapeHTML(
          error.message
        )}</p>
      </div>
    `;

  }

}


function renderNotice(notice) {

  return `
    <article class="admin-list-item">

      <div class="admin-list-content">

        <div class="notice-meta">

          <span class="notice-category">
            ${escapeHTML(
              notice.category || "GENERAL"
            )}
          </span>

          <span>
            ${formatDate(
              notice.created_at
            )}
          </span>

        </div>

        <h3>
          ${escapeHTML(
            notice.title
          )}
        </h3>

        <p>
          ${escapeHTML(
            notice.content || ""
          )}
        </p>

        <span class="status-badge ${
          notice.published
            ? "published"
            : "draft"
        }">
          ${
            notice.published
              ? "Published"
              : "Draft"
          }
        </span>

      </div>

      <div class="admin-list-actions">

        <button
          class="admin-small-button"
          onclick="editNotice('${notice.id}')"
        >
          Edit
        </button>

        <button
          class="admin-small-button danger"
          onclick="deleteNotice('${notice.id}')"
        >
          Delete
        </button>

      </div>

    </article>
  `;

}


/* =========================================================
   CREATE NOTICE
========================================================= */

function openNoticeModal() {

  const content = `

    <div class="modal-header">

      <span class="page-label">
        CONTENT MANAGEMENT
      </span>

      <h2>
        Create
        <span>Notice.</span>
      </h2>

    </div>

    <form id="noticeForm" class="admin-form">

      <div class="input-group">

        <label>NOTICE TITLE</label>

        <input
          type="text"
          id="noticeTitle"
          required
          placeholder="Enter notice title"
        >

      </div>

      <div class="input-group">

        <label>CATEGORY</label>

        <select id="noticeCategory">

          <option value="GENERAL">
            General
          </option>

          <option value="SPORTS">
            Sports
          </option>

          <option value="MATCH">
            Match
          </option>

          <option value="TOURNAMENT">
            Tournament
          </option>

          <option value="ANNOUNCEMENT">
            Announcement
          </option>

        </select>

      </div>

      <div class="input-group">

        <label>CONTENT</label>

        <textarea
          id="noticeContent"
          rows="7"
          required
          placeholder="Write notice content..."
        ></textarea>

      </div>

      <div class="input-group">

        <label>
          <input
            type="checkbox"
            id="noticePublished"
            checked
          >

          Publish immediately

        </label>

      </div>

      <button
        type="submit"
        class="admin-button admin-button-dark"
      >
        Publish Notice
      </button>

    </form>
  `;

  openModal(content);


  const form =
    $("#noticeForm");

  form.addEventListener(
    "submit",
    createNotice
  );

}


/* =========================================================
   CREATE NOTICE DATABASE
========================================================= */

async function createNotice(e) {

  e.preventDefault();

  const title =
    $("#noticeTitle").value.trim();

  const content =
    $("#noticeContent").value.trim();

  const category =
    $("#noticeCategory").value;

  const published =
    $("#noticePublished").checked;


  if (!title || !content) {

    toast(
      "Please fill in all required fields.",
      "error"
    );

    return;

  }


  showLoading(true);

  try {

    const {
      error
    } = await supabaseClient
      .from("notices")
      .insert({
        title,
        content,
        category,
        image_url: null,
        published
      });

    if (error) throw error;


    closeModal();

    toast(
      "Notice created successfully!",
      "success"
    );

    await loadDashboard();

    await loadNotices();

  } catch (error) {

    console.error(
      "Create notice error:",
      error
    );

    toast(
      error.message ||
      "Failed to create notice.",
      "error"
    );

  } finally {

    showLoading(false);

  }

}


/* =========================================================
   EDIT NOTICE
========================================================= */

window.editNotice = async function(id) {

  const notice =
    notices.find(
      item => item.id === id
    );

  if (!notice) return;


  const content = `

    <div class="modal-header">

      <span class="page-label">
        CONTENT MANAGEMENT
      </span>

      <h2>
        Edit
        <span>Notice.</span>
      </h2>

    </div>

    <form id="editNoticeForm" class="admin-form">

      <div class="input-group">

        <label>NOTICE TITLE</label>

        <input
          type="text"
          id="editNoticeTitle"
          value="${escapeAttribute(
            notice.title
          )}"
          required
        >

      </div>

      <div class="input-group">

        <label>CATEGORY</label>

        <select id="editNoticeCategory">

          ${getCategoryOptions(
            notice.category
          )}

        </select>

      </div>

      <div class="input-group">

        <label>CONTENT</label>

        <textarea
          id="editNoticeContent"
          rows="7"
          required
        >${escapeHTML(
          notice.content || ""
        )}</textarea>

      </div>

      <div class="input-group">

        <label>

          <input
            type="checkbox"
            id="editNoticePublished"
            ${
              notice.published
                ? "checked"
                : ""
            }
          >

          Published

        </label>

      </div>

      <button
        type="submit"
        class="admin-button admin-button-dark"
      >
        Save Changes
      </button>

    </form>
  `;


  openModal(content);


  $("#editNoticeForm").addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      showLoading(true);

      try {

        const {
          error
        } = await supabaseClient
          .from("notices")
          .update({
            title:
              $("#editNoticeTitle")
                .value.trim(),

            category:
              $("#editNoticeCategory")
                .value,

            content:
              $("#editNoticeContent")
                .value.trim(),

            published:
              $("#editNoticePublished")
                .checked,

            updated_at:
              new Date().toISOString()

          })
          .eq("id", id);

        if (error) throw error;


        closeModal();

        toast(
          "Notice updated successfully!",
          "success"
        );

        await loadDashboard();
        await loadNotices();

      } catch (error) {

        console.error(
          "Update notice error:",
          error
        );

        toast(
          error.message ||
          "Failed to update notice.",
          "error"
        );

      } finally {

        showLoading(false);

      }

    }
  );

};


/* =========================================================
   DELETE NOTICE
========================================================= */

window.deleteNotice = async function(id) {

  const notice =
    notices.find(
      item => item.id === id
    );

  if (!notice) return;


  const confirmed =
    confirm(
      `Delete "${notice.title}"?`
    );

  if (!confirmed) return;


  showLoading(true);

  try {

    const {
      error
    } = await supabaseClient
      .from("notices")
      .delete()
      .eq("id", id);

    if (error) throw error;


    toast(
      "Notice deleted successfully.",
      "success"
    );

    await loadDashboard();
    await loadNotices();

  } catch (error) {

    console.error(
      "Delete notice error:",
      error
    );

    toast(
      error.message ||
      "Failed to delete notice.",
      "error"
    );

  } finally {

    showLoading(false);

  }

};


/* =========================================================
   GALLERY
========================================================= */

async function loadGallery() {

  const container =
    $("#galleryAdminGrid");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>▧</span>
      <h4>Gallery</h4>
      <p>Gallery database connection will be added next.</p>
    </div>
  `;

}


/* =========================================================
   TOURNAMENTS
========================================================= */

async function loadTournaments() {

  const container =
    $("#tournamentsList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>🏆</span>
      <h4>Tournaments</h4>
      <p>Tournament database connection will be added next.</p>
    </div>
  `;

}


/* =========================================================
   FIXTURES
========================================================= */

async function loadFixtures() {

  const container =
    $("#fixturesList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>⚽</span>
      <h4>Matches & Fixtures</h4>
      <p>Fixture database connection will be added next.</p>
    </div>
  `;

}


/* =========================================================
   LEADERSHIP
========================================================= */

async function loadLeadership() {

  const container =
    $("#leadershipList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>★</span>
      <h4>Leadership</h4>
      <p>Leadership database connection will be added next.</p>
    </div>
  `;

}


/* =========================================================
   COMMITTEE
========================================================= */

async function loadCommittee() {

  const container =
    $("#committeeList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>♙</span>
      <h4>Committee</h4>
      <p>Committee database connection will be added next.</p>
    </div>
  `;

}


/* =========================================================
   FRIENDLY APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  const container =
    $("#friendlyApplicationsList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>⚽</span>
      <h4>No applications loaded</h4>
      <p>Friendly Match applications will appear here.</p>
    </div>
  `;

}


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

async function loadMembershipApplications() {

  const container =
    $("#membershipApplicationsList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <span>✦</span>
      <h4>No applications loaded</h4>
      <p>Membership applications will appear here.</p>
    </div>
  `;

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

  const closeButton =
    $("#adminModalClose");

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeModal
    );

  }


  const modal =
    $("#adminModal");

  if (modal) {

    modal.addEventListener(
      "click",
      (e) => {

        if (
          e.target === modal
        ) {
          closeModal();
        }

      }
    );

  }

}


function openModal(content) {

  const modal =
    $("#adminModal");

  const modalContent =
    $("#adminModalContent");

  if (!modal || !modalContent)
    return;

  modalContent.innerHTML =
    content;

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal() {

  const modal =
    $("#adminModal");

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


function openSimpleModal(
  title,
  message
) {

  openModal(`

    <div class="modal-header">

      <span class="page-label">
        GSA ADMIN
      </span>

      <h2>
        ${escapeHTML(title)}
      </h2>

    </div>

    <div class="empty-state">
      <p>
        ${escapeHTML(message)}
      </p>
    </div>

  `);

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(show) {

  const loading =
    $("#adminLoading");

  if (!loading) return;

  loading.style.display =
    show ? "flex" : "none";

}


/* =========================================================
   TOAST
========================================================= */

function toast(
  message,
  type = "success"
) {

  const container =
    $("#toastContainer");

  if (!container) return;


  const item =
    document.createElement("div");

  item.className =
    `toast toast-${type}`;

  item.textContent =
    message;


  container.appendChild(item);


  setTimeout(() => {

    item.remove();

  }, 3500);

}


/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {

  if (!date) return "";

  return new Date(date)
    .toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );

}


function escapeHTML(value) {

  if (value === null ||
      value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


function getCategoryOptions(selected) {

  const categories = [
    "GENERAL",
    "SPORTS",
    "MATCH",
    "TOURNAMENT",
    "ANNOUNCEMENT"
  ];

  return categories
    .map(category => {

      return `
        <option
          value="${category}"
          ${
            String(selected).toUpperCase() ===
            category
              ? "selected"
              : ""
          }
        >
          ${category}
        </option>
      `;

    })
    .join("");

}

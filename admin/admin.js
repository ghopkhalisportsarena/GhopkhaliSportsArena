/* =========================================================
   GHOPKHALI SPORTS ARENA
   ADMIN PANEL
   Supabase + Admin Dashboard
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://cmygmswzokyrmgdnuszq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

const { createClient } = supabase;

const db = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;


/* =========================================================
   DOM
========================================================= */

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");
const refreshButton = document.getElementById("refreshButton");

const adminName = document.getElementById("adminName");
const adminAvatar = document.getElementById("adminAvatar");

const currentDate = document.getElementById("currentDate");


/* =========================================================
   YEAR
========================================================= */

document.querySelectorAll("[data-current-year]").forEach(el => {
  el.textContent = new Date().getFullYear();
});


/* =========================================================
   DATE
========================================================= */

function updateDate() {

  if (!currentDate) return;

  const now = new Date();

  currentDate.textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
}

updateDate();


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  loginError.textContent = "";

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  if (!email || !password) {
    loginError.textContent =
      "Please enter your email and password.";
    return;
  }

  setLoading(true);

  try {

    const { data, error } =
      await db.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    currentUser = data.user;

    showAdmin();

  } catch (error) {

    console.error(error);

    loginError.textContent =
      error.message || "Login failed.";

  } finally {

    setLoading(false);

  }

});


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

  try {

    const {
      data: {
        session
      }
    } = await db.auth.getSession();

    if (session?.user) {

      currentUser = session.user;

      showAdmin();

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
   SHOW ADMIN
========================================================= */

function showAdmin() {

  loginScreen.style.display = "none";

  adminApp.style.display = "flex";

  updateAdminProfile();

  loadDashboard();

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

  loginScreen.style.display = "flex";

  adminApp.style.display = "none";

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function updateAdminProfile() {

  if (!currentUser) return;

  const email =
    currentUser.email || "Administrator";

  if (adminName) {

    adminName.textContent =
      email;

  }

  if (adminAvatar) {

    adminAvatar.textContent =
      email.charAt(0).toUpperCase();

  }

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton?.addEventListener(
  "click",
  async () => {

    try {

      await db.auth.signOut();

      currentUser = null;

      showLogin();

    } catch (error) {

      console.error(error);

    }

  }
);


/* =========================================================
   LOADING
========================================================= */

function setLoading(status) {

  const loading =
    document.getElementById("adminLoading");

  if (!loading) return;

  loading.style.display =
    status ? "flex" : "none";

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  await Promise.all([
    loadNoticeStats(),
    loadTournamentStats(),
    loadFixtureStats(),
    loadApplicationStats(),
    loadRecentActivity(),
    loadApplicationsPreview()
  ]);

}


/* =========================================================
   NOTICE COUNT
========================================================= */

async function loadNoticeStats() {

  const { count, error } =
    await db
      .from("notices")
      .select("*", {
        count: "exact",
        head: true
      });

  if (error) {

    console.error(
      "Notice count:",
      error
    );

    return;

  }

  const el =
    document.getElementById("totalNotices");

  if (el) {
    el.textContent = count || 0;
  }

}


/* =========================================================
   TOURNAMENT COUNT
========================================================= */

async function loadTournamentStats() {

  const { count, error } =
    await db
      .from("tournaments")
      .select("*", {
        count: "exact",
        head: true
      });

  if (error) {

    console.error(
      "Tournament count:",
      error
    );

    return;

  }

  const el =
    document.getElementById("totalTournaments");

  if (el) {
    el.textContent = count || 0;
  }

}


/* =========================================================
   FIXTURE COUNT
========================================================= */

async function loadFixtureStats() {

  const { count, error } =
    await db
      .from("fixtures")
      .select("*", {
        count: "exact",
        head: true
      });

  if (error) {

    console.error(
      "Fixture count:",
      error
    );

    return;

  }

  const el =
    document.getElementById("totalFixtures");

  if (el) {
    el.textContent = count || 0;
  }

}


/* =========================================================
   APPLICATION COUNT
========================================================= */

async function loadApplicationStats() {

  let total = 0;

  const friendly =
    await db
      .from("friendly_applications")
      .select("*", {
        count: "exact",
        head: true
      });

  if (!friendly.error) {
    total += friendly.count || 0;
  }

  const membership =
    await db
      .from("membership_applications")
      .select("*", {
        count: "exact",
        head: true
      });

  if (!membership.error) {
    total += membership.count || 0;
  }

  const el =
    document.getElementById(
      "totalApplications"
    );

  if (el) {
    el.textContent = total;
  }

}


/* =========================================================
   NOTICES
========================================================= */

async function loadNotices() {

  const list =
    document.getElementById(
      "noticesList"
    );

  if (!list) return;

  list.innerHTML =
    `<div class="empty-state">
      <p>Loading notices...</p>
    </div>`;

  const {
    data,
    error
  } = await db
    .from("notices")
    .select("*")
    .order(
      "created_at",
      { ascending: false }
    );

  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="empty-state">
        <p>Unable to load notices.</p>
      </div>`;

    return;

  }

  if (!data?.length) {

    list.innerHTML =
      `<div class="empty-state">
        <span>◉</span>
        <h4>No notices yet</h4>
        <p>Create your first notice.</p>
      </div>`;

    return;

  }

  list.innerHTML =
    data.map(notice => {

      const date =
        formatDate(notice.created_at);

      return `
        <article class="admin-list-item">

          <div>

            <span class="page-label">
              ${escapeHTML(
                notice.category || "GENERAL"
              )}
            </span>

            <h3>
              ${escapeHTML(
                notice.title || ""
              )}
            </h3>

            <p>
              ${escapeHTML(
                notice.content || ""
              )}
            </p>

            <small>
              ${date}
            </small>

          </div>

          <div class="admin-item-actions">

            <button
              class="admin-button"
              onclick="editNotice('${notice.id}')"
            >
              Edit
            </button>

            <button
              class="admin-button"
              onclick="deleteNotice('${notice.id}')"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");

}


/* =========================================================
   DELETE NOTICE
========================================================= */

window.deleteNotice = async function(id) {

  if (!confirm(
    "Delete this notice?"
  )) return;

  const {
    error
  } = await db
    .from("notices")
    .delete()
    .eq("id", id);

  if (error) {

    alert(
      "Delete failed: " +
      error.message
    );

    return;

  }

  showToast(
    "Notice deleted successfully."
  );

  loadNotices();
  loadDashboard();

};


/* =========================================================
   EDIT NOTICE
========================================================= */

window.editNotice = async function(id) {

  const {
    data,
    error
  } = await db
    .from("notices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {

    alert(error.message);

    return;

  }

  openModal(`
    
    <h2>Edit <span>Notice.</span></h2>

    <form
      id="editNoticeForm"
      class="application-form"
    >

      <div class="input-group">

        <label>Title</label>

        <input
          id="editNoticeTitle"
          value="${escapeAttribute(
            data.title || ""
          )}"
          required
        >

      </div>

      <div class="input-group">

        <label>Category</label>

        <input
          id="editNoticeCategory"
          value="${escapeAttribute(
            data.category || "GENERAL"
          )}"
        >

      </div>

      <div class="input-group">

        <label>Content</label>

        <textarea
          id="editNoticeContent"
          rows="6"
          required
        >${escapeHTML(
          data.content || ""
        )}</textarea>

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Save Changes
      </button>

    </form>
  `);

  document
    .getElementById("editNoticeForm")
    ?.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const {
          error
        } = await db
          .from("notices")
          .update({
            title:
              document.getElementById(
                "editNoticeTitle"
              ).value,

            category:
              document.getElementById(
                "editNoticeCategory"
              ).value,

            content:
              document.getElementById(
                "editNoticeContent"
              ).value,

            updated_at:
              new Date().toISOString()
          })
          .eq("id", id);

        if (error) {

          alert(error.message);

          return;

        }

        closeModal();

        showToast(
          "Notice updated successfully."
        );

        loadNotices();
        loadDashboard();

      }
    );

};


/* =========================================================
   CREATE NOTICE
========================================================= */

function openCreateNotice() {

  openModal(`

    <h2>
      Create <span>Notice.</span>
    </h2>

    <form
      id="createNoticeForm"
      class="application-form"
    >

      <div class="input-group">

        <label>Title</label>

        <input
          id="newNoticeTitle"
          placeholder="Notice title"
          required
        >

      </div>

      <div class="input-group">

        <label>Category</label>

        <select id="newNoticeCategory">

          <option value="GENERAL">
            General
          </option>

          <option value="NOTICE">
            Notice
          </option>

          <option value="ANNOUNCEMENT">
            Announcement
          </option>

          <option value="MATCH">
            Match
          </option>

          <option value="EVENT">
            Event
          </option>

        </select>

      </div>

      <div class="input-group">

        <label>Content</label>

        <textarea
          id="newNoticeContent"
          rows="7"
          placeholder="Write notice..."
          required
        ></textarea>

      </div>

      <div class="input-group">

        <label>Image URL (optional)</label>

        <input
          id="newNoticeImage"
          placeholder="https://..."
        >

      </div>

      <button
        type="submit"
        class="admin-button admin-button-dark"
      >
        Publish Notice →
      </button>

    </form>

  `);


  document
    .getElementById("createNoticeForm")
    ?.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const {
          error
        } = await db
          .from("notices")
          .insert({

            title:
              document.getElementById(
                "newNoticeTitle"
              ).value.trim(),

            content:
              document.getElementById(
                "newNoticeContent"
              ).value.trim(),

            category:
              document.getElementById(
                "newNoticeCategory"
              ).value,

            image_url:
              document.getElementById(
                "newNoticeImage"
              ).value.trim() || null,

            published: true

          });

        if (error) {

          alert(error.message);

          return;

        }

        closeModal();

        showToast(
          "Notice published successfully."
        );

        loadNotices();
        loadDashboard();

      }
    );

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

async function loadRecentActivity() {

  const list =
    document.getElementById(
      "recentActivityList"
    );

  if (!list) return;

  const {
    data,
    error
  } = await db
    .from("notices")
    .select(
      "title,category,created_at"
    )
    .order(
      "created_at",
      { ascending: false }
    )
    .limit(5);

  if (error || !data?.length) return;

  list.innerHTML =
    data.map(item => `
      
      <div class="recent-item">

        <span class="recent-dot"></span>

        <div>

          <strong>
            ${escapeHTML(
              item.title
            )}
          </strong>

          <small>
            ${escapeHTML(
              item.category || "GENERAL"
            )}
            •
            ${formatDate(
              item.created_at
            )}
          </small>

        </div>

      </div>

    `).join("");

}


/* =========================================================
   APPLICATION PREVIEW
========================================================= */

async function loadApplicationsPreview() {

  const container =
    document.getElementById(
      "applicationsPreview"
    );

  if (!container) return;

  const {
    data,
    error
  } = await db
    .from("friendly_applications")
    .select("*")
    .order(
      "created_at",
      { ascending: false }
    )
    .limit(5);

  if (error || !data?.length) return;

  container.innerHTML =
    data.map(app => `

      <div class="application-preview-item">

        <strong>
          ${escapeHTML(
            app.team_name ||
            app.team_club_name ||
            "Team Application"
          )}
        </strong>

        <span>
          ${escapeHTML(
            app.status || "pending"
          )}
        </span>

      </div>

    `).join("");

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

document
  .querySelectorAll(
    ".sidebar-link[data-page]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        openPage(page);

      }
    );

  });


document
  .querySelectorAll(
    "[data-page-link]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openPage(
          button.dataset.pageLink
        );

      }
    );

  });


function openPage(page) {

  document
    .querySelectorAll(".admin-page")
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      page + "Page"
    );

  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(
      ".sidebar-link[data-page]"
    )
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.page === page
      );

    });


  const title =
    document.getElementById(
      "pageTitle"
    );

  if (title) {

    const names = {

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

    title.textContent =
      names[page] || "Dashboard";

  }


  if (page === "notices") {
    loadNotices();
  }

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

document
  .querySelectorAll(
    "[data-action]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const action =
          button.dataset.action;

        if (
          action === "add-notice"
        ) {

          openCreateNotice();

        }

      }
    );

  });


/* =========================================================
   REFRESH
========================================================= */

refreshButton?.addEventListener(
  "click",
  async () => {

    setLoading(true);

    await loadDashboard();

    const active =
      document.querySelector(
        ".sidebar-link.active"
      )?.dataset.page;

    if (active === "notices") {
      await loadNotices();
    }

    setLoading(false);

    showToast(
      "Data refreshed."
    );

  }
);


/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

  const modal =
    document.getElementById(
      "adminModal"
    );

  const modalContent =
    document.getElementById(
      "adminModalContent"
    );

  if (!modal || !modalContent)
    return;

  modalContent.innerHTML =
    content;

  modal.classList.add("active");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal() {

  const modal =
    document.getElementById(
      "adminModal"
    );

  if (!modal) return;

  modal.classList.remove(
    "active"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


document
  .getElementById(
    "adminModalClose"
  )
  ?.addEventListener(
    "click",
    closeModal
  );


document
  .getElementById(
    "adminModal"
  )
  ?.addEventListener(
    "click",
    e => {

      if (
        e.target.id ===
        "adminModal"
      ) {

        closeModal();

      }

    }
  );


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  const container =
    document.getElementById(
      "toastContainer"
    );

  if (!container) return;

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "toast";

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  setTimeout(() => {

    toast.remove();

  }, 3000);

}


/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {

  if (!date) return "";

  return new Date(date)
    .toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

const sidebarToggle =
  document.getElementById(
    "sidebarToggle"
  );

const sidebar =
  document.getElementById(
    "adminSidebar"
  );


sidebarToggle?.addEventListener(
  "click",
  () => {

    sidebar?.classList.toggle(
      "open"
    );

  }
);


/* =========================================================
   SUPABASE AUTH STATE
========================================================= */

db.auth.onAuthStateChange(
  (event, session) => {

    if (session?.user) {

      currentUser =
        session.user;

      showAdmin();

    } else if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;

      showLogin();

    }

  }
);


/* =========================================================
   START
========================================================= */

checkSession();

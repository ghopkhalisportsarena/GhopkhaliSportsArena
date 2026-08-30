/* =========================================================
   GSA ADMIN PANEL
   GHOPKHALI SPORTS ARENA
   SUPABASE VERSION
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


if (
  typeof window.supabase === "undefined"
) {

  console.error(
    "Supabase library is not loaded."
  );

  throw new Error(
    "Supabase library is not loaded."
  );

}


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;

let notices = [];

let friendlyApplications = [];

let membershipApplications = [];


const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setCurrentYear();

    setCurrentDate();

    setupNavigation();

    setupButtons();

    setupModal();

    setupLogin();

    setupSidebar();

    checkSession();

  }
);


/* =========================================================
   YEAR
========================================================= */

function setCurrentYear() {

  $$("[data-current-year]").forEach(
    element => {

      element.textContent =
        new Date().getFullYear();

    }
  );

}


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

  const element =
    $("#currentDate");

  if (!element) return;

  element.textContent =
    new Date().toLocaleDateString(
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

  const form =
    $("#loginForm");

  if (!form) return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const emailElement =
        $("#adminEmail");

      const passwordElement =
        $("#adminPassword");

      const errorBox =
        $("#loginError");


      const email =
        emailElement
          ? emailElement.value.trim()
          : "";

      const password =
        passwordElement
          ? passwordElement.value
          : "";


      if (errorBox) {
        errorBox.textContent = "";
      }


      if (!email || !password) {

        if (errorBox) {

          errorBox.textContent =
            "Please enter email and password.";

        }

        return;

      }


      showLoading(true);


      try {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({
              email,
              password
            });


        if (error) {
          throw error;
        }


        currentUser =
          data.user;


        showAdminPanel();

        await loadDashboard();


        toast(
          "Welcome back!",
          "success"
        );


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        if (errorBox) {

          errorBox.textContent =
            error.message ||
            "Login failed.";

        }


      } finally {

        showLoading(false);

      }

    }
  );

}


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

  try {

    const {
      data: {
        session
      }
    } =
      await supabaseClient.auth
        .getSession();


    if (session?.user) {

      currentUser =
        session.user;

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
  (event, session) => {

    if (
      event === "SIGNED_IN" &&
      session?.user
    ) {

      currentUser =
        session.user;

    }


    if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;

      showLogin();

    }

  }
);


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

  const loginScreen =
    $("#loginScreen");

  const adminApp =
    $("#adminApp");


  if (loginScreen) {

    loginScreen.style.display =
      "flex";

  }


  if (adminApp) {

    adminApp.style.display =
      "none";

  }

}


/* =========================================================
   SHOW ADMIN PANEL
========================================================= */

function showAdminPanel() {

  const loginScreen =
    $("#loginScreen");

  const adminApp =
    $("#adminApp");


  if (loginScreen) {

    loginScreen.style.display =
      "none";

  }


  if (adminApp) {

    adminApp.style.display =
      "flex";

  }


  updateAdminProfile();

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

function updateAdminProfile() {

  if (!currentUser) return;


  const email =
    currentUser.email ||
    "Administrator";


  const name =
    email.split("@")[0] ||
    "Administrator";


  const nameElement =
    $("#adminName");

  const avatarElement =
    $("#adminAvatar");


  if (nameElement) {

    nameElement.textContent =
      name;

  }


  if (avatarElement) {

    avatarElement.textContent =
      name
        .charAt(0)
        .toUpperCase();

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  showLoading(true);


  try {

    const {
      error
    } =
      await supabaseClient.auth
        .signOut();


    if (error) {
      throw error;
    }


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

  $$(".sidebar-link[data-page]")
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


  $$("[data-page-link]")
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

}


/* =========================================================
   OPEN PAGE
========================================================= */

async function openPage(page) {

  if (!currentUser) {

    showLogin();

    return;

  }


  $$(".sidebar-link[data-page]")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.page === page
      );

    });


  $$(".admin-page")
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const pageId =
    page.replace(
      /-/g,
      ""
    ) + "Page";


  const pageElement =
    document.getElementById(
      pageId
    );


  if (pageElement) {

    pageElement.classList.add(
      "active"
    );

  }


  updatePageTitle(page);


  /* -------------------------------------------------------
     PAGE DATA
  ------------------------------------------------------- */

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


  if (
    page ===
    "friendly-applications"
  ) {

    await loadFriendlyApplications();

  }


  if (
    page ===
    "membership-applications"
  ) {

    await loadMembershipApplications();

  }

}


/* =========================================================
   PAGE TITLE
========================================================= */

function updatePageTitle(page) {

  const titles = {

    dashboard:
      "Dashboard",

    notices:
      "Notices",

    gallery:
      "Gallery",

    tournaments:
      "Tournaments",

    fixtures:
      "Matches & Fixtures",

    leadership:
      "Leadership",

    committee:
      "Committee",

    "friendly-applications":
      "Friendly Match Applications",

    "membership-applications":
      "Membership Applications"

  };


  const title =
    titles[page] ||
    "Dashboard";


  const element =
    $("#pageTitle");


  if (element) {

    element.textContent =
      title;

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


  if (!toggle || !sidebar)
    return;


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
          "Dashboard refreshed.",
          "success"
        );

      }
    );

  }


  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
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

  if (
    action ===
    "add-notice"
  ) {

    openNoticeModal();

    return;

  }


  if (
    action ===
    "add-gallery"
  ) {

    openSimpleModal(
      "Add Gallery Photo",
      "Gallery management will be connected next."
    );

    return;

  }


  if (
    action ===
    "add-tournament"
  ) {

    openSimpleModal(
      "Add Tournament",
      "Tournament management will be connected next."
    );

    return;

  }


  if (
    action ===
    "add-fixture"
  ) {

    openSimpleModal(
      "Add Match",
      "Fixture management will be connected next."
    );

    return;

  }


  if (
    action ===
    "add-leader"
  ) {

    openSimpleModal(
      "Add Leader",
      "Leadership management will be connected next."
    );

    return;

  }


  if (
    action ===
    "add-committee"
  ) {

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

  if (!currentUser) return;


  await Promise.all([

    loadNoticeStats(),

    loadApplicationStats(),

    loadRecentActivity()

  ]);

}


/* =========================================================
   NOTICE STATS
========================================================= */

async function loadNoticeStats() {

  try {

    const {
      count,
      error
    } =
      await supabaseClient
        .from("notices")
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (error) {
      throw error;
    }


    const element =
      $("#totalNotices");


    if (element) {

      element.textContent =
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
   APPLICATION STATS
========================================================= */

async function loadApplicationStats() {

  try {

    const [
      friendlyResult,
      membershipResult
    ] = await Promise.all([

      supabaseClient
        .from(
          "friendly_applications"
        )
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        ),

      supabaseClient
        .from(
          "membership_applications"
        )
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        )

    ]);


    if (friendlyResult.error) {

      console.error(
        "Friendly count error:",
        friendlyResult.error
      );

    }


    if (membershipResult.error) {

      console.error(
        "Membership count error:",
        membershipResult.error
      );

    }


    const friendlyCount =
      friendlyResult.count || 0;


    const membershipCount =
      membershipResult.count || 0;


    const friendlyElement =
      $("#totalFriendlyApplications");


    const membershipElement =
      $("#totalMembershipApplications");


    const totalApplicationsElement =
      $("#totalApplications");


    if (friendlyElement) {

      friendlyElement.textContent =
        friendlyCount;

    }


    if (membershipElement) {

      membershipElement.textContent =
        membershipCount;

    }


    if (totalApplicationsElement) {

      totalApplicationsElement.textContent =
        friendlyCount +
        membershipCount;

    }


  } catch (error) {

    console.error(
      "Application stats error:",
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


  container.innerHTML = `

    <div class="empty-state small-empty">

      <span>◌</span>

      <p>
        Loading recent activity...
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
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


    if (error) {
      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <div class="empty-state small-empty">

          <span>◌</span>

          <p>
            No recent activity yet.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data
        .map(notice => `

          <div class="recent-item">

            <div class="recent-item-icon">
              ◉
            </div>

            <div class="recent-item-content">

              <strong>
                ${escapeHTML(
                  notice.title
                )}
              </strong>

              <span>

                ${escapeHTML(
                  notice.category ||
                  "GENERAL"
                )}

                •
                ${formatDate(
                  notice.created_at
                )}

              </span>

            </div>

          </div>

        `)
        .join("");


  } catch (error) {

    console.error(
      "Recent activity error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state small-empty">

        <span>⚠</span>

        <p>
          Could not load recent activity.
        </p>

      </div>

    `;

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

      <p>
        Loading notices...
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
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


    if (error) {
      throw error;
    }


    notices =
      data || [];


    if (!notices.length) {

      container.innerHTML = `

        <div class="empty-state">

          <span>◉</span>

          <h4>
            No notices found
          </h4>

          <p>
            Create your first notice.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      notices
        .map(renderNotice)
        .join("");


  } catch (error) {

    console.error(
      "Load notices error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <span>⚠</span>

        <h4>
          Could not load notices
        </h4>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

  }

}


/* =========================================================
   RENDER NOTICE
========================================================= */

function renderNotice(notice) {

  return `

    <article class="admin-list-item">

      <div class="admin-list-content">

        <div class="notice-meta">

          <span class="notice-category">

            ${escapeHTML(
              notice.category ||
              "GENERAL"
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
            notice.content ||
            ""
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
          onclick="editNotice('${escapeAttribute(
            notice.id
          )}')"
        >
          Edit
        </button>


        <button
          class="admin-small-button danger"
          onclick="deleteNotice('${escapeAttribute(
            notice.id
          )}')"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   CREATE NOTICE MODAL
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


    <form
      id="noticeForm"
      class="admin-form"
    >

      <div class="input-group">

        <label>
          NOTICE TITLE
        </label>

        <input
          type="text"
          id="noticeTitle"
          required
          placeholder="Enter notice title"
        >

      </div>


      <div class="input-group">

        <label>
          CATEGORY
        </label>

        <select
          id="noticeCategory"
        >

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

        <label>
          CONTENT
        </label>

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


  if (form) {

    form.addEventListener(
      "submit",
      createNotice
    );

  }

}


/* =========================================================
   CREATE NOTICE
========================================================= */

async function createNotice(event) {

  event.preventDefault();


  const title =
    $("#noticeTitle")
      ?.value
      .trim();


  const content =
    $("#noticeContent")
      ?.value
      .trim();


  const category =
    $("#noticeCategory")
      ?.value ||
    "GENERAL";


  const published =
    $("#noticePublished")
      ?.checked ||
    false;


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
    } =
      await supabaseClient
        .from("notices")
        .insert({
          title,
          content,
          category,
          image_url: null,
          published
        });


    if (error) {
      throw error;
    }


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

window.editNotice =
  async function(id) {

    const notice =
      notices.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!notice) {

      toast(
        "Notice not found.",
        "error"
      );

      return;

    }


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


      <form
        id="editNoticeForm"
        class="admin-form"
      >

        <div class="input-group">

          <label>
            NOTICE TITLE
          </label>

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

          <label>
            CATEGORY
          </label>

          <select
            id="editNoticeCategory"
          >

            ${getCategoryOptions(
              notice.category
            )}

          </select>

        </div>


        <div class="input-group">

          <label>
            CONTENT
          </label>

          <textarea
            id="editNoticeContent"
            rows="7"
            required
          >${escapeHTML(
            notice.content ||
            ""
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


    const form =
      $("#editNoticeForm");


    if (!form) return;


    form.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        showLoading(true);


        try {

          const {
            error
          } =
            await supabaseClient
              .from("notices")
              .update({

                title:
                  $("#editNoticeTitle")
                    .value
                    .trim(),

                category:
                  $("#editNoticeCategory")
                    .value,

                content:
                  $("#editNoticeContent")
                    .value
                    .trim(),

                published:
                  $("#editNoticePublished")
                    .checked,

                updated_at:
                  new Date()
                    .toISOString()

              })
              .eq(
                "id",
                id
              );


          if (error) {
            throw error;
          }


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

window.deleteNotice =
  async function(id) {

    const notice =
      notices.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!notice) return;


    const confirmed =
      window.confirm(
        `Delete "${notice.title}"?`
      );


    if (!confirmed) return;


    showLoading(true);


    try {

      const {
        error
      } =
        await supabaseClient
          .from("notices")
          .delete()
          .eq(
            "id",
            id
          );


      if (error) {
        throw error;
      }


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
   FRIENDLY APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  const container =
    $("#friendlyApplicationsList");


  if (!container) return;


  container.innerHTML = `

    <div class="empty-state">

      <span>◌</span>

      <h4>
        Loading applications...
      </h4>

      <p>
        Please wait.
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "friendly_applications"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    friendlyApplications =
      data || [];


    if (
      friendlyApplications.length ===
      0
    ) {

      container.innerHTML = `

        <div class="empty-state">

          <span>⚽</span>

          <h4>
            No applications found
          </h4>

          <p>
            Friendly Match applications
            will appear here.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      friendlyApplications
        .map(
          renderFriendlyApplication
        )
        .join("");


  } catch (error) {

    console.error(
      "Friendly applications error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <span>⚠</span>

        <h4>
          Could not load applications
        </h4>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

  }

}


/* =========================================================
   RENDER FRIENDLY APPLICATION
========================================================= */

function renderFriendlyApplication(
  application
) {

  const status =
    application.status ||
    "pending";


  return `

    <article
      class="admin-list-item application-item"
    >

      <div class="admin-list-content">

        <div class="notice-meta">

          <span class="notice-category">
            FRIENDLY MATCH
          </span>

          <span>
            ${formatDateTime(
              application.created_at
            )}
          </span>

        </div>


        <h3>

          ${escapeHTML(
            application.team_name ||
            "Unnamed Team"
          )}

        </h3>


        <p>

          <strong>
            Representative:
          </strong>

          ${escapeHTML(
            application.contact_person ||
            "Not provided"
          )}

        </p>


        <p>

          <strong>
            Phone:
          </strong>

          ${escapeHTML(
            application.phone ||
            "Not provided"
          )}

        </p>


        ${
          application.email
            ? `
              <p>

                <strong>
                  Email:
                </strong>

                ${escapeHTML(
                  application.email
                )}

              </p>
            `
            : ""
        }


        <p>

          <strong>
            Preferred Date:
          </strong>

          ${escapeHTML(
            application.preferred_date ||
            "Not specified"
          )}

        </p>


        <p>

          <strong>
            Preferred Time:
          </strong>

          ${escapeHTML(
            application.preferred_time ||
            "Not specified"
          )}

        </p>


        ${
          application.message
            ? `
              <div class="application-message">

                <strong>
                  Application Details
                </strong>

                <p>
                  ${formatMultiline(
                    application.message
                  )}
                </p>

              </div>
            `
            : ""
        }


        <span class="status-badge ${getStatusClass(
          status
        )}">

          ${escapeHTML(
            String(status)
              .toUpperCase()
          )}

        </span>

      </div>


      <div class="admin-list-actions">

        <button
          class="admin-small-button"
          onclick="viewFriendlyApplication('${escapeAttribute(
            application.id
          )}')"
        >
          View
        </button>


        <button
          class="admin-small-button danger"
          onclick="deleteFriendlyApplication('${escapeAttribute(
            application.id
          )}')"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   VIEW FRIENDLY APPLICATION
========================================================= */

window.viewFriendlyApplication =
  function(id) {

    const application =
      friendlyApplications.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!application) return;


    openModal(`

      <div class="modal-header">

        <span class="page-label">
          FRIENDLY MATCH APPLICATION
        </span>

        <h2>
          ${escapeHTML(
            application.team_name ||
            "Application"
          )}
        </h2>

      </div>


      <div class="application-details">

        <p>
          <strong>
            Representative
          </strong>

          ${escapeHTML(
            application.contact_person ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Phone
          </strong>

          ${escapeHTML(
            application.phone ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Email
          </strong>

          ${escapeHTML(
            application.email ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Preferred Date
          </strong>

          ${escapeHTML(
            application.preferred_date ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Preferred Time
          </strong>

          ${escapeHTML(
            application.preferred_time ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Status
          </strong>

          ${escapeHTML(
            application.status ||
            "pending"
          )}
        </p>


        ${
          application.message
            ? `
              <div>

                <strong>
                  Details
                </strong>

                <p>
                  ${formatMultiline(
                    application.message
                  )}
                </p>

              </div>
            `
            : ""
        }

      </div>

    `);

  };


/* =========================================================
   DELETE FRIENDLY APPLICATION
========================================================= */

window.deleteFriendlyApplication =
  async function(id) {

    const application =
      friendlyApplications.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!application) return;


    const confirmed =
      window.confirm(
        `Delete application from "${application.team_name}"?`
      );


    if (!confirmed) return;


    showLoading(true);


    try {

      const {
        error
      } =
        await supabaseClient
          .from(
            "friendly_applications"
          )
          .delete()
          .eq(
            "id",
            id
          );


      if (error) {
        throw error;
      }


      toast(
        "Friendly application deleted.",
        "success"
      );


      await loadFriendlyApplications();

      await loadApplicationStats();


    } catch (error) {

      console.error(
        "Delete friendly application error:",
        error
      );


      toast(
        error.message ||
        "Failed to delete application.",
        "error"
      );


    } finally {

      showLoading(false);

    }

  };


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

async function loadMembershipApplications() {

  const container =
    $("#membershipApplicationsList");


  if (!container) return;


  container.innerHTML = `

    <div class="empty-state">

      <span>◌</span>

      <h4>
        Loading applications...
      </h4>

      <p>
        Please wait.
      </p>

    </div>

  `;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "membership_applications"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {
      throw error;
    }


    membershipApplications =
      data || [];


    if (
      membershipApplications.length ===
      0
    ) {

      container.innerHTML = `

        <div class="empty-state">

          <span>✦</span>

          <h4>
            No applications found
          </h4>

          <p>
            Membership applications
            will appear here.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      membershipApplications
        .map(
          renderMembershipApplication
        )
        .join("");


  } catch (error) {

    console.error(
      "Membership applications error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <span>⚠</span>

        <h4>
          Could not load applications
        </h4>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

  }

}


/* =========================================================
   RENDER MEMBERSHIP APPLICATION
========================================================= */

function renderMembershipApplication(
  application
) {

  const status =
    application.status ||
    "pending";


  return `

    <article
      class="admin-list-item application-item"
    >

      <div class="admin-list-content">

        <div class="notice-meta">

          <span class="notice-category">
            MEMBERSHIP
          </span>

          <span>
            ${formatDateTime(
              application.created_at
            )}
          </span>

        </div>


        <h3>

          ${escapeHTML(
            application.full_name ||
            "Unnamed Applicant"
          )}

        </h3>


        <p>

          <strong>
            Phone:
          </strong>

          ${escapeHTML(
            application.phone ||
            "Not provided"
          )}

        </p>


        <p>

          <strong>
            Date of Birth:
          </strong>

          ${escapeHTML(
            application.date_of_birth ||
            "Not provided"
          )}

        </p>


        <p>

          <strong>
            Occupation:
          </strong>

          ${escapeHTML(
            application.occupation ||
            "Not provided"
          )}

        </p>


        <p>

          <strong>
            Address:
          </strong>

          ${escapeHTML(
            application.address ||
            "Not provided"
          )}

        </p>


        ${
          application.preferred_position
            ? `
              <p>

                <strong>
                  Main Skill:
                </strong>

                ${escapeHTML(
                  application.preferred_position
                )}

              </p>
            `
            : ""
        }


        ${
          application.experience
            ? `
              <div class="application-message">

                <strong>
                  Sports / Experience
                </strong>

                <p>
                  ${formatMultiline(
                    application.experience
                  )}
                </p>

              </div>
            `
            : ""
        }


        ${
          application.message
            ? `
              <div class="application-message">

                <strong>
                  Additional Information
                </strong>

                <p>
                  ${formatMultiline(
                    application.message
                  )}
                </p>

              </div>
            `
            : ""
        }


        <span class="status-badge ${getStatusClass(
          status
        )}">

          ${escapeHTML(
            String(status)
              .toUpperCase()
          )}

        </span>

      </div>


      <div class="admin-list-actions">

        <button
          class="admin-small-button"
          onclick="viewMembershipApplication('${escapeAttribute(
            application.id
          )}')"
        >
          View
        </button>


        <button
          class="admin-small-button danger"
          onclick="deleteMembershipApplication('${escapeAttribute(
            application.id
          )}')"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   VIEW MEMBERSHIP APPLICATION
========================================================= */

window.viewMembershipApplication =
  function(id) {

    const application =
      membershipApplications.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!application) return;


    openModal(`

      <div class="modal-header">

        <span class="page-label">
          MEMBERSHIP APPLICATION
        </span>

        <h2>
          ${escapeHTML(
            application.full_name ||
            "Application"
          )}
        </h2>

      </div>


      <div class="application-details">

        <p>
          <strong>
            Full Name
          </strong>

          ${escapeHTML(
            application.full_name ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Date of Birth
          </strong>

          ${escapeHTML(
            application.date_of_birth ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Phone
          </strong>

          ${escapeHTML(
            application.phone ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Address
          </strong>

          ${escapeHTML(
            application.address ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Occupation
          </strong>

          ${escapeHTML(
            application.occupation ||
            "—"
          )}
        </p>


        <p>
          <strong>
            Main Sports Skill
          </strong>

          ${escapeHTML(
            application.preferred_position ||
            "—"
          )}
        </p>


        ${
          application.experience
            ? `
              <div>

                <strong>
                  Sports & Experience
                </strong>

                <p>
                  ${formatMultiline(
                    application.experience
                  )}
                </p>

              </div>
            `
            : ""
        }


        ${
          application.message
            ? `
              <div>

                <strong>
                  Additional Information
                </strong>

                <p>
                  ${formatMultiline(
                    application.message
                  )}
                </p>

              </div>
            `
            : ""
        }


        <p>

          <strong>
            Status
          </strong>

          ${escapeHTML(
            application.status ||
            "pending"
          )}

        </p>


        ${
          application.admin_note
            ? `
              <div>

                <strong>
                  Admin Note
                </strong>

                <p>
                  ${formatMultiline(
                    application.admin_note
                  )}
                </p>

              </div>
            `
            : ""
        }

      </div>

    `);

  };


/* =========================================================
   DELETE MEMBERSHIP APPLICATION
========================================================= */

window.deleteMembershipApplication =
  async function(id) {

    const application =
      membershipApplications.find(
        item =>
          String(item.id) ===
          String(id)
      );


    if (!application) return;


    const confirmed =
      window.confirm(
        `Delete membership application from "${application.full_name}"?`
      );


    if (!confirmed) return;


    showLoading(true);


    try {

      const {
        error
      } =
        await supabaseClient
          .from(
            "membership_applications"
          )
          .delete()
          .eq(
            "id",
            id
          );


      if (error) {
        throw error;
      }


      toast(
        "Membership application deleted.",
        "success"
      );


      await loadMembershipApplications();

      await loadApplicationStats();


    } catch (error) {

      console.error(
        "Delete membership application error:",
        error
      );


      toast(
        error.message ||
        "Failed to delete application.",
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

      <h4>
        Gallery
      </h4>

      <p>
        Gallery database connection
        will be added next.
      </p>

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

      <h4>
        Tournaments
      </h4>

      <p>
        Tournament database connection
        will be added next.
      </p>

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

      <h4>
        Matches & Fixtures
      </h4>

      <p>
        Fixture database connection
        will be added next.
      </p>

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

      <h4>
        Leadership
      </h4>

      <p>
        Leadership database connection
        will be added next.
      </p>

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

      <h4>
        Committee
      </h4>

      <p>
        Committee database connection
        will be added next.
      </p>

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
      event => {

        if (
          event.target ===
          modal
        ) {

          closeModal();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeModal();

      }

    }
  );

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(content) {

  const modal =
    $("#adminModal");


  const modalContent =
    $("#adminModalContent");


  if (
    !modal ||
    !modalContent
  ) return;


  modalContent.innerHTML =
    content;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

  const modal =
    $("#adminModal");


  if (!modal) return;


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

}


/* =========================================================
   SIMPLE MODAL
========================================================= */

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
        ${escapeHTML(
          title
        )}
      </h2>

    </div>


    <div class="empty-state">

      <p>
        ${escapeHTML(
          message
        )}
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
    show
      ? "flex"
      : "none";

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


  if (!container) {

    console.log(
      message
    );

    return;

  }


  const item =
    document.createElement(
      "div"
    );


  item.className =
    `toast toast-${type}`;


  item.textContent =
    message;


  container.appendChild(
    item
  );


  setTimeout(
    () => {

      item.remove();

    },
    3500
  );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

  if (!date) return "";


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "";

  }


  return parsed.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}


/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(date) {

  if (!date) return "";


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "";

  }


  return parsed.toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


/* =========================================================
   MULTILINE TEXT
========================================================= */

function formatMultiline(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return escapeHTML(
    value
  ).replace(
    /\n/g,
    "<br>"
  );

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
  status
) {

  const value =
    String(
      status ||
      "pending"
    )
      .toLowerCase()
      .trim();


  if (
    value ===
    "approved"
  ) {

    return "published";

  }


  if (
    value ===
    "rejected"
  ) {

    return "draft";

  }


  if (
    value ===
    "pending"
  ) {

    return "pending";

  }


  return value;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   CATEGORY OPTIONS
========================================================= */

function getCategoryOptions(
  selected
) {

  const categories = [

    "GENERAL",

    "SPORTS",

    "MATCH",

    "TOURNAMENT",

    "ANNOUNCEMENT"

  ];


  return categories
    .map(
      category => `

        <option
          value="${category}"
          ${
            String(
              selected ||
              ""
            ).toUpperCase() ===
            category
              ? "selected"
              : ""
          }
        >
          ${category}
        </option>

      `
    )
    .join("");

}


/* =========================================================
   INITIALIZED
========================================================= */

console.log(
  "GSA Admin Panel initialized."
);
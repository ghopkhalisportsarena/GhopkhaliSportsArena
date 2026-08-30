/* =========================================================
   GSA ADMIN PANEL
   Ghopkhali Sports Arena
   Supabase — STABLE VERSION
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


let supabaseClient = null;


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;
let notices = [];

let dashboardLoading = false;


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  console.log("GSA Admin Panel starting...");

  setCurrentYear();
  setCurrentDate();

  setupNavigation();
  setupButtons();
  setupModal();
  setupLogin();
  setupSidebar();

  initializeSupabase();

});


/* =========================================================
   SUPABASE INITIALIZATION
========================================================= */

function initializeSupabase() {

  try {

    if (!window.supabase) {

      console.error(
        "Supabase library not found."
      );

      showLoginError(
        "Supabase library could not be loaded. Please refresh the page."
      );

      return;

    }


    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );


    console.log(
      "Supabase initialized successfully."
    );


    setupAuthListener();

    checkSession();


  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    showLoginError(
      "Unable to connect to Supabase."
    );

  }

}


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

  if (!form) {

    console.warn(
      "Login form not found."
    );

    return;

  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!supabaseClient) {

        showLoginError(
          "Supabase is not ready. Please refresh the page."
        );

        return;

      }


      const email =
        $("#adminEmail")?.value.trim() || "";

      const password =
        $("#adminPassword")?.value || "";


      const errorBox =
        $("#loginError");


      if (errorBox) {
        errorBox.textContent = "";
      }


      if (!email || !password) {

        showLoginError(
          "Please enter email and password."
        );

        return;

      }


      showLoading(true);


      try {

        console.log(
          "Attempting admin login..."
        );


        const {
          data,
          error
        } =
          await supabaseClient.auth.signInWithPassword({
            email,
            password
          });


        if (error) {
          throw error;
        }


        if (!data?.user) {

          throw new Error(
            "Login succeeded but no user was returned."
          );

        }


        currentUser =
          data.user;


        console.log(
          "Login successful:",
          currentUser.email
        );


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


        showLoginError(
          getSupabaseErrorMessage(error)
        );


      } finally {

        showLoading(false);

      }

    }
  );

}


/* =========================================================
   AUTH LISTENER
========================================================= */

function setupAuthListener() {

  if (!supabaseClient) return;


  supabaseClient.auth.onAuthStateChange(
    (event, session) => {

      console.log(
        "Auth event:",
        event
      );


      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {

        currentUser =
          session.user;

      }


      if (event === "SIGNED_OUT") {

        currentUser =
          null;

        showLogin();

      }

    }
  );

}


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

  if (!supabaseClient) {

    showLogin();

    return;

  }


  try {

    console.log(
      "Checking session..."
    );


    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {
      throw error;
    }


    const session =
      data?.session;


    if (
      session &&
      session.user
    ) {

      currentUser =
        session.user;


      console.log(
        "Existing session found."
      );


      showAdminPanel();


      await loadDashboard();


    } else {

      console.log(
        "No active session."
      );


      showLogin();

    }


  } catch (error) {

    console.error(
      "Session check error:",
      error
    );


    showLogin();

  }

}


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
   SHOW ADMIN
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

  if (!supabaseClient) return;


  showLoading(true);


  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {
      throw error;
    }


    currentUser =
      null;


    showLogin();


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
      getSupabaseErrorMessage(error),
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

  if (!page) return;


  console.log(
    "Opening page:",
    page
  );


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
    page.replace(/-/g, "") +
    "Page";


  const pageElement =
    document.getElementById(pageId);


  if (pageElement) {

    pageElement.classList.add(
      "active"
    );

  }


  updatePageTitle(page);


  try {

    switch (page) {

      case "dashboard":
        await loadDashboard();
        break;

      case "notices":
        await loadNotices();
        break;

      case "gallery":
        await loadGallery();
        break;

      case "tournaments":
        await loadTournaments();
        break;

      case "fixtures":
        await loadFixtures();
        break;

      case "leadership":
        await loadLeadership();
        break;

      case "committee":
        await loadCommittee();
        break;

      case "friendly-applications":
        await loadFriendlyApplications();
        break;

      case "membership-applications":
        await loadMembershipApplications();
        break;

    }


  } catch (error) {

    console.error(
      "Page loading error:",
      error
    );

    toast(
      "Could not load page data.",
      "error"
    );

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
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button) return;


      handleAction(
        button.dataset.action
      );

    }
  );

}


/* =========================================================
   ACTIONS
========================================================= */

function handleAction(action) {

  switch (action) {

    case "add-notice":

      openNoticeModal();

      break;


    case "add-gallery":

      openSimpleModal(
        "Add Gallery Photo",
        "Gallery management will be connected next."
      );

      break;


    case "add-tournament":

      openSimpleModal(
        "Add Tournament",
        "Tournament management will be connected next."
      );

      break;


    case "add-fixture":

      openSimpleModal(
        "Add Match",
        "Fixture management will be connected next."
      );

      break;


    case "add-leader":

      openSimpleModal(
        "Add Leader",
        "Leadership management will be connected next."
      );

      break;


    case "add-committee":

      openSimpleModal(
        "Add Committee Member",
        "Committee management will be connected next."
      );

      break;

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  if (!supabaseClient) {

    console.warn(
      "Dashboard skipped: Supabase unavailable."
    );

    return;

  }


  if (dashboardLoading) {
    return;
  }


  dashboardLoading =
    true;


  console.log(
    "Loading dashboard..."
  );


  try {

    await Promise.all([
      loadNoticeStats(),
      loadRecentActivity()
    ]);


    console.log(
      "Dashboard loaded successfully."
    );


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );


  } finally {

    dashboardLoading =
      false;

  }

}


/* =========================================================
   NOTICE STATS
========================================================= */

async function loadNoticeStats() {

  const element =
    $("#totalNotices");


  if (!element) return;


  element.textContent =
    "…";


  try {

    const {
      count,
      error
    } =
      await supabaseClient
        .from("notices")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );


    if (error) {
      throw error;
    }


    element.textContent =
      count ?? 0;


  } catch (error) {

    console.error(
      "Notice stats error:",
      error
    );


    element.textContent =
      "0";

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
      <p>Loading...</p>
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
          <p>No recent activity yet.</p>
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
          ${escapeHTML(
            getSupabaseErrorMessage(error)
          )}
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
      <p>Loading notices...</p>
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
          <h4>No notices found</h4>
          <p>Create your first notice.</p>
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
            getSupabaseErrorMessage(error)
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
            notice.content || ""
          )}
        </p>


        <span
          class="status-badge ${
            notice.published
              ? "published"
              : "draft"
          }"
        >

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
    $("#noticeTitle")?.value.trim() ||
    "";

  const content =
    $("#noticeContent")?.value.trim() ||
    "";

  const category =
    $("#noticeCategory")?.value ||
    "GENERAL";

  const published =
    $("#noticePublished")?.checked ||
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


    if (
      $("#noticesList")
    ) {

      await loadNotices();

    }


  } catch (error) {

    console.error(
      "Create notice error:",
      error
    );


    toast(
      getSupabaseErrorMessage(error),
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

          <select id="editNoticeCategory">

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


          if (
            $("#noticesList")
          ) {

            await loadNotices();

          }


        } catch (error) {

          console.error(
            "Update notice error:",
            error
          );


          toast(
            getSupabaseErrorMessage(error),
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


      if (
        $("#noticesList")
      ) {

        await loadNotices();

      }


    } catch (error) {

      console.error(
        "Delete notice error:",
        error
      );


      toast(
        getSupabaseErrorMessage(error),
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
        Gallery management will be connected next.
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
        Tournament management will be connected next.
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
        Fixture management will be connected next.
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
        Leadership management will be connected next.
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
        Committee management will be connected next.
      </p>

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

      <h4>
        No applications loaded
      </h4>

      <p>
        Friendly Match applications
        will appear here.
      </p>

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

      <h4>
        No applications loaded
      </h4>

      <p>
        Membership applications
        will appear here.
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
          event.target === modal
        ) {

          closeModal();

        }

      }
    );

  }

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
  ) {

    console.error(
      "Admin modal elements not found."
    );

    return;

  }


  modalContent.innerHTML =
    content;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
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
    show
      ? "flex"
      : "none";

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(message) {

  const errorBox =
    $("#loginError");


  if (errorBox) {

    errorBox.textContent =
      message;

  }

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
      `[${type}]`,
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

function escapeAttribute(value) {

  return escapeHTML(value);

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
    .map(category => `

      <option
        value="${category}"
        ${
          String(selected)
            .toUpperCase() ===
          category
            ? "selected"
            : ""
        }
      >
        ${category}
      </option>

    `)
    .join("");

}


/* =========================================================
   SUPABASE ERROR
========================================================= */

function getSupabaseErrorMessage(
  error
) {

  if (!error) {

    return "Unknown error.";

  }


  if (
    error.message
  ) {

    return error.message;

  }


  if (
    error.error_description
  ) {

    return error.error_description;

  }


  return "Something went wrong.";

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeModal();

    }

  }
);


/* =========================================================
   GLOBAL ERROR LOGGER
========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "JavaScript error:",
      event.error ||
      event.message
    );

  }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
  "GSA Admin JS loaded."
);
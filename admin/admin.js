/* =========================================================
   GSA ADMIN PANEL
   GHOPKHALI SPORTS ARENA
   SUPABASE — FULL REPLACEMENT
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


/* =========================================================
   SUPABASE INITIALIZATION
========================================================= */

let supabaseClient = null;

try {

  if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
  ) {

    throw new Error(
      "Supabase library is not loaded."
    );

  }

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

} catch (error) {

  console.error(
    "Supabase initialization error:",
    error
  );

}


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;
let notices = [];


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "GSA Admin Panel starting..."
    );

    setCurrentYear();
    setCurrentDate();

    setupNavigation();
    setupButtons();
    setupModal();
    setupLogin();
    setupSidebar();

    /*
      IMPORTANT:
      Show login immediately.
      This prevents infinite splash/loading.
    */

    showLogin();

    /*
      Check authentication after UI is ready.
    */

    await checkSession();

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


      const emailInput =
        $("#adminEmail");

      const passwordInput =
        $("#adminPassword");

      const errorBox =
        $("#loginError");


      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      const password =
        passwordInput
          ? passwordInput.value
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

        if (!supabaseClient) {

          throw new Error(
            "Supabase is not initialized."
          );

        }


        console.log(
          "Attempting admin login..."
        );


        const result =
          await supabaseClient.auth
            .signInWithPassword({
              email,
              password
            });


        const {
          data,
          error
        } = result;


        if (error) {
          throw error;
        }


        if (!data || !data.user) {

          throw new Error(
            "Login successful but user data was not returned."
          );

        }


        currentUser =
          data.user;


        console.log(
          "Admin login successful:",
          currentUser.email
        );


        showAdminPanel();


        /*
          Do not block the panel
          while dashboard loads.
        */

        loadDashboard()
          .catch(error => {

            console.error(
              "Dashboard loading error:",
              error
            );

          });


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
   SESSION CHECK
========================================================= */

async function checkSession() {

  if (!supabaseClient) {

    console.error(
      "Supabase client unavailable."
    );

    showLogin();

    return;

  }


  try {

    console.log(
      "Checking admin session..."
    );


    /*
      Timeout prevents infinite loading.
    */

    const sessionPromise =
      supabaseClient.auth.getSession();


    const timeoutPromise =
      new Promise(
        (_, reject) => {

          setTimeout(
            () => {

              reject(
                new Error(
                  "Session check timed out."
                )
              );

            },
            8000
          );

        }
      );


    const {
      data,
      error
    } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]);


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
        "Existing admin session found."
      );


      showAdminPanel();


      /*
        Dashboard loading is independent.
      */

      loadDashboard()
        .catch(error => {

          console.error(
            "Dashboard error:",
            error
          );

        });


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


    /*
      Make sure loading overlay
      can never remain visible.
    */

    showLoading(false);

  }

}


/* =========================================================
   AUTH STATE
========================================================= */

if (supabaseClient) {

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

        updateAdminProfile();

      }


      if (
        event === "SIGNED_OUT"
      ) {

        currentUser =
          null;

        showLogin();

      }

    }
  );

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


  showLoading(false);

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

    if (!supabaseClient) {
      throw new Error(
        "Supabase is not initialized."
      );
    }


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
      error.message ||
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

  if (!page) return;


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
    document.getElementById(
      pageId
    );


  if (pageElement) {

    pageElement.classList.add(
      "active"
    );

  }


  updatePageTitle(page);


  try {

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

  } catch (error) {

    console.error(
      "Page loading error:",
      error
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


  if (!toggle || !sidebar) {
    return;
  }


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

        showLoading(true);


        try {

          await loadDashboard();


          toast(
            "Data refreshed.",
            "success"
          );

        } catch (error) {

          console.error(error);


          toast(
            "Refresh failed.",
            "error"
          );

        } finally {

          showLoading(false);

        }

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

  console.log(
    "Loading dashboard..."
  );


  /*
    Do NOT show global loading here.
    Otherwise a slow query can make the
    entire admin panel look frozen.
  */

  await Promise.allSettled([

    loadNoticeStats(),

    loadRecentActivity(),

    loadApplicationStats()

  ]);


  console.log(
    "Dashboard loaded."
  );

}


/* =========================================================
   NOTICE STATS
========================================================= */

async function loadNoticeStats() {

  const element =
    $("#totalNotices");


  if (!element) return;


  try {

    const {
      count,
      error
    } =
      await supabaseClient
        .from("notices")
        .select("*", {
          count: "exact",
          head: true
        });


    if (error) {
      throw error;
    }


    element.textContent =
      count || 0;


  } catch (error) {

    console.error(
      "Notice stats error:",
      error
    );


    element.textContent =
      "—";

  }

}


/* =========================================================
   APPLICATION STATS
========================================================= */

async function loadApplicationStats() {

  const friendlyElement =
    $("#totalFriendlyApplications");

  const membershipElement =
    $("#totalMembershipApplications");


  if (
    !friendlyElement &&
    !membershipElement
  ) {

    return;

  }


  if (friendlyElement) {

    try {

      const {
        count,
        error
      } =
        await supabaseClient
          .from(
            "friendly_applications"
          )
          .select("*", {
            count: "exact",
            head: true
          });


      if (!error) {

        friendlyElement.textContent =
          count || 0;

      }

    } catch (error) {

      console.error(
        "Friendly stats error:",
        error
      );

    }

  }


  if (membershipElement) {

    try {

      const {
        count,
        error
      } =
        await supabaseClient
          .from(
            "membership_applications"
          )
          .select("*", {
            count: "exact",
            head: true
          });


      if (!error) {

        membershipElement.textContent =
          count || 0;

      }

    } catch (error) {

      console.error(
        "Membership stats error:",
        error
      );

    }

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
        .map(notice => {

          return `
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
          `;

        })
        .join("");


  } catch (error) {

    console.error(
      "Recent activity error:",
      error
    );


    container.innerHTML = `
      <div class="empty-state small-empty">
        <span>⚠</span>
        <p>Unable to load recent activity.</p>
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
        <h4>Could not load notices</h4>
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
      ?.value;


  const published =
    $("#noticePublished")
      ?.checked;


  if (
    !title ||
    !content
  ) {

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

          image_url:
            null,

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
      <p>
        Gallery database connection will be added next.
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
      <h4>Tournaments</h4>
      <p>
        Tournament database connection will be added next.
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
      <h4>Matches & Fixtures</h4>
      <p>
        Fixture database connection will be added next.
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
      <h4>Leadership</h4>
      <p>
        Leadership database connection will be added next.
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
      <h4>Committee</h4>
      <p>
        Committee database connection will be added next.
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
      <h4>Friendly Match Applications</h4>
      <p>
        Applications will appear here.
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
      <h4>Membership Applications</h4>
      <p>
        Applications will appear here.
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
    .map(category => {

      return `
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
      `;

    })
    .join("");

}


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "GSA Admin JS Error:",
      event.error ||
      event.message
    );

    /*
      Never allow a JavaScript error
      to leave the loading screen stuck.
    */

    showLoading(false);

  }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
  "GSA Admin Panel JavaScript loaded."
);
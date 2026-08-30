/* =========================================================
   GSA ADMIN PANEL
   GHOPKHALI SPORTS ARENA
   SUPABASE ADMINISTRATION
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

let supabaseClient = null;

if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {
  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
}


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
  document.getElementById("loginScreen");

const adminApp =
  document.getElementById("adminApp");

const loginForm =
  document.getElementById("loginForm");

const loginError =
  document.getElementById("loginError");

const logoutButton =
  document.getElementById("logoutButton");

const adminLoading =
  document.getElementById("adminLoading");

const sidebar =
  document.getElementById("adminSidebar");

const sidebarToggle =
  document.getElementById("sidebarToggle");

const adminModal =
  document.getElementById("adminModal");

const adminModalContent =
  document.getElementById("adminModalContent");

const adminModalClose =
  document.getElementById("adminModalClose");

const toastContainer =
  document.getElementById("toastContainer");


/* =========================================================
   BASIC HELPERS
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function formatDate(dateValue) {

  if (!dateValue) {
    return "—";
  }

  const date =
    new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(dateValue);
  }

  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


function formatDateTime(dateValue) {

  if (!dateValue) {
    return "—";
  }

  const date =
    new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(dateValue);
  }

  return date.toLocaleString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );

}


/* =========================================================
   YEAR
========================================================= */

document
  .querySelectorAll("[data-current-year]")
  .forEach(element => {

    element.textContent =
      new Date().getFullYear();

  });


/* =========================================================
   DATE
========================================================= */

function updateDate() {

  const dateElement =
    document.getElementById(
      "currentDate"
    );

  if (!dateElement) {
    return;
  }

  dateElement.textContent =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

  if (!adminLoading) {
    return;
  }

  adminLoading.style.display =
    "grid";

}


function hideLoading() {

  if (!adminLoading) {
    return;
  }

  adminLoading.style.display =
    "none";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "success"
) {

  if (!toastContainer) {
    return;
  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;

  toast.textContent =
    message;

  toastContainer.appendChild(
    toast
  );

  setTimeout(() => {

    toast.style.opacity =
      "0";

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3000);

}


/* =========================================================
   LOGIN SCREEN
========================================================= */

function showLoginScreen() {

  if (loginScreen) {
    loginScreen.style.display =
      "flex";
  }

  if (adminApp) {
    adminApp.style.display =
      "none";
  }

}


async function showAdminPanel() {

  if (loginScreen) {
    loginScreen.style.display =
      "none";
  }

  if (adminApp) {
    adminApp.style.display =
      "flex";
  }

  updateDate();

  await loadAdminProfile();

  await loadDashboard();

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
  email,
  password
) {

  if (!supabaseClient) {

    if (loginError) {
      loginError.textContent =
        "Supabase could not be loaded.";
    }

    return false;

  }

  if (loginError) {
    loginError.textContent =
      "";
  }

  showLoading();

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

      if (loginError) {
        loginError.textContent =
          error.message ||
          "Invalid email or password.";
      }

      return false;

    }

    if (!data || !data.session) {

      if (loginError) {
        loginError.textContent =
          "Login session could not be created.";
      }

      return false;

    }

    return true;

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    if (loginError) {
      loginError.textContent =
        "Something went wrong while signing in.";
    }

    return false;

  } finally {

    hideLoading();

  }

}


/* =========================================================
   LOGIN FORM
========================================================= */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const emailInput =
        document.getElementById(
          "adminEmail"
        );

      const passwordInput =
        document.getElementById(
          "adminPassword"
        );

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      const password =
        passwordInput
          ? passwordInput.value
          : "";

      if (!email || !password) {
        return;
      }

      const success =
        await loginUser(
          email,
          password
        );

      if (success) {

        await showAdminPanel();

      }

    }
  );

}


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

  if (!supabaseClient) {

    hideLoading();
    showLoginScreen();

    if (loginError) {
      loginError.textContent =
        "Supabase library is not available.";
    }

    return;

  }

  showLoading();

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

      showLoginScreen();
      return;

    }

    const session =
      data?.session;

    if (session) {

      await showAdminPanel();

    } else {

      showLoginScreen();

    }

  } catch (error) {

    console.error(
      "Session check failed:",
      error
    );

    showLoginScreen();

  } finally {

    hideLoading();

  }

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

  if (!supabaseClient) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getUser();

    if (error || !data?.user) {
      return;
    }

    const user =
      data.user;

    const email =
      user.email ||
      "Administrator";

    const rawName =
      email
        .split("@")[0]
        .replace(/[._-]/g, " ");

    const formattedName =
      rawName.replace(
        /\b\w/g,
        char =>
          char.toUpperCase()
      );

    const adminName =
      document.getElementById(
        "adminName"
      );

    const adminAvatar =
      document.getElementById(
        "adminAvatar"
      );

    if (adminName) {

      adminName.textContent =
        formattedName;

    }

    if (adminAvatar) {

      adminAvatar.textContent =
        formattedName
          .charAt(0)
          .toUpperCase();

    }

  } catch (error) {

    console.error(
      "Profile error:",
      error
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      if (!supabaseClient) {
        return;
      }

      showLoading();

      try {

        await supabaseClient.auth
          .signOut();

        showLoginScreen();

        showToast(
          "You have been signed out."
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      } finally {

        hideLoading();

      }

    }
  );

}


/* =========================================================
   SIDEBAR
========================================================= */

if (sidebarToggle) {

  sidebarToggle.addEventListener(
    "click",
    () => {

      if (!sidebar) {
        return;
      }

      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const sidebarLinks =
  document.querySelectorAll(
    ".sidebar-link[data-page]"
  );


function getPageId(pageName) {

  const pageMap = {

    dashboard:
      "dashboardPage",

    notices:
      "noticesPage",

    gallery:
      "galleryPage",

    tournaments:
      "tournamentsPage",

    fixtures:
      "fixturesPage",

    leadership:
      "leadershipPage",

    committee:
      "committeePage",

    "friendly-applications":
      "friendlyApplicationsPage",

    "membership-applications":
      "membershipApplicationsPage"

  };

  return pageMap[pageName] ||
    null;

}


function openPage(pageName) {

  document
    .querySelectorAll(
      ".admin-page"
    )
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  document
    .querySelectorAll(
      ".sidebar-link[data-page]"
    )
    .forEach(link => {

      link.classList.remove(
        "active"
      );

    });


  const pageId =
    getPageId(pageName);

  const page =
    pageId
      ? document.getElementById(
          pageId
        )
      : null;


  const activeLink =
    document.querySelector(
      `.sidebar-link[data-page="${pageName}"]`
    );


  if (page) {

    page.classList.add(
      "active"
    );

  }

  if (activeLink) {

    activeLink.classList.add(
      "active"
    );

  }


  const titles = {

    dashboard: [
      "ADMINISTRATION",
      "Dashboard"
    ],

    notices: [
      "CONTENT MANAGEMENT",
      "Notices"
    ],

    gallery: [
      "MEDIA MANAGEMENT",
      "Gallery"
    ],

    tournaments: [
      "SPORTS MANAGEMENT",
      "Tournaments"
    ],

    fixtures: [
      "MATCH MANAGEMENT",
      "Matches & Fixtures"
    ],

    leadership: [
      "CLUB LEADERSHIP",
      "Leadership"
    ],

    committee: [
      "CLUB MANAGEMENT",
      "Committee"
    ],

    "friendly-applications": [
      "APPLICATION CENTER",
      "Friendly Match Applications"
    ],

    "membership-applications": [
      "APPLICATION CENTER",
      "Membership Applications"
    ]

  };


  const title =
    titles[pageName];


  if (title) {

    const pageKicker =
      document.getElementById(
        "pageKicker"
      );

    const pageTitle =
      document.getElementById(
        "pageTitle"
      );

    if (pageKicker) {
      pageKicker.textContent =
        title[0];
    }

    if (pageTitle) {
      pageTitle.textContent =
        title[1];
    }

  }


  /* Load page-specific data */

  switch (pageName) {

    case "notices":
      loadNotices();
      break;

    case "gallery":
      loadGallery();
      break;

    case "tournaments":
      loadTournaments();
      break;

    case "fixtures":
      loadFixtures();
      break;

    case "leadership":
      loadLeadership();
      break;

    case "committee":
      loadCommittee();
      break;

    case "friendly-applications":
      loadFriendlyApplications();
      break;

    case "membership-applications":
      loadMembershipApplications();
      break;

  }

}


sidebarLinks.forEach(link => {

  link.addEventListener(
    "click",
    () => {

      openPage(
        link.dataset.page
      );

      if (sidebar) {

        sidebar.classList.remove(
          "open"
        );

      }

    }
  );

});


/* =========================================================
   PAGE LINKS
========================================================= */

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


/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

  if (!adminModal ||
      !adminModalContent) {
    return;
  }

  adminModalContent.innerHTML =
    content;

  adminModal.classList.add(
    "show"
  );

  adminModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );

}


function closeModal() {

  if (!adminModal ||
      !adminModalContent) {
    return;
  }

  adminModal.classList.remove(
    "show"
  );

  adminModal.setAttribute(
    "aria-hidden",
    "true"
  );

  adminModalContent.innerHTML =
    "";

  document.body.classList.remove(
    "modal-open"
  );

}


if (adminModalClose) {

  adminModalClose.addEventListener(
    "click",
    closeModal
  );

}


if (adminModal) {

  adminModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        adminModal
      ) {

        closeModal();

      }

    }
  );

}


/* =========================================================
   ESC CLOSE MODAL
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

        switch (action) {

          case "add-notice":
            openNoticeModal();
            break;

          case "add-fixture":
            openFixtureModal();
            break;

          case "add-tournament":
            openTournamentModal();
            break;

          case "add-gallery":
            openGalleryModal();
            break;

          case "add-leader":
            openLeaderModal();
            break;

          case "add-committee":
            openCommitteeModal();
            break;

        }

      }
    );

  });


/* =========================================================
   NOTICE MODAL
========================================================= */

function openNoticeModal() {

  openModal(`

    <form
      class="modal-form"
      id="noticeForm"
    >

      <h2>
        Create New Notice
      </h2>

      <div class="form-field">

        <label>
          TITLE
        </label>

        <input
          type="text"
          id="noticeTitle"
          placeholder="Notice title"
          required
        >

      </div>


      <div class="form-field">

        <label>
          CONTENT
        </label>

        <textarea
          id="noticeContent"
          placeholder="Write your notice..."
          rows="6"
          required
        ></textarea>

      </div>


      <div class="form-field">

        <label>
          CATEGORY
        </label>

        <input
          type="text"
          id="noticeCategory"
          placeholder="General"
          value="General"
        >

      </div>


      <div class="form-field">

        <label>
          IMAGE URL
        </label>

        <input
          type="url"
          id="noticeImage"
          placeholder="https://..."
        >

      </div>


      <div class="form-field">

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
        class="admin-button admin-button-dark form-submit"
        type="submit"
      >
        Publish Notice
      </button>

    </form>

  `);


  const form =
    document.getElementById(
      "noticeForm"
    );

  if (form) {

    form.addEventListener(
      "submit",
      saveNotice
    );

  }

}


/* =========================================================
   SAVE NOTICE
========================================================= */

async function saveNotice(event) {

  event.preventDefault();

  if (!supabaseClient) {
    showToast(
      "Supabase is not available.",
      "error"
    );
    return;
  }


  const title =
    document.getElementById(
      "noticeTitle"
    )?.value.trim();


  const content =
    document.getElementById(
      "noticeContent"
    )?.value.trim();


  const category =
    document.getElementById(
      "noticeCategory"
    )?.value.trim() ||
    "General";


  const imageValue =
    document.getElementById(
      "noticeImage"
    )?.value.trim();


  const published =
    document.getElementById(
      "noticePublished"
    )?.checked ?? true;


  if (!title || !content) {

    showToast(
      "Title and content are required.",
      "error"
    );

    return;

  }


  showLoading();


  try {

    const noticeData = {

      title,
      content,
      category,
      image_url:
        imageValue || null,
      published

    };


    const {
      error
    } =
      await supabaseClient
        .from("notices")
        .insert(
          noticeData
        );


    if (error) {

      console.error(
        "Save notice error:",
        error
      );

      showToast(
        error.message ||
        "Could not save notice.",
        "error"
      );

      return;

    }


    closeModal();

    showToast(
      "Notice published successfully."
    );


    await loadNotices();

    await loadDashboard();

  } finally {

    hideLoading();

  }

}


/* =========================================================
   LOAD NOTICES
========================================================= */

async function loadNotices() {

  const container =
    document.getElementById(
      "noticesList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  container.innerHTML =
    emptyState(
      "◌",
      "Loading notices...",
      "Please wait."
    );


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

    console.error(
      "Load notices error:",
      error
    );

    container.innerHTML =
      emptyState(
        "!",
        "Could not load notices",
        error.message ||
        "Check your Supabase RLS policies."
      );

    return;

  }


  if (!data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "◉",
        "No notices available",
        "Create your first announcement."
      );

    return;

  }


  container.innerHTML =
    data.map(
      notice => {

        const status =
          notice.published
            ? "Published"
            : "Draft";


        return `

          <div
            class="admin-item"
          >

            <div
              class="admin-item-content"
            >

              <div
                class="admin-item-top"
              >

                <h4>
                  ${escapeHTML(
                    notice.title ||
                    "Untitled"
                  )}
                </h4>

                <span
                  class="status-badge ${
                    notice.published
                      ? "published"
                      : "draft"
                  }"
                >
                  ${status}
                </span>

              </div>


              <p>
                ${escapeHTML(
                  notice.content ||
                  ""
                )}
              </p>


              <div
                class="admin-item-meta"
              >

                <span>
                  ${escapeHTML(
                    notice.category ||
                    "General"
                  )}
                </span>

                <span>
                  ${formatDateTime(
                    notice.created_at
                  )}
                </span>

              </div>

            </div>


            <div
              class="item-actions"
            >

              <button
                class="item-action item-delete"
                type="button"
                data-delete-notice="${escapeHTML(
                  notice.id
                )}"
              >
                Delete
              </button>

            </div>

          </div>

        `;

      }
    )
    .join("");


  container
    .querySelectorAll(
      "[data-delete-notice]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteNotice(
            button.dataset.deleteNotice
          );

        }
      );

    });

}


/* =========================================================
   DELETE NOTICE
========================================================= */

async function deleteNotice(id) {

  if (!id ||
      !supabaseClient) {
    return;
  }


  const confirmed =
    window.confirm(
      "Are you sure you want to delete this notice?"
    );


  if (!confirmed) {
    return;
  }


  showLoading();


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

      console.error(
        "Delete notice error:",
        error
      );

      showToast(
        error.message ||
        "Could not delete notice.",
        "error"
      );

      return;

    }


    showToast(
      "Notice deleted successfully."
    );


    await loadNotices();

    await loadDashboard();

  } finally {

    hideLoading();

  }

}


/* =========================================================
   TOURNAMENT MODAL
========================================================= */

function openTournamentModal() {

  openModal(`

    <form
      class="modal-form"
      id="tournamentForm"
    >

      <h2>
        Add Tournament
      </h2>

      <div class="form-field">

        <label>
          TOURNAMENT NAME
        </label>

        <input
          id="tournamentName"
          required
        >

      </div>

      <div class="form-field">

        <label>
          DATE
        </label>

        <input
          type="date"
          id="tournamentDate"
        >

      </div>

      <div class="form-field">

        <label>
          LOCATION
        </label>

        <input
          id="tournamentLocation"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Save Tournament
      </button>

    </form>

  `);


  document
    .getElementById(
      "tournamentForm"
    )
    ?.addEventListener(
      "submit",
      saveTournament
    );

}


async function saveTournament(event) {

  event.preventDefault();

  if (!supabaseClient) {
    return;
  }


  const name =
    document.getElementById(
      "tournamentName"
    )?.value.trim();


  const date =
    document.getElementById(
      "tournamentDate"
    )?.value ||
    null;


  const location =
    document.getElementById(
      "tournamentLocation"
    )?.value.trim();


  if (!name) {

    showToast(
      "Tournament name is required.",
      "error"
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("tournaments")
      .insert({
        name,
        date,
        location
      });


  if (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save tournament.",
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Tournament created successfully."
  );

  await loadDashboard();

  await loadTournaments();

}


/* =========================================================
   FIXTURE MODAL
========================================================= */

function openFixtureModal() {

  openModal(`

    <form
      class="modal-form"
      id="fixtureForm"
    >

      <h2>
        Add Match
      </h2>

      <div class="form-field">

        <label>
          HOME TEAM
        </label>

        <input
          id="homeTeam"
          required
        >

      </div>

      <div class="form-field">

        <label>
          AWAY TEAM
        </label>

        <input
          id="awayTeam"
          required
        >

      </div>

      <div class="form-field">

        <label>
          MATCH DATE
        </label>

        <input
          type="date"
          id="fixtureDate"
          required
        >

      </div>

      <div class="form-field">

        <label>
          VENUE
        </label>

        <input
          id="fixtureVenue"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Save Match
      </button>

    </form>

  `);


  document
    .getElementById(
      "fixtureForm"
    )
    ?.addEventListener(
      "submit",
      saveFixture
    );

}


async function saveFixture(event) {

  event.preventDefault();

  if (!supabaseClient) {
    return;
  }


  const home_team =
    document.getElementById(
      "homeTeam"
    )?.value.trim();


  const away_team =
    document.getElementById(
      "awayTeam"
    )?.value.trim();


  const match_date =
    document.getElementById(
      "fixtureDate"
    )?.value;


  const venue =
    document.getElementById(
      "fixtureVenue"
    )?.value.trim();


  if (
    !home_team ||
    !away_team ||
    !match_date
  ) {

    showToast(
      "Please fill all required fields.",
      "error"
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from("fixtures")
      .insert({
        home_team,
        away_team,
        match_date,
        venue
      });


  if (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save match.",
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Match added successfully."
  );

  await loadDashboard();

  await loadFixtures();

}


/* =========================================================
   GALLERY MODAL
========================================================= */

function openGalleryModal() {

  openModal(`

    <form
      class="modal-form"
      id="galleryForm"
    >

      <h2>
        Add Gallery Photo
      </h2>

      <div class="form-field">

        <label>
          PHOTO URL
        </label>

        <input
          type="url"
          id="galleryUrl"
          placeholder="https://..."
          required
        >

      </div>

      <div class="form-field">

        <label>
          CAPTION
        </label>

        <input
          id="galleryCaption"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Add Photo
      </button>

    </form>

  `);


  document
    .getElementById(
      "galleryForm"
    )
    ?.addEventListener(
      "submit",
      saveGallery
    );

}


async function saveGallery(event) {

  event.preventDefault();

  if (!supabaseClient) {
    return;
  }


  const image_url =
    document.getElementById(
      "galleryUrl"
    )?.value.trim();


  const caption =
    document.getElementById(
      "galleryCaption"
    )?.value.trim();


  const {
    error
  } =
    await supabaseClient
      .from("gallery")
      .insert({
        image_url,
        caption
      });


  if (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not add photo.",
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Photo added successfully."
  );

  await loadGallery();

}


/* =========================================================
   LEADER MODAL
========================================================= */

function openLeaderModal() {

  openModal(`

    <form
      class="modal-form"
      id="leaderForm"
    >

      <h2>
        Add Leader
      </h2>

      <div class="form-field">

        <label>
          NAME
        </label>

        <input
          id="leaderName"
          required
        >

      </div>

      <div class="form-field">

        <label>
          POSITION
        </label>

        <input
          id="leaderPosition"
          required
        >

      </div>

      <div class="form-field">

        <label>
          PHOTO URL
        </label>

        <input
          type="url"
          id="leaderPhoto"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Save Leader
      </button>

    </form>

  `);


  document
    .getElementById(
      "leaderForm"
    )
    ?.addEventListener(
      "submit",
      saveLeader
    );

}


async function saveLeader(event) {

  event.preventDefault();

  if (!supabaseClient) {
    return;
  }


  const name =
    document.getElementById(
      "leaderName"
    )?.value.trim();


  const position =
    document.getElementById(
      "leaderPosition"
    )?.value.trim();


  const photo_url =
    document.getElementById(
      "leaderPhoto"
    )?.value.trim();


  const {
    error
  } =
    await supabaseClient
      .from("leadership")
      .insert({
        name,
        position,
        photo_url
      });


  if (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save leader.",
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Leader added successfully."
  );

  await loadLeadership();

}


/* =========================================================
   COMMITTEE MODAL
========================================================= */

function openCommitteeModal() {

  openModal(`

    <form
      class="modal-form"
      id="committeeForm"
    >

      <h2>
        Add Committee Member
      </h2>

      <div class="form-field">

        <label>
          NAME
        </label>

        <input
          id="committeeName"
          required
        >

      </div>

      <div class="form-field">

        <label>
          POSITION
        </label>

        <input
          id="committeePosition"
          required
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        Save Member
      </button>

    </form>

  `);


  document
    .getElementById(
      "committeeForm"
    )
    ?.addEventListener(
      "submit",
      saveCommittee
    );

}


async function saveCommittee(event) {

  event.preventDefault();

  if (!supabaseClient) {
    return;
  }


  const name =
    document.getElementById(
      "committeeName"
    )?.value.trim();


  const position =
    document.getElementById(
      "committeePosition"
    )?.value.trim();


  const {
    error
  } =
    await supabaseClient
      .from("committee")
      .insert({
        name,
        position
      });


  if (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save committee member.",
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Committee member added successfully."
  );

  await loadCommittee();

}


/* =========================================================
   GENERIC COUNT
========================================================= */

async function getCount(
  table
) {

  if (!supabaseClient) {
    return 0;
  }


  try {

    const {
      count,
      error
    } =
      await supabaseClient
        .from(table)
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (error) {

      console.warn(
        `Count failed for ${table}:`,
        error.message
      );

      return 0;

    }


    return count || 0;

  } catch (error) {

    console.error(
      `Count error for ${table}:`,
      error
    );

    return 0;

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  if (!supabaseClient) {
    return;
  }


  const [
    notices,
    tournaments,
    fixtures,
    friendly,
    membership
  ] =
    await Promise.all([

      getCount(
        "notices"
      ),

      getCount(
        "tournaments"
      ),

      getCount(
        "fixtures"
      ),

      getCount(
        "friendly_applications"
      ),

      getCount(
        "membership_applications"
      )

    ]);


  const totalNotices =
    document.getElementById(
      "totalNotices"
    );

  const totalTournaments =
    document.getElementById(
      "totalTournaments"
    );

  const totalFixtures =
    document.getElementById(
      "totalFixtures"
    );

  const totalApplications =
    document.getElementById(
      "totalApplications"
    );


  if (totalNotices) {

    totalNotices.textContent =
      notices;

  }


  if (totalTournaments) {

    totalTournaments.textContent =
      tournaments;

  }


  if (totalFixtures) {

    totalFixtures.textContent =
      fixtures;

  }


  if (totalApplications) {

    totalApplications.textContent =
      friendly + membership;

  }


  const friendlyCount =
    document.getElementById(
      "friendlyApplicationCount"
    );

  const membershipCount =
    document.getElementById(
      "membershipApplicationCount"
    );


  if (friendlyCount) {

    friendlyCount.textContent =
      friendly;

  }


  if (membershipCount) {

    membershipCount.textContent =
      membership;

  }


  const notificationDot =
    document.getElementById(
      "notificationDot"
    );


  if (notificationDot) {

    if (
      friendly +
      membership >
      0
    ) {

      notificationDot.classList.add(
        "show"
      );

    } else {

      notificationDot.classList.remove(
        "show"
      );

    }

  }


  await loadRecentActivity();

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

async function loadRecentActivity() {

  const container =
    document.getElementById(
      "recentActivityList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("notices")
      .select(
        "id,title,category,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(5);


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      `
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
    data.map(
      notice => `

        <div
          class="recent-activity-item"
        >

          <div>

            <strong>
              ${escapeHTML(
                notice.title ||
                "Notice"
              )}
            </strong>

            <small>
              ${escapeHTML(
                notice.category ||
                "General"
              )}
            </small>

          </div>

          <time>
            ${formatDate(
              notice.created_at
            )}
          </time>

        </div>

      `
    ).join("");

}


/* =========================================================
   GALLERY LIST
========================================================= */

async function loadGallery() {

  const container =
    document.getElementById(
      "galleryAdminGrid"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("gallery")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "▧",
        "No gallery photos",
        "Add your first photo."
      );

    return;

  }


  container.innerHTML =
    data.map(
      item => {

        const image =
          item.image_url ||
          "";


        return `

          <div
            class="gallery-admin-card"
          >

            ${
              image
                ? `
                  <img
                    src="${escapeHTML(
                      image
                    )}"
                    alt="${escapeHTML(
                      item.caption ||
                      "GSA Gallery"
                    )}"
                    loading="lazy"
                  >
                `
                : `
                  <div class="image-placeholder">
                    ▧
                  </div>
                `
            }


            <div
              class="gallery-admin-info"
            >

              <strong>
                ${escapeHTML(
                  item.caption ||
                  "GSA Gallery"
                )}
              </strong>

            </div>

          </div>

        `;

      }
    ).join("");

}


/* =========================================================
   TOURNAMENT LIST
========================================================= */

async function loadTournaments() {

  const container =
    document.getElementById(
      "tournamentsList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("tournaments")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "🏆",
        "No tournaments",
        "Create your first tournament."
      );

    return;

  }


  container.innerHTML =
    data.map(
      item => `

        <div class="admin-card">

          <span class="card-icon">
            🏆
          </span>

          <h3>
            ${escapeHTML(
              item.name ||
              "Tournament"
            )}
          </h3>

          <p>
            ${
              item.date
                ? formatDate(
                    item.date
                  )
                : "Date not set"
            }
          </p>

          <small>
            ${escapeHTML(
              item.location ||
              "Location not set"
            )}
          </small>

        </div>

      `
    ).join("");

}


/* =========================================================
   FIXTURES LIST
========================================================= */

async function loadFixtures() {

  const container =
    document.getElementById(
      "fixturesList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("fixtures")
      .select("*")
      .order(
        "match_date",
        {
          ascending: true
        }
      );


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "⚽",
        "No matches",
        "Add your first fixture."
      );

    return;

  }


  container.innerHTML =
    data.map(
      match => `

        <div class="admin-item">

          <div>

            <h4>
              ${escapeHTML(
                match.home_team ||
                "Home Team"
              )}

              <span>
                vs
              </span>

              ${escapeHTML(
                match.away_team ||
                "Away Team"
              )}
            </h4>

            <p>
              ${match.match_date
                ? formatDate(
                    match.match_date
                  )
                : "Date not set"}
            </p>

            <small>
              ${escapeHTML(
                match.venue ||
                "Venue not set"
              )}
            </small>

          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   LEADERSHIP LIST
========================================================= */

async function loadLeadership() {

  const container =
    document.getElementById(
      "leadershipList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("leadership")
      .select("*")
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "★",
        "No leadership members",
        "Add your first leader."
      );

    return;

  }


  container.innerHTML =
    data.map(
      leader => `

        <div class="leader-admin-card">

          ${
            leader.photo_url
              ? `
                <img
                  src="${escapeHTML(
                    leader.photo_url
                  )}"
                  alt="${escapeHTML(
                    leader.name ||
                    "Leader"
                  )}"
                >
              `
              : `
                <div class="leader-placeholder">
                  ${escapeHTML(
                    (leader.name || "L")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
              `
          }

          <h3>
            ${escapeHTML(
              leader.name ||
              "Leader"
            )}
          </h3>

          <p>
            ${escapeHTML(
              leader.position ||
              ""
            )}
          </p>

        </div>

      `
    ).join("");

}


/* =========================================================
   COMMITTEE LIST
========================================================= */

async function loadCommittee() {

  const container =
    document.getElementById(
      "committeeList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("committee")
      .select("*")
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "♙",
        "No committee members",
        "Add your first committee member."
      );

    return;

  }


  container.innerHTML =
    data.map(
      member => `

        <div class="admin-item">

          <div>

            <h4>
              ${escapeHTML(
                member.name ||
                "Member"
              )}
            </h4>

            <p>
              ${escapeHTML(
                member.position ||
                ""
              )}
            </p>

          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   FRIENDLY APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  const container =
    document.getElementById(
      "friendlyApplicationsList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


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


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "⚽",
        "No applications",
        "Friendly Match applications will appear here."
      );

    return;

  }


  renderApplications(
    container,
    data,
    "friendly"
  );

}


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

async function loadMembershipApplications() {

  const container =
    document.getElementById(
      "membershipApplicationsList"
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


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


  if (error ||
      !data ||
      data.length === 0) {

    container.innerHTML =
      emptyState(
        "✦",
        "No applications",
        "Membership applications will appear here."
      );

    return;

  }


  renderApplications(
    container,
    data,
    "membership"
  );

}


/* =========================================================
   APPLICATION RENDER
========================================================= */

function renderApplications(
  container,
  applications,
  type
) {

  container.innerHTML =
    applications.map(
      application => {

        const status =
          application.status ||
          "pending";


        const name =
          application.name ||
          application.full_name ||
          application.team_name ||
          application.club_name ||
          "Application";


        const email =
          application.email ||
          "";


        return `

          <div
            class="application-card"
          >

            <div
              class="application-card-header"
            >

              <div>

                <h3>
                  ${escapeHTML(
                    name
                  )}
                </h3>

                <span>
                  ${escapeHTML(
                    type === "friendly"
                      ? "Friendly Match"
                      : "Membership"
                  )}
                </span>

              </div>


              <strong
                class="status-badge ${escapeHTML(
                  status
                )}"
              >
                ${escapeHTML(
                  status
                )}
              </strong>

            </div>


            ${
              email
                ? `
                  <p>
                    ${escapeHTML(
                      email
                    )}
                  </p>
                `
                : ""
            }


            <small>
              ${formatDateTime(
                application.created_at
              )}
            </small>


          </div>

        `;

      }
    ).join("");

}


/* =========================================================
   APPLICATION FILTERS
========================================================= */

const friendlyStatusFilter =
  document.getElementById(
    "friendlyStatusFilter"
  );


const membershipStatusFilter =
  document.getElementById(
    "membershipStatusFilter"
  );


if (friendlyStatusFilter) {

  friendlyStatusFilter.addEventListener(
    "change",
    () => {

      filterApplications(
        "friendly_applications",
        "friendlyApplicationsList",
        friendlyStatusFilter.value
      );

    }
  );

}


if (membershipStatusFilter) {

  membershipStatusFilter.addEventListener(
    "change",
    () => {

      filterApplications(
        "membership_applications",
        "membershipApplicationsList",
        membershipStatusFilter.value
      );

    }
  );

}


async function filterApplications(
  table,
  containerId,
  status
) {

  const container =
    document.getElementById(
      containerId
    );

  if (!container ||
      !supabaseClient) {
    return;
  }


  let query =
    supabaseClient
      .from(table)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (
    status &&
    status !== "all"
  ) {

    query =
      query.eq(
        "status",
        status
      );

  }


  const {
    data,
    error
  } =
    await query;


  if (
    error ||
    !data ||
    data.length === 0
  ) {

    container.innerHTML =
      emptyState(
        "◌",
        "No applications found",
        "Try another filter."
      );

    return;

  }


  renderApplications(
    container,
    data,
    table === "friendly_applications"
      ? "friendly"
      : "membership"
  );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(
  icon,
  title,
  text
) {

  return `

    <div class="empty-state">

      <span>
        ${escapeHTML(icon)}
      </span>

      <h4>
        ${escapeHTML(title)}
      </h4>

      <p>
        ${escapeHTML(text)}
      </p>

    </div>

  `;

}


/* =========================================================
   REFRESH BUTTON
========================================================= */

const refreshButton =
  document.getElementById(
    "refreshButton"
  );


if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    async () => {

      refreshButton.style.transform =
        "rotate(360deg)";

      showLoading();

      try {

        await loadDashboard();

        const activePage =
          document.querySelector(
            ".admin-page.active"
          );


        if (
          activePage?.id ===
          "noticesPage"
        ) {

          await loadNotices();

        }

        else if (
          activePage?.id ===
          "galleryPage"
        ) {

          await loadGallery();

        }

        else if (
          activePage?.id ===
          "tournamentsPage"
        ) {

          await loadTournaments();

        }

        else if (
          activePage?.id ===
          "fixturesPage"
        ) {

          await loadFixtures();

        }

        else if (
          activePage?.id ===
          "leadershipPage"
        ) {

          await loadLeadership();

        }

        else if (
          activePage?.id ===
          "committeePage"
        ) {

          await loadCommittee();

        }

        else if (
          activePage?.id ===
          "friendlyApplicationsPage"
        ) {

          await loadFriendlyApplications();

        }

        else if (
          activePage?.id ===
          "membershipApplicationsPage"
        ) {

          await loadMembershipApplications();

        }


        showToast(
          "Dashboard refreshed."
        );

      } catch (error) {

        console.error(
          "Refresh error:",
          error
        );

        showToast(
          "Refresh failed.",
          "error"
        );

      } finally {

        hideLoading();

        setTimeout(() => {

          refreshButton.style.transform =
            "";

        }, 400);

      }

    }
  );

}


/* =========================================================
   AUTH STATE
========================================================= */

if (supabaseClient) {

  supabaseClient.auth
    .onAuthStateChange(
      (event, session) => {

        if (
          event ===
          "SIGNED_OUT"
        ) {

          showLoginScreen();

        }

      }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateDate();

    await checkSession();

  }
);
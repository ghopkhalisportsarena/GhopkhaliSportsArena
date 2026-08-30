/* =========================================================
   GSA ADMIN PANEL
   Ghopkhali Sports Arena
   Admin JavaScript
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

/*
   Change these credentials before using the panel.

   IMPORTANT:
   This is NOT secure server-side authentication.
   Do not use a real sensitive password here.
*/

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE = {
  notices: "gsa_notices",
  gallery: "gsa_gallery",
  tournaments: "gsa_tournaments",
  fixtures: "gsa_fixtures",
  leadership: "gsa_leadership",
  committee: "gsa_committee",
  friendly: "gsa_friendly_applications",
  membership: "gsa_membership_applications",
  loggedIn: "gsa_admin_logged_in"
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.error("Storage error:", error);
    return [];
  }
}


function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


function generateId() {
  return Date.now().toString(36) + Math.random()
    .toString(36)
    .substring(2, 8);
}


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentPage = "dashboard";

let editingId = null;
let editingType = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setCurrentYear();

  setCurrentDate();

  setupLogin();

  setupNavigation();

  setupSidebar();

  setupTopbar();

  setupModal();

  setupQuickActions();

  setupFilters();

  updateDashboard();

  hideLoading();

});


/* =========================================================
   CURRENT YEAR
========================================================= */

function setCurrentYear() {

  $$("[data-current-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

}


/* =========================================================
   CURRENT DATE
========================================================= */

function setCurrentDate() {

  const dateElement = $("#currentDate");

  if (!dateElement) return;

  const now = new Date();

  dateElement.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

  const form = $("#loginForm");

  if (!form) return;

  form.addEventListener("submit", event => {

    event.preventDefault();

    const email = $("#adminEmail")?.value.trim();
    const password = $("#adminPassword")?.value;

    const errorElement = $("#loginError");

    if (
      email === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {

      localStorage.setItem(STORAGE.loggedIn, "true");

      if (errorElement) {
        errorElement.textContent = "";
      }

      showAdminApp();

      showToast("Welcome to GSA Admin Panel.");

    } else {

      if (errorElement) {
        errorElement.textContent =
          "Invalid email address or password.";
      }

    }

  });


  /*
     Auto login if session exists.
  */

  if (localStorage.getItem(STORAGE.loggedIn) === "true") {
    showAdminApp();
  }

}


/* =========================================================
   SHOW ADMIN APP
========================================================= */

function showAdminApp() {

  const loginScreen = $("#loginScreen");
  const adminApp = $("#adminApp");

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (adminApp) {
    adminApp.style.display = "flex";
  }

  updateDashboard();

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  localStorage.removeItem(STORAGE.loggedIn);

  const loginScreen = $("#loginScreen");
  const adminApp = $("#adminApp");

  if (adminApp) {
    adminApp.style.display = "none";
  }

  if (loginScreen) {
    loginScreen.style.display = "flex";
  }

  const form = $("#loginForm");

  if (form) {
    form.reset();
  }

  showToast("Signed out successfully.");

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  $$(".sidebar-link[data-page]").forEach(button => {

    button.addEventListener("click", () => {

      const page = button.dataset.page;

      if (!page) return;

      navigateTo(page);

    });

  });


  $$("[data-page-link]").forEach(button => {

    button.addEventListener("click", () => {

      navigateTo(button.dataset.pageLink);

    });

  });

}


function navigateTo(page) {

  currentPage = page;

  $$(".sidebar-link").forEach(link => {
    link.classList.remove("active");
  });


  const activeLink =
    document.querySelector(
      `.sidebar-link[data-page="${page}"]`
    );

  if (activeLink) {
    activeLink.classList.add("active");
  }


  $$(".admin-page").forEach(section => {
    section.classList.remove("active");
  });


  const pageElement =
    document.getElementById(page + "Page");

  if (pageElement) {
    pageElement.classList.add("active");
  }


  updatePageTitle(page);

  renderCurrentPage();

  closeSidebarMobile();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   PAGE TITLES
========================================================= */

const PAGE_TITLES = {

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


function updatePageTitle(page) {

  const title = $("#pageTitle");

  if (title) {
    title.textContent =
      PAGE_TITLES[page] || "Dashboard";
  }


  const kicker = $("#pageKicker");

  if (kicker) {

    if (page === "dashboard") {
      kicker.textContent = "ADMINISTRATION";
    } else {
      kicker.textContent = "GSA MANAGEMENT";
    }

  }

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

  const toggle = $("#sidebarToggle");

  if (!toggle) return;

  toggle.addEventListener("click", () => {

    const sidebar = $("#adminSidebar");

    if (!sidebar) return;

    sidebar.classList.toggle("open");

  });

}


function closeSidebarMobile() {

  if (window.innerWidth <= 768) {

    const sidebar = $("#adminSidebar");

    if (sidebar) {
      sidebar.classList.remove("open");
    }

  }

}


/* =========================================================
   TOPBAR
========================================================= */

function setupTopbar() {

  const refreshButton = $("#refreshButton");

  if (refreshButton) {

    refreshButton.addEventListener("click", () => {

      renderCurrentPage();

      updateDashboard();

      showToast("Data refreshed.");

    });

  }


  const logoutButton = $("#logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener("click", logout);

  }


  const notificationButton =
    document.querySelector(".notification-button");

  if (notificationButton) {

    notificationButton.addEventListener("click", () => {

      const friendly =
        getData(STORAGE.friendly)
          .filter(item => item.status === "pending")
          .length;

      const membership =
        getData(STORAGE.membership)
          .filter(item => item.status === "pending")
          .length;

      const total = friendly + membership;

      if (total > 0) {

        showToast(
          `${total} pending application${total > 1 ? "s" : ""}.`
        );

      } else {

        showToast("No new notifications.");

      }

    });

  }

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

  $$("[data-action]").forEach(button => {

    button.addEventListener("click", () => {

      const action = button.dataset.action;

      openCreateModal(action);

    });

  });

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

  const modal = $("#adminModal");
  const closeButton = $("#adminModalClose");

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeModal
    );

  }


  if (modal) {

    modal.addEventListener("click", event => {

      if (event.target === modal) {
        closeModal();
      }

    });

  }


  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      closeModal();
    }

  });

}


function openModal(content) {

  const modal = $("#adminModal");
  const modalContent = $("#adminModalContent");

  if (!modal || !modalContent) return;

  modalContent.innerHTML = content;

  modal.setAttribute("aria-hidden", "false");

  setTimeout(() => {

    const firstInput =
      modalContent.querySelector(
        "input, textarea, select"
      );

    if (firstInput) {
      firstInput.focus();
    }

  }, 50);

}


function closeModal() {

  const modal = $("#adminModal");
  const modalContent = $("#adminModalContent");

  if (!modal) return;

  modal.setAttribute("aria-hidden", "true");

  if (modalContent) {
    modalContent.innerHTML = "";
  }

  editingId = null;
  editingType = null;

}


/* =========================================================
   CREATE MODAL
========================================================= */

function openCreateModal(action) {

  editingId = null;
  editingType = null;

  let content = "";

  switch (action) {

    case "add-notice":

      content = noticeForm();

      break;

    case "add-gallery":

      content = galleryForm();

      break;

    case "add-tournament":

      content = tournamentForm();

      break;

    case "add-fixture":

      content = fixtureForm();

      break;

    case "add-leader":

      content = leaderForm();

      break;

    case "add-committee":

      content = committeeForm();

      break;

    default:

      return;

  }

  openModal(content);

}


/* =========================================================
   NOTICE FORM
========================================================= */

function noticeForm(data = {}) {

  return `

    <form id="noticeForm">

      <h2>
        ${data.id ? "Edit Notice" : "Create Notice"}
      </h2>

      <div>
        <label>NOTICE TITLE</label>

        <input
          type="text"
          id="noticeTitle"
          value="${escapeAttribute(data.title || "")}"
          placeholder="Enter notice title"
          required
        >
      </div>

      <div>
        <label>DESCRIPTION</label>

        <textarea
          id="noticeDescription"
          placeholder="Write announcement..."
          required
        >${escapeHTML(data.description || "")}</textarea>
      </div>

      <div>
        <label>DATE</label>

        <input
          type="date"
          id="noticeDate"
          value="${data.date || today()}"
          required
        >
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Publish Notice"}
      </button>

    </form>

  `;

}


/* =========================================================
   GALLERY FORM
========================================================= */

function galleryForm(data = {}) {

  return `

    <form id="galleryForm">

      <h2>
        ${data.id ? "Edit Photo" : "Add Gallery Photo"}
      </h2>

      <div>
        <label>PHOTO URL</label>

        <input
          type="url"
          id="galleryImage"
          value="${escapeAttribute(data.image || "")}"
          placeholder="https://example.com/photo.jpg"
          required
        >
      </div>

      <div>
        <label>TITLE</label>

        <input
          type="text"
          id="galleryTitle"
          value="${escapeAttribute(data.title || "")}"
          placeholder="Photo title"
          required
        >
      </div>

      <div>
        <label>DESCRIPTION</label>

        <textarea
          id="galleryDescription"
          placeholder="Photo description..."
        >${escapeHTML(data.description || "")}</textarea>
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Add Photo"}
      </button>

    </form>

  `;

}


/* =========================================================
   TOURNAMENT FORM
========================================================= */

function tournamentForm(data = {}) {

  return `

    <form id="tournamentForm">

      <h2>
        ${data.id ? "Edit Tournament" : "Add Tournament"}
      </h2>

      <div>
        <label>TOURNAMENT NAME</label>

        <input
          type="text"
          id="tournamentName"
          value="${escapeAttribute(data.name || "")}"
          placeholder="Tournament name"
          required
        >
      </div>

      <div>
        <label>LOCATION</label>

        <input
          type="text"
          id="tournamentLocation"
          value="${escapeAttribute(data.location || "")}"
          placeholder="Venue"
        >
      </div>

      <div>
        <label>START DATE</label>

        <input
          type="date"
          id="tournamentDate"
          value="${data.date || today()}"
          required
        >
      </div>

      <div>
        <label>DESCRIPTION</label>

        <textarea
          id="tournamentDescription"
          placeholder="Tournament details..."
        >${escapeHTML(data.description || "")}</textarea>
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Create Tournament"}
      </button>

    </form>

  `;

}


/* =========================================================
   FIXTURE FORM
========================================================= */

function fixtureForm(data = {}) {

  return `

    <form id="fixtureForm">

      <h2>
        ${data.id ? "Edit Match" : "Add Match"}
      </h2>

      <div>
        <label>HOME TEAM</label>

        <input
          type="text"
          id="homeTeam"
          value="${escapeAttribute(data.home || "")}"
          placeholder="Home team"
          required
        >
      </div>

      <div>
        <label>AWAY TEAM</label>

        <input
          type="text"
          id="awayTeam"
          value="${escapeAttribute(data.away || "")}"
          placeholder="Away team"
          required
        >
      </div>

      <div>
        <label>MATCH DATE</label>

        <input
          type="date"
          id="fixtureDate"
          value="${data.date || today()}"
          required
        >
      </div>

      <div>
        <label>MATCH TIME</label>

        <input
          type="time"
          id="fixtureTime"
          value="${data.time || "18:00"}"
        >
      </div>

      <div>
        <label>VENUE</label>

        <input
          type="text"
          id="fixtureVenue"
          value="${escapeAttribute(data.venue || "")}"
          placeholder="Match venue"
        >
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Add Match"}
      </button>

    </form>

  `;

}


/* =========================================================
   LEADERSHIP FORM
========================================================= */

function leaderForm(data = {}) {

  return `

    <form id="leaderForm">

      <h2>
        ${data.id ? "Edit Leader" : "Add Leader"}
      </h2>

      <div>
        <label>NAME</label>

        <input
          type="text"
          id="leaderName"
          value="${escapeAttribute(data.name || "")}"
          placeholder="Full name"
          required
        >
      </div>

      <div>
        <label>POSITION</label>

        <input
          type="text"
          id="leaderPosition"
          value="${escapeAttribute(data.position || "")}"
          placeholder="President / Secretary..."
          required
        >
      </div>

      <div>
        <label>PHOTO URL</label>

        <input
          type="url"
          id="leaderPhoto"
          value="${escapeAttribute(data.photo || "")}"
          placeholder="https://example.com/photo.jpg"
        >
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Add Leader"}
      </button>

    </form>

  `;

}


/* =========================================================
   COMMITTEE FORM
========================================================= */

function committeeForm(data = {}) {

  return `

    <form id="committeeForm">

      <h2>
        ${data.id ? "Edit Member" : "Add Committee Member"}
      </h2>

      <div>
        <label>NAME</label>

        <input
          type="text"
          id="committeeName"
          value="${escapeAttribute(data.name || "")}"
          placeholder="Full name"
          required
        >
      </div>

      <div>
        <label>POSITION</label>

        <input
          type="text"
          id="committeePosition"
          value="${escapeAttribute(data.position || "")}"
          placeholder="Committee position"
          required
        >
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${data.id ? "Save Changes" : "Add Member"}
      </button>

    </form>

  `;

}


/* =========================================================
   MODAL FORM SUBMISSION
========================================================= */

document.addEventListener("submit", event => {

  const form = event.target;

  if (!form) return;


  if (form.id === "noticeForm") {

    event.preventDefault();

    saveNotice();

  }


  if (form.id === "galleryForm") {

    event.preventDefault();

    saveGallery();

  }


  if (form.id === "tournamentForm") {

    event.preventDefault();

    saveTournament();

  }


  if (form.id === "fixtureForm") {

    event.preventDefault();

    saveFixture();

  }


  if (form.id === "leaderForm") {

    event.preventDefault();

    saveLeader();

  }


  if (form.id === "committeeForm") {

    event.preventDefault();

    saveCommittee();

  }

});


/* =========================================================
   SAVE NOTICE
========================================================= */

function saveNotice() {

  const data = getData(STORAGE.notices);

  const item = {

    id: editingId || generateId(),

    title: $("#noticeTitle").value.trim(),

    description:
      $("#noticeDescription").value.trim(),

    date: $("#noticeDate").value,

    createdAt:
      editingId
        ? findCreatedAt(data, editingId)
        : new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.notices, data);

  closeModal();

  renderNotices();

  updateDashboard();

  showToast(
    editingId
      ? "Notice updated."
      : "Notice published."
  );

}


/* =========================================================
   SAVE GALLERY
========================================================= */

function saveGallery() {

  const data = getData(STORAGE.gallery);

  const item = {

    id: editingId || generateId(),

    image:
      $("#galleryImage").value.trim(),

    title:
      $("#galleryTitle").value.trim(),

    description:
      $("#galleryDescription").value.trim(),

    createdAt: new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.gallery, data);

  closeModal();

  renderGallery();

  updateDashboard();

  showToast(
    editingId
      ? "Photo updated."
      : "Photo added."
  );

}


/* =========================================================
   SAVE TOURNAMENT
========================================================= */

function saveTournament() {

  const data = getData(STORAGE.tournaments);

  const item = {

    id: editingId || generateId(),

    name:
      $("#tournamentName").value.trim(),

    location:
      $("#tournamentLocation").value.trim(),

    date:
      $("#tournamentDate").value,

    description:
      $("#tournamentDescription").value.trim(),

    createdAt:
      new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.tournaments, data);

  closeModal();

  renderTournaments();

  updateDashboard();

  showToast(
    editingId
      ? "Tournament updated."
      : "Tournament created."
  );

}


/* =========================================================
   SAVE FIXTURE
========================================================= */

function saveFixture() {

  const data = getData(STORAGE.fixtures);

  const item = {

    id: editingId || generateId(),

    home:
      $("#homeTeam").value.trim(),

    away:
      $("#awayTeam").value.trim(),

    date:
      $("#fixtureDate").value,

    time:
      $("#fixtureTime").value,

    venue:
      $("#fixtureVenue").value.trim(),

    createdAt:
      new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.fixtures, data);

  closeModal();

  renderFixtures();

  updateDashboard();

  showToast(
    editingId
      ? "Match updated."
      : "Match added."
  );

}


/* =========================================================
   SAVE LEADER
========================================================= */

function saveLeader() {

  const data = getData(STORAGE.leadership);

  const item = {

    id: editingId || generateId(),

    name:
      $("#leaderName").value.trim(),

    position:
      $("#leaderPosition").value.trim(),

    photo:
      $("#leaderPhoto").value.trim(),

    createdAt:
      new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.leadership, data);

  closeModal();

  renderLeadership();

  updateDashboard();

  showToast(
    editingId
      ? "Leader updated."
      : "Leader added."
  );

}


/* =========================================================
   SAVE COMMITTEE
========================================================= */

function saveCommittee() {

  const data = getData(STORAGE.committee);

  const item = {

    id: editingId || generateId(),

    name:
      $("#committeeName").value.trim(),

    position:
      $("#committeePosition").value.trim(),

    createdAt:
      new Date().toISOString()

  };


  if (editingId) {

    const index =
      data.findIndex(x => x.id === editingId);

    if (index !== -1) {
      data[index] = item;
    }

  } else {

    data.unshift(item);

  }


  saveData(STORAGE.committee, data);

  closeModal();

  renderCommittee();

  updateDashboard();

  showToast(
    editingId
      ? "Member updated."
      : "Member added."
  );

}


/* =========================================================
   RENDER CURRENT PAGE
========================================================= */

function renderCurrentPage() {

  switch (currentPage) {

    case "dashboard":
      updateDashboard();
      break;

    case "notices":
      renderNotices();
      break;

    case "gallery":
      renderGallery();
      break;

    case "tournaments":
      renderTournaments();
      break;

    case "fixtures":
      renderFixtures();
      break;

    case "leadership":
      renderLeadership();
      break;

    case "committee":
      renderCommittee();
      break;

    case "friendly-applications":
      renderFriendlyApplications();
      break;

    case "membership-applications":
      renderMembershipApplications();
      break;

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const notices =
    getData(STORAGE.notices);

  const tournaments =
    getData(STORAGE.tournaments);

  const fixtures =
    getData(STORAGE.fixtures);

  const friendly =
    getData(STORAGE.friendly)
      .filter(x => x.status === "pending");

  const membership =
    getData(STORAGE.membership)
      .filter(x => x.status === "pending");


  setText(
    "totalNotices",
    notices.length
  );

  setText(
    "totalTournaments",
    tournaments.length
  );

  setText(
    "totalFixtures",
    fixtures.length
  );

  setText(
    "totalApplications",
    friendly.length + membership.length
  );


  setText(
    "friendlyApplicationCount",
    friendly.length
  );

  setText(
    "membershipApplicationCount",
    membership.length
  );


  const totalApplications =
    friendly.length + membership.length;

  const notificationDot =
    $("#notificationDot");

  if (notificationDot) {

    notificationDot.style.display =
      totalApplications > 0
        ? "block"
        : "none";

  }


  renderRecentActivity();

  renderApplicationPreview();

}


/* =========================================================
   NOTICES
========================================================= */

function renderNotices() {

  const container = $("#noticesList");

  if (!container) return;

  const data = getData(STORAGE.notices);

  if (!data.length) {

    container.innerHTML = emptyState(
      "◉",
      "No notices available",
      "Create your first announcement."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="data-card">

        <div class="data-card-content">

          <span class="data-card-date">
            ${formatDate(item.date)}
          </span>

          <h3>
            ${escapeHTML(item.title)}
          </h3>

          <p>
            ${escapeHTML(item.description)}
          </p>

        </div>

        <div class="data-card-actions">

          <button
            class="edit-btn"
            onclick="editItem('notice','${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteItem('notice','${item.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   GALLERY
========================================================= */

function renderGallery() {

  const container =
    $("#galleryAdminGrid");

  if (!container) return;

  const data = getData(STORAGE.gallery);

  if (!data.length) {

    container.innerHTML = emptyState(
      "▧",
      "Gallery is empty",
      "Upload photos from club activities."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="gallery-card">

        <div class="gallery-image">

          <img
            src="${escapeAttribute(item.image)}"
            alt="${escapeAttribute(item.title)}"
            loading="lazy"
            onerror="this.src=''; this.parentElement.classList.add('image-error')"
          >

        </div>

        <div class="gallery-card-info">

          <h3>
            ${escapeHTML(item.title)}
          </h3>

          <p>
            ${escapeHTML(item.description || "")}
          </p>

          <div class="data-card-actions">

            <button
              class="edit-btn"
              onclick="editItem('gallery','${item.id}')"
            >
              Edit
            </button>

            <button
              class="delete-btn"
              onclick="deleteItem('gallery','${item.id}')"
            >
              Delete
            </button>

          </div>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   TOURNAMENTS
========================================================= */

function renderTournaments() {

  const container =
    $("#tournamentsList");

  if (!container) return;

  const data =
    getData(STORAGE.tournaments);


  if (!data.length) {

    container.innerHTML = emptyState(
      "🏆",
      "No tournaments",
      "Create your first tournament."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="sport-card">

        <span class="sport-card-label">
          TOURNAMENT
        </span>

        <h3>
          ${escapeHTML(item.name)}
        </h3>

        <p>
          ${escapeHTML(item.location || "Venue not specified")}
        </p>

        <strong>
          ${formatDate(item.date)}
        </strong>

        <div class="data-card-actions">

          <button
            class="edit-btn"
            onclick="editItem('tournament','${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteItem('tournament','${item.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   FIXTURES
========================================================= */

function renderFixtures() {

  const container =
    $("#fixturesList");

  if (!container) return;

  const data =
    getData(STORAGE.fixtures);


  if (!data.length) {

    container.innerHTML = emptyState(
      "⚽",
      "No matches available",
      "Add an upcoming match or fixture."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="fixture-card">

        <div class="fixture-date">
          ${formatDate(item.date)}
        </div>

        <div class="fixture-teams">

          <strong>
            ${escapeHTML(item.home)}
          </strong>

          <span>
            VS
          </span>

          <strong>
            ${escapeHTML(item.away)}
          </strong>

        </div>

        <div class="fixture-meta">

          ${item.time || ""}

          ${item.venue
            ? " • " + escapeHTML(item.venue)
            : ""
          }

        </div>

        <div class="data-card-actions">

          <button
            class="edit-btn"
            onclick="editItem('fixture','${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteItem('fixture','${item.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   LEADERSHIP
========================================================= */

function renderLeadership() {

  const container =
    $("#leadershipList");

  if (!container) return;

  const data =
    getData(STORAGE.leadership);


  if (!data.length) {

    container.innerHTML = emptyState(
      "★",
      "No leadership members",
      "Add club leadership information."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="person-card">

        <div class="person-photo">

          ${
            item.photo
              ? `<img
                   src="${escapeAttribute(item.photo)}"
                   alt="${escapeAttribute(item.name)}"
                 >`
              : `<span>★</span>`
          }

        </div>

        <div class="person-info">

          <h3>
            ${escapeHTML(item.name)}
          </h3>

          <p>
            ${escapeHTML(item.position)}
          </p>

        </div>

        <div class="data-card-actions">

          <button
            class="edit-btn"
            onclick="editItem('leader','${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteItem('leader','${item.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   COMMITTEE
========================================================= */

function renderCommittee() {

  const container =
    $("#committeeList");

  if (!container) return;

  const data =
    getData(STORAGE.committee);


  if (!data.length) {

    container.innerHTML = emptyState(
      "♙",
      "Committee list is empty",
      "Add committee members and positions."
    );

    return;

  }


  container.innerHTML =
    data.map(item => `

      <article class="committee-card">

        <div>

          <h3>
            ${escapeHTML(item.name)}
          </h3>

          <p>
            ${escapeHTML(item.position)}
          </p>

        </div>

        <div class="data-card-actions">

          <button
            class="edit-btn"
            onclick="editItem('committee','${item.id}')"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteItem('committee','${item.id}')"
          >
            Delete
          </button>

        </div>

      </article>

    `).join("");

}


/* =========================================================
   FRIENDLY APPLICATIONS
========================================================= */

function renderFriendlyApplications() {

  const container =
    $("#friendlyApplicationsList");

  if (!container) return;

  const data =
    getData(STORAGE.friendly);

  const filter =
    $("#friendlyStatusFilter")?.value || "all";


  const filtered =
    filter === "all"
      ? data
      : data.filter(x => x.status === filter);


  if (!filtered.length) {

    container.innerHTML = emptyState(
      "⚽",
      "No friendly match applications",
      "Submitted applications will appear here."
    );

    return;

  }


  container.innerHTML =
    filtered.map(applicationCard).join("");

}


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

function renderMembershipApplications() {

  const container =
    $("#membershipApplicationsList");

  if (!container) return;

  const data =
    getData(STORAGE.membership);

  const filter =
    $("#membershipStatusFilter")?.value || "all";


  const filtered =
    filter === "all"
      ? data
      : data.filter(x => x.status === filter);


  if (!filtered.length) {

    container.innerHTML = emptyState(
      "✦",
      "No membership applications",
      "New club membership applications will appear here."
    );

    return;

  }


  container.innerHTML =
    filtered.map(applicationCard).join("");

}


/* =========================================================
   APPLICATION CARD
========================================================= */

function applicationCard(item) {

  const status =
    item.status || "pending";


  return `

    <article class="application-card">

      <div class="application-card-header">

        <div>

          <span class="application-type">
            ${escapeHTML(
              item.type ||
              "APPLICATION"
            )}
          </span>

          <h3>
            ${escapeHTML(
              item.name ||
              item.teamName ||
              "Applicant"
            )}
          </h3>

        </div>

        <span class="status-badge ${status}">
          ${escapeHTML(status)}
        </span>

      </div>

      <div class="application-details">

        ${
          item.email
            ? `<p><strong>Email:</strong> ${escapeHTML(item.email)}</p>`
            : ""
        }

        ${
          item.phone
            ? `<p><strong>Phone:</strong> ${escapeHTML(item.phone)}</p>`
            : ""
        }

        ${
          item.date
            ? `<p><strong>Date:</strong> ${formatDate(item.date)}</p>`
            : ""
        }

        ${
          item.message
            ? `<p><strong>Message:</strong> ${escapeHTML(item.message)}</p>`
            : ""
        }

      </div>

      <div class="application-actions">

        ${
          status !== "approved"
            ? `
              <button
                class="approve-btn"
                onclick="updateApplicationStatus('${item.id}','approved')"
              >
                Approve
              </button>
            `
            : ""
        }

        ${
          status !== "rejected"
            ? `
              <button
                class="reject-btn"
                onclick="updateApplicationStatus('${item.id}','rejected')"
              >
                Reject
              </button>
            `
            : ""
        }

        <button
          class="delete-btn"
          onclick="deleteApplication('${item.id}')"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

  const friendly =
    $("#friendlyStatusFilter");

  const membership =
    $("#membershipStatusFilter");


  if (friendly) {

    friendly.addEventListener(
      "change",
      renderFriendlyApplications
    );

  }


  if (membership) {

    membership.addEventListener(
      "change",
      renderMembershipApplications
    );

  }

}


/* =========================================================
   UPDATE APPLICATION STATUS
========================================================= */

function updateApplicationStatus(id, status) {

  let key = null;

  let item = null;


  const friendly =
    getData(STORAGE.friendly);

  const friendlyIndex =
    friendly.findIndex(x => x.id === id);


  if (friendlyIndex !== -1) {

    key = STORAGE.friendly;

    item = friendly[friendlyIndex];

  } else {

    const membership =
      getData(STORAGE.membership);

    const membershipIndex =
      membership.findIndex(x => x.id === id);

    if (membershipIndex !== -1) {

      key = STORAGE.membership;

      item = membership[membershipIndex];

    }

  }


  if (!key || !item) return;


  const data = getData(key);

  const index =
    data.findIndex(x => x.id === id);


  data[index].status = status;

  data[index].updatedAt =
    new Date().toISOString();


  saveData(key, data);


  renderFriendlyApplications();

  renderMembershipApplications();

  updateDashboard();


  showToast(
    `Application ${status}.`
  );

}


/* =========================================================
   DELETE APPLICATION
========================================================= */

function deleteApplication(id) {

  let key = null;


  const friendly =
    getData(STORAGE.friendly);

  if (friendly.some(x => x.id === id)) {
    key = STORAGE.friendly;
  }


  const membership =
    getData(STORAGE.membership);

  if (membership.some(x => x.id === id)) {
    key = STORAGE.membership;
  }


  if (!key) return;


  if (!confirm("Delete this application?")) {
    return;
  }


  const data =
    getData(key)
      .filter(x => x.id !== id);


  saveData(key, data);


  renderFriendlyApplications();

  renderMembershipApplications();

  updateDashboard();

  showToast("Application deleted.");

}


/* =========================================================
   EDIT ITEM
========================================================= */

function editItem(type, id) {

  editingId = id;

  editingType = type;


  let key = null;

  let form = null;


  switch (type) {

    case "notice":
      key = STORAGE.notices;
      form = noticeForm;
      break;

    case "gallery":
      key = STORAGE.gallery;
      form = galleryForm;
      break;

    case "tournament":
      key = STORAGE.tournaments;
      form = tournamentForm;
      break;

    case "fixture":
      key = STORAGE.fixtures;
      form = fixtureForm;
      break;

    case "leader":
      key = STORAGE.leadership;
      form = leaderForm;
      break;

    case "committee":
      key = STORAGE.committee;
      form = committeeForm;
      break;

    default:
      return;

  }


  const data = getData(key);

  const item =
    data.find(x => x.id === id);


  if (!item) return;


  openModal(form(item));

}


/* =========================================================
   DELETE ITEM
========================================================= */

function deleteItem(type, id) {

  if (!confirm("Are you sure you want to delete this item?")) {
    return;
  }


  let key = null;


  switch (type) {

    case "notice":
      key = STORAGE.notices;
      break;

    case "gallery":
      key = STORAGE.gallery;
      break;

    case "tournament":
      key = STORAGE.tournaments;
      break;

    case "fixture":
      key = STORAGE.fixtures;
      break;

    case "leader":
      key = STORAGE.leadership;
      break;

    case "committee":
      key = STORAGE.committee;
      break;

    default:
      return;

  }


  const data =
    getData(key)
      .filter(item => item.id !== id);


  saveData(key, data);


  renderCurrentPage();

  updateDashboard();

  showToast("Item deleted.");

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecentActivity() {

  const container =
    $("#recentActivityList");

  if (!container) return;


  const all = [];


  const addItems =
    (data, type) => {

      data.forEach(item => {

        all.push({

          ...item,

          activityType: type,

          activityDate:
            item.createdAt ||
            item.date ||
            new Date().toISOString()

        });

      });

    };


  addItems(
    getData(STORAGE.notices),
    "Notice"
  );

  addItems(
    getData(STORAGE.tournaments),
    "Tournament"
  );

  addItems(
    getData(STORAGE.fixtures),
    "Match"
  );

  addItems(
    getData(STORAGE.gallery),
    "Gallery"
  );


  all.sort(
    (a, b) =>
      new Date(b.activityDate) -
      new Date(a.activityDate)
  );


  const recent =
    all.slice(0, 5);


  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state small-empty">
        <span>◌</span>
        <p>No recent activity yet.</p>
      </div>
    `;

    return;

  }


  container.innerHTML =
    recent.map(item => `

      <div class="activity-item">

        <span class="activity-dot"></span>

        <div>

          <strong>
            ${escapeHTML(item.activityType)}
          </strong>

          <p>
            ${escapeHTML(
              item.title ||
              item.name ||
              `${item.home || ""} vs ${item.away || ""}`
            )}
          </p>

        </div>

        <small>
          ${formatDate(
            item.date ||
            item.activityDate
          )}
        </small>

      </div>

    `).join("");

}


/* =========================================================
   APPLICATION PREVIEW
========================================================= */

function renderApplicationPreview() {

  const container =
    $("#applicationsPreview");

  if (!container) return;


  const friendly =
    getData(STORAGE.friendly);

  const membership =
    getData(STORAGE.membership);


  const applications = [

    ...friendly.map(x => ({
      ...x,
      applicationType: "Friendly Match"
    })),

    ...membership.map(x => ({
      ...x,
      applicationType: "Membership"
    }))

  ]
  .sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  )
  .slice(0, 5);


  if (!applications.length) {

    container.innerHTML = `

      <div class="empty-state">

        <span>✦</span>

        <h4>
          No applications yet
        </h4>

        <p>
          New Friendly Match and Membership
          applications will appear here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    applications.map(item => `

      <div class="preview-application">

        <div>

          <strong>
            ${escapeHTML(
              item.name ||
              item.teamName ||
              "Applicant"
            )}
          </strong>

          <span>
            ${item.applicationType}
          </span>

        </div>

        <span class="status-badge ${item.status || "pending"}">
          ${item.status || "pending"}
        </span>

      </div>

    `).join("");

}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(icon, title, text) {

  return `

    <div class="empty-state">

      <span>${icon}</span>

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
   TOAST
========================================================= */

function showToast(message) {

  const container =
    $("#toastContainer");

  if (!container) return;


  const toast =
    document.createElement("div");

  toast.className = "toast";

  toast.textContent = message;


  container.appendChild(toast);


  setTimeout(() => {

    toast.style.opacity = "0";
    toast.style.transform = "translateX(15px)";

    setTimeout(() => {
      toast.remove();
    }, 250);

  }, 2800);

}


/* =========================================================
   LOADING SCREEN
========================================================= */

function hideLoading() {

  const loading =
    $("#adminLoading");

  if (!loading) return;


  setTimeout(() => {

    loading.style.opacity = "0";
    loading.style.pointerEvents = "none";

    setTimeout(() => {
      loading.style.display = "none";
    }, 300);

  }, 500);

}


/* =========================================================
   HELPERS
========================================================= */

function setText(id, value) {

  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}


function today() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");


  return `${year}-${month}-${day}`;

}


function formatDate(date) {

  if (!date) return "Date not set";


  const parsed =
    new Date(date);


  if (Number.isNaN(parsed.getTime())) {
    return date;
  }


  return parsed.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


function findCreatedAt(data, id) {

  const item =
    data.find(x => x.id === id);

  return item?.createdAt ||
    new Date().toISOString();

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }


  return String(value)
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
   DEMO APPLICATION DATA
========================================================= */

/*
   These functions are intentionally empty.

   Your public website can later save real
   Friendly Match and Membership applications
   into these LocalStorage keys.

   Example:

   localStorage.setItem(
      "gsa_friendly_applications",
      JSON.stringify([...])
   );

*/


/* =========================================================
   END
========================================================= */

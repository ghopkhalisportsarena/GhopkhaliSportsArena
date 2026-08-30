/* =========================================================
   GSA ADMIN PANEL — FINAL SUPABASE VERSION
   GHOPKHALI SPORTS ARENA
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

let supabaseClient = null;

if (
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutButton = document.getElementById("logoutButton");
const adminLoading = document.getElementById("adminLoading");
const sidebar = document.getElementById("adminSidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const adminModal = document.getElementById("adminModal");
const adminModalContent =
  document.getElementById("adminModalContent");
const adminModalClose =
  document.getElementById("adminModalClose");
const toastContainer =
  document.getElementById("toastContainer");


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(value);
  }

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}


function showLoading() {
  if (adminLoading) {
    adminLoading.style.display = "grid";
  }
}


function hideLoading() {
  if (adminLoading) {
    adminLoading.style.display = "none";
  }
}


function showToast(message, type = "success") {

  if (!toastContainer) return;

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 3000);
}


function emptyState(icon, title, text) {

  return `
    <div class="empty-state">
      <span>${escapeHTML(icon)}</span>
      <h4>${escapeHTML(title)}</h4>
      <p>${escapeHTML(text)}</p>
    </div>
  `;
}


/* =========================================================
   YEAR / DATE
========================================================= */

document
  .querySelectorAll("[data-current-year]")
  .forEach(element => {
    element.textContent =
      new Date().getFullYear();
  });


function updateDate() {

  const element =
    document.getElementById("currentDate");

  if (!element) return;

  element.textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
}


/* =========================================================
   LOGIN
========================================================= */

function showLoginScreen() {

  if (loginScreen) {
    loginScreen.style.display = "flex";
  }

  if (adminApp) {
    adminApp.style.display = "none";
  }
}


async function showAdminPanel() {

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (adminApp) {
    adminApp.style.display = "flex";
  }

  updateDate();

  await loadAdminProfile();
  await loadDashboard();
}


async function loginUser(email, password) {

  if (!supabaseClient) {

    if (loginError) {
      loginError.textContent =
        "Supabase library could not be loaded.";
    }

    return false;
  }

  if (loginError) {
    loginError.textContent = "";
  }

  showLoading();

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
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

    if (!data?.session) {

      if (loginError) {
        loginError.textContent =
          "Login session could not be created.";
      }

      return false;
    }

    return true;

  } catch (error) {

    console.error(error);

    if (loginError) {
      loginError.textContent =
        "Unable to sign in.";
    }

    return false;

  } finally {

    hideLoading();

  }
}


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const email =
        document.getElementById("adminEmail")
          ?.value.trim();

      const password =
        document.getElementById("adminPassword")
          ?.value || "";

      if (!email || !password) {

        if (loginError) {
          loginError.textContent =
            "Email and password are required.";
        }

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
   SESSION
========================================================= */

async function checkSession() {

  if (!supabaseClient) {
    showLoginScreen();
    hideLoading();
    return;
  }

  showLoading();

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {
      console.error(error);
      showLoginScreen();
      return;
    }

    if (data?.session) {
      await showAdminPanel();
    } else {
      showLoginScreen();
    }

  } catch (error) {

    console.error(error);
    showLoginScreen();

  } finally {

    hideLoading();

  }
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

  if (!supabaseClient) return;

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getUser();

    if (error || !data?.user) return;

    const email =
      data.user.email ||
      "Administrator";

    const name =
      email
        .split("@")[0]
        .replace(/[._-]/g, " ");

    const formatted =
      name.replace(
        /\b\w/g,
        char => char.toUpperCase()
      );

    const nameElement =
      document.getElementById("adminName");

    const avatarElement =
      document.getElementById("adminAvatar");

    if (nameElement) {
      nameElement.textContent = formatted;
    }

    if (avatarElement) {
      avatarElement.textContent =
        formatted.charAt(0).toUpperCase();
    }

  } catch (error) {

    console.error(error);

  }
}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      if (!supabaseClient) return;

      showLoading();

      try {

        const {
          error
        } =
          await supabaseClient.auth.signOut();

        if (error) {
          showToast(
            error.message ||
            "Logout failed.",
            "error"
          );
          return;
        }

        showLoginScreen();

        showToast(
          "You have been signed out."
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

      if (!sidebar) return;

      sidebar.classList.toggle("open");

    }
  );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function getPageId(page) {

  const pages = {

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

  return pages[page] || null;
}


function openPage(pageName) {

  document
    .querySelectorAll(".admin-page")
    .forEach(page => {
      page.classList.remove("active");
    });

  document
    .querySelectorAll(
      ".sidebar-link[data-page]"
    )
    .forEach(link => {
      link.classList.remove("active");
    });

  const pageId =
    getPageId(pageName);

  const page =
    pageId
      ? document.getElementById(pageId)
      : null;

  const link =
    document.querySelector(
      `.sidebar-link[data-page="${pageName}"]`
    );

  if (page) {
    page.classList.add("active");
  }

  if (link) {
    link.classList.add("active");
  }

  const titles = {

    dashboard:
      ["ADMINISTRATION", "Dashboard"],

    notices:
      ["CONTENT MANAGEMENT", "Notices"],

    gallery:
      ["MEDIA MANAGEMENT", "Gallery"],

    tournaments:
      ["SPORTS MANAGEMENT", "Tournaments"],

    fixtures:
      ["MATCH MANAGEMENT", "Matches & Fixtures"],

    leadership:
      ["CLUB LEADERSHIP", "Leadership"],

    committee:
      ["CLUB MANAGEMENT", "Committee"],

    "friendly-applications":
      ["APPLICATION CENTER", "Friendly Match Applications"],

    "membership-applications":
      ["APPLICATION CENTER", "Membership Applications"]

  };

  const title = titles[pageName];

  if (title) {

    const kicker =
      document.getElementById("pageKicker");

    const heading =
      document.getElementById("pageTitle");

    if (kicker) {
      kicker.textContent = title[0];
    }

    if (heading) {
      heading.textContent = title[1];
    }
  }


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


document
  .querySelectorAll(
    ".sidebar-link[data-page]"
  )
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {

        openPage(
          link.dataset.page
        );

        sidebar?.classList.remove(
          "open"
        );

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

  adminModal.classList.add("show");

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

  adminModal.classList.remove("show");

  adminModal.setAttribute(
    "aria-hidden",
    "true"
  );

  adminModalContent.innerHTML = "";

  document.body.classList.remove(
    "modal-open"
  );
}


adminModalClose?.addEventListener(
  "click",
  closeModal
);


adminModal?.addEventListener(
  "click",
  event => {

    if (event.target === adminModal) {
      closeModal();
    }

  }
);


/* =========================================================
   DELETE HELPER
========================================================= */

async function deleteRecord(
  table,
  id,
  successMessage
) {

  if (!supabaseClient || !id) return;

  const confirmed =
    window.confirm(
      "Are you sure you want to delete this item?"
    );

  if (!confirmed) return;

  showLoading();

  try {

    const {
      error
    } =
      await supabaseClient
        .from(table)
        .delete()
        .eq("id", id);

    if (error) {

      console.error(error);

      showToast(
        error.message ||
        "Delete failed.",
        "error"
      );

      return;
    }

    showToast(successMessage);

  } finally {

    hideLoading();

  }
}


/* =========================================================
   NOTICE
========================================================= */

function openNoticeModal(notice = null) {

  const edit = Boolean(notice);

  openModal(`

    <form class="modal-form" id="noticeForm">

      <h2>
        ${edit ? "Edit Notice" : "Create New Notice"}
      </h2>

      <div class="form-field">
        <label>TITLE</label>
        <input
          id="noticeTitle"
          required
          value="${escapeHTML(notice?.title || "")}"
        >
      </div>

      <div class="form-field">
        <label>CONTENT</label>
        <textarea
          id="noticeContent"
          rows="6"
          required
        >${escapeHTML(notice?.content || "")}</textarea>
      </div>

      <div class="form-field">
        <label>CATEGORY</label>
        <input
          id="noticeCategory"
          value="${escapeHTML(
            notice?.category || "General"
          )}"
        >
      </div>

      <div class="form-field">
        <label>IMAGE URL</label>
        <input
          type="url"
          id="noticeImage"
          value="${escapeHTML(
            notice?.image_url || ""
          )}"
        >
      </div>

      <div class="form-field">
        <label>
          <input
            type="checkbox"
            id="noticePublished"
            ${notice?.published !== false ? "checked" : ""}
          >
          Published
        </label>
      </div>

      <button
        class="admin-button admin-button-dark form-submit"
        type="submit"
      >
        ${edit ? "Update Notice" : "Publish Notice"}
      </button>

    </form>
  `);

  document
    .getElementById("noticeForm")
    ?.addEventListener(
      "submit",
      event => saveNotice(event, notice?.id)
    );
}


async function saveNotice(event, id = null) {

  event.preventDefault();

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

  const image_url =
    document.getElementById(
      "noticeImage"
    )?.value.trim() ||
    null;

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

    const payload = {
      title,
      content,
      category,
      image_url,
      published
    };

    let result;

    if (id) {

      result =
        await supabaseClient
          .from("notices")
          .update(payload)
          .eq("id", id);

    } else {

      result =
        await supabaseClient
          .from("notices")
          .insert(payload);

    }

    if (result.error) {

      showToast(
        result.error.message ||
        "Could not save notice.",
        "error"
      );

      return;
    }

    closeModal();

    showToast(
      id
        ? "Notice updated successfully."
        : "Notice created successfully."
    );

    await loadNotices();
    await loadDashboard();

  } finally {

    hideLoading();

  }
}


async function loadNotices() {

  const container =
    document.getElementById(
      "noticesList"
    );

  if (!container || !supabaseClient) return;

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
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    container.innerHTML =
      emptyState(
        "!",
        "Could not load notices",
        error.message
      );

    return;
  }

  if (!data?.length) {

    container.innerHTML =
      emptyState(
        "◉",
        "No notices available",
        "Create your first announcement."
      );

    return;
  }

  container.innerHTML =
    data.map(notice => `

      <div class="admin-item">

        <div class="admin-item-content">

          <div class="admin-item-top">

            <h4>
              ${escapeHTML(
                notice.title
              )}
            </h4>

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

          <p>
            ${escapeHTML(
              notice.content
            )}
          </p>

          <div class="admin-item-meta">

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

        <div class="item-actions">

          <button
            class="item-action"
            type="button"
            data-edit-notice
          >
            Edit
          </button>

          <button
            class="item-action item-delete"
            type="button"
            data-delete-notice
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  data.forEach((notice, index) => {

    const item =
      container.children[index];

    item
      ?.querySelector(
        "[data-edit-notice]"
      )
      ?.addEventListener(
        "click",
        () => openNoticeModal(notice)
      );

    item
      ?.querySelector(
        "[data-delete-notice]"
      )
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "notices",
            notice.id,
            "Notice deleted successfully."
          );

          await loadNotices();
          await loadDashboard();

        }
      );

  });

}


/* =========================================================
   TOURNAMENTS
========================================================= */

function openTournamentModal(
  tournament = null
) {

  openModal(`

    <form class="modal-form" id="tournamentForm">

      <h2>
        ${
          tournament
            ? "Edit Tournament"
            : "Add Tournament"
        }
      </h2>

      <div class="form-field">
        <label>TOURNAMENT NAME</label>

        <input
          id="tournamentName"
          required
          value="${escapeHTML(
            tournament?.name || ""
          )}"
        >
      </div>

      <div class="form-field">
        <label>DATE</label>

        <input
          type="date"
          id="tournamentDate"
          value="${escapeHTML(
            tournament?.date || ""
          )}"
        >
      </div>

      <div class="form-field">
        <label>LOCATION</label>

        <input
          id="tournamentLocation"
          value="${escapeHTML(
            tournament?.location || ""
          )}"
        >
      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${
          tournament
            ? "Update Tournament"
            : "Save Tournament"
        }
      </button>

    </form>
  `);

  document
    .getElementById(
      "tournamentForm"
    )
    ?.addEventListener(
      "submit",
      event =>
        saveTournament(
          event,
          tournament?.id
        )
    );
}


async function saveTournament(
  event,
  id = null
) {

  event.preventDefault();

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
    )?.value.trim() ||
    null;

  if (!name) {

    showToast(
      "Tournament name is required.",
      "error"
    );

    return;
  }

  const payload = {
    name,
    date,
    location
  };

  const result =
    id
      ? await supabaseClient
          .from("tournaments")
          .update(payload)
          .eq("id", id)
      : await supabaseClient
          .from("tournaments")
          .insert(payload);

  if (result.error) {

    showToast(
      result.error.message,
      "error"
    );

    return;
  }

  closeModal();

  showToast(
    id
      ? "Tournament updated."
      : "Tournament created."
  );

  await loadTournaments();
  await loadDashboard();
}


async function loadTournaments() {

  const container =
    document.getElementById(
      "tournamentsList"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

    container.innerHTML =
      emptyState(
        "🏆",
        "No tournaments",
        "Create your first tournament."
      );

    return;
  }

  container.innerHTML =
    data.map(item => `

      <div class="admin-card">

        <span class="card-icon">🏆</span>

        <h3>
          ${escapeHTML(
            item.name
          )}
        </h3>

        <p>
          ${
            item.date
              ? formatDate(item.date)
              : "Date not set"
          }
        </p>

        <small>
          ${escapeHTML(
            item.location ||
            "Location not set"
          )}
        </small>

        <div class="item-actions">

          <button
            class="item-action"
            data-edit
          >
            Edit
          </button>

          <button
            class="item-action item-delete"
            data-delete
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  data.forEach((item, index) => {

    const card =
      container.children[index];

    card
      ?.querySelector("[data-edit]")
      ?.addEventListener(
        "click",
        () =>
          openTournamentModal(item)
      );

    card
      ?.querySelector("[data-delete]")
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "tournaments",
            item.id,
            "Tournament deleted."
          );

          await loadTournaments();
          await loadDashboard();

        }
      );

  });

}


/* =========================================================
   FIXTURES
========================================================= */

function openFixtureModal(
  fixture = null
) {

  openModal(`

    <form class="modal-form" id="fixtureForm">

      <h2>
        ${
          fixture
            ? "Edit Match"
            : "Add Match"
        }
      </h2>

      <div class="form-field">

        <label>HOME TEAM</label>

        <input
          id="homeTeam"
          required
          value="${escapeHTML(
            fixture?.home_team || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>AWAY TEAM</label>

        <input
          id="awayTeam"
          required
          value="${escapeHTML(
            fixture?.away_team || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>MATCH DATE</label>

        <input
          type="date"
          id="fixtureDate"
          required
          value="${escapeHTML(
            fixture?.match_date || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>VENUE</label>

        <input
          id="fixtureVenue"
          value="${escapeHTML(
            fixture?.venue || ""
          )}"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${
          fixture
            ? "Update Match"
            : "Save Match"
        }
      </button>

    </form>
  `);

  document
    .getElementById(
      "fixtureForm"
    )
    ?.addEventListener(
      "submit",
      event =>
        saveFixture(
          event,
          fixture?.id
        )
    );
}


async function saveFixture(
  event,
  id = null
) {

  event.preventDefault();

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
    )?.value.trim() ||
    null;

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

  const payload = {
    home_team,
    away_team,
    match_date,
    venue
  };

  const result =
    id
      ? await supabaseClient
          .from("fixtures")
          .update(payload)
          .eq("id", id)
      : await supabaseClient
          .from("fixtures")
          .insert(payload);

  if (result.error) {

    showToast(
      result.error.message,
      "error"
    );

    return;
  }

  closeModal();

  showToast(
    id
      ? "Match updated."
      : "Match added."
  );

  await loadFixtures();
  await loadDashboard();
}


async function loadFixtures() {

  const container =
    document.getElementById(
      "fixturesList"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

    container.innerHTML =
      emptyState(
        "⚽",
        "No matches",
        "Add your first fixture."
      );

    return;
  }

  container.innerHTML =
    data.map(match => `

      <div class="admin-item">

        <div>

          <h4>

            ${escapeHTML(
              match.home_team
            )}

            <span>vs</span>

            ${escapeHTML(
              match.away_team
            )}

          </h4>

          <p>
            ${
              match.match_date
                ? formatDate(
                    match.match_date
                  )
                : "Date not set"
            }
          </p>

          <small>
            ${escapeHTML(
              match.venue ||
              "Venue not set"
            )}
          </small>

        </div>

        <div class="item-actions">

          <button
            class="item-action"
            data-edit
          >
            Edit
          </button>

          <button
            class="item-action item-delete"
            data-delete
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  data.forEach((match, index) => {

    const item =
      container.children[index];

    item
      ?.querySelector("[data-edit]")
      ?.addEventListener(
        "click",
        () => openFixtureModal(match)
      );

    item
      ?.querySelector("[data-delete]")
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "fixtures",
            match.id,
            "Match deleted."
          );

          await loadFixtures();
          await loadDashboard();

        }
      );

  });

}


/* =========================================================
   GALLERY
========================================================= */

function openGalleryModal(
  photo = null
) {

  openModal(`

    <form class="modal-form" id="galleryForm">

      <h2>
        ${
          photo
            ? "Edit Gallery Photo"
            : "Add Gallery Photo"
        }
      </h2>

      <div class="form-field">

        <label>PHOTO URL</label>

        <input
          type="url"
          id="galleryUrl"
          required
          value="${escapeHTML(
            photo?.image_url || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>CAPTION</label>

        <input
          id="galleryCaption"
          value="${escapeHTML(
            photo?.caption || ""
          )}"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${
          photo
            ? "Update Photo"
            : "Add Photo"
        }
      </button>

    </form>
  `);

  document
    .getElementById(
      "galleryForm"
    )
    ?.addEventListener(
      "submit",
      event =>
        saveGallery(
          event,
          photo?.id
        )
    );
}


async function saveGallery(
  event,
  id = null
) {

  event.preventDefault();

  const image_url =
    document.getElementById(
      "galleryUrl"
    )?.value.trim();

  const caption =
    document.getElementById(
      "galleryCaption"
    )?.value.trim() ||
    null;

  if (!image_url) {

    showToast(
      "Photo URL is required.",
      "error"
    );

    return;
  }

  const payload = {
    image_url,
    caption
  };

  const result =
    id
      ? await supabaseClient
          .from("gallery")
          .update(payload)
          .eq("id", id)
      : await supabaseClient
          .from("gallery")
          .insert(payload);

  if (result.error) {

    showToast(
      result.error.message,
      "error"
    );

    return;
  }

  closeModal();

  showToast(
    id
      ? "Photo updated."
      : "Photo added."
  );

  await loadGallery();
}


async function loadGallery() {

  const container =
    document.getElementById(
      "galleryAdminGrid"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

    container.innerHTML =
      emptyState(
        "▧",
        "No gallery photos",
        "Add your first photo."
      );

    return;
  }

  container.innerHTML =
    data.map(item => `

      <div class="gallery-admin-card">

        ${
          item.image_url
            ? `
              <img
                src="${escapeHTML(
                  item.image_url
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

        <div class="gallery-admin-info">

          <strong>
            ${escapeHTML(
              item.caption ||
              "GSA Gallery"
            )}
          </strong>

          <div class="item-actions">

            <button
              class="item-action"
              data-edit
            >
              Edit
            </button>

            <button
              class="item-action item-delete"
              data-delete
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    `).join("");


  data.forEach((item, index) => {

    const card =
      container.children[index];

    card
      ?.querySelector("[data-edit]")
      ?.addEventListener(
        "click",
        () => openGalleryModal(item)
      );

    card
      ?.querySelector("[data-delete]")
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "gallery",
            item.id,
            "Photo deleted."
          );

          await loadGallery();

        }
      );

  });

}


/* =========================================================
   LEADERSHIP
========================================================= */

function openLeaderModal(
  leader = null
) {

  openModal(`

    <form class="modal-form" id="leaderForm">

      <h2>
        ${
          leader
            ? "Edit Leader"
            : "Add Leader"
        }
      </h2>

      <div class="form-field">

        <label>NAME</label>

        <input
          id="leaderName"
          required
          value="${escapeHTML(
            leader?.name || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>POSITION</label>

        <input
          id="leaderPosition"
          required
          value="${escapeHTML(
            leader?.position || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>PHOTO URL</label>

        <input
          type="url"
          id="leaderPhoto"
          value="${escapeHTML(
            leader?.photo_url || ""
          )}"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${
          leader
            ? "Update Leader"
            : "Save Leader"
        }
      </button>

    </form>
  `);

  document
    .getElementById(
      "leaderForm"
    )
    ?.addEventListener(
      "submit",
      event =>
        saveLeader(
          event,
          leader?.id
        )
    );
}


async function saveLeader(
  event,
  id = null
) {

  event.preventDefault();

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
    )?.value.trim() ||
    null;

  if (!name || !position) {

    showToast(
      "Name and position are required.",
      "error"
    );

    return;
  }

  const payload = {
    name,
    position,
    photo_url
  };

  const result =
    id
      ? await supabaseClient
          .from("leadership")
          .update(payload)
          .eq("id", id)
      : await supabaseClient
          .from("leadership")
          .insert(payload);

  if (result.error) {

    showToast(
      result.error.message,
      "error"
    );

    return;
  }

  closeModal();

  showToast(
    id
      ? "Leader updated."
      : "Leader added."
  );

  await loadLeadership();
}


async function loadLeadership() {

  const container =
    document.getElementById(
      "leadershipList"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

    container.innerHTML =
      emptyState(
        "★",
        "No leadership members",
        "Add your first leader."
      );

    return;
  }

  container.innerHTML =
    data.map(leader => `

      <div class="leader-admin-card">

        ${
          leader.photo_url
            ? `
              <img
                src="${escapeHTML(
                  leader.photo_url
                )}"
                alt="${escapeHTML(
                  leader.name
                )}"
              >
            `
            : `
              <div class="leader-placeholder">
                ${escapeHTML(
                  leader.name
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
            `
        }

        <h3>
          ${escapeHTML(
            leader.name
          )}
        </h3>

        <p>
          ${escapeHTML(
            leader.position
          )}
        </p>

        <div class="item-actions">

          <button
            class="item-action"
            data-edit
          >
            Edit
          </button>

          <button
            class="item-action item-delete"
            data-delete
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  data.forEach((leader, index) => {

    const card =
      container.children[index];

    card
      ?.querySelector("[data-edit]")
      ?.addEventListener(
        "click",
        () => openLeaderModal(leader)
      );

    card
      ?.querySelector("[data-delete]")
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "leadership",
            leader.id,
            "Leader deleted."
          );

          await loadLeadership();

        }
      );

  });

}


/* =========================================================
   COMMITTEE
========================================================= */

function openCommitteeModal(
  member = null
) {

  openModal(`

    <form
      class="modal-form"
      id="committeeForm"
    >

      <h2>
        ${
          member
            ? "Edit Committee Member"
            : "Add Committee Member"
        }
      </h2>

      <div class="form-field">

        <label>NAME</label>

        <input
          id="committeeName"
          required
          value="${escapeHTML(
            member?.name || ""
          )}"
        >

      </div>

      <div class="form-field">

        <label>POSITION</label>

        <input
          id="committeePosition"
          required
          value="${escapeHTML(
            member?.position || ""
          )}"
        >

      </div>

      <button
        class="admin-button admin-button-dark"
        type="submit"
      >
        ${
          member
            ? "Update Member"
            : "Save Member"
        }
      </button>

    </form>
  `);

  document
    .getElementById(
      "committeeForm"
    )
    ?.addEventListener(
      "submit",
      event =>
        saveCommittee(
          event,
          member?.id
        )
    );
}


async function saveCommittee(
  event,
  id = null
) {

  event.preventDefault();

  const name =
    document.getElementById(
      "committeeName"
    )?.value.trim();

  const position =
    document.getElementById(
      "committeePosition"
    )?.value.trim();

  if (!name || !position) {

    showToast(
      "Name and position are required.",
      "error"
    );

    return;
  }

  const payload = {
    name,
    position
  };

  const result =
    id
      ? await supabaseClient
          .from("committee")
          .update(payload)
          .eq("id", id)
      : await supabaseClient
          .from("committee")
          .insert(payload);

  if (result.error) {

    showToast(
      result.error.message,
      "error"
    );

    return;
  }

  closeModal();

  showToast(
    id
      ? "Committee member updated."
      : "Committee member added."
  );

  await loadCommittee();
}


async function loadCommittee() {

  const container =
    document.getElementById(
      "committeeList"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

    container.innerHTML =
      emptyState(
        "♙",
        "No committee members",
        "Add your first committee member."
      );

    return;
  }

  container.innerHTML =
    data.map(member => `

      <div class="admin-item">

        <div>

          <h4>
            ${escapeHTML(
              member.name
            )}
          </h4>

          <p>
            ${escapeHTML(
              member.position
            )}
          </p>

        </div>

        <div class="item-actions">

          <button
            class="item-action"
            data-edit
          >
            Edit
          </button>

          <button
            class="item-action item-delete"
            data-delete
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  data.forEach((member, index) => {

    const item =
      container.children[index];

    item
      ?.querySelector("[data-edit]")
      ?.addEventListener(
        "click",
        () =>
          openCommitteeModal(member)
      );

    item
      ?.querySelector("[data-delete]")
      ?.addEventListener(
        "click",
        async () => {

          await deleteRecord(
            "committee",
            member.id,
            "Committee member deleted."
          );

          await loadCommittee();

        }
      );

  });

}


/* =========================================================
   APPLICATIONS
========================================================= */

function applicationName(application) {

  return (
    application.name ||
    application.full_name ||
    application.team_name ||
    application.club_name ||
    "Application"
  );
}


function renderApplications(
  container,
  applications,
  type
) {

  container.innerHTML =
    applications.map(application => {

      const status =
        application.status ||
        "pending";

      const name =
        applicationName(
          application
        );

      return `

        <div
          class="application-card"
          data-application-id="${escapeHTML(
            application.id
          )}"
        >

          <div
            class="application-card-header"
          >

            <div>

              <h3>
                ${escapeHTML(name)}
              </h3>

              <span>
                ${
                  type === "friendly"
                    ? "Friendly Match"
                    : "Membership"
                }
              </span>

            </div>

            <strong
              class="status-badge ${escapeHTML(
                status
              )}"
            >
              ${escapeHTML(status)}
            </strong>

          </div>

          ${
            application.email
              ? `
                <p>
                  ${escapeHTML(
                    application.email
                  )}
                </p>
              `
              : ""
          }

          ${
            application.phone
              ? `
                <p>
                  ${escapeHTML(
                    application.phone
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

          <div class="item-actions">

            <select
              class="application-status"
              data-status
            >

              <option
                value="pending"
                ${
                  status === "pending"
                    ? "selected"
                    : ""
                }
              >
                Pending
              </option>

              <option
                value="approved"
                ${
                  status === "approved"
                    ? "selected"
                    : ""
                }
              >
                Approved
              </option>

              <option
                value="rejected"
                ${
                  status === "rejected"
                    ? "selected"
                    : ""
                }
              >
                Rejected
              </option>

              <option
                value="completed"
                ${
                  status === "completed"
                    ? "selected"
                    : ""
                }
              >
                Completed
              </option>

            </select>

            <button
              class="item-action item-delete"
              data-delete
            >
              Delete
            </button>

          </div>

        </div>

      `;

    }).join("");


  applications.forEach(
    application => {

      const card =
        container.querySelector(
          `[data-application-id="${CSS.escape(
            String(application.id)
          )}"]`
        );

      card
        ?.querySelector("[data-status]")
        ?.addEventListener(
          "change",
          event =>
            updateApplicationStatus(
              type === "friendly"
                ? "friendly_applications"
                : "membership_applications",
              application.id,
              event.target.value
            )
        );

      card
        ?.querySelector("[data-delete]")
        ?.addEventListener(
          "click",
          async () => {

            await deleteRecord(
              type === "friendly"
                ? "friendly_applications"
                : "membership_applications",
              application.id,
              "Application deleted."
            );

            if (
              type === "friendly"
            ) {
              await loadFriendlyApplications();
            } else {
              await loadMembershipApplications();
            }

            await loadDashboard();

          }
        );

    }
  );

}


async function updateApplicationStatus(
  table,
  id,
  status
) {

  if (!supabaseClient) return;

  const {
    error
  } =
    await supabaseClient
      .from(table)
      .update({
        status
      })
      .eq("id", id);

  if (error) {

    showToast(
      error.message ||
      "Could not update status.",
      "error"
    );

    return;
  }

  showToast(
    `Application marked as ${status}.`
  );

  await loadDashboard();
}


/* =========================================================
   FRIENDLY APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  const container =
    document.getElementById(
      "friendlyApplicationsList"
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

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

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

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
   APPLICATION FILTERS
========================================================= */

async function filterApplications(
  table,
  containerId,
  status
) {

  const container =
    document.getElementById(
      containerId
    );

  if (!container || !supabaseClient) return;

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

  if (error || !data?.length) {

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
    table ===
      "friendly_applications"
      ? "friendly"
      : "membership"
  );
}


document
  .getElementById(
    "friendlyStatusFilter"
  )
  ?.addEventListener(
    "change",
    event =>
      filterApplications(
        "friendly_applications",
        "friendlyApplicationsList",
        event.target.value
      )
  );


document
  .getElementById(
    "membershipStatusFilter"
  )
  ?.addEventListener(
    "change",
    event =>
      filterApplications(
        "membership_applications",
        "membershipApplicationsList",
        event.target.value
      )
  );


/* =========================================================
   DASHBOARD
========================================================= */

async function getCount(table) {

  if (!supabaseClient) return 0;

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
        table,
        error.message
      );
      return 0;
    }

    return count || 0;

  } catch {
    return 0;
  }
}


async function loadDashboard() {

  if (!supabaseClient) return;

  const [
    notices,
    tournaments,
    fixtures,
    friendly,
    membership
  ] =
    await Promise.all([

      getCount("notices"),
      getCount("tournaments"),
      getCount("fixtures"),
      getCount("friendly_applications"),
      getCount("membership_applications")

    ]);


  document.getElementById(
    "totalNotices"
  )?.replaceChildren(
    document.createTextNode(
      notices
    )
  );


  document.getElementById(
    "totalTournaments"
  )?.replaceChildren(
    document.createTextNode(
      tournaments
    )
  );


  document.getElementById(
    "totalFixtures"
  )?.replaceChildren(
    document.createTextNode(
      fixtures
    )
  );


  document.getElementById(
    "totalApplications"
  )?.replaceChildren(
    document.createTextNode(
      friendly + membership
    )
  );


  document.getElementById(
    "friendlyApplicationCount"
  )?.replaceChildren(
    document.createTextNode(
      friendly
    )
  );


  document.getElementById(
    "membershipApplicationCount"
  )?.replaceChildren(
    document.createTextNode(
      membership
    )
  );


  const dot =
    document.getElementById(
      "notificationDot"
    );

  if (dot) {

    dot.classList.toggle(
      "show",
      friendly + membership > 0
    );

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

  if (!container || !supabaseClient) return;

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

  if (
    error ||
    !data?.length
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
    data.map(notice => `

      <div class="recent-activity-item">

        <div>

          <strong>
            ${escapeHTML(
              notice.title
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

    `).join("");
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

        switch (
          button.dataset.action
        ) {

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
   REFRESH
========================================================= */

document
  .getElementById(
    "refreshButton"
  )
  ?.addEventListener(
    "click",
    async () => {

      showLoading();

      try {

        await loadDashboard();

        const active =
          document.querySelector(
            ".admin-page.active"
          );

        switch (
          active?.id
        ) {

          case "noticesPage":
            await loadNotices();
            break;

          case "galleryPage":
            await loadGallery();
            break;

          case "tournamentsPage":
            await loadTournaments();
            break;

          case "fixturesPage":
            await loadFixtures();
            break;

          case "leadershipPage":
            await loadLeadership();
            break;

          case "committeePage":
            await loadCommittee();
            break;

          case "friendlyApplicationsPage":
            await loadFriendlyApplications();
            break;

          case "membershipApplicationsPage":
            await loadMembershipApplications();
            break;

        }

        showToast(
          "Dashboard refreshed."
        );

      } catch (error) {

        console.error(error);

        showToast(
          "Refresh failed.",
          "error"
        );

      } finally {

        hideLoading();

      }

    }
  );


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);


/* =========================================================
   AUTH STATE
========================================================= */

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    (event) => {

      if (
        event === "SIGNED_OUT"
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


/* =========================================================
   END
========================================================= */

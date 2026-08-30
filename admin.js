/* =========================================================
   GSA ADMIN PANEL
   Supabase + Authentication
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


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
   YEAR
========================================================= */

document.querySelectorAll("[data-current-year]")
  .forEach(el => {
    el.textContent = new Date().getFullYear();
  });


/* =========================================================
   DATE
========================================================= */

function updateDate() {

  const dateElement =
    document.getElementById("currentDate");

  if (!dateElement) return;

  const now = new Date();

  dateElement.textContent =
    now.toLocaleDateString(
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

  if (adminLoading) {
    adminLoading.style.display = "grid";
  }
}

function hideLoading() {

  if (adminLoading) {
    adminLoading.style.display = "none";
  }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "success"
) {

  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;

  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = "0";

    setTimeout(() => {
      toast.remove();
    }, 250);

  }, 3000);
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(email, password) {

  loginError.textContent = "";

  showLoading();

  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  hideLoading();

  if (error) {

    loginError.textContent =
      error.message ||
      "Invalid email or password.";

    return false;
  }

  if (!data.session) {

    loginError.textContent =
      "Login session could not be created.";

    return false;
  }

  return true;
}


/* =========================================================
   LOGIN FORM
========================================================= */

loginForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email =
      document.getElementById(
        "adminEmail"
      ).value.trim();

    const password =
      document.getElementById(
        "adminPassword"
      ).value;

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


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

  showLoading();

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();

  hideLoading();

  if (session) {

    await showAdminPanel();

  } else {

    showLoginScreen();

  }
}


/* =========================================================
   SHOW ADMIN
========================================================= */

async function showAdminPanel() {

  loginScreen.style.display =
    "none";

  adminApp.style.display =
    "flex";

  updateDate();

  await loadAdminProfile();

  await loadDashboard();

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLoginScreen() {

  loginScreen.style.display =
    "flex";

  adminApp.style.display =
    "none";
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();

  if (!user) return;

  const email =
    user.email || "Administrator";

  const name =
    email
      .split("@")[0]
      .replace(/[._-]/g, " ");

  const formattedName =
    name.replace(
      /\b\w/g,
      char => char.toUpperCase()
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
}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
  "click",
  async () => {

    showLoading();

    await supabaseClient.auth.signOut();

    hideLoading();

    showLoginScreen();

    showToast(
      "You have been signed out.",
      "success"
    );

  }
);


/* =========================================================
   SIDEBAR
========================================================= */

sidebarToggle.addEventListener(
  "click",
  () => {

    sidebar.classList.toggle(
      "open"
    );

  }
);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const sidebarLinks =
  document.querySelectorAll(
    ".sidebar-link[data-page]"
  );

sidebarLinks.forEach(link => {

  link.addEventListener(
    "click",
    () => {

      const page =
        link.dataset.page;

      openPage(page);

      sidebar.classList.remove(
        "open"
      );

    }
  );

});


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


  const page =
    document.getElementById(
      `${pageName.replace(
        "friendly-applications",
        "friendlyApplications"
      ).replace(
        "membership-applications",
        "membershipApplications"
      )}Page`
    );


  const activeLink =
    document.querySelector(
      `.sidebar-link[data-page="${pageName}"]`
    );


  if (page) {
    page.classList.add("active");
  }

  if (activeLink) {
    activeLink.classList.add("active");
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

    document.getElementById(
      "pageKicker"
    ).textContent = title[0];

    document.getElementById(
      "pageTitle"
    ).textContent = title[1];

  }

}


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

  adminModalContent.innerHTML =
    content;

  adminModal.classList.add(
    "show"
  );

  adminModal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal() {

  adminModal.classList.remove(
    "show"
  );

  adminModal.setAttribute(
    "aria-hidden",
    "true"
  );

  adminModalContent.innerHTML =
    "";

}


adminModalClose.addEventListener(
  "click",
  closeModal
);


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
          required
        >

      </div>

      <div class="form-field">

        <label>
          CONTENT
        </label>

        <textarea
          id="noticeContent"
          required
        ></textarea>

      </div>

      <button
        class="admin-button admin-button-dark form-submit"
        type="submit"
      >
        Publish Notice
      </button>

    </form>

  `);


  document
    .getElementById("noticeForm")
    .addEventListener(
      "submit",
      saveNotice
    );

}


/* =========================================================
   SAVE NOTICE
========================================================= */

async function saveNotice(event) {

  event.preventDefault();

  const title =
    document.getElementById(
      "noticeTitle"
    ).value.trim();

  const content =
    document.getElementById(
      "noticeContent"
    ).value.trim();


  const {
    error
  } =
    await supabaseClient
      .from("notices")
      .insert({

        title,
        content

      });


  if (error) {

    console.error(error);

    showToast(
      "Could not save notice. Check your Supabase table.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Notice published successfully."
  );

  loadDashboard();

  loadNotices();

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
    .addEventListener(
      "submit",
      saveTournament
    );

}


async function saveTournament(event) {

  event.preventDefault();

  const name =
    document.getElementById(
      "tournamentName"
    ).value.trim();

  const date =
    document.getElementById(
      "tournamentDate"
    ).value || null;

  const location =
    document.getElementById(
      "tournamentLocation"
    ).value.trim();


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
      "Could not save tournament.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Tournament created successfully."
  );

  loadDashboard();

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
    .addEventListener(
      "submit",
      saveFixture
    );

}


async function saveFixture(event) {

  event.preventDefault();

  const home_team =
    document.getElementById(
      "homeTeam"
    ).value.trim();

  const away_team =
    document.getElementById(
      "awayTeam"
    ).value.trim();

  const match_date =
    document.getElementById(
      "fixtureDate"
    ).value;

  const venue =
    document.getElementById(
      "fixtureVenue"
    ).value.trim();


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
      "Could not save match.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Match added successfully."
  );

  loadDashboard();

}


/* =========================================================
   GALLERY
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
    .addEventListener(
      "submit",
      saveGallery
    );

}


async function saveGallery(event) {

  event.preventDefault();

  const image_url =
    document.getElementById(
      "galleryUrl"
    ).value.trim();

  const caption =
    document.getElementById(
      "galleryCaption"
    ).value.trim();


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
      "Could not add photo.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Photo added successfully."
  );

}


/* =========================================================
   LEADER
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
    .addEventListener(
      "submit",
      saveLeader
    );

}


async function saveLeader(event) {

  event.preventDefault();

  const name =
    document.getElementById(
      "leaderName"
    ).value.trim();

  const position =
    document.getElementById(
      "leaderPosition"
    ).value.trim();

  const photo_url =
    document.getElementById(
      "leaderPhoto"
    ).value.trim();


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
      "Could not save leader.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Leader added successfully."
  );

}


/* =========================================================
   COMMITTEE
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
    .addEventListener(
      "submit",
      saveCommittee
    );

}


async function saveCommittee(event) {

  event.preventDefault();

  const name =
    document.getElementById(
      "committeeName"
    ).value.trim();

  const position =
    document.getElementById(
      "committeePosition"
    ).value.trim();


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
      "Could not save committee member.",
      "error"
    );

    return;
  }


  closeModal();

  showToast(
    "Committee member added."
  );

}


/* =========================================================
   DASHBOARD DATA
========================================================= */

async function getCount(table) {

  const {
    count,
    error
  } =
    await supabaseClient
      .from(table)
      .select("*", {
        count: "exact",
        head: true
      });

  if (error) {

    console.warn(
      `Table ${table} unavailable`,
      error
    );

    return 0;
  }

  return count || 0;
}


async function loadDashboard() {

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


  if (totalNotices)
    totalNotices.textContent =
      notices;

  if (totalTournaments)
    totalTournaments.textContent =
      tournaments;

  if (totalFixtures)
    totalFixtures.textContent =
      fixtures;

  if (totalApplications)
    totalApplications.textContent =
      friendly + membership;


  document.getElementById(
    "friendlyApplicationCount"
  ).textContent = friendly;

  document.getElementById(
    "membershipApplicationCount"
  ).textContent = membership;


  if (
    friendly + membership > 0
  ) {

    document
      .getElementById(
        "notificationDot"
      )
      .classList.add("show");

  }

}


/* =========================================================
   NOTICES LIST
========================================================= */

async function loadNotices() {

  const container =
    document.getElementById(
      "noticesList"
    );

  if (!container) return;


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

    container.innerHTML = emptyState(
      "◉",
      "No notices available",
      "Create your first announcement."
    );

    return;
  }


  if (!data || data.length === 0) {

    container.innerHTML = emptyState(
      "◉",
      "No notices available",
      "Create your first announcement."
    );

    return;
  }


  container.innerHTML =
    data.map(notice => `

      <div class="admin-item">

        <div>

          <h4>
            ${escapeHTML(
              notice.title || "Untitled"
            )}
          </h4>

          <p>
            ${escapeHTML(
              notice.content || ""
            )}
          </p>

        </div>

        <div class="item-actions">

          <button
            class="item-action item-delete"
            onclick="deleteNotice('${notice.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");

}


/* =========================================================
   DELETE NOTICE
========================================================= */

async function deleteNotice(id) {

  if (
    !confirm(
      "Delete this notice?"
    )
  ) return;


  const {
    error
  } =
    await supabaseClient
      .from("notices")
      .delete()
      .eq("id", id);


  if (error) {

    showToast(
      "Could not delete notice.",
      "error"
    );

    return;
  }


  showToast(
    "Notice deleted."
  );

  loadNotices();

  loadDashboard();

}


/* =========================================================
   REFRESH
========================================================= */

document
  .getElementById(
    "refreshButton"
  )
  .addEventListener(
    "click",
    async () => {

      const button =
        document.getElementById(
          "refreshButton"
        );

      button.style.transform =
        "rotate(360deg)";

      await loadDashboard();

      await loadNotices();

      setTimeout(() => {

        button.style.transform =
          "";

      }, 400);

      showToast(
        "Dashboard refreshed."
      );

    }
  );


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

      <span>${icon}</span>

      <h4>
        ${title}
      </h4>

      <p>
        ${text}
      </p>

    </div>

  `;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

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
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (
      event === "SIGNED_OUT"
    ) {

      showLoginScreen();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateDate();

    await checkSession();

    if (
      document
        .getElementById(
          "noticesPage"
        )
        .classList
        .contains("active")
    ) {

      await loadNotices();

    }

  }
);
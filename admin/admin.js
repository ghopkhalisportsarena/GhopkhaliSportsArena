/* =========================================================
   GSA ADMIN SYSTEM
   Ghopkhali Sports Arena
   Supabase Admin JavaScript
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   GLOBAL
========================================================= */

let currentUser = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  document.querySelectorAll(selector);


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setCurrentYear();

    setupSidebar();

    setupLogout();

    setupNavigation();

    setupMobileMenu();

    await checkAuthentication();

  }
);


/* =========================================================
   CURRENT YEAR
========================================================= */

function setCurrentYear() {

  $$("[data-current-year]").forEach(
    (element) => {

      element.textContent =
        new Date().getFullYear();

    }
  );

}


/* =========================================================
   AUTHENTICATION
========================================================= */

async function checkAuthentication() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();

    if (error) {

      console.error(
        "Session error:",
        error
      );

      redirectToLogin();

      return;

    }


    const session =
      data?.session;


    if (!session?.user) {

      redirectToLogin();

      return;

    }


    currentUser =
      session.user;


    updateAdminInformation();


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    redirectToLogin();

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

      updateAdminInformation();

    }


    if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;

      redirectToLogin();

    }

  }
);


/* =========================================================
   LOGIN REDIRECT
========================================================= */

function redirectToLogin() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  if (
    currentPage ===
    "admin-login.html"
  ) {

    return;

  }


  window.location.href =
    "admin-login.html";

}


/* =========================================================
   ADMIN INFORMATION
========================================================= */

function updateAdminInformation() {

  if (!currentUser)
    return;


  const email =
    currentUser.email ||
    "Administrator";


  const username =
    email.split("@")[0] ||
    "Administrator";


  $$("[data-admin-email]")
    .forEach((element) => {

      element.textContent =
        email;

    });


  $$("[data-admin-name]")
    .forEach((element) => {

      element.textContent =
        username;

    });


  $$("[data-admin-avatar]")
    .forEach((element) => {

      element.textContent =
        username
          .charAt(0)
          .toUpperCase();

    });

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

  const buttons =
    $$("[data-admin-logout]");


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        async () => {

          button.disabled = true;

          button.textContent =
            "Signing out...";


          try {

            const {
              error
            } =
              await supabaseClient
                .auth
                .signOut();


            if (error)
              throw error;


            window.location.href =
              "admin-login.html";


          } catch (error) {

            console.error(
              "Logout error:",
              error
            );


            button.disabled =
              false;

            button.textContent =
              "Logout";


            showToast(
              error.message ||
              "Logout failed.",
              "error"
            );

          }

        }
      );

    }
  );

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

  const toggle =
    $("#sidebarToggle");

  const sidebar =
    $("#adminSidebar");

  const overlay =
    $("#sidebarOverlay");


  if (
    !toggle ||
    !sidebar
  )
    return;


  toggle.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "open"
      );


      if (overlay) {

        overlay.classList.toggle(
          "active"
        );

      }

    }
  );


  if (overlay) {

    overlay.addEventListener(
      "click",
      () => {

        sidebar.classList.remove(
          "open"
        );

        overlay.classList.remove(
          "active"
        );

      }
    );

  }

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

  $$("[data-sidebar-toggle]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const sidebar =
            $("#adminSidebar");

          if (!sidebar)
            return;


          sidebar.classList.toggle(
            "open"
          );

        }
      );

    });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  $$("[data-admin-page]")
    .forEach((link) => {

      link.addEventListener(
        "click",
        () => {

          const page =
            link.dataset.adminPage;


          if (!page)
            return;


          navigateToAdminPage(
            page
          );

        }
      );

    });

}


/* =========================================================
   NAVIGATE
========================================================= */

function navigateToAdminPage(
  page
) {

  const pages = {

    dashboard:
      "admin-dashboard.html",

    notices:
      "admin-notices.html",

    gallery:
      "admin-gallery.html",

    tournaments:
      "admin-tournaments.html",

    fixtures:
      "admin-fixtures.html",

    leadership:
      "admin-leadership.html",

    committee:
      "admin-committee.html",

    "friendly-applications":
      "admin-friendly-applications.html",

    "membership-applications":
      "admin-membership-applications.html",

    settings:
      "admin-settings.html",

    users:
      "admin-users.html",

    profile:
      "admin-profile.html"

  };


  const target =
    pages[page];


  if (!target) {

    console.warn(
      "Unknown admin page:",
      page
    );

    return;

  }


  window.location.href =
    target;

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function setActiveNavigation() {

  const filename =
    window.location.pathname
      .split("/")
      .pop();


  $$("[data-admin-page]")
    .forEach((link) => {

      link.classList.remove(
        "active"
      );


      const page =
        link.dataset.adminPage;


      const pageMap = {

        dashboard:
          "admin-dashboard.html",

        notices:
          "admin-notices.html",

        gallery:
          "admin-gallery.html",

        tournaments:
          "admin-tournaments.html",

        fixtures:
          "admin-fixtures.html",

        leadership:
          "admin-leadership.html",

        committee:
          "admin-committee.html",

        "friendly-applications":
          "admin-friendly-applications.html",

        "membership-applications":
          "admin-membership-applications.html",

        settings:
          "admin-settings.html",

        users:
          "admin-users.html",

        profile:
          "admin-profile.html"

      };


      if (
        pageMap[page] ===
        filename
      ) {

        link.classList.add(
          "active"
        );

      }

    });

}


/* =========================================================
   RUN ACTIVE NAV
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  setActiveNavigation
);


/* =========================================================
   SUPABASE ERROR HANDLER
========================================================= */

function handleSupabaseError(
  error,
  fallbackMessage =
    "Something went wrong."
) {

  console.error(
    "Supabase error:",
    error
  );


  if (
    error?.message
  ) {

    showToast(
      error.message,
      "error"
    );

  } else {

    showToast(
      fallbackMessage,
      "error"
    );

  }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
  show = true
) {

  const loader =
    $("#adminLoading");


  if (!loader)
    return;


  loader.style.display =
    show ? "flex" : "none";

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function buttonLoading(
  button,
  loading = true,
  loadingText = "Loading..."
) {

  if (!button)
    return;


  if (loading) {

    button.dataset.originalText =
      button.innerHTML;

    button.disabled = true;

    button.innerHTML =
      loadingText;

  } else {

    button.disabled = false;

    if (
      button.dataset.originalText
    ) {

      button.innerHTML =
        button.dataset.originalText;

    }

  }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "success"
) {

  let container =
    $("#adminToastContainer");


  if (!container) {

    container =
      document.createElement(
        "div"
      );

    container.id =
      "adminToastContainer";

    container.className =
      "admin-toast-container";


    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `admin-toast admin-toast-${type}`;


  toast.textContent =
    message;


  container.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.classList.add(
        "hide"
      );


      setTimeout(
        () => {

          toast.remove();

        },
        300
      );

    },
    3500
  );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete(
  message =
    "Are you sure you want to delete this item?"
) {

  return window.confirm(
    message
  );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
  value
) {

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
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  date
) {

  if (!date)
    return "—";


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "—";

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
   DATE + TIME
========================================================= */

function formatDateTime(
  date
) {

  if (!date)
    return "—";


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "—";

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
   SUPABASE USER
========================================================= */

async function getCurrentUser() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getUser();


    if (error)
      throw error;


    return data?.user || null;

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return null;

  }

}


/* =========================================================
   REQUIRE AUTH
========================================================= */

async function requireAuth() {

  const user =
    await getCurrentUser();


  if (!user) {

    redirectToLogin();

    return null;

  }


  currentUser =
    user;


  updateAdminInformation();


  return user;

}


/* =========================================================
   DATABASE HELPER
========================================================= */

async function fetchTable(
  table,
  options = {}
) {

  let query =
    supabaseClient
      .from(table)
      .select(
        options.select || "*"
      );


  if (
    options.order
  ) {

    query =
      query.order(
        options.order,
        {
          ascending:
            options.ascending ??
            false
        }
      );

  }


  if (
    options.limit
  ) {

    query =
      query.limit(
        options.limit
      );

  }


  if (
    options.eq
  ) {

    Object.entries(
      options.eq
    ).forEach(
      ([column, value]) => {

        query =
          query.eq(
            column,
            value
          );

      }
    );

  }


  const {
    data,
    error
  } =
    await query;


  if (error)
    throw error;


  return data || [];

}


/* =========================================================
   DATABASE INSERT
========================================================= */

async function insertRecord(
  table,
  record
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(table)
      .insert(record)
      .select();


  if (error)
    throw error;


  return data;

}


/* =========================================================
   DATABASE UPDATE
========================================================= */

async function updateRecord(
  table,
  id,
  record
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(table)
      .update(record)
      .eq(
        "id",
        id
      )
      .select();


  if (error)
    throw error;


  return data;

}


/* =========================================================
   DATABASE DELETE
========================================================= */

async function deleteRecord(
  table,
  id
) {

  const {
    error
  } =
    await supabaseClient
      .from(table)
      .delete()
      .eq(
        "id",
        id
      );


  if (error)
    throw error;


  return true;

}


/* =========================================================
   TABLE COUNT
========================================================= */

async function getTableCount(
  table
) {

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


  if (error)
    throw error;


  return count || 0;

}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.supabaseClient =
  supabaseClient;

window.currentUser =
  currentUser;

window.showLoading =
  showLoading;

window.buttonLoading =
  buttonLoading;

window.showToast =
  showToast;

window.confirmDelete =
  confirmDelete;

window.escapeHTML =
  escapeHTML;

window.escapeAttribute =
  escapeAttribute;

window.formatDate =
  formatDate;

window.formatDateTime =
  formatDateTime;

window.getCurrentUser =
  getCurrentUser;

window.requireAuth =
  requireAuth;

window.fetchTable =
  fetchTable;

window.insertRecord =
  insertRecord;

window.updateRecord =
  updateRecord;

window.deleteRecord =
  deleteRecord;

window.getTableCount =
  getTableCount;

window.navigateToAdminPage =
  navigateToAdminPage;
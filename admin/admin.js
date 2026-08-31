/* =========================================================
   GSA ADMIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   LOAD NAVIGATION
========================================================= */

async function loadNavigation() {

  const container =
    document.getElementById("navContainer");

  if (!container) return;

  try {

    const response =
      await fetch("admin-nav.html");

    if (!response.ok) {

      throw new Error(
        "Navigation file could not be loaded."
      );

    }

    container.innerHTML =
      await response.text();

    initializeNavigation();

    updateCurrentUser();

  } catch (error) {

    console.error(
      "Navigation error:",
      error
    );

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

  const toggle =
    document.getElementById(
      "sidebarToggle"
    );

  const sidebar =
    document.getElementById(
      "adminSidebar"
    );

  const overlay =
    document.getElementById(
      "adminSidebarOverlay"
    );


  function openSidebar() {

    if (!sidebar) return;

    sidebar.classList.add("open");

    if (overlay) {

      overlay.classList.add("open");

    }

  }


  function closeSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove("open");

    if (overlay) {

      overlay.classList.remove("open");

    }

  }


  if (toggle) {

    toggle.addEventListener(
      "click",
      openSidebar
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeSidebar
    );

  }


  /*
   * Active page
   */

  const currentPage =
    location.pathname
      .split("/")
      .pop()
      .replace(
        ".html",
        ""
      )
      .replace(
        "admin-",
        ""
      );


  document
    .querySelectorAll(".sidebar-link")
    .forEach(function(link) {

      const page =
        link.dataset.page;

      if (
        page &&
        page === currentPage
      ) {

        link.classList.add("active");

      }

    });


  /*
   * Close mobile menu after link
   */

  document
    .querySelectorAll(".sidebar-link")
    .forEach(function(link) {

      link.addEventListener(
        "click",
        closeSidebar
      );

    });


  /*
   * Logout
   */

  const logout =
    document.getElementById(
      "logoutButton"
    );

  if (logout) {

    logout.addEventListener(
      "click",
      logoutAdmin
    );

  }

}


/* =========================================================
   CURRENT USER
========================================================= */

async function updateCurrentUser() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getUser();


    if (error) {

      console.warn(
        "Could not get user:",
        error
      );

      return;

    }


    const user =
      data?.user;


    if (!user) return;


    const email =
      user.email || "Administrator";


    const name =
      email
        .split("@")[0]
        .replace(
          /^[a-z]/,
          function(letter) {
            return letter.toUpperCase();
          }
        );


    const nameElement =
      document.getElementById(
        "adminName"
      );

    const avatarElement =
      document.getElementById(
        "adminAvatar"
      );


    if (nameElement) {

      nameElement.textContent =
        name;

    }


    if (avatarElement) {

      avatarElement.textContent =
        name.charAt(0)
          .toUpperCase();

    }

  } catch (error) {

    console.error(
      "User error:",
      error
    );

  }

}


/* =========================================================
   AUTH CHECK
========================================================= */

async function checkAuthentication() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();


    if (error) {

      throw error;

    }


    const session =
      data?.session;


    if (!session) {

      window.location.replace(
        "admin.html"
      );

      return false;

    }


    return true;

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    window.location.replace(
      "admin.html"
    );

    return false;

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

  const button =
    document.getElementById(
      "logoutButton"
    );


  if (button) {

    button.disabled =
      true;

    button.innerHTML =
      "<span>...</span><span>Signing out</span>";

  }


  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }


  window.location.replace(
    "admin.html"
  );

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  function(event, session) {

    if (
      event === "SIGNED_OUT"
    ) {

      window.location.replace(
        "admin.html"
      );

    }

  }
);


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const authenticated =
      await checkAuthentication();

    if (!authenticated) return;

    await loadNavigation();

  }
);
"use strict";

/* =========================================================
   GSA ADMIN JAVASCRIPT
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
   HELPERS
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


function formatDate(value) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day:"2-digit",
      month:"short",
      year:"numeric"
    }
  );
}


function showComingSoon(name) {

  alert(
    name +
    " is ready for connection, but its Supabase table structure has not been provided yet."
  );
}


/* =========================================================
   LOGIN
========================================================= */

async function checkExistingSession() {

  if (!document.getElementById("gsaAdminLoginForm")) {
    return;
  }

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();

  if (session?.user) {

    window.location.replace(
      "admin-dashboard.html"
    );

  }
}


async function handleLogin(event) {

  event.preventDefault();

  const emailInput =
    document.getElementById(
      "gsaAdminEmail"
    );

  const passwordInput =
    document.getElementById(
      "gsaAdminPassword"
    );

  const errorBox =
    document.getElementById(
      "gsaAdminError"
    );

  const button =
    document.getElementById(
      "gsaAdminLoginButton"
    );

  const loading =
    document.getElementById(
      "gsaAdminLoading"
    );


  errorBox.textContent = "";

  button.disabled = true;
  button.textContent = "Signing in...";

  if (loading) {
    loading.style.display = "flex";
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email:
          emailInput.value.trim(),

        password:
          passwordInput.value
      });


    if (error) {
      throw error;
    }


    if (!data?.user) {
      throw new Error(
        "Login failed."
      );
    }


    window.location.replace(
      "admin-dashboard.html"
    );


  } catch (error) {

    console.error(error);

    errorBox.textContent =
      error?.message ||
      "Login failed. Please check your email and password.";

    button.disabled = false;
    button.textContent =
      "Login to Admin Panel";

    if (loading) {
      loading.style.display = "none";
    }

  }
}


/* =========================================================
   AUTH GUARD
========================================================= */

async function requireSession() {

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();


  if (!session?.user) {

    window.location.replace(
      "admin.html"
    );

    return null;
  }


  return session;
}


/* =========================================================
   USER
========================================================= */

async function loadAdminUser() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) return;


  const name =
    user.user_metadata?.full_name ||
    user.email ||
    "Administrator";


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
      name.charAt(0).toUpperCase();
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
    button.disabled = true;
  }


  await supabaseClient.auth.signOut();

  window.location.replace(
    "admin.html"
  );
}


/* =========================================================
   FRIENDLY APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  const container =
    document.getElementById(
      "friendlyApplications"
    );

  if (!container) return;


  container.innerHTML =
    `<div class="admin-loading">
      Loading applications...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("friendly_applications")
      .select("*")
      .order("created_at", {
        ascending:false
      });


  if (error) {

    console.error(error);

    container.innerHTML =
      `<div class="admin-error">
        ${escapeHTML(error.message)}
      </div>`;

    return;
  }


  if (!data?.length) {

    container.innerHTML =
      `<div class="admin-empty">
        No friendly match applications found.
      </div>`;

    return;
  }


  container.innerHTML = "";


  data.forEach(application => {

    const card =
      document.createElement("article");

    card.className =
      "application-card";


    const status =
      application.status ||
      "pending";


    card.innerHTML = `

      <div class="application-card-header">

        <div>

          <span class="application-label">
            FRIENDLY MATCH
          </span>

          <h3>
            ${escapeHTML(
              application.team_name ||
              "Unnamed Team"
            )}
          </h3>

        </div>

        <span class="status status-${escapeHTML(status)}">
          ${escapeHTML(status.toUpperCase())}
        </span>

      </div>


      <div class="application-grid">

        <div>
          <small>Representative</small>
          <strong>
            ${escapeHTML(
              application.contact_person || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Phone</small>
          <strong>
            ${escapeHTML(
              application.phone || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Email</small>
          <strong>
            ${escapeHTML(
              application.email || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Match Date</small>
          <strong>
            ${formatDate(
              application.preferred_date
            )}
          </strong>
        </div>

        <div>
          <small>Match Time</small>
          <strong>
            ${escapeHTML(
              application.preferred_time || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Submitted</small>
          <strong>
            ${formatDate(
              application.created_at
            )}
          </strong>
        </div>

      </div>


      <div class="application-message">

        <small>MESSAGE</small>

        <p>
          ${escapeHTML(
            application.message ||
            "No additional message."
          )}
        </p>

      </div>


      <div class="application-actions">

        <button
          class="admin-button success"
          data-action="approve-friendly"
          data-id="${escapeHTML(application.id)}">
          Approve
        </button>

        <button
          class="admin-button warning"
          data-action="reject-friendly"
          data-id="${escapeHTML(application.id)}">
          Reject
        </button>

        <button
          class="admin-button danger"
          data-action="delete-friendly"
          data-id="${escapeHTML(application.id)}">
          Delete
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

async function loadMembershipApplications() {

  const container =
    document.getElementById(
      "membershipApplications"
    );

  if (!container) return;


  container.innerHTML =
    `<div class="admin-loading">
      Loading applications...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("membership_applications")
      .select("*")
      .order("created_at", {
        ascending:false
      });


  if (error) {

    console.error(error);

    container.innerHTML =
      `<div class="admin-error">
        ${escapeHTML(error.message)}
      </div>`;

    return;
  }


  if (!data?.length) {

    container.innerHTML =
      `<div class="admin-empty">
        No membership applications found.
      </div>`;

    return;
  }


  container.innerHTML = "";


  data.forEach(application => {

    const card =
      document.createElement("article");

    card.className =
      "application-card";


    const status =
      application.status ||
      "pending";


    card.innerHTML = `

      <div class="application-card-header">

        <div>

          <span class="application-label">
            CLUB MEMBERSHIP
          </span>

          <h3>
            ${escapeHTML(
              application.full_name ||
              "Unnamed Applicant"
            )}
          </h3>

        </div>

        <span class="status status-${escapeHTML(status)}">
          ${escapeHTML(status.toUpperCase())}
        </span>

      </div>


      <div class="application-grid">

        <div>
          <small>Phone</small>
          <strong>
            ${escapeHTML(
              application.phone || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Date of Birth</small>
          <strong>
            ${formatDate(
              application.date_of_birth
            )}
          </strong>
        </div>

        <div>
          <small>Occupation</small>
          <strong>
            ${escapeHTML(
              application.occupation || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Sports Position / Skill</small>
          <strong>
            ${escapeHTML(
              application.preferred_position || "—"
            )}
          </strong>
        </div>

        <div>
          <small>Submitted</small>
          <strong>
            ${formatDate(
              application.created_at
            )}
          </strong>
        </div>

        <div>
          <small>Address</small>
          <strong>
            ${escapeHTML(
              application.address || "—"
            )}
          </strong>
        </div>

      </div>


      <div class="application-message">

        <small>SPORTS / EXPERIENCE</small>

        <p>
          ${escapeHTML(
            application.experience || "—"
          )}
        </p>

      </div>


      <div class="application-message">

        <small>ADDITIONAL INFORMATION</small>

        <p>
          ${escapeHTML(
            application.message || "—"
          )}
        </p>

      </div>


      <div class="application-actions">

        <button
          class="admin-button success"
          data-action="approve-membership"
          data-id="${escapeHTML(application.id)}">
          Approve
        </button>

        <button
          class="admin-button warning"
          data-action="reject-membership"
          data-id="${escapeHTML(application.id)}">
          Reject
        </button>

        <button
          class="admin-button danger"
          data-action="delete-membership"
          data-id="${escapeHTML(application.id)}">
          Delete
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   STATUS UPDATE
========================================================= */

async function updateStatus(
  table,
  id,
  status,
  reloadFunction
) {

  const {
    error
  } =
    await supabaseClient
      .from(table)
      .update({
        status:status
      })
      .eq("id",id);


  if (error) {

    console.error(error);

    alert(
      "Unable to update application.\n\n" +
      error.message
    );

    return;
  }


  await reloadFunction();

  await loadDashboardStats();
}


/* =========================================================
   DELETE
========================================================= */

async function deleteApplication(
  table,
  id,
  reloadFunction
) {

  if (
    !confirm(
      "Are you sure you want to delete this application?"
    )
  ) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from(table)
      .delete()
      .eq("id",id);


  if (error) {

    console.error(error);

    alert(
      "Unable to delete application.\n\n" +
      error.message
    );

    return;
  }


  await reloadFunction();

  await loadDashboardStats();
}


/* =========================================================
   DASHBOARD STATS
========================================================= */

async function loadDashboardStats() {

  const memberElement =
    document.getElementById(
      "totalMembers"
    );

  const applicationElement =
    document.getElementById(
      "totalApplications"
    );


  const membership =
    await supabaseClient
      .from("membership_applications")
      .select("id", {
        count:"exact",
        head:true
      });


  const friendly =
    await supabaseClient
      .from("friendly_applications")
      .select("id", {
        count:"exact",
        head:true
      });


  const members =
    membership.count || 0;

  const friendlyCount =
    friendly.count || 0;


  if (memberElement) {
    memberElement.textContent =
      members;
  }


  if (applicationElement) {
    applicationElement.textContent =
      members + friendlyCount;
  }

}


/* =========================================================
   SIDEBAR
========================================================= */

function initSidebar() {

  const toggle =
    document.getElementById(
      "adminMenuToggle"
    );

  const sidebar =
    document.getElementById(
      "adminSidebar"
    );

  const overlay =
    document.getElementById(
      "adminSidebarOverlay"
    );


  if (!sidebar) return;


  function openSidebar() {

    sidebar.classList.add("open");

    if (overlay) {
      overlay.style.display = "block";
    }
  }


  function closeSidebar() {

    sidebar.classList.remove("open");

    if (overlay) {
      overlay.style.display = "none";
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

}


/* =========================================================
   APPLICATION BUTTON EVENTS
========================================================= */

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) return;


    const id =
      button.dataset.id;

    const action =
      button.dataset.action;


    if (!id) return;


    if (action === "approve-friendly") {

      await updateStatus(
        "friendly_applications",
        id,
        "approved",
        loadFriendlyApplications
      );

    }


    if (action === "reject-friendly") {

      await updateStatus(
        "friendly_applications",
        id,
        "rejected",
        loadFriendlyApplications
      );

    }


    if (action === "delete-friendly") {

      await deleteApplication(
        "friendly_applications",
        id,
        loadFriendlyApplications
      );

    }


    if (action === "approve-membership") {

      await updateStatus(
        "membership_applications",
        id,
        "approved",
        loadMembershipApplications
      );

    }


    if (action === "reject-membership") {

      await updateStatus(
        "membership_applications",
        id,
        "rejected",
        loadMembershipApplications
      );

    }


    if (action === "delete-membership") {

      await deleteApplication(
        "membership_applications",
        id,
        loadMembershipApplications
      );

    }

  }
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const loginForm =
      document.getElementById(
        "gsaAdminLoginForm"
      );


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        handleLogin
      );

      await checkExistingSession();

      return;
    }


    const session =
      await requireSession();


    if (!session) return;


    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        logoutAdmin
      );

    }


    initSidebar();

    await loadAdminUser();

    await loadDashboardStats();

    await loadFriendlyApplications();

    await loadMembershipApplications();

  }
);

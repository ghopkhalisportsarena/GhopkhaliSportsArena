"use strict";

/* =========================================================
   GSA ADMIN SYSTEM
   Ghopkhali Sports Arena
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
   AUTH
========================================================= */

async function requireAdmin() {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();

  if (!session || !session.user) {

    window.location.replace("admin.html");

    return null;
  }

  return session;
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

  await supabaseClient.auth.signOut();

  window.location.replace("admin.html");
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

  if (!date) return "—";

  try {

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  } catch {

    return date;
  }
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
        ascending: false
      });


  if (error) {

    console.error(error);

    container.innerHTML =
      `<div class="admin-error">
        Unable to load friendly match applications.
      </div>`;

    return;
  }


  if (!data || !data.length) {

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
      application.status || "pending";


    card.innerHTML = `

      <div class="application-card-header">

        <div>

          <span class="application-label">
            FRIENDLY MATCH
          </span>

          <h3>
            ${escapeHTML(
              application.team_name || "Unnamed Team"
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
            application.message || "No additional message."
          )}
        </p>

      </div>


      <div class="application-actions">

        <button
          class="admin-button success"
          onclick="updateFriendlyStatus(
            '${application.id}',
            'approved'
          )"
        >
          Approve
        </button>


        <button
          class="admin-button warning"
          onclick="updateFriendlyStatus(
            '${application.id}',
            'rejected'
          )"
        >
          Reject
        </button>


        <button
          class="admin-button danger"
          onclick="deleteFriendlyApplication(
            '${application.id}'
          )"
        >
          Delete
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   UPDATE FRIENDLY STATUS
========================================================= */

async function updateFriendlyStatus(
  id,
  status
) {

  const {
    error
  } =
    await supabaseClient
      .from("friendly_applications")
      .update({
        status: status
      })
      .eq("id", id);


  if (error) {

    console.error(error);

    alert(
      "Unable to update application."
    );

    return;
  }


  await loadFriendlyApplications();

  await loadDashboardStats();

}


/* =========================================================
   DELETE FRIENDLY APPLICATION
========================================================= */

async function deleteFriendlyApplication(id) {

  if (
    !confirm(
      "Delete this friendly match application?"
    )
  ) {

    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("friendly_applications")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    alert(
      "Unable to delete application."
    );

    return;
  }


  await loadFriendlyApplications();

  await loadDashboardStats();
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
        ascending: false
      });


  if (error) {

    console.error(error);

    container.innerHTML =
      `<div class="admin-error">
        Unable to load membership applications.
      </div>`;

    return;
  }


  if (!data || !data.length) {

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
      application.status || "pending";


    card.innerHTML = `

      <div class="application-card-header">

        <div>

          <span class="application-label">
            CLUB MEMBERSHIP
          </span>

          <h3>
            ${escapeHTML(
              application.full_name || "Unnamed Applicant"
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
          <small>Position / Skill</small>
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
          onclick="updateMembershipStatus(
            '${application.id}',
            'approved'
          )"
        >
          Approve
        </button>


        <button
          class="admin-button warning"
          onclick="updateMembershipStatus(
            '${application.id}',
            'rejected'
          )"
        >
          Reject
        </button>


        <button
          class="admin-button danger"
          onclick="deleteMembershipApplication(
            '${application.id}'
          )"
        >
          Delete
        </button>

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   UPDATE MEMBERSHIP STATUS
========================================================= */

async function updateMembershipStatus(
  id,
  status
) {

  const {
    error
  } =
    await supabaseClient
      .from("membership_applications")
      .update({
        status: status
      })
      .eq("id", id);


  if (error) {

    console.error(error);

    alert(
      "Unable to update application."
    );

    return;
  }


  await loadMembershipApplications();

  await loadDashboardStats();
}


/* =========================================================
   DELETE MEMBERSHIP APPLICATION
========================================================= */

async function deleteMembershipApplication(id) {

  if (
    !confirm(
      "Delete this membership application?"
    )
  ) {

    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("membership_applications")
      .delete()
      .eq("id", id);


  if (error) {

    console.error(error);

    alert(
      "Unable to delete application."
    );

    return;
  }


  await loadMembershipApplications();

  await loadDashboardStats();
}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

async function loadDashboardStats() {

  const noticeElement =
    document.getElementById(
      "totalNotices"
    );

  const fixtureElement =
    document.getElementById(
      "totalFixtures"
    );

  const memberElement =
    document.getElementById(
      "totalMembers"
    );

  const applicationElement =
    document.getElementById(
      "totalApplications"
    );


  /* MEMBERSHIP */

  const membership =
    await supabaseClient
      .from("membership_applications")
      .select("id", {
        count: "exact",
        head: true
      });


  /* FRIENDLY */

  const friendly =
    await supabaseClient
      .from("friendly_applications")
      .select("id", {
        count: "exact",
        head: true
      });


  if (memberElement) {

    memberElement.textContent =
      membership.count || 0;

  }


  if (applicationElement) {

    applicationElement.textContent =
      (friendly.count || 0) +
      (membership.count || 0);

  }


  /*
   * Notices / Fixtures are intentionally
   * left at zero until their real Supabase
   * table schema is connected.
   */

  if (noticeElement) {

    noticeElement.textContent = "—";

  }


  if (fixtureElement) {

    fixtureElement.textContent = "—";

  }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }


  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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


  if (!toggle || !sidebar) return;


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


  toggle.addEventListener(
    "click",
    openSidebar
  );


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeSidebar
    );

  }

}


/* =========================================================
   ACTIVE PAGE
========================================================= */

function setActivePage() {

  const page =
    document.body.dataset.page;

  if (!page) return;


  document
    .querySelectorAll(
      ".sidebar-link"
    )
    .forEach(link => {

      if (
        link.dataset.page === page
      ) {

        link.classList.add(
          "active"
        );

      }

    });

}


/* =========================================================
   CURRENT USER
========================================================= */

async function loadAdminUser() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth.getUser();


  if (!user) return;


  const nameElement =
    document.getElementById(
      "adminName"
    );

  const avatarElement =
    document.getElementById(
      "adminAvatar"
    );


  const name =
    user.user_metadata?.full_name ||
    user.email ||
    "Administrator";


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
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const session =
      await requireAdmin();

    if (!session) return;


    document
      .querySelectorAll(
        "#logoutButton"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          logoutAdmin
        );

      });


    initSidebar();

    setActivePage();

    loadAdminUser();

    loadDashboardStats();

    loadFriendlyApplications();

    loadMembershipApplications();

    console.log(
      "GSA Admin System initialized."
    );

  }
);
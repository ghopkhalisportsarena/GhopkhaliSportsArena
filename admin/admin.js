/* =========================================================
   GHOPKHALI SPORTS ARENA
   ADMIN PANEL - SUPABASE
========================================================= */

const SUPABASE_URL = "https://cmygmswzokyrmgdnuszq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   DOM
========================================================= */

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");

const logoutButton = document.getElementById("logoutButton");

const noticesList = document.getElementById("noticesList");
const totalNotices = document.getElementById("totalNotices");

const adminModal = document.getElementById("adminModal");
const adminModalContent = document.getElementById("adminModalContent");
const adminModalClose = document.getElementById("adminModalClose");

const toastContainer = document.getElementById("toastContainer");

const currentDate = document.getElementById("currentDate");
const adminName = document.getElementById("adminName");
const adminAvatar = document.getElementById("adminAvatar");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  setCurrentYear();
  setCurrentDate();

  setupNavigation();
  setupModal();
  setupQuickActions();

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showAdminPanel(session);
  } else {
    showLoginScreen();
  }

});


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  loginError.textContent = "";

  const email = adminEmail.value.trim();
  const password = adminPassword.value;

  if (!email || !password) {
    loginError.textContent = "Please enter email and password.";
    return;
  }

  const submitButton =
    loginForm.querySelector("button[type='submit']");

  if (submitButton) {
    submitButton.disabled = true;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (submitButton) {
    submitButton.disabled = false;
  }

  if (error) {

    console.error(error);

    loginError.textContent =
      error.message || "Login failed.";

    return;
  }

  await showAdminPanel(data.session);

});


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_IN" && session) {
      await showAdminPanel(session);
    }

    if (event === "SIGNED_OUT") {
      showLoginScreen();
    }

  }
);


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLoginScreen() {

  if (loginScreen) {
    loginScreen.style.display = "flex";
  }

  if (adminApp) {
    adminApp.style.display = "none";
  }

}


/* =========================================================
   SHOW ADMIN
========================================================= */

async function showAdminPanel(session) {

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (adminApp) {
    adminApp.style.display = "flex";
  }

  const email =
    session?.user?.email || "Administrator";

  if (adminName) {
    adminName.textContent = email;
  }

  if (adminAvatar) {
    adminAvatar.textContent =
      email.charAt(0).toUpperCase();
  }

  await loadDashboard();

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton?.addEventListener("click", async () => {

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showToast("Unable to sign out.", "error");
    return;
  }

  showLoginScreen();

});


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  await loadNotices();

}


/* =========================================================
   LOAD NOTICES
========================================================= */

async function loadNotices() {

  if (!noticesList) return;

  noticesList.innerHTML = `
    <div class="empty-state">
      <span>◌</span>
      <p>Loading notices...</p>
    </div>
  `;

  const {
    data,
    error
  } = await supabaseClient
    .from("notices")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error("Notice loading error:", error);

    noticesList.innerHTML = `
      <div class="empty-state">
        <span>!</span>
        <h4>Unable to load notices</h4>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;

    return;
  }

  if (totalNotices) {
    totalNotices.textContent = data?.length || 0;
  }

  renderNotices(data || []);

}


/* =========================================================
   RENDER NOTICES
========================================================= */

function renderNotices(notices) {

  if (!noticesList) return;

  if (!notices.length) {

    noticesList.innerHTML = `
      <div class="empty-state">
        <span>◌</span>
        <h4>No notices yet</h4>
        <p>Create your first GSA announcement.</p>
      </div>
    `;

    return;
  }

  noticesList.innerHTML =
    notices.map(notice => {

      const date =
        formatDate(notice.created_at);

      const status =
        notice.published
          ? "PUBLISHED"
          : "DRAFT";

      return `

        <article class="admin-list-item">

          <div class="admin-list-main">

            <div class="admin-list-meta">

              <span>
                ${escapeHTML(
                  notice.category || "GENERAL"
                )}
              </span>

              <span>
                ${date}
              </span>

              <span>
                ${status}
              </span>

            </div>

            <h3>
              ${escapeHTML(
                notice.title || "Untitled Notice"
              )}
            </h3>

            <p>
              ${escapeHTML(
                notice.content || ""
              )}
            </p>

          </div>


          <div class="admin-list-actions">

            <button
              class="admin-button admin-button-outline"
              data-edit-notice="${notice.id}"
            >
              Edit
            </button>

            <button
              class="admin-button admin-button-danger"
              data-delete-notice="${notice.id}"
            >
              Delete
            </button>

          </div>

        </article>

      `;

    }).join("");


  document
    .querySelectorAll("[data-edit-notice]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id =
          button.dataset.editNotice;

        openNoticeModal(id);

      });

    });


  document
    .querySelectorAll("[data-delete-notice]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id =
          button.dataset.deleteNotice;

        deleteNotice(id);

      });

    });

}


/* =========================================================
   CREATE NOTICE
========================================================= */

async function createNotice(form) {

  const formData =
    new FormData(form);

  const title =
    formData.get("title")?.trim();

  const content =
    formData.get("content")?.trim();

  const category =
    formData.get("category")?.trim() ||
    "GENERAL";

  const published =
    formData.get("published") === "on";


  if (!title || !content) {

    showToast(
      "Title and content are required.",
      "error"
    );

    return;

  }


  const { error } =
    await supabaseClient
      .from("notices")
      .insert({

        title,
        content,
        category,
        published,
        image_url: null

      });


  if (error) {

    console.error(error);

    showToast(
      error.message,
      "error"
    );

    return;

  }


  closeModal();

  showToast(
    "Notice created successfully.",
    "success"
  );

  await loadNotices();

}


/* =========================================================
   OPEN NOTICE MODAL
========================================================= */

async function openNoticeModal(id = null) {

  let notice = null;


  if (id) {

    const {
      data,
      error
    } = await supabaseClient
      .from("notices")
      .select("*")
      .eq("id", id)
      .single();


    if (error) {

      console.error(error);

      showToast(
        "Unable to load notice.",
        "error"
      );

      return;

    }

    notice = data;

  }


  adminModalContent.innerHTML = `

    <div class="admin-form">

      <span class="page-label">
        ${id ? "EDIT NOTICE" : "NEW NOTICE"}
      </span>

      <h2>
        ${id ? "Edit" : "Create"}
        <span>Notice.</span>
      </h2>


      <form id="noticeForm">

        <div class="input-group">

          <label>
            TITLE
          </label>

          <input
            type="text"
            name="title"
            value="${escapeAttribute(
              notice?.title || ""
            )}"
            placeholder="Notice title"
            required
          >

        </div>


        <div class="input-group">

          <label>
            CATEGORY
          </label>

          <select name="category">

            <option value="GENERAL"
              ${notice?.category === "GENERAL"
                ? "selected"
                : ""}>
              General
            </option>

            <option value="NOTICE"
              ${notice?.category === "NOTICE"
                ? "selected"
                : ""}>
              Notice
            </option>

            <option value="ANNOUNCEMENT"
              ${notice?.category === "ANNOUNCEMENT"
                ? "selected"
                : ""}>
              Announcement
            </option>

            <option value="SPORTS"
              ${notice?.category === "SPORTS"
                ? "selected"
                : ""}>
              Sports
            </option>

            <option value="EVENT"
              ${notice?.category === "EVENT"
                ? "selected"
                : ""}>
              Event
            </option>

          </select>

        </div>


        <div class="input-group">

          <label>
            CONTENT
          </label>

          <textarea
            name="content"
            rows="8"
            placeholder="Write your notice..."
            required
          >${escapeHTML(
            notice?.content || ""
          )}</textarea>

        </div>


        <div class="input-group">

          <label class="checkbox-label">

            <input
              type="checkbox"
              name="published"
              ${notice?.published !== false
                ? "checked"
                : ""}
            >

            Publish this notice

          </label>

        </div>


        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          ${id ? "Update Notice" : "Publish Notice"} ↗
        </button>

      </form>

    </div>

  `;


  const form =
    document.getElementById("noticeForm");


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!id) {

        await createNotice(form);

        return;

      }


      const formData =
        new FormData(form);

      const updates = {

        title:
          formData.get("title")?.trim(),

        content:
          formData.get("content")?.trim(),

        category:
          formData.get("category") ||
          "GENERAL",

        published:
          formData.get("published") === "on",

        updated_at:
          new Date().toISOString()

      };


      const {
        error
      } = await supabaseClient
        .from("notices")
        .update(updates)
        .eq("id", id);


      if (error) {

        console.error(error);

        showToast(
          error.message,
          "error"
        );

        return;

      }


      closeModal();

      showToast(
        "Notice updated successfully.",
        "success"
      );

      await loadNotices();

    }
  );


  openModal();

}


/* =========================================================
   DELETE NOTICE
========================================================= */

async function deleteNotice(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this notice?"
    );

  if (!confirmed) return;


  const {
    error
  } = await supabaseClient
    .from("notices")
    .delete()
    .eq("id", id);


  if (error) {

    console.error(error);

    showToast(
      error.message,
      "error"
    );

    return;

  }


  showToast(
    "Notice deleted successfully.",
    "success"
  );

  await loadNotices();

}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {

  document
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset.action;

          if (action === "add-notice") {
            openNoticeModal();
          }

        }
      );

    });


  document
    .querySelectorAll("[data-page-link]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.pageLink;

          activatePage(page);

        }
      );

    });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(".sidebar-link[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          activatePage(
            button.dataset.page
          );

        }
      );

    });


  document
    .getElementById("refreshButton")
    ?.addEventListener(
      "click",
      async () => {

        await loadDashboard();

        showToast(
          "Data refreshed.",
          "success"
        );

      }
    );

}


function activatePage(page) {

  document
    .querySelectorAll(".sidebar-link[data-page]")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.page === page
      );

    });


  document
    .querySelectorAll(".admin-page")
    .forEach(section => {

      section.classList.remove("active");

    });


  const pageElement =
    document.getElementById(
      `${page.replace(/-([a-z])/g, (_, c) =>
        c.toUpperCase()
      )}Page`
    );


  if (pageElement) {
    pageElement.classList.add("active");
  }


  if (page === "notices") {
    loadNotices();
  }


  const title =
    document.getElementById("pageTitle");

  if (title) {

    const titles = {

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

    title.textContent =
      titles[page] || "Dashboard";

  }

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

  adminModalClose?.addEventListener(
    "click",
    closeModal
  );


  adminModal?.addEventListener(
    "click",
    event => {

      if (
        event.target === adminModal
      ) {
        closeModal();
      }

    }
  );

}


function openModal() {

  if (!adminModal) return;

  adminModal.classList.add("active");

  adminModal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeModal() {

  if (!adminModal) return;

  adminModal.classList.remove("active");

  adminModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "success"
) {

  if (!toastContainer) return;

  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;

  toast.textContent = message;

  toastContainer.appendChild(toast);


  setTimeout(() => {

    toast.remove();

  }, 3500);

}


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

  if (!currentDate) return;

  const date =
    new Date();

  currentDate.textContent =
    date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

}


function setCurrentYear() {

  document
    .querySelectorAll(
      "[data-current-year]"
    )
    .forEach(element => {

      element.textContent =
        new Date().getFullYear();

    });

}


/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  return new Date(
    dateString
  ).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function escapeHTML(value) {

  if (value === null ||
      value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}

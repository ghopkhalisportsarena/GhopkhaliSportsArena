/* =========================================================
   GHOPKHALI SPORTS ARENA
   ADMIN PANEL JAVASCRIPT
   FULL REPLACE VERSION
   Supabase Powered
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  window.SUPABASE_URL ||
  "YOUR_SUPABASE_URL";

const SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY ||
  "YOUR_SUPABASE_ANON_KEY";


let supabaseClient = null;


/* =========================================================
   DATABASE TABLE CONFIGURATION
========================================================= */

const TABLES = {

  notices: "posts",

  gallery: "gallery",

  tournaments: "tournaments",

  fixtures: "fixtures",

  leadership: "leadership",

  committee: "committee",

  friendlyApplications: "friendly_applications",

  membershipApplications: "membership_applications"

};


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentUser = null;

let currentPage = "dashboard";

let editingItem = null;

let postsCache = [];

let galleryCache = [];

let tournamentsCache = [];

let fixturesCache = [];

let leadershipCache = [];

let committeeCache = [];

let friendlyApplicationsCache = [];

let membershipApplicationsCache = [];


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   SUPABASE INITIALIZATION
========================================================= */

function initSupabase() {

  if (
    SUPABASE_URL === "YOUR_SUPABASE_URL" ||
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
  ) {

    console.error(
      "Supabase URL / Anon Key is missing."
    );

    showToast(
      "Supabase configuration is missing.",
      "error"
    );

    return false;

  }


  if (
    typeof window.supabase === "undefined"
  ) {

    console.error(
      "Supabase JavaScript library is not loaded."
    );

    showToast(
      "Supabase library is not loaded.",
      "error"
    );

    return false;

  }


  try {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

    return true;

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    showToast(
      "Could not initialize Supabase.",
      "error"
    );

    return false;

  }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
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


  const toast =
    document.createElement("div");


  toast.className =
    `admin-toast ${type}`;


  toast.innerHTML = `
    <span class="toast-icon">
      ${
        type === "success"
          ? "✓"
          : type === "error"
          ? "!"
          : "i"
      }
    </span>

    <span class="toast-message">
      ${escapeHTML(message)}
    </span>

    <button
      type="button"
      class="toast-close"
      aria-label="Close"
    >
      ×
    </button>
  `;


  container.appendChild(toast);


  requestAnimationFrame(() => {

    toast.classList.add("show");

  });


  const close =
    () => {

      toast.classList.remove("show");

      setTimeout(() => {

        toast.remove();

      }, 250);

    };


  toast
    .querySelector(".toast-close")
    ?.addEventListener(
      "click",
      close
    );


  setTimeout(
    close,
    3500
  );

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(
  button,
  loading,
  text = "Processing..."
) {

  if (!button)
    return;


  if (loading) {

    if (
      !button.dataset.originalHTML
    ) {

      button.dataset.originalHTML =
        button.innerHTML;

    }


    button.disabled = true;

    button.innerHTML =
      `
      <span class="admin-spinner"></span>
      ${escapeHTML(text)}
      `;

  } else {

    button.disabled = false;

    if (
      button.dataset.originalHTML
    ) {

      button.innerHTML =
        button.dataset.originalHTML;

      delete button.dataset.originalHTML;

    }

  }

}


/* =========================================================
   AUTH
========================================================= */

async function checkAuth() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error)
      throw error;


    currentUser =
      data?.session?.user || null;


    updateAuthUI();


    if (currentUser) {

      await loadDashboard();

    }

  } catch (error) {

    console.error(
      "Auth check error:",
      error
    );

    showToast(
      error.message ||
      "Authentication check failed.",
      "error"
    );

  }

}


/* =========================================================
   AUTH LISTENER
========================================================= */

function setupAuthListener() {

  if (!supabaseClient)
    return;


  supabaseClient.auth.onAuthStateChange(
    (
      event,
      session
    ) => {

      currentUser =
        session?.user || null;


      updateAuthUI();


      if (
        event === "SIGNED_IN" &&
        currentUser
      ) {

        setTimeout(
          () => loadDashboard(),
          0
        );

      }

    }
  );

}


/* =========================================================
   AUTH UI
========================================================= */

function updateAuthUI() {

  const loginScreen =
    $("#loginScreen");


  const adminApp =
    $("#adminApp");


  const adminName =
    $("#adminName");


  const adminAvatar =
    $("#adminAvatar");


  if (currentUser) {

    if (loginScreen)
      loginScreen.style.display =
        "none";


    if (adminApp)
      adminApp.style.display =
        "flex";


    const email =
      currentUser.email ||
      "Administrator";


    if (adminName)
      adminName.textContent =
        email.split("@")[0];


    if (adminAvatar)
      adminAvatar.textContent =
        email
          .charAt(0)
          .toUpperCase();

  } else {

    if (loginScreen)
      loginScreen.style.display =
        "flex";


    if (adminApp)
      adminApp.style.display =
        "none";

  }

}


/* =========================================================
   LOGIN
========================================================= */

async function loginAdmin(
  email,
  password,
  button = null
) {

  if (!supabaseClient)
    return;


  email =
    String(email || "").trim();


  password =
    String(password || "");


  if (!email || !password) {

    showToast(
      "Email and password are required.",
      "error"
    );

    return;

  }


  setLoading(
    button,
    true,
    "Signing in..."
  );


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


    if (error)
      throw error;


    currentUser =
      data?.user || null;


    updateAuthUI();


    showToast(
      "Login successful.",
      "success"
    );


    await loadDashboard();

  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    const loginError =
      $("#loginError");


    if (loginError) {

      loginError.textContent =
        error.message ||
        "Login failed.";

    }


    showToast(
      error.message ||
      "Login failed.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


/* =========================================================
   LOGIN FORM
========================================================= */

function setupLoginForm() {

  const form =
    $("#loginForm");


  if (!form)
    return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        $("#adminEmail")?.value.trim();


      const password =
        $("#adminPassword")?.value;


      const button =
        form.querySelector(
          "button[type='submit']"
        );


      await loginAdmin(
        email,
        password,
        button
      );

    }
  );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

  if (!supabaseClient)
    return;


  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error)
      throw error;


    currentUser = null;

    updateAuthUI();


    showToast(
      "Signed out successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    showToast(
      error.message ||
      "Logout failed.",
      "error"
    );

  }

}


/* =========================================================
   LOGOUT BUTTON
========================================================= */

function setupLogout() {

  $("#logoutButton")
    ?.addEventListener(
      "click",
      logoutAdmin
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

  if (!currentUser)
    return;


  updateCurrentDate();


  await Promise.allSettled([

    loadPosts(),

    loadGallery(),

    loadTournaments(),

    loadFixtures(),

    loadLeadership(),

    loadCommittee(),

    loadFriendlyApplications(),

    loadMembershipApplications()

  ]);


  updateDashboardStats();

  renderRecentActivity();

  renderApplicationsPreview();

}


/* =========================================================
   CURRENT DATE
========================================================= */

function updateCurrentDate() {

  const element =
    $("#currentDate");


  if (!element)
    return;


  const date =
    new Date();


  element.textContent =
    date.toLocaleDateString(
      "en-BD",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const PAGE_META = {

  dashboard: {
    title: "Dashboard",
    kicker: "ADMINISTRATION"
  },

  notices: {
    title: "Notices",
    kicker: "CONTENT MANAGEMENT"
  },

  gallery: {
    title: "Gallery",
    kicker: "MEDIA MANAGEMENT"
  },

  tournaments: {
    title: "Tournaments",
    kicker: "SPORTS MANAGEMENT"
  },

  fixtures: {
    title: "Matches & Fixtures",
    kicker: "MATCH MANAGEMENT"
  },

  leadership: {
    title: "Leadership",
    kicker: "CLUB LEADERSHIP"
  },

  committee: {
    title: "Committee",
    kicker: "CLUB MANAGEMENT"
  },

  "friendly-applications": {
    title: "Friendly Match Applications",
    kicker: "APPLICATION CENTER"
  },

  "membership-applications": {
    title: "Membership Applications",
    kicker: "APPLICATION CENTER"
  }

};


function navigateToPage(
  page
) {

  if (!page)
    return;


  currentPage =
    page;


  $$(".sidebar-link")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.page === page
      );

    });


  $$(".admin-page")
    .forEach(section => {

      const sectionId =
        section.id;


      const expected =
        `${page}Page`;


      section.classList.toggle(
        "active",
        sectionId === expected
      );

      section.style.display =
        sectionId === expected
          ? ""
          : "none";

    });


  const meta =
    PAGE_META[page];


  if (meta) {

    setText(
      "#pageTitle",
      meta.title
    );


    setText(
      "#pageKicker",
      meta.kicker
    );

  }


  const sidebar =
    $("#adminSidebar");


  if (sidebar)
    sidebar.classList.remove(
      "open"
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

  $$(".sidebar-link[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          navigateToPage(
            button.dataset.page
          );

        }
      );

    });


  $$("[data-page-link]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          navigateToPage(
            button.dataset.pageLink
          );

        }
      );

    });

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupMobileSidebar() {

  const toggle =
    $("#sidebarToggle");


  const sidebar =
    $("#adminSidebar");


  if (!toggle || !sidebar)
    return;


  toggle.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      sidebar.classList.toggle(
        "open"
      );

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        window.innerWidth <= 900 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !toggle.contains(event.target)
      ) {

        sidebar.classList.remove(
          "open"
        );

      }

    }
  );

}


/* =========================================================
   UNIVERSAL ACTION HANDLER
========================================================= */

function setupActions() {

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button)
        return;


      const action =
        button.dataset.action;


      switch(action) {

        case "add-notice":
          openNoticeModal();
          break;


        case "add-gallery":
          openGalleryModal();
          break;


        case "add-tournament":
          openTournamentModal();
          break;


        case "add-fixture":
          openFixtureModal();
          break;


        case "add-leader":
          openLeadershipModal();
          break;


        case "add-committee":
          openCommitteeModal();
          break;

      }

    }
  );

}


/* =========================================================
   MODAL
========================================================= */

function openModal(
  content
) {

  const modal =
    $("#adminModal");


  const modalContent =
    $("#adminModalContent");


  if (!modal || !modalContent)
    return;


  modalContent.innerHTML =
    content;


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );

}


function closeModal() {

  const modal =
    $("#adminModal");


  if (!modal)
    return;


  modal.classList.remove(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );


  editingItem = null;

}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupModal() {

  $("#adminModalClose")
    ?.addEventListener(
      "click",
      closeModal
    );


  $("#adminModal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          event.currentTarget
        ) {

          closeModal();

        }

      }
    );


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

}


/* =========================================================
   NOTICES
========================================================= */

async function loadPosts() {

  if (!supabaseClient)
    return;


  const {
    data,
    error
  } =
    await supabaseClient
      .from(TABLES.notices)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Notice loading error:",
      error
    );

    renderNoticeList([]);

    return;

  }


  postsCache =
    data || [];


  renderNoticeList(
    postsCache
  );

}


function renderNoticeList(
  posts
) {

  const container =
    $("#noticesList");


  if (!container)
    return;


  if (!posts.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>◉</span>

        <h4>No notices available</h4>

        <p>
          Create your first announcement.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    posts.map(post => {

      const id =
        escapeAttribute(
          post.id
        );


      const title =
        escapeHTML(
          post.title ||
          "Untitled Notice"
        );


      const category =
        escapeHTML(
          post.category ||
          "General"
        );


      const status =
        post.status ||
        "draft";


      return `
        <article class="admin-list-item">

          <div class="admin-list-main">

            <span class="status-badge ${escapeAttribute(status)}">
              ${escapeHTML(status)}
            </span>

            <h3>
              ${title}
            </h3>

            <p>
              ${category}
              ·
              ${formatDate(post.created_at)}
            </p>

          </div>


          <div class="admin-list-actions">

            <button
              type="button"
              class="admin-action edit"
              data-edit-notice="${id}"
            >
              Edit
            </button>

            <button
              type="button"
              class="admin-action delete"
              data-delete-notice="${id}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-edit-notice]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const post =
            postsCache.find(
              item =>
                String(item.id) ===
                String(
                  button.dataset.editNotice
                )
            );


          if (post)
            openNoticeModal(post);

        }
      );

    });


  $$("[data-delete-notice]")
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
   NOTICE MODAL
========================================================= */

function openNoticeModal(
  post = null
) {

  editingItem =
    post;


  openModal(`
    <div class="modal-header">

      <span class="page-label">
        CONTENT MANAGEMENT
      </span>

      <h2>
        ${
          post
            ? "Edit Notice"
            : "Create Notice"
        }
      </h2>

    </div>


    <form
      id="noticeForm"
      class="admin-form"
    >

      <div class="form-group">

        <label>
          TITLE
        </label>

        <input
          name="title"
          type="text"
          required
          maxlength="180"
          value="${escapeAttribute(post?.title || "")}"
          placeholder="Notice title"
        >

      </div>


      <div class="form-row">

        <div class="form-group">

          <label>
            CATEGORY
          </label>

          <input
            name="category"
            type="text"
            value="${escapeAttribute(post?.category || "General")}"
            placeholder="General"
          >

        </div>


        <div class="form-group">

          <label>
            STATUS
          </label>

          <select name="status">

            <option
              value="draft"
              ${post?.status === "draft" ? "selected" : ""}
            >
              Draft
            </option>

            <option
              value="published"
              ${post?.status === "published" ? "selected" : ""}
            >
              Published
            </option>

          </select>

        </div>

      </div>


      <div class="form-group">

        <label>
          SHORT DESCRIPTION
        </label>

        <textarea
          name="excerpt"
          rows="3"
          maxlength="500"
          placeholder="Short description"
        >${escapeHTML(post?.excerpt || "")}</textarea>

      </div>


      <div class="form-group">

        <label>
          CONTENT
        </label>

        <textarea
          name="content"
          rows="8"
          placeholder="Write notice content..."
        >${escapeHTML(post?.content || "")}</textarea>

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          ${
            post
              ? "Update Notice"
              : "Create Notice"
          }
        </button>

      </div>

    </form>
  `);


  $("#noticeForm")
    ?.addEventListener(
      "submit",
      saveNotice
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });

}


async function saveNotice(
  event
) {

  event.preventDefault();


  if (!currentUser)
    return;


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  const formData =
    new FormData(form);


  const payload = {

    title:
      String(
        formData.get("title") || ""
      ).trim(),

    category:
      String(
        formData.get("category") ||
        "General"
      ).trim(),

    excerpt:
      String(
        formData.get("excerpt") || ""
      ).trim(),

    content:
      String(
        formData.get("content") || ""
      ).trim(),

    status:
      formData.get("status") ||
      "draft",

    updated_at:
      new Date().toISOString()

  };


  if (!payload.title) {

    showToast(
      "Notice title is required.",
      "error"
    );

    return;

  }


  setLoading(
    button,
    true,
    editingItem
      ? "Updating..."
      : "Creating..."
  );


  try {

    let result;


    if (editingItem?.id) {

      result =
        await supabaseClient
          .from(TABLES.notices)
          .update(payload)
          .eq(
            "id",
            editingItem.id
          );

    } else {

      payload.author_id =
        currentUser.id;


      payload.created_at =
        new Date().toISOString();


      result =
        await supabaseClient
          .from(TABLES.notices)
          .insert(
            payload
          );

    }


    if (result.error)
      throw result.error;


    closeModal();


    showToast(
      editingItem
        ? "Notice updated successfully."
        : "Notice created successfully.",
      "success"
    );


    await loadPosts();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save notice.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteNotice(
  id
) {

  if (
    !confirm(
      "Are you sure you want to delete this notice?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(TABLES.notices)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Notice deleted.",
      "success"
    );


    await loadPosts();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not delete notice.",
      "error"
    );

  }

}


/* =========================================================
   GALLERY
========================================================= */

async function loadGallery() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(TABLES.gallery)
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    galleryCache =
      data || [];


    renderGallery(
      galleryCache
    );

  } catch (error) {

    console.error(
      "Gallery loading error:",
      error
    );


    renderGallery([]);

  }

}


function renderGallery(
  gallery
) {

  const container =
    $("#galleryAdminGrid");


  if (!container)
    return;


  if (!gallery.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>▧</span>

        <h4>Gallery is empty</h4>

        <p>
          Upload photos from club activities.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    gallery.map(item => {

      const image =
        item.image_url ||
        item.url ||
        item.image ||
        "";


      return `
        <article class="admin-gallery-item">

          <img
            src="${escapeAttribute(image)}"
            alt="${escapeAttribute(item.title || "GSA Gallery")}"
            loading="lazy"
          >


          <div class="admin-gallery-overlay">

            <strong>
              ${escapeHTML(item.title || "Gallery Image")}
            </strong>

            <button
              type="button"
              data-delete-gallery="${escapeAttribute(item.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-delete-gallery]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteGallery(
            button.dataset.deleteGallery
          );

        }
      );

    });

}


/* =========================================================
   GALLERY MODAL
========================================================= */

function openGalleryModal() {

  openModal(`

    <div class="modal-header">

      <span class="page-label">
        MEDIA MANAGEMENT
      </span>

      <h2>
        Add Gallery Photo
      </h2>

    </div>


    <form
      id="galleryForm"
      class="admin-form"
    >

      <div class="form-group">

        <label>
          PHOTO TITLE
        </label>

        <input
          type="text"
          name="title"
          placeholder="Photo title"
        >

      </div>


      <div class="form-group">

        <label>
          IMAGE
        </label>

        <input
          type="file"
          name="image"
          accept="image/*"
          required
        >

      </div>


      <div class="image-preview-box">

        <img
          id="galleryPreview"
          alt="Preview"
          style="display:none;"
        >

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          Upload Photo
        </button>

      </div>

    </form>

  `);


  $("#galleryForm")
    ?.addEventListener(
      "submit",
      saveGallery
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });


  const input =
    $("#galleryForm input[type='file']");


  input?.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];


      const preview =
        $("#galleryPreview");


      if (
        file &&
        preview
      ) {

        preview.src =
          URL.createObjectURL(file);

        preview.style.display =
          "block";

      }

    }
  );

}


async function saveGallery(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const file =
    form.querySelector(
      "input[type='file']"
    )?.files?.[0];


  const title =
    form.querySelector(
      "[name='title']"
    )?.value.trim();


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  if (!file) {

    showToast(
      "Please select an image.",
      "error"
    );

    return;

  }


  if (
    !file.type.startsWith("image/")
  ) {

    showToast(
      "Only image files are allowed.",
      "error"
    );

    return;

  }


  if (
    file.size >
    10 * 1024 * 1024
  ) {

    showToast(
      "Image must be smaller than 10MB.",
      "error"
    );

    return;

  }


  setLoading(
    button,
    true,
    "Uploading..."
  );


  try {

    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();


    const unique =
      typeof crypto !== "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random()
            .toString(36)
            .slice(2);


    const path =
      `gallery/${Date.now()}-${unique}.${extension}`;


    const {
      error: uploadError
    } =
      await supabaseClient
        .storage
        .from("gallery")
        .upload(
          path,
          file,
          {
            cacheControl: "3600",
            upsert: false
          }
        );


    if (uploadError)
      throw uploadError;


    const {
      data
    } =
      supabaseClient
        .storage
        .from("gallery")
        .getPublicUrl(
          path
        );


    const imageUrl =
      data?.publicUrl;


    if (!imageUrl)
      throw new Error(
        "Could not generate image URL."
      );


    const {
      error: dbError
    } =
      await supabaseClient
        .from(TABLES.gallery)
        .insert({

          title:
            title ||
            file.name,

          image_url:
            imageUrl,

          storage_path:
            path,

          created_at:
            new Date().toISOString(),

          uploaded_by:
            currentUser.id

        });


    if (dbError)
      throw dbError;


    closeModal();


    showToast(
      "Photo uploaded successfully.",
      "success"
    );


    await loadGallery();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Photo upload failed.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteGallery(
  id
) {

  if (
    !confirm(
      "Delete this gallery image?"
    )
  )
    return;


  const item =
    galleryCache.find(
      image =>
        String(image.id) ===
        String(id)
    );


  try {

    if (item?.storage_path) {

      const {
        error
      } =
        await supabaseClient
          .storage
          .from("gallery")
          .remove([
            item.storage_path
          ]);


      if (error)
        console.warn(
          "Storage deletion warning:",
          error
        );

    }


    const {
      error
    } =
      await supabaseClient
        .from(TABLES.gallery)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Gallery image deleted.",
      "success"
    );


    await loadGallery();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not delete image.",
      "error"
    );

  }

}


/* =========================================================
   TOURNAMENTS
========================================================= */

async function loadTournaments() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(TABLES.tournaments)
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    tournamentsCache =
      data || [];


    renderTournaments(
      tournamentsCache
    );

  } catch (error) {

    console.error(
      "Tournament loading error:",
      error
    );


    renderTournaments([]);

  }

}


function renderTournaments(
  tournaments
) {

  const container =
    $("#tournamentsList");


  if (!container)
    return;


  if (!tournaments.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>🏆</span>

        <h4>No tournaments</h4>

        <p>
          Create your first tournament.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    tournaments.map(item => {

      return `
        <article class="admin-card">

          <div class="admin-card-icon">
            🏆
          </div>

          <div class="admin-card-content">

            <h3>
              ${escapeHTML(
                item.name ||
                item.title ||
                "Tournament"
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.location ||
                item.venue ||
                ""
              )}
            </p>

            <small>
              ${formatDate(
                item.date ||
                item.start_date ||
                item.created_at
              )}
            </small>

          </div>

          <div class="admin-card-actions">

            <button
              type="button"
              data-edit-tournament="${escapeAttribute(item.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              data-delete-tournament="${escapeAttribute(item.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-edit-tournament]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            tournamentsCache.find(
              x =>
                String(x.id) ===
                String(
                  button.dataset.editTournament
                )
            );


          if (item)
            openTournamentModal(item);

        }
      );

    });


  $$("[data-delete-tournament]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteTournament(
            button.dataset.deleteTournament
          );

        }
      );

    });

}


function openTournamentModal(
  item = null
) {

  editingItem =
    item;


  openModal(`

    <div class="modal-header">

      <span class="page-label">
        SPORTS MANAGEMENT
      </span>

      <h2>
        ${
          item
            ? "Edit Tournament"
            : "Add Tournament"
        }
      </h2>

    </div>


    <form
      id="tournamentForm"
      class="admin-form"
    >

      <div class="form-group">

        <label>
          TOURNAMENT NAME
        </label>

        <input
          name="name"
          required
          value="${escapeAttribute(
            item?.name ||
            item?.title ||
            ""
          )}"
          placeholder="Tournament name"
        >

      </div>


      <div class="form-row">

        <div class="form-group">

          <label>
            DATE
          </label>

          <input
            type="date"
            name="date"
            value="${escapeAttribute(
              normalizeDateInput(
                item?.date ||
                item?.start_date
              )
            )}"
          >

        </div>


        <div class="form-group">

          <label>
            VENUE
          </label>

          <input
            name="venue"
            value="${escapeAttribute(
              item?.venue ||
              item?.location ||
              ""
            )}"
            placeholder="Venue"
          >

        </div>

      </div>


      <div class="form-group">

        <label>
          DESCRIPTION
        </label>

        <textarea
          name="description"
          rows="5"
          placeholder="Tournament details"
        >${escapeHTML(
          item?.description ||
          ""
        )}</textarea>

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          ${
            item
              ? "Update Tournament"
              : "Create Tournament"
          }
        </button>

      </div>

    </form>

  `);


  $("#tournamentForm")
    ?.addEventListener(
      "submit",
      saveTournament
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });

}


async function saveTournament(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  const formData =
    new FormData(form);


  const payload = {

    name:
      String(
        formData.get("name") || ""
      ).trim(),

    date:
      formData.get("date") ||
      null,

    venue:
      String(
        formData.get("venue") || ""
      ).trim(),

    description:
      String(
        formData.get("description") || ""
      ).trim(),

    updated_at:
      new Date().toISOString()

  };


  if (!payload.name) {

    showToast(
      "Tournament name is required.",
      "error"
    );

    return;

  }


  setLoading(
    button,
    true,
    "Saving..."
  );


  try {

    let result;


    if (editingItem?.id) {

      result =
        await supabaseClient
          .from(TABLES.tournaments)
          .update(payload)
          .eq(
            "id",
            editingItem.id
          );

    } else {

      payload.created_at =
        new Date().toISOString();


      payload.created_by =
        currentUser?.id || null;


      result =
        await supabaseClient
          .from(TABLES.tournaments)
          .insert(
            payload
          );

    }


    if (result.error)
      throw result.error;


    closeModal();


    showToast(
      "Tournament saved successfully.",
      "success"
    );


    await loadTournaments();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save tournament.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteTournament(
  id
) {

  if (
    !confirm(
      "Delete this tournament?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(TABLES.tournaments)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Tournament deleted.",
      "success"
    );


    await loadTournaments();

    updateDashboardStats();

  } catch (error) {

    showToast(
      error.message ||
      "Could not delete tournament.",
      "error"
    );

  }

}


/* =========================================================
   FIXTURES
========================================================= */

async function loadFixtures() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(TABLES.fixtures)
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    fixturesCache =
      data || [];


    renderFixtures(
      fixturesCache
    );

  } catch (error) {

    console.error(
      "Fixtures loading error:",
      error
    );


    renderFixtures([]);

  }

}


function renderFixtures(
  fixtures
) {

  const container =
    $("#fixturesList");


  if (!container)
    return;


  if (!fixtures.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>⚽</span>

        <h4>No matches available</h4>

        <p>
          Add an upcoming match or fixture.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    fixtures.map(item => {

      const home =
        item.home_team ||
        item.home ||
        item.team_a ||
        "Team A";


      const away =
        item.away_team ||
        item.away ||
        item.team_b ||
        "Team B";


      return `
        <article class="admin-list-item">

          <div class="admin-list-main">

            <span class="fixture-date">
              ${formatDate(
                item.date ||
                item.match_date ||
                item.created_at
              )}
            </span>

            <h3>
              ${escapeHTML(home)}
              <span>vs</span>
              ${escapeHTML(away)}
            </h3>

            <p>
              ${escapeHTML(
                item.venue ||
                item.location ||
                ""
              )}
            </p>

          </div>


          <div class="admin-list-actions">

            <button
              type="button"
              data-edit-fixture="${escapeAttribute(item.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              data-delete-fixture="${escapeAttribute(item.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-edit-fixture]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            fixturesCache.find(
              x =>
                String(x.id) ===
                String(
                  button.dataset.editFixture
                )
            );


          if (item)
            openFixtureModal(item);

        }
      );

    });


  $$("[data-delete-fixture]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteFixture(
            button.dataset.deleteFixture
          );

        }
      );

    });

}


function openFixtureModal(
  item = null
) {

  editingItem =
    item;


  openModal(`

    <div class="modal-header">

      <span class="page-label">
        MATCH MANAGEMENT
      </span>

      <h2>
        ${
          item
            ? "Edit Match"
            : "Add Match"
        }
      </h2>

    </div>


    <form
      id="fixtureForm"
      class="admin-form"
    >

      <div class="form-row">

        <div class="form-group">

          <label>
            HOME TEAM
          </label>

          <input
            name="home_team"
            required
            value="${escapeAttribute(
              item?.home_team ||
              item?.home ||
              item?.team_a ||
              ""
            )}"
          >

        </div>


        <div class="form-group">

          <label>
            AWAY TEAM
          </label>

          <input
            name="away_team"
            required
            value="${escapeAttribute(
              item?.away_team ||
              item?.away ||
              item?.team_b ||
              ""
            )}"
          >

        </div>

      </div>


      <div class="form-row">

        <div class="form-group">

          <label>
            MATCH DATE
          </label>

          <input
            type="date"
            name="date"
            value="${escapeAttribute(
              normalizeDateInput(
                item?.date ||
                item?.match_date
              )
            )}"
          >

        </div>


        <div class="form-group">

          <label>
            VENUE
          </label>

          <input
            name="venue"
            value="${escapeAttribute(
              item?.venue ||
              item?.location ||
              ""
            )}"
          >

        </div>

      </div>


      <div class="form-row">

        <div class="form-group">

          <label>
            STATUS
          </label>

          <select name="status">

            <option value="upcoming"
              ${item?.status === "upcoming" ? "selected" : ""}
            >
              Upcoming
            </option>

            <option value="live"
              ${item?.status === "live" ? "selected" : ""}
            >
              Live
            </option>

            <option value="completed"
              ${item?.status === "completed" ? "selected" : ""}
            >
              Completed
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>
            SCORE
          </label>

          <input
            name="score"
            value="${escapeAttribute(
              item?.score ||
              ""
            )}"
            placeholder="e.g. 2-1"
          >

        </div>

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          ${
            item
              ? "Update Match"
              : "Add Match"
          }
        </button>

      </div>

    </form>

  `);


  $("#fixtureForm")
    ?.addEventListener(
      "submit",
      saveFixture
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });

}


async function saveFixture(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  const formData =
    new FormData(form);


  const payload = {

    home_team:
      String(
        formData.get("home_team") ||
        ""
      ).trim(),

    away_team:
      String(
        formData.get("away_team") ||
        ""
      ).trim(),

    date:
      formData.get("date") ||
      null,

    venue:
      String(
        formData.get("venue") ||
        ""
      ).trim(),

    status:
      formData.get("status") ||
      "upcoming",

    score:
      String(
        formData.get("score") ||
        ""
      ).trim(),

    updated_at:
      new Date().toISOString()

  };


  if (
    !payload.home_team ||
    !payload.away_team
  ) {

    showToast(
      "Both team names are required.",
      "error"
    );

    return;

  }


  setLoading(
    button,
    true,
    "Saving..."
  );


  try {

    let result;


    if (editingItem?.id) {

      result =
        await supabaseClient
          .from(TABLES.fixtures)
          .update(payload)
          .eq(
            "id",
            editingItem.id
          );

    } else {

      payload.created_at =
        new Date().toISOString();


      payload.created_by =
        currentUser?.id || null;


      result =
        await supabaseClient
          .from(TABLES.fixtures)
          .insert(
            payload
          );

    }


    if (result.error)
      throw result.error;


    closeModal();


    showToast(
      "Match saved successfully.",
      "success"
    );


    await loadFixtures();

    updateDashboardStats();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save match.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteFixture(
  id
) {

  if (
    !confirm(
      "Delete this match?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(TABLES.fixtures)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Match deleted.",
      "success"
    );


    await loadFixtures();

    updateDashboardStats();

  } catch (error) {

    showToast(
      error.message ||
      "Could not delete match.",
      "error"
    );

  }

}


/* =========================================================
   LEADERSHIP
========================================================= */

async function loadLeadership() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(TABLES.leadership)
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (error)
      throw error;


    leadershipCache =
      data || [];


    renderLeadership(
      leadershipCache
    );

  } catch (error) {

    console.error(
      "Leadership loading error:",
      error
    );


    renderLeadership([]);

  }

}


function renderLeadership(
  leaders
) {

  const container =
    $("#leadershipList");


  if (!container)
    return;


  if (!leaders.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>★</span>

        <h4>
          No leadership members
        </h4>

        <p>
          Add club leadership information.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    leaders.map(item => {

      return `
        <article class="admin-person-card">

          ${
            item.photo ||
            item.image_url
              ? `
                <img
                  src="${escapeAttribute(
                    item.photo ||
                    item.image_url
                  )}"
                  alt="${escapeAttribute(
                    item.name ||
                    "Leader"
                  )}"
                >
              `
              : `
                <div class="person-placeholder">
                  ${escapeHTML(
                    (item.name || "L")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
              `
          }


          <div>

            <h3>
              ${escapeHTML(
                item.name ||
                "Unnamed"
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.position ||
                item.role ||
                ""
              )}
            </p>

          </div>


          <div class="admin-card-actions">

            <button
              type="button"
              data-edit-leader="${escapeAttribute(item.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              data-delete-leader="${escapeAttribute(item.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-edit-leader]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            leadershipCache.find(
              x =>
                String(x.id) ===
                String(
                  button.dataset.editLeader
                )
            );


          if (item)
            openLeadershipModal(item);

        }
      );

    });


  $$("[data-delete-leader]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteLeadership(
            button.dataset.deleteLeader
          );

        }
      );

    });

}


function openLeadershipModal(
  item = null
) {

  editingItem =
    item;


  openModal(`

    <div class="modal-header">

      <span class="page-label">
        CLUB LEADERSHIP
      </span>

      <h2>
        ${
          item
            ? "Edit Leader"
            : "Add Leader"
        }
      </h2>

    </div>


    <form
      id="leadershipForm"
      class="admin-form"
    >

      <div class="form-group">

        <label>
          FULL NAME
        </label>

        <input
          name="name"
          required
          value="${escapeAttribute(
            item?.name || ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          POSITION
        </label>

        <input
          name="position"
          required
          value="${escapeAttribute(
            item?.position ||
            item?.role ||
            ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          PHOTO URL
        </label>

        <input
          name="photo"
          type="url"
          value="${escapeAttribute(
            item?.photo ||
            item?.image_url ||
            ""
          )}"
          placeholder="https://..."
        >

      </div>


      <div class="form-group">

        <label>
          BIO
        </label>

        <textarea
          name="bio"
          rows="4"
        >${escapeHTML(
          item?.bio ||
          ""
        )}</textarea>

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          Save Leader
        </button>

      </div>

    </form>

  `);


  $("#leadershipForm")
    ?.addEventListener(
      "submit",
      saveLeadership
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });

}


async function saveLeadership(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  const formData =
    new FormData(form);


  const payload = {

    name:
      String(
        formData.get("name") ||
        ""
      ).trim(),

    position:
      String(
        formData.get("position") ||
        ""
      ).trim(),

    photo:
      String(
        formData.get("photo") ||
        ""
      ).trim(),

    bio:
      String(
        formData.get("bio") ||
        ""
      ).trim(),

    updated_at:
      new Date().toISOString()

  };


  setLoading(
    button,
    true,
    "Saving..."
  );


  try {

    let result;


    if (editingItem?.id) {

      result =
        await supabaseClient
          .from(TABLES.leadership)
          .update(payload)
          .eq(
            "id",
            editingItem.id
          );

    } else {

      payload.created_at =
        new Date().toISOString();


      result =
        await supabaseClient
          .from(TABLES.leadership)
          .insert(
            payload
          );

    }


    if (result.error)
      throw result.error;


    closeModal();


    showToast(
      "Leadership member saved.",
      "success"
    );


    await loadLeadership();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save leader.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteLeadership(
  id
) {

  if (
    !confirm(
      "Delete this leadership member?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(TABLES.leadership)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Leadership member deleted.",
      "success"
    );


    await loadLeadership();

  } catch (error) {

    showToast(
      error.message ||
      "Could not delete member.",
      "error"
    );

  }

}


/* =========================================================
   COMMITTEE
========================================================= */

async function loadCommittee() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(TABLES.committee)
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (error)
      throw error;


    committeeCache =
      data || [];


    renderCommittee(
      committeeCache
    );

  } catch (error) {

    console.error(
      "Committee loading error:",
      error
    );


    renderCommittee([]);

  }

}


function renderCommittee(
  members
) {

  const container =
    $("#committeeList");


  if (!container)
    return;


  if (!members.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>♙</span>

        <h4>
          Committee list is empty
        </h4>

        <p>
          Add committee members and positions.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    members.map(item => {

      return `
        <article class="admin-list-item">

          <div class="admin-list-main">

            <h3>
              ${escapeHTML(
                item.name ||
                "Unnamed Member"
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.position ||
                item.role ||
                ""
              )}
            </p>

          </div>


          <div class="admin-list-actions">

            <button
              type="button"
              data-edit-committee="${escapeAttribute(item.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              data-delete-committee="${escapeAttribute(item.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-edit-committee]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            committeeCache.find(
              x =>
                String(x.id) ===
                String(
                  button.dataset.editCommittee
                )
            );


          if (item)
            openCommitteeModal(item);

        }
      );

    });


  $$("[data-delete-committee]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteCommittee(
            button.dataset.deleteCommittee
          );

        }
      );

    });

}


function openCommitteeModal(
  item = null
) {

  editingItem =
    item;


  openModal(`

    <div class="modal-header">

      <span class="page-label">
        CLUB MANAGEMENT
      </span>

      <h2>
        ${
          item
            ? "Edit Committee Member"
            : "Add Committee Member"
        }
      </h2>

    </div>


    <form
      id="committeeForm"
      class="admin-form"
    >

      <div class="form-group">

        <label>
          FULL NAME
        </label>

        <input
          name="name"
          required
          value="${escapeAttribute(
            item?.name || ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          POSITION
        </label>

        <input
          name="position"
          required
          value="${escapeAttribute(
            item?.position ||
            item?.role ||
            ""
          )}"
        >

      </div>


      <div class="form-group">

        <label>
          PHONE / CONTACT
        </label>

        <input
          name="phone"
          value="${escapeAttribute(
            item?.phone ||
            ""
          )}"
        >

      </div>


      <div class="modal-form-actions">

        <button
          type="button"
          class="admin-button admin-button-light"
          data-modal-close
        >
          Cancel
        </button>

        <button
          type="submit"
          class="admin-button admin-button-dark"
        >
          Save Member
        </button>

      </div>

    </form>

  `);


  $("#committeeForm")
    ?.addEventListener(
      "submit",
      saveCommittee
    );


  $$("[data-modal-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeModal
      );

    });

}


async function saveCommittee(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  const formData =
    new FormData(form);


  const payload = {

    name:
      String(
        formData.get("name") ||
        ""
      ).trim(),

    position:
      String(
        formData.get("position") ||
        ""
      ).trim(),

    phone:
      String(
        formData.get("phone") ||
        ""
      ).trim(),

    updated_at:
      new Date().toISOString()

  };


  setLoading(
    button,
    true,
    "Saving..."
  );


  try {

    let result;


    if (editingItem?.id) {

      result =
        await supabaseClient
          .from(TABLES.committee)
          .update(payload)
          .eq(
            "id",
            editingItem.id
          );

    } else {

      payload.created_at =
        new Date().toISOString();


      result =
        await supabaseClient
          .from(TABLES.committee)
          .insert(
            payload
          );

    }


    if (result.error)
      throw result.error;


    closeModal();


    showToast(
      "Committee member saved.",
      "success"
    );


    await loadCommittee();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not save member.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


async function deleteCommittee(
  id
) {

  if (
    !confirm(
      "Delete this committee member?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(TABLES.committee)
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Committee member deleted.",
      "success"
    );


    await loadCommittee();

  } catch (error) {

    showToast(
      error.message ||
      "Could not delete member.",
      "error"
    );

  }

}


/* =========================================================
   FRIENDLY MATCH APPLICATIONS
========================================================= */

async function loadFriendlyApplications() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          TABLES.friendlyApplications
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    friendlyApplicationsCache =
      data || [];


    renderFriendlyApplications(
      friendlyApplicationsCache
    );


    updateApplicationCount();

  } catch (error) {

    console.error(
      "Friendly applications error:",
      error
    );


    renderFriendlyApplications([]);

  }

}


function renderFriendlyApplications(
  applications
) {

  const container =
    $("#friendlyApplicationsList");


  if (!container)
    return;


  const filter =
    $("#friendlyStatusFilter");


  const status =
    filter?.value ||
    "all";


  let list =
    applications;


  if (status !== "all") {

    list =
      applications.filter(
        item =>
          String(
            item.status ||
            "pending"
          ).toLowerCase() ===
          status
      );

  }


  if (!list.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>⚽</span>

        <h4>
          No friendly match applications
        </h4>

        <p>
          Submitted applications will appear here.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    list.map(item => {

      return applicationCard(
        item,
        "friendly"
      );

    }).join("");


  bindApplicationActions();

}


function applicationCard(
  item,
  type
) {

  const name =
    item.team_name ||
    item.name ||
    item.club_name ||
    "Unknown";


  const status =
    item.status ||
    "pending";


  return `
    <article class="application-card">

      <div class="application-card-header">

        <div>

          <span class="application-type">
            ${
              type === "friendly"
                ? "FRIENDLY MATCH"
                : "MEMBERSHIP"
            }
          </span>

          <h3>
            ${escapeHTML(name)}
          </h3>

        </div>


        <span class="status-badge ${escapeAttribute(status)}">
          ${escapeHTML(status)}
        </span>

      </div>


      <div class="application-details">

        ${
          item.contact_name ||
          item.applicant_name
            ? `
              <p>
                <strong>Contact:</strong>
                ${escapeHTML(
                  item.contact_name ||
                  item.applicant_name
                )}
              </p>
            `
            : ""
        }


        ${
          item.phone
            ? `
              <p>
                <strong>Phone:</strong>
                ${escapeHTML(item.phone)}
              </p>
            `
            : ""
        }


        ${
          item.email
            ? `
              <p>
                <strong>Email:</strong>
                ${escapeHTML(item.email)}
              </p>
            `
            : ""
        }


        ${
          item.preferred_date ||
          item.match_date
            ? `
              <p>
                <strong>Date:</strong>
                ${formatDate(
                  item.preferred_date ||
                  item.match_date
                )}
              </p>
            `
            : ""
        }


        ${
          item.message
            ? `
              <p>
                <strong>Message:</strong>
                ${escapeHTML(item.message)}
              </p>
            `
            : ""
        }

      </div>


      <div class="application-actions">

        <button
          type="button"
          data-application-status="approved"
          data-application-type="${type}"
          data-application-id="${escapeAttribute(item.id)}"
        >
          Approve
        </button>


        <button
          type="button"
          data-application-status="rejected"
          data-application-type="${type}"
          data-application-id="${escapeAttribute(item.id)}"
        >
          Reject
        </button>


        ${
          status !== "pending"
            ? `
              <button
                type="button"
                data-application-status="pending"
                data-application-type="${type}"
                data-application-id="${escapeAttribute(item.id)}"
              >
                Pending
              </button>
            `
            : ""
        }

      </div>


      <small>
        Submitted:
        ${formatDate(item.created_at)}
      </small>

    </article>
  `;

}


/* =========================================================
   MEMBERSHIP APPLICATIONS
========================================================= */

async function loadMembershipApplications() {

  if (!supabaseClient)
    return;


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          TABLES.membershipApplications
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    membershipApplicationsCache =
      data || [];


    renderMembershipApplications(
      membershipApplicationsCache
    );


    updateApplicationCount();

  } catch (error) {

    console.error(
      "Membership applications error:",
      error
    );


    renderMembershipApplications([]);

  }

}


function renderMembershipApplications(
  applications
) {

  const container =
    $("#membershipApplicationsList");


  if (!container)
    return;


  const filter =
    $("#membershipStatusFilter");


  const status =
    filter?.value ||
    "all";


  let list =
    applications;


  if (status !== "all") {

    list =
      applications.filter(
        item =>
          String(
            item.status ||
            "pending"
          ).toLowerCase() ===
          status
      );

  }


  if (!list.length) {

    container.innerHTML = `
      <div class="empty-state">

        <span>✦</span>

        <h4>
          No membership applications
        </h4>

        <p>
          New club membership applications
          will appear here.
        </p>

      </div>
    `;

    return;

  }


  container.innerHTML =
    list.map(item => {

      return applicationCard(
        item,
        "membership"
      );

    }).join("");


  bindApplicationActions();

}


/* =========================================================
   APPLICATION STATUS
========================================================= */

function bindApplicationActions() {

  $$("[data-application-status]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          updateApplicationStatus(
            button.dataset.applicationType,
            button.dataset.applicationId,
            button.dataset.applicationStatus
          );

        }
      );

    });

}


async function updateApplicationStatus(
  type,
  id,
  status
) {

  const table =
    type === "friendly"
      ? TABLES.friendlyApplications
      : TABLES.membershipApplications;


  try {

    const {
      error
    } =
      await supabaseClient
        .from(table)
        .update({

          status,

          updated_at:
            new Date().toISOString()

        })
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      `Application marked as ${status}.`,
      "success"
    );


    if (type === "friendly") {

      await loadFriendlyApplications();

    } else {

      await loadMembershipApplications();

    }


    updateApplicationCount();

    renderApplicationsPreview();

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Could not update application.",
      "error"
    );

  }

}


/* =========================================================
   APPLICATION FILTERS
========================================================= */

function setupApplicationFilters() {

  $("#friendlyStatusFilter")
    ?.addEventListener(
      "change",
      () => {

        renderFriendlyApplications(
          friendlyApplicationsCache
        );

      }
    );


  $("#membershipStatusFilter")
    ?.addEventListener(
      "change",
      () => {

        renderMembershipApplications(
          membershipApplicationsCache
        );

      }
    );

}


/* =========================================================
   APPLICATION COUNTS
========================================================= */

function updateApplicationCount() {

  const friendlyPending =
    friendlyApplicationsCache.filter(
      item =>
        String(
          item.status ||
          "pending"
        ).toLowerCase() ===
        "pending"
    ).length;


  const membershipPending =
    membershipApplicationsCache.filter(
      item =>
        String(
          item.status ||
          "pending"
        ).toLowerCase() ===
        "pending"
    ).length;


  const total =
    friendlyPending +
    membershipPending;


  setText(
    "#friendlyApplicationCount",
    friendlyPending
  );


  setText(
    "#membershipApplicationCount",
    membershipPending
  );


  setText(
    "#totalApplications",
    total
  );


  const notificationDot =
    $("#notificationDot");


  if (notificationDot) {

    notificationDot.style.display =
      total > 0
        ? "block"
        : "none";

  }

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateDashboardStats() {

  setText(
    "#totalNotices",
    postsCache.length
  );


  setText(
    "#totalTournaments",
    tournamentsCache.length
  );


  setText(
    "#totalFixtures",
    fixturesCache.length
  );


  updateApplicationCount();

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecentActivity() {

  const container =
    $("#recentActivityList");


  if (!container)
    return;


  const items = [];


  postsCache
    .slice(0, 5)
    .forEach(item => {

      items.push({

        type: "Notice",

        title:
          item.title ||
          "New notice",

        date:
          item.created_at

      });

    });


  tournamentsCache
    .slice(0, 5)
    .forEach(item => {

      items.push({

        type: "Tournament",

        title:
          item.name ||
          item.title ||
          "Tournament",

        date:
          item.created_at

      });

    });


  fixturesCache
    .slice(0, 5)
    .forEach(item => {

      items.push({

        type: "Match",

        title:
          `${
            item.home_team ||
            item.home ||
            "Team A"
          } vs ${
            item.away_team ||
            item.away ||
            "Team B"
          }`,

        date:
          item.created_at

      });

    });


  items.sort(
    (a,b) =>
      new Date(
        b.date || 0
      ) -
      new Date(
        a.date || 0
      )
  );


  const latest =
    items.slice(0, 6);


  if (!latest.length) {

    container.innerHTML = `
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
    latest.map(item => {

      return `
        <div class="recent-activity-item">

          <div class="recent-activity-icon">
            ${
              item.type === "Notice"
                ? "◉"
                : item.type === "Tournament"
                ? "🏆"
                : "⚽"
            }
          </div>

          <div>

            <strong>
              ${escapeHTML(item.title)}
            </strong>

            <span>
              ${escapeHTML(item.type)}
              ·
              ${formatDate(item.date)}
            </span>

          </div>

        </div>
      `;

    }).join("");

}


/* =========================================================
   APPLICATION PREVIEW
========================================================= */

function renderApplicationsPreview() {

  const container =
    $("#applicationsPreview");


  if (!container)
    return;


  const applications = [

    ...friendlyApplicationsCache
      .map(item => ({
        ...item,
        applicationType:
          "Friendly Match"
      })),

    ...membershipApplicationsCache
      .map(item => ({
        ...item,
        applicationType:
          "Membership"
      }))

  ];


  applications.sort(
    (a,b) =>
      new Date(
        b.created_at || 0
      ) -
      new Date(
        a.created_at || 0
      )
  );


  const latest =
    applications.slice(0, 5);


  if (!latest.length) {

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
    latest.map(item => {

      const name =
        item.team_name ||
        item.name ||
        item.club_name ||
        "Application";


      return `
        <div class="application-preview-item">

          <div>

            <span>
              ${escapeHTML(
                item.applicationType
              )}
            </span>

            <strong>
              ${escapeHTML(name)}
            </strong>

          </div>


          <span class="status-badge ${
            escapeAttribute(
              item.status ||
              "pending"
            )
          }">
            ${escapeHTML(
              item.status ||
              "pending"
            )}
          </span>

        </div>
      `;

    }).join("");

}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

  $("#refreshButton")
    ?.addEventListener(
      "click",
      async event => {

        const button =
          event.currentTarget;


        setLoading(
          button,
          true,
          "Refreshing..."
        );


        try {

          await loadDashboard();


          showToast(
            "Dashboard refreshed.",
            "success"
          );

        } finally {

          setLoading(
            button,
            false
          );

        }

      }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
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


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
  selector,
  value
) {

  const element =
    $(selector);


  if (element)
    element.textContent =
      value ?? "";

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  value
) {

  if (!value)
    return "—";


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  )
    return "—";


  return date.toLocaleDateString(
    "en-BD",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}


function normalizeDateInput(
  value
) {

  if (!value)
    return "";


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  )
    return "";


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


/* =========================================================
   YEAR
========================================================= */

function updateYear() {

  $$("[data-current-year]")
    .forEach(element => {

      element.textContent =
        new Date()
          .getFullYear();

    });

}


/* =========================================================
   BODY MODAL CLICK
========================================================= */

document.addEventListener(
  "click",
  event => {

    const closeButton =
      event.target.closest(
        "[data-modal-close]"
      );


    if (closeButton)
      closeModal();

  }
);


/* =========================================================
   GLOBAL ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !==
      "Escape"
    )
      return;


    closeModal();

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeAdmin() {

  updateYear();

  updateCurrentDate();


  const configured =
    initSupabase();


  if (!configured)
    return;


  setupLoginForm();

  setupLogout();

  setupAuthListener();

  setupSidebar();

  setupMobileSidebar();

  setupActions();

  setupModal();

  setupRefresh();

  setupApplicationFilters();


  navigateToPage(
    "dashboard"
  );


  await checkAuth();

}


/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
  );

} else {

  initializeAdmin();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.GSAAdmin = {

  login:
    loginAdmin,

  logout:
    logoutAdmin,

  refresh:
    loadDashboard,

  loadDashboard:
    loadDashboard,

  loadPosts:
    loadPosts,

  loadGallery:
    loadGallery,

  loadTournaments:
    loadTournaments,

  loadFixtures:
    loadFixtures,

  loadLeadership:
    loadLeadership,

  loadCommittee:
    loadCommittee,

  loadFriendlyApplications:
    loadFriendlyApplications,

  loadMembershipApplications:
    loadMembershipApplications,

  openNotice:
    openNoticeModal,

  openGallery:
    openGalleryModal,

  openTournament:
    openTournamentModal,

  openFixture:
    openFixtureModal,

  openLeadership:
    openLeadershipModal,

  openCommittee:
    openCommitteeModal

};


/* =========================================================
   END OF GSA ADMIN PANEL
========================================================= */
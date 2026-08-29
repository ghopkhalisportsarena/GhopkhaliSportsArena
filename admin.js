/* ==================================================
   GHOPKHALI SPORTS ARENA
   ADMIN PANEL JAVASCRIPT
   Supabase Powered
================================================== */


/* ==================================================
   SUPABASE CONFIGURATION
================================================== */

/*
   IMPORTANT:
   এখানে আপনার Supabase URL এবং ANON/PUBLIC KEY বসান।

   উদাহরণ:
   const SUPABASE_URL = "https://xxxx.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-key";
*/

const SUPABASE_URL =
  window.SUPABASE_URL ||
  "YOUR_SUPABASE_URL";

const SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY ||
  "YOUR_SUPABASE_ANON_KEY";


let supabaseClient = null;


/* ==================================================
   INITIALIZE SUPABASE
================================================== */

function initSupabase() {

  if (
    SUPABASE_URL === "YOUR_SUPABASE_URL" ||
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
  ) {

    console.error(
      "Supabase configuration is missing."
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
      "Supabase library not loaded."
    );

    showToast(
      "Supabase library could not be loaded.",
      "error"
    );

    return false;
  }


  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );


  return true;
}


/* ==================================================
   DOM HELPERS
================================================== */

const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  document.querySelectorAll(selector);


/* ==================================================
   GLOBAL STATE
================================================== */

let currentUser = null;

let editingPostId = null;

let editingGalleryId = null;

let postsCache = [];

let galleryCache = [];


/* ==================================================
   TOAST
================================================== */

function showToast(
  message,
  type = "success"
) {

  let toast =
    document.querySelector(
      ".admin-toast"
    );


  if (!toast) {

    toast =
      document.createElement("div");

    toast.className =
      "admin-toast";

    document.body.appendChild(toast);
  }


  toast.textContent = message;

  toast.classList.remove(
    "success",
    "error",
    "warning",
    "show"
  );

  toast.classList.add(type);

  requestAnimationFrame(() => {

    toast.classList.add("show");

  });


  clearTimeout(
    toast._timer
  );


  toast._timer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3200);

}


/* ==================================================
   LOADING
================================================== */

function setLoading(
  button,
  loading,
  loadingText = "Processing..."
) {

  if (!button)
    return;


  if (loading) {

    button.dataset.originalText =
      button.innerHTML;

    button.disabled = true;

    button.innerHTML =
      `<span class="admin-spinner"></span> ${loadingText}`;

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


/* ==================================================
   AUTH CHECK
================================================== */

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
      "Authentication check failed.",
      "error"
    );

  }

}


/* ==================================================
   AUTH STATE LISTENER
================================================== */

function setupAuthListener() {

  if (!supabaseClient)
    return;


  supabaseClient.auth.onAuthStateChange(
    async (
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

        await loadDashboard();

      }

    }
  );

}


/* ==================================================
   AUTH UI
================================================== */

function updateAuthUI() {

  const loginScreen =
    $("#loginScreen");

  const adminApp =
    $("#adminApp");

  const userEmail =
    $("#userEmail");


  if (currentUser) {

    if (loginScreen)
      loginScreen.style.display =
        "none";


    if (adminApp)
      adminApp.style.display =
        "block";


    if (userEmail) {

      userEmail.textContent =
        currentUser.email || "";

    }

  } else {

    if (loginScreen)
      loginScreen.style.display =
        "flex";


    if (adminApp)
      adminApp.style.display =
        "none";

  }

}


/* ==================================================
   LOGIN
================================================== */

async function loginAdmin(
  email,
  password,
  button = null
) {

  if (!supabaseClient)
    return;


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


    showToast(
      "Login successful.",
      "success"
    );


    updateAuthUI();

    await loadDashboard();


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

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


/* ==================================================
   LOGOUT
================================================== */

async function logoutAdmin() {

  if (!supabaseClient)
    return;


  try {

    await supabaseClient.auth.signOut();

    currentUser = null;

    updateAuthUI();

    showToast(
      "Logged out successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    showToast(
      "Logout failed.",
      "error"
    );

  }

}


/* ==================================================
   LOGIN FORM
================================================== */

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
        form.querySelector(
          "[name='email']"
        )?.value.trim();


      const password =
        form.querySelector(
          "[name='password']"
        )?.value;


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


/* ==================================================
   LOGOUT BUTTON
================================================== */

function setupLogout() {

  const buttons =
    $$(
      "[data-admin-logout], #logoutBtn, #logoutButton"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      logoutAdmin
    );

  });

}


/* ==================================================
   DASHBOARD
================================================== */

async function loadDashboard() {

  if (!currentUser)
    return;


  await Promise.all([
    loadPosts(),
    loadGallery(),
    loadDashboardStats()
  ]);

}


/* ==================================================
   POSTS TABLE
================================================== */

async function loadPosts() {

  if (!supabaseClient)
    return;


  const tableBody =
    $(
      "#postsTableBody"
    );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("posts")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error)
      throw error;


    postsCache =
      data || [];


    renderPosts(
      postsCache
    );


  } catch (error) {

    console.error(
      "Posts loading error:",
      error
    );


    /*
      Some projects use public_posts
      instead of posts.
    */

    try {

      const {
        data,
        error: secondError
      } =
        await supabaseClient
          .from("public_posts")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );


      if (secondError)
        throw secondError;


      postsCache =
        data || [];


      renderPosts(
        postsCache
      );


    } catch (secondError) {

      console.error(
        secondError
      );


      if (tableBody) {

        tableBody.innerHTML =
          `
          <tr>
            <td colspan="8">
              Could not load posts.
            </td>
          </tr>
          `;

      }

    }

  }

}


/* ==================================================
   RENDER POSTS
================================================== */

function renderPosts(
  posts
) {

  const tableBody =
    $(
      "#postsTableBody"
    );


  if (!tableBody)
    return;


  if (!posts.length) {

    tableBody.innerHTML =
      `
      <tr>
        <td colspan="8">
          No posts found.
        </td>
      </tr>
      `;

    return;

  }


  tableBody.innerHTML =
    posts.map(
      post => {

        const id =
          post.id ?? "";


        const title =
          escapeHTML(
            post.title ||
            "Untitled"
          );


        const category =
          escapeHTML(
            post.category ||
            "General"
          );


        const status =
          post.status ||
          "draft";


        const date =
          formatDate(
            post.created_at
          );


        return `
          <tr>

            <td>
              ${title}
            </td>

            <td>
              ${category}
            </td>

            <td>
              <span class="status-badge ${status}">
                ${escapeHTML(status)}
              </span>
            </td>

            <td>
              ${date}
            </td>

            <td>

              <button
                type="button"
                class="admin-action edit"
                data-edit-post="${escapeAttribute(id)}"
              >
                Edit
              </button>

              <button
                type="button"
                class="admin-action delete"
                data-delete-post="${escapeAttribute(id)}"
              >
                Delete
              </button>

            </td>

          </tr>
        `;

      }
    )
    .join("");


  bindPostActions();

}


/* ==================================================
   POST ACTIONS
================================================== */

function bindPostActions() {

  $$(
    "[data-edit-post]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.getAttribute(
            "data-edit-post"
          );

        editPost(id);

      }
    );

  });


  $$(
    "[data-delete-post]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.getAttribute(
            "data-delete-post"
          );

        deletePost(id);

      }
    );

  });

}


/* ==================================================
   OPEN POST FORM
================================================== */

function openPostForm(
  post = null
) {

  const modal =
    $(
      "#postModal, #postFormModal"
    );


  const form =
    $(
      "#postForm"
    );


  if (!form)
    return;


  editingPostId =
    post?.id || null;


  form.reset();


  const title =
    form.querySelector(
      "[name='title']"
    );

  const category =
    form.querySelector(
      "[name='category']"
    );

  const content =
    form.querySelector(
      "[name='content']"
    );

  const excerpt =
    form.querySelector(
      "[name='excerpt']"
    );

  const status =
    form.querySelector(
      "[name='status']"
    );


  if (post) {

    if (title)
      title.value =
        post.title || "";


    if (category)
      category.value =
        post.category || "";


    if (content)
      content.value =
        post.content || "";


    if (excerpt)
      excerpt.value =
        post.excerpt || "";


    if (status)
      status.value =
        post.status || "draft";

  }


  if (modal) {

    modal.classList.add(
      "active"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


/* ==================================================
   EDIT POST
================================================== */

function editPost(id) {

  const post =
    postsCache.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!post) {

    showToast(
      "Post not found.",
      "error"
    );

    return;

  }


  openPostForm(
    post
  );

}


/* ==================================================
   CLOSE POST FORM
================================================== */

function closePostForm() {

  const modal =
    $(
      "#postModal, #postFormModal"
    );


  if (!modal)
    return;


  modal.classList.remove(
    "active"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  editingPostId =
    null;

}


/* ==================================================
   SAVE POST
================================================== */

async function savePost(
  form
) {

  if (!supabaseClient)
    return;


  if (!currentUser) {

    showToast(
      "Please login first.",
      "error"
    );

    return;

  }


  const title =
    form.querySelector(
      "[name='title']"
    )?.value.trim();


  const category =
    form.querySelector(
      "[name='category']"
    )?.value.trim();


  const content =
    form.querySelector(
      "[name='content']"
    )?.value.trim();


  const excerpt =
    form.querySelector(
      "[name='excerpt']"
    )?.value.trim();


  const status =
    form.querySelector(
      "[name='status']"
    )?.value ||
    "draft";


  if (!title) {

    showToast(
      "Title is required.",
      "error"
    );

    return;

  }


  const payload = {

    title,

    category:
      category ||
      "General",

    content:
      content || "",

    excerpt:
      excerpt || "",

    status,

    updated_at:
      new Date().toISOString()

  };


  const button =
    form.querySelector(
      "button[type='submit']"
    );


  setLoading(
    button,
    true,
    editingPostId
      ? "Updating..."
      : "Publishing..."
  );


  try {

    let result;


    if (editingPostId) {

      result =
        await supabaseClient
          .from("posts")
          .update(payload)
          .eq(
            "id",
            editingPostId
          )
          .select();

    } else {

      payload.author_id =
        currentUser.id;


      payload.created_at =
        new Date().toISOString();


      result =
        await supabaseClient
          .from("posts")
          .insert(
            payload
          )
          .select();

    }


    if (result.error)
      throw result.error;


    showToast(
      editingPostId
        ? "Post updated successfully."
        : "Post created successfully.",
      "success"
    );


    closePostForm();

    await loadPosts();


  } catch (error) {

    console.error(
      "Save post error:",
      error
    );


    showToast(
      error.message ||
      "Could not save post.",
      "error"
    );

  } finally {

    setLoading(
      button,
      false
    );

  }

}


/* ==================================================
   DELETE POST
================================================== */

async function deletePost(
  id
) {

  if (!supabaseClient)
    return;


  if (
    !confirm(
      "Are you sure you want to delete this post?"
    )
  )
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from("posts")
        .delete()
        .eq(
          "id",
          id
        );


    if (error)
      throw error;


    showToast(
      "Post deleted.",
      "success"
    );


    await loadPosts();


  } catch (error) {

    console.error(
      "Delete post error:",
      error
    );


    showToast(
      error.message ||
      "Could not delete post.",
      "error"
    );

  }

}


/* ==================================================
   PUBLISH / DRAFT TOGGLE
================================================== */

async function updatePostStatus(
  id,
  status
) {

  if (!supabaseClient)
    return;


  try {

    const {
      error
    } =
      await supabaseClient
        .from("posts")
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
      status === "published"
        ? "Post published."
        : "Post moved to draft.",
      "success"
    );


    await loadPosts();


  } catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      "Status update failed.",
      "error"
    );

  }

}


/* ==================================================
   GALLERY
================================================== */

async function loadGallery() {

  if (!supabaseClient)
    return;


  try {

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


/* ==================================================
   RENDER GALLERY
================================================== */

function renderGallery(
  gallery
) {

  const container =
    $(
      "#galleryAdminGrid, #galleryGrid"
    );


  if (!container)
    return;


  if (!gallery.length) {

    container.innerHTML =
      `
      <div class="empty-state">
        No gallery images found.
      </div>
      `;

    return;

  }


  container.innerHTML =
    gallery.map(
      item => {

        const id =
          item.id || "";


        const image =
          item.image_url ||
          item.url ||
          item.image ||
          "";


        const title =
          escapeHTML(
            item.title ||
            "Gallery Image"
          );


        return `
          <div
            class="admin-gallery-item"
          >

            <img
              src="${escapeAttribute(image)}"
              alt="${title}"
              loading="lazy"
            >

            <div
              class="admin-gallery-overlay"
            >

              <strong>
                ${title}
              </strong>

              <button
                type="button"
                data-delete-gallery="${escapeAttribute(id)}"
              >
                Delete
              </button>

            </div>

          </div>
        `;

      }
    )
    .join("");


  $$(
    "[data-delete-gallery]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        deleteGallery(
          button.getAttribute(
            "data-delete-gallery"
          )
        );

      }
    );

  });

}


/* ==================================================
   UPLOAD GALLERY IMAGE
================================================== */

async function uploadGalleryImage(
  file,
  title = ""
) {

  if (!supabaseClient)
    return;


  if (!currentUser) {

    showToast(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!file) {

    showToast(
      "Please select an image.",
      "error"
    );

    return;

  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    showToast(
      "Only image files are allowed.",
      "error"
    );

    return;

  }


  const maxSize =
    10 * 1024 * 1024;


  if (
    file.size > maxSize
  ) {

    showToast(
      "Image must be smaller than 10MB.",
      "error"
    );

    return;

  }


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const filename =
    `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}.${extension}`;


  const path =
    `gallery/${filename}`;


  try {

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
            cacheControl:
              "3600",
            upsert:false
          }
        );


    if (uploadError)
      throw uploadError;


    const {
      data:
        publicData
    } =
      supabaseClient
        .storage
        .from("gallery")
        .getPublicUrl(
          path
        );


    const imageUrl =
      publicData?.publicUrl;


    if (!imageUrl) {

      throw new Error(
        "Could not generate public image URL."
      );

    }


    const {
      error: insertError
    } =
      await supabaseClient
        .from("gallery")
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


    if (insertError)
      throw insertError;


    showToast(
      "Image uploaded successfully.",
      "success"
    );


    await loadGallery();


  } catch (error) {

    console.error(
      "Gallery upload error:",
      error
    );


    showToast(
      error.message ||
      "Image upload failed.",
      "error"
    );

  }

}


/* ==================================================
   GALLERY FORM
================================================== */

function setupGalleryForm() {

  const form =
    $(
      "#galleryForm"
    );


  if (!form)
    return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const file =
        form.querySelector(
          "[name='image'], input[type='file']"
        )?.files?.[0];


      const title =
        form.querySelector(
          "[name='title']"
        )?.value.trim() ||
        "";


      const button =
        form.querySelector(
          "button[type='submit']"
        );


      setLoading(
        button,
        true,
        "Uploading..."
      );


      try {

        await uploadGalleryImage(
          file,
          title
        );


        form.reset();

      } finally {

        setLoading(
          button,
          false
        );

      }

    }
  );

}


/* ==================================================
   DELETE GALLERY
================================================== */

async function deleteGallery(
  id
) {

  if (!supabaseClient)
    return;


  if (
    !confirm(
      "Delete this gallery image?"
    )
  )
    return;


  const item =
    galleryCache.find(
      gallery =>
        String(gallery.id) ===
        String(id)
    );


  try {

    if (
      item?.storage_path
    ) {

      await supabaseClient
        .storage
        .from("gallery")
        .remove([
          item.storage_path
        ]);

    }


    const {
      error
    } =
      await supabaseClient
        .from("gallery")
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


  } catch (error) {

    console.error(
      "Delete gallery error:",
      error
    );


    showToast(
      error.message ||
      "Could not delete image.",
      "error"
    );

  }

}


/* ==================================================
   PDF UPLOAD
================================================== */

async function uploadPDF(
  file
) {

  if (!supabaseClient)
    return;


  if (!currentUser) {

    showToast(
      "Please login first.",
      "error"
    );

    return;

  }


  if (!file) {

    showToast(
      "Please select a PDF.",
      "error"
    );

    return;

  }


  if (
    file.type !==
    "application/pdf"
  ) {

    showToast(
      "Only PDF files are allowed.",
      "error"
    );

    return;

  }


  const maxSize =
    25 * 1024 * 1024;


  if (
    file.size > maxSize
  ) {

    showToast(
      "PDF must be smaller than 25MB.",
      "error"
    );

    return;

  }


  const safeName =
    file.name
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );


  const path =
    `pdf/${Date.now()}-${safeName}`;


  try {

    const {
      error
    } =
      await supabaseClient
        .storage
        .from("documents")
        .upload(
          path,
          file,
          {
            cacheControl:
              "3600",
            upsert:false
          }
        );


    if (error)
      throw error;


    const {
      data
    } =
      supabaseClient
        .storage
        .from("documents")
        .getPublicUrl(
          path
        );


    const url =
      data?.publicUrl;


    const urlInput =
      $(
        "#pdfUrl"
      );


    if (urlInput) {

      urlInput.value =
        url || "";

    }


    showToast(
      "PDF uploaded successfully.",
      "success"
    );


    return url;


  } catch (error) {

    console.error(
      "PDF upload error:",
      error
    );


    showToast(
      error.message ||
      "PDF upload failed.",
      "error"
    );

  }

}


/* ==================================================
   PDF INPUT
================================================== */

function setupPDFUpload() {

  const input =
    $(
      "#pdfFile, input[name='pdf']"
    );


  if (!input)
    return;


  input.addEventListener(
    "change",
    async () => {

      const file =
        input.files?.[0];


      if (file) {

        await uploadPDF(
          file
        );

      }

    }
  );

}


/* ==================================================
   DASHBOARD STATISTICS
================================================== */

async function loadDashboardStats() {

  if (!supabaseClient)
    return;


  try {

    const postsResult =
      await supabaseClient
        .from("posts")
        .select(
          "id,status",
          {
            count:"exact",
            head:false
          }
        );


    const galleryResult =
      await supabaseClient
        .from("gallery")
        .select(
          "id",
          {
            count:"exact",
            head:true
          }
        );


    const totalPosts =
      postsResult.count || 0;


    const publishedPosts =
      postsResult.data
        ?.filter(
          post =>
            post.status ===
            "published"
        )
        .length ||
      postsCache.filter(
        post =>
          post.status ===
          "published"
      ).length;


    const drafts =
      postsResult.data
        ?.filter(
          post =>
            post.status ===
            "draft"
        )
        .length ||
      postsCache.filter(
        post =>
          post.status ===
          "draft"
      ).length;


    const totalGallery =
      galleryResult.count || 0;


    setText(
      "#totalPosts",
      totalPosts
    );


    setText(
      "#publishedPosts",
      publishedPosts
    );


    setText(
      "#draftPosts",
      drafts
    );


    setText(
      "#totalGallery",
      totalGallery
    );


  } catch (error) {

    console.error(
      "Stats error:",
      error
    );

  }

}


/* ==================================================
   SEARCH POSTS
================================================== */

function setupPostSearch() {

  const search =
    $(
      "#postSearch, #searchPosts"
    );


  if (!search)
    return;


  search.addEventListener(
    "input",
    () => {

      const query =
        search.value
          .trim()
          .toLowerCase();


      if (!query) {

        renderPosts(
          postsCache
        );

        return;

      }


      const filtered =
        postsCache.filter(
          post => {

            const title =
              String(
                post.title || ""
              ).toLowerCase();


            const category =
              String(
                post.category || ""
              ).toLowerCase();


            return (
              title.includes(query) ||
              category.includes(query)
            );

          }
        );


      renderPosts(
        filtered
      );

    }
  );

}


/* ==================================================
   FILTER POSTS
================================================== */

function setupPostFilter() {

  const filter =
    $(
      "#postStatusFilter, #statusFilter"
    );


  if (!filter)
    return;


  filter.addEventListener(
    "change",
    () => {

      const value =
        filter.value;


      if (!value || value === "all") {

        renderPosts(
          postsCache
        );

        return;

      }


      renderPosts(
        postsCache.filter(
          post =>
            post.status ===
            value
        )
      );

    }
  );

}


/* ==================================================
   MODAL HELPERS
================================================== */

function setupModals() {

  $$(
    "[data-open-post], #addPostBtn, #newPostBtn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openPostForm();

      }
    );

  });


  $$(
    "[data-close-post], #closePostModal"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      closePostForm
    );

  });


  $(
    "#postModal, #postFormModal"
  )?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        event.currentTarget
      ) {

        closePostForm();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      )
        return;


      closePostForm();

    }
  );

}


/* ==================================================
   POST FORM SUBMIT
================================================== */

function setupPostForm() {

  const form =
    $(
      "#postForm"
    );


  if (!form)
    return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      await savePost(
        form
      );

    }
  );

}


/* ==================================================
   SIDEBAR NAVIGATION
================================================== */

function setupSidebar() {

  const buttons =
    $$(
      "[data-admin-section]"
    );


  const sections =
    $$(
      "[data-section]"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          button.getAttribute(
            "data-admin-section"
          );


        buttons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        sections.forEach(
          section => {

            section.style.display =
              section.getAttribute(
                "data-section"
              ) === target
                ? ""
                : "none";

          }
        );

      }
    );

  });

}


/* ==================================================
   MOBILE SIDEBAR
================================================== */

function setupMobileSidebar() {

  const toggle =
    $(
      "#sidebarToggle, .sidebar-toggle"
    );


  const sidebar =
    $(
      ".admin-sidebar, #adminSidebar"
    );


  if (!toggle || !sidebar)
    return;


  toggle.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


/* ==================================================
   REFRESH BUTTON
================================================== */

function setupRefresh() {

  $$(
    "[data-refresh], #refreshBtn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

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

  });

}


/* ==================================================
   HELPER: TEXT
================================================== */

function setText(
  selector,
  value
) {

  const element =
    $(selector);


  if (element)
    element.textContent =
      value;

}


/* ==================================================
   HELPER: DATE
================================================== */

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
      year:"numeric",
      month:"short",
      day:"numeric"
    }
  );

}


/* ==================================================
   HELPER: ESCAPE HTML
================================================== */

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


/* ==================================================
   HELPER: ESCAPE ATTRIBUTE
================================================== */

function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}


/* ==================================================
   AUTO SLUG
================================================== */

function setupSlug() {

  const title =
    $(
      "[name='title']"
    );


  const slug =
    $(
      "[name='slug']"
    );


  if (!title || !slug)
    return;


  title.addEventListener(
    "input",
    () => {

      if (
        slug.dataset.manual ===
        "true"
      )
        return;


      slug.value =
        createSlug(
          title.value
        );

    }
  );


  slug.addEventListener(
    "input",
    () => {

      slug.dataset.manual =
        "true";

    }
  );

}


/* ==================================================
   CREATE SLUG
================================================== */

function createSlug(
  text
) {

  return String(text)
    .toLowerCase()
    .trim()
    .replace(
      /[^\w\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );

}


/* ==================================================
   CHARACTER COUNTER
================================================== */

function setupCharacterCounters() {

  $$(
    "[maxlength]"
  )
  .forEach(input => {

    const counter =
      document.querySelector(
        `[data-counter-for="${input.name}"]`
      );


    if (!counter)
      return;


    const update =
      () => {

        counter.textContent =
          `${input.value.length}/${input.maxLength}`;

      };


    input.addEventListener(
      "input",
      update
    );


    update();

  });

}


/* ==================================================
   PREVIEW IMAGE
================================================== */

function setupImagePreview() {

  $$(
    "input[type='file']"
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      () => {

        const file =
          input.files?.[0];


        if (
          !file ||
          !file.type.startsWith(
            "image/"
          )
        )
          return;


        const preview =
          document.querySelector(
            `[data-preview-for="${input.name}"]`
          );


        if (!preview)
          return;


        preview.src =
          URL.createObjectURL(
            file
          );


        preview.style.display =
          "block";

      }
    );

  });

}


/* ==================================================
   CONFIRM DELETE LINKS
================================================== */

function setupDeleteConfirmations() {

  $$(
    "[data-confirm-delete]"
  )
  .forEach(element => {

    element.addEventListener(
      "click",
      event => {

        const message =
          element.getAttribute(
            "data-confirm-delete"
          ) ||
          "Are you sure you want to delete this item?";


        if (
          !confirm(message)
        ) {

          event.preventDefault();

        }

      }
    );

  });

}


/* ==================================================
   PREVENT DOUBLE SUBMIT
================================================== */

function preventDoubleSubmit() {

  $$(
    "form"
  )
  .forEach(form => {

    form.addEventListener(
      "submit",
      event => {

        if (
          form.dataset.submitting ===
          "true"
        ) {

          event.preventDefault();

          return;

        }


        form.dataset.submitting =
          "true";


        setTimeout(
          () => {

            form.dataset.submitting =
              "false";

          },
          5000
        );

      }
    );

  });

}


/* ==================================================
   INITIALIZE
================================================== */

async function initializeAdmin() {

  initSupabase();


  if (!supabaseClient)
    return;


  setupLoginForm();

  setupLogout();

  setupAuthListener();

  setupGalleryForm();

  setupPDFUpload();

  setupPostForm();

  setupModals();

  setupSidebar();

  setupMobileSidebar();

  setupRefresh();

  setupPostSearch();

  setupPostFilter();

  setupSlug();

  setupCharacterCounters();

  setupImagePreview();

  setupDeleteConfirmations();

  preventDoubleSubmit();


  await checkAuth();

}


/* ==================================================
   DOM READY
================================================== */

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


/* ==================================================
   GLOBAL EXPORTS
================================================== */

window.GSAAdmin = {

  login:
    loginAdmin,

  logout:
    logoutAdmin,

  loadDashboard:
    loadDashboard,

  loadPosts:
    loadPosts,

  loadGallery:
    loadGallery,

  openPostForm:
    openPostForm,

  closePostForm:
    closePostForm,

  editPost:
    editPost,

  deletePost:
    deletePost,

  deleteGallery:
    deleteGallery,

  uploadPDF:
    uploadPDF,

  uploadGalleryImage:
    uploadGalleryImage,

  updatePostStatus:
    updatePostStatus

};


/* ==================================================
   END
================================================== */
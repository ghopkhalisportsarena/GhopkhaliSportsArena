/* =========================================================
   GHOPKHALI SPORTS ARENA
   FINAL ADMIN CMS
   Login + Session Protection
   Dashboard + Notices + Fixtures + Gallery
   Supabase
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    if (!window.supabase) {
        alert("Supabase library is not loaded.");
        return;
    }

    const SUPABASE_URL =
        "https://cmygmswzokyrmgdnuszq.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = id =>
        document.getElementById(id);


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatDate(value) {

        if (!value) {
            return "No date";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "No date";
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function showError(error) {

        console.error(error);

        alert(
            error?.message ||
            "Something went wrong."
        );

    }


    /* =====================================================
       AUTH ELEMENTS
    ===================================================== */

    const loginScreen =
        $("loginScreen");

    const dashboardScreen =
        $("dashboardScreen");

    const loginForm =
        $("gsaAdminLoginForm");

    const emailInput =
        $("gsaAdminEmail");

    const passwordInput =
        $("gsaAdminPassword");

    const loginButton =
        $("gsaAdminLoginButton");

    const loginError =
        $("gsaAdminError");

    const loadingScreen =
        $("gsaAdminLoading");


    /* =====================================================
       AUTH UI
    ===================================================== */

    function showLogin() {

        if (loginScreen) {
            loginScreen.hidden = false;
        }

        if (dashboardScreen) {
            dashboardScreen.hidden = true;
        }

    }


    function showDashboard() {

        if (loginScreen) {
            loginScreen.hidden = true;
        }

        if (dashboardScreen) {
            dashboardScreen.hidden = false;
        }

    }


    function showLoading(show) {

        if (!loadingScreen) {
            return;
        }

        loadingScreen.hidden =
            !show;

    }


    function setLoginError(message) {

        if (!loginError) {
            return;
        }

        loginError.textContent =
            message || "";

    }


    /* =====================================================
       SESSION PROTECTION
    ===================================================== */

    const {
        data: {
            session: currentSession
        },
        error: sessionError
    } =
        await supabaseClient
            .auth
            .getSession();


    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        showLogin();

    } else if (currentSession) {

        showDashboard();

    } else {

        showLogin();

    }

/* =====================================================
   LOGIN
===================================================== */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        setLoginError("");

        const email =
            emailInput?.value.trim() || "";

        const password =
            passwordInput?.value || "";

        if (!email || !password) {

            setLoginError(
                "Please enter your email and password."
            );

            return;
        }

        if (loginButton) {
            loginButton.disabled = true;
        }

        showLoading(true);

        try {

            console.log("Starting login...");

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            console.log("Login response:", data);
            console.log("Login error:", error);

            if (error) {
                throw error;
            }

            if (!data || !data.session) {
                throw new Error(
                    "Login successful but no session was created."
                );
            }

            console.log(
                "Login successful. Showing dashboard..."
            );

            showDashboard();

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setLoginError(
                error.message ||
                "Invalid email or password."
            );

        } finally {

            showLoading(false);

            if (loginButton) {
                loginButton.disabled = false;
            }

        }

    }
);


/* =====================================================
   AUTH STATE CHANGE
===================================================== */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "AUTH EVENT:",
            event
        );

        if (session) {

            showDashboard();

        } else {

            showLogin();

        }

    }
);

    /* =====================================================
       LOGOUT
    ===================================================== */

    $("logoutButton")
        ?.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await supabaseClient
                        .auth
                        .signOut();

                    showLogin();

                    if (emailInput) {
                        emailInput.value = "";
                    }

                    if (passwordInput) {
                        passwordInput.value = "";
                    }

                } catch (error) {

                    showError(error);

                }

            }
        );


    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar =
        $("adminSidebar");

    const overlay =
        $("adminSidebarOverlay");

    const sidebarToggle =
        $("sidebarToggle");


    function openSidebar() {

        sidebar?.classList.add(
            "active"
        );

        overlay?.classList.add(
            "active"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "active"
        );

        overlay?.classList.remove(
            "active"
        );

    }


    sidebarToggle?.addEventListener(
        "click",
        openSidebar
    );


    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });


    /* =====================================================
       MODALS
    ===================================================== */

    function openModal(modal) {

        if (!modal) {
            console.error(
                "Modal not found."
            );
            return;
        }

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


    function closeModal(modal) {

        if (!modal) {
            return;
        }

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

    }


    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.closest(
                            ".modal"
                        )
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeModal(
                            modal
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            document
                .querySelectorAll(
                    ".modal.active"
                )
                .forEach(
                    modal =>
                        closeModal(
                            modal
                        )
                );

        }
    );


    /* =====================================================
       DASHBOARD COUNTS
    ===================================================== */

    async function countTable(
        table
    ) {

        const {
            count,
            error
        } =
            await supabaseClient
                .from(table)
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                table,
                error
            );

            return 0;

        }


        return count || 0;

    }


    async function loadDashboardCounts() {

        const [
            notices,
            fixtures,
            members,
            friendly
        ] =
            await Promise.all([

                countTable(
                    "notices"
                ),

                countTable(
                    "fixtures"
                ),

                countTable(
                    "membership_applications"
                ),

                countTable(
                    "friendly_applications"
                )

            ]);


        if ($("noticeCount")) {

            $("noticeCount")
                .textContent =
                notices;

        }


        if ($("fixtureCount")) {

            $("fixtureCount")
                .textContent =
                fixtures;

        }


        if ($("memberCount")) {

            $("memberCount")
                .textContent =
                members;

        }


        if ($("applicationCount")) {

            $("applicationCount")
                .textContent =
                members +
                friendly;

        }

    }

/* =====================================================
   NOTICES
   GSA PREMIUM NOTICE MANAGEMENT
===================================================== */

let notices = [];
let editingNoticeId = null;


/* =====================================================
   NOTICE ELEMENTS
===================================================== */

const noticeEditor =
    $("noticeEditor");

const noticeEditorTitle =
    $("noticeEditorTitle");

const noticeTitle =
    $("noticeTitle");

const noticeContent =
    $("noticeContent");

const noticeCategory =
    $("noticeCategory");

const noticeImage =
    $("noticeImage");

const noticeImagePreview =
    $("noticeImagePreview");

const noticePreviewImage =
    $("noticePreviewImage");

const removeNoticeImage =
    $("removeNoticeImage");

const noticeImportant =
    $("noticeImportant");

const noticePublished =
    $("noticePublished");

const saveNoticeButton =
    $("saveNoticeButton");

const closeNoticeEditor =
    $("closeNoticeEditor");

const cancelNoticeButton =
    $("cancelNoticeButton");

let currentNoticeImageUrl = "";


/* =====================================================
   LOAD NOTICES
===================================================== */

async function loadNotices() {

    const list =
        $("noticeList");

    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="loading-state">
            Loading notices...
        </div>
    `;


    try {

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
            throw error;
        }


        notices =
            data || [];


        renderNotices();


    } catch (error) {

        console.error(
            "Notice loading error:",
            error
        );


        list.innerHTML = `
            <div class="empty-state">
                Unable to load notices.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;

    }

}


/* =====================================================
   RENDER NOTICES
===================================================== */

function renderNotices() {

    const list =
        $("noticeList");

    if (!list) {
        return;
    }


    const total =
        notices.length;

    const published =
        notices.filter(
            item =>
                item.published === true
        ).length;

    const draft =
        notices.filter(
            item =>
                item.published !== true
        ).length;

    const important =
        notices.filter(
            item =>
                item.important === true
        ).length;


    if ($("noticeTotalCount")) {

        $("noticeTotalCount")
            .textContent =
            total;

    }


    if ($("noticePublishedCount")) {

        $("noticePublishedCount")
            .textContent =
            published;

    }


    if ($("noticeDraftCount")) {

        $("noticeDraftCount")
            .textContent =
            draft;

    }


    if ($("noticeImportantCount")) {

        $("noticeImportantCount")
            .textContent =
            important;

    }


    if (!notices.length) {

        list.innerHTML = `
            <div class="empty-state">
                No notices yet.
            </div>
        `;

        return;

    }


    list.innerHTML =
        notices.map(
            notice => {

                const isPublished =
                    notice.published === true;

                const isImportant =
                    notice.important === true;


                const image =
                    notice.image_url
                        ? `
                            <div class="notice-card-image">
                                <img
                                    src="${escapeHTML(
                                        notice.image_url
                                    )}"
                                    alt="${escapeHTML(
                                        notice.title ||
                                        "Notice"
                                    )}"
                                    loading="lazy"
                                >
                            </div>
                          `
                        : "";


                return `

                <article
                    class="notice-card"
                >

                    ${image}


                    <div
                        class="notice-card-main"
                    >

                        <div>

                            <div
                                class="notice-meta"
                            >

                                <span
                                    class="badge ${
                                        isPublished
                                            ? "published"
                                            : "draft"
                                    }"
                                >
                                    ${
                                        isPublished
                                            ? "● Published"
                                            : "◐ Draft"
                                    }
                                </span>


                                ${
                                    isImportant
                                        ? `
                                            <span
                                                class="badge important"
                                            >
                                                ★ Important
                                            </span>
                                          `
                                        : ""
                                }

                            </div>


                            <div
                                class="content-date"
                            >
                                ${formatDate(
                                    notice.created_at
                                )}
                            </div>


                            <div
                                class="notice-category"
                            >
                                ${escapeHTML(
                                    notice.category ||
                                    "NOTICE"
                                )}
                            </div>


                            <h3>
                                ${escapeHTML(
                                    notice.title ||
                                    "Untitled Notice"
                                )}
                            </h3>


                            <div
                                class="notice-card-content"
                            >
                                ${escapeHTML(
                                    notice.content ||
                                    ""
                                )}
                            </div>

                        </div>

                    </div>


                    <div
                        class="card-actions"
                    >

                        <button
                            type="button"
                            class="small-button"
                            data-notice-action="edit"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="small-button"
                            data-notice-action="publish"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            ${
                                isPublished
                                    ? "Unpublish"
                                    : "Publish"
                            }
                        </button>


                        <button
                            type="button"
                            class="small-button"
                            data-notice-action="important"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            ${
                                isImportant
                                    ? "Remove Important"
                                    : "Important"
                            }
                        </button>


                        <button
                            type="button"
                            class="small-button danger"
                            data-notice-action="delete"
                            data-id="${escapeHTML(
                                notice.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }
        ).join("");

}


/* =====================================================
   OPEN NOTICE EDITOR
===================================================== */

function openNoticeEditor(
    notice = null
) {

    if (!noticeEditor) {
        return;
    }


    editingNoticeId =
        notice?.id || null;


    if (noticeEditorTitle) {

        noticeEditorTitle
            .textContent =
            notice
                ? "Edit Notice"
                : "New Notice";

    }


    if (noticeTitle) {

        noticeTitle.value =
            notice?.title || "";

    }


    if (noticeContent) {

        noticeContent.value =
            notice?.content || "";

    }


    if (noticeCategory) {

        noticeCategory.value =
            notice?.category ||
            "NOTICE";

    }


    if (noticeImportant) {

        noticeImportant.checked =
            notice?.important === true;

    }


    if (noticePublished) {

        noticePublished.checked =
            notice
                ? notice.published === true
                : true;

    }


    currentNoticeImageUrl =
        notice?.image_url || "";


    if (noticeImage) {

        noticeImage.value = "";

    }


    if (
        currentNoticeImageUrl &&
        noticePreviewImage &&
        noticeImagePreview
    ) {

        noticePreviewImage.src =
            currentNoticeImageUrl;

        noticeImagePreview.style.display =
            "block";

    } else {

        hideNoticeImagePreview();

    }


    noticeEditor.style.display =
        "block";


    noticeEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================================
   CLOSE NOTICE EDITOR
===================================================== */

function closeNoticeEditorForm() {

    editingNoticeId =
        null;

    currentNoticeImageUrl =
        "";


    if (noticeTitle) {
        noticeTitle.value = "";
    }


    if (noticeContent) {
        noticeContent.value = "";
    }


    if (noticeCategory) {
        noticeCategory.value = "NOTICE";
    }


    if (noticeImportant) {
        noticeImportant.checked = false;
    }


    if (noticePublished) {
        noticePublished.checked = true;
    }


    if (noticeImage) {
        noticeImage.value = "";
    }


    hideNoticeImagePreview();


    if (noticeEditor) {

        noticeEditor.style.display =
            "none";

    }

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function hideNoticeImagePreview() {

    if (noticeImagePreview) {

        noticeImagePreview.style.display =
            "none";

    }


    if (noticePreviewImage) {

        noticePreviewImage.src =
            "";

    }

}


/* =====================================================
   SELECT IMAGE
===================================================== */

noticeImage
    ?.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {

                if (!currentNoticeImageUrl) {
                    hideNoticeImagePreview();
                }

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                noticeImage.value = "";

                return;

            }


            const maxSize =
                6 * 1024 * 1024;


            if (file.size > maxSize) {

                alert(
                    "Image must be smaller than 6 MB."
                );

                noticeImage.value = "";

                return;

            }


            const previewUrl =
                URL.createObjectURL(
                    file
                );


            if (noticePreviewImage) {

                noticePreviewImage.src =
                    previewUrl;

            }


            if (noticeImagePreview) {

                noticeImagePreview.style.display =
                    "block";

            }

        }
    );


/* =====================================================
   REMOVE IMAGE
===================================================== */

removeNoticeImage
    ?.addEventListener(
        "click",
        () => {

            currentNoticeImageUrl =
                "";

            if (noticeImage) {
                noticeImage.value = "";
            }

            hideNoticeImagePreview();

        }
    );


/* =====================================================
   NEW NOTICE
===================================================== */

$("newNoticeButton")
    ?.addEventListener(
        "click",
        () => {

            openNoticeEditor();

        }
    );


/* =====================================================
   CANCEL NOTICE
===================================================== */

closeNoticeEditor
    ?.addEventListener(
        "click",
        () => {

            closeNoticeEditorForm();

        }
    );


cancelNoticeButton
    ?.addEventListener(
        "click",
        () => {

            closeNoticeEditorForm();

        }
    );


/* =====================================================
   UPLOAD NOTICE IMAGE
===================================================== */

async function uploadNoticeImage(
    file
) {

    if (!file) {
        return null;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const safeExtension =
        [
            "jpg",
            "jpeg",
            "png",
            "webp"
        ].includes(extension)
            ? extension
            : "jpg";


    const randomPart =
        Math.random()
            .toString(36)
            .substring(2, 10);


    const filePath =
        `notices/${Date.now()}_${randomPart}.${safeExtension}`;


    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from("notice-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType:
                        file.type
                }
            );


    if (error) {
        throw error;
    }


    const {
        data: publicData
    } =
        supabaseClient
            .storage
            .from("notice-images")
            .getPublicUrl(
                data.path
            );


    return (
        publicData?.publicUrl ||
        null
    );

}


/* =====================================================
   SAVE NOTICE
===================================================== */

saveNoticeButton
    ?.addEventListener(
        "click",
        async () => {

            const title =
                noticeTitle
                    ?.value
                    .trim() || "";


            const content =
                noticeContent
                    ?.value
                    .trim() || "";


            const category =
                noticeCategory
                    ?.value
                    .trim() ||
                "NOTICE";


            const published =
                noticePublished
                    ?.checked ??
                true;


            const important =
                noticeImportant
                    ?.checked ??
                false;


            const selectedFile =
                noticeImage
                    ?.files?.[0] ||
                null;


            if (!title) {

                alert(
                    "Please enter the notice title."
                );

                noticeTitle?.focus();

                return;

            }


            if (!content) {

                alert(
                    "Please enter the notice content."
                );

                noticeContent?.focus();

                return;

            }


            try {

                if (saveNoticeButton) {

                    saveNoticeButton.disabled =
                        true;

                    saveNoticeButton.textContent =
                        "Saving...";

                }


                let imageUrl =
                    currentNoticeImageUrl ||
                    null;


                /* -------------------------------------
                   UPLOAD NEW IMAGE
                ------------------------------------- */

                if (selectedFile) {

                    imageUrl =
                        await uploadNoticeImage(
                            selectedFile
                        );

                }


                const payload = {

                    title,

                    content,

                    category,

                    image_url:
                        imageUrl,

                    published,

                    important,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                let response;


                /* -------------------------------------
                   UPDATE
                ------------------------------------- */

                if (editingNoticeId) {

                    response =
                        await supabaseClient
                            .from("notices")
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                editingNoticeId
                            );

                }

                /* -------------------------------------
                   INSERT
                ------------------------------------- */

                else {

                    response =
                        await supabaseClient
                            .from("notices")
                            .insert([
                                payload
                            ]);

                }


                if (response.error) {

                    throw response.error;

                }


                closeNoticeEditorForm();


                await loadNotices();


                if (
                    typeof loadDashboardCounts ===
                    "function"
                ) {

                    await loadDashboardCounts();

                }


                alert(
                    editingNoticeId
                        ? "Notice updated successfully."
                        : "Notice created successfully."
                );


            } catch (error) {

                console.error(
                    "Notice save error:",
                    error
                );


                showError(error);


            } finally {

                if (saveNoticeButton) {

                    saveNoticeButton.disabled =
                        false;

                    saveNoticeButton.textContent =
                        "Save Notice";

                }

            }

        }
    );


/* =====================================================
   NOTICE ACTIONS
===================================================== */

$("noticeList")
    ?.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-notice-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const notice =
                notices.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!notice) {
                return;
            }


            const action =
                button.dataset.noticeAction;


            /* -----------------------------------------
               EDIT
            ----------------------------------------- */

            if (
                action ===
                "edit"
            ) {

                openNoticeEditor(
                    notice
                );

                return;

            }


            /* -----------------------------------------
               PUBLISH / UNPUBLISH
            ----------------------------------------- */

            if (
                action ===
                "publish"
            ) {

                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("notices")
                            .update({
                                published:
                                    notice.published !== true,

                                updated_at:
                                    new Date()
                                        .toISOString()
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {
                        throw error;
                    }


                    await loadNotices();


                } catch (error) {

                    showError(error);

                }


                return;

            }


            /* -----------------------------------------
               IMPORTANT
            ----------------------------------------- */

            if (
                action ===
                "important"
            ) {

                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("notices")
                            .update({
                                important:
                                    notice.important !== true,

                                updated_at:
                                    new Date()
                                        .toISOString()
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {
                        throw error;
                    }


                    await loadNotices();


                } catch (error) {

                    showError(error);

                }


                return;

            }


            /* -----------------------------------------
               DELETE
            ----------------------------------------- */

            if (
                action ===
                "delete"
            ) {

                const confirmed =
                    confirm(
                        `Delete "${notice.title}"?`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("notices")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {
                        throw error;
                    }


                    await loadNotices();


                    if (
                        typeof loadDashboardCounts ===
                        "function"
                    ) {

                        await loadDashboardCounts();

                    }


                } catch (error) {

                    showError(error);

                }

            }

        }
    );

    /* =====================================================
       FIXTURES
    ===================================================== */

    let fixtures = [];


    async function loadFixtures() {

        const list =
            $("fixtureList");

        if (!list) {
            return;
        }


        list.innerHTML =
            `<div class="loading-state">
                Loading fixtures...
             </div>`;


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


        if (error) {

            console.error(
                "Fixtures:",
                error
            );

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load fixtures.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
                 </div>`;

            return;

        }


        fixtures =
            data || [];


        renderFixtures();

    }


    function renderFixtures() {

        const list =
            $("fixtureList");

        if (!list) {
            return;
        }


        if (!fixtures.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No fixtures found.
                 </div>`;

            return;

        }


        list.innerHTML =
            fixtures.map(
                item => {

                    const published =
                        item.published !== false;


                    return `

                    <article class="content-card">

                        <div class="content-card-top">

                            <div>

                                <div class="notice-meta">

                                    <span class="badge">
                                        ${escapeHTML(
                                            item.type ||
                                            "MATCH"
                                        )}
                                    </span>


                                    <span class="badge ${
                                        published
                                            ? "published"
                                            : "draft"
                                    }">

                                        ${
                                            published
                                                ? "Published"
                                                : "Draft"
                                        }

                                    </span>

                                </div>


                                <h3>

                                    ${escapeHTML(
                                        item.home_team ||
                                        "Home Team"
                                    )}

                                    <span>
                                        VS
                                    </span>

                                    ${escapeHTML(
                                        item.away_team ||
                                        "Away Team"
                                    )}

                                </h3>


                                <p>
                                    ${escapeHTML(
                                        item.venue ||
                                        "Venue TBA"
                                    )}
                                </p>

                            </div>


                            <div class="content-date">

                                ${formatDate(
                                    item.match_date
                                )}

                                ${
                                    item.match_time
                                        ? `
                                        <br>
                                        ${escapeHTML(
                                            String(
                                                item.match_time
                                            ).slice(
                                                0,
                                                5
                                            )
                                        )}
                                        `
                                        : ""
                                }

                            </div>

                        </div>


                        <div class="card-actions">

                            <button
                                type="button"
                                class="small-button"
                                data-fixture-action="edit"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="small-button"
                                data-fixture-action="publish"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                ${
                                    published
                                        ? "Unpublish"
                                        : "Publish"
                                }
                            </button>


                            <button
                                type="button"
                                class="small-button danger"
                                data-fixture-action="delete"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    </article>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       FIXTURE FORM
    ===================================================== */

    function openFixtureForm(
        item = null
    ) {

        const form =
            $("fixtureForm");


        if (!form) {

            console.error(
                "fixtureForm not found."
            );

            alert(
                "Fixture form is missing from admin.html."
            );

            return;

        }


        form.reset();


        if ($("fixtureId")) {

            $("fixtureId").value =
                item?.id || "";

        }


        if ($("fixtureHome")) {

            $("fixtureHome").value =
                item?.home_team || "";

        }


        if ($("fixtureAway")) {

            $("fixtureAway").value =
                item?.away_team || "";

        }


        if ($("fixtureDate")) {

            $("fixtureDate").value =
                item?.match_date || "";

        }


        if ($("fixtureTime")) {

            $("fixtureTime").value =
                item?.match_time
                    ? String(
                        item.match_time
                    ).slice(
                        0,
                        5
                    )
                    : "";

        }


        if ($("fixtureVenue")) {

            $("fixtureVenue").value =
                item?.venue || "";

        }


        if ($("fixtureType")) {

            $("fixtureType").value =
                item?.type ||
                "FRIENDLY MATCH";

        }


        if ($("fixturePublished")) {

            $("fixturePublished").checked =
                item
                    ? item.published !== false
                    : true;

        }


        const modal =
            $("fixtureModal");


        if (!modal) {

            console.error(
                "fixtureModal not found."
            );

            alert(
                "Fixture modal is missing from admin.html."
            );

            return;

        }


        const title =
            modal.querySelector("h2");


        if (title) {

            title.textContent =
                item
                    ? "Edit Fixture"
                    : "Add Fixture";

        }


        openModal(
            modal
        );

    }


    /* =====================================================
       ADD FIXTURE BUTTON
    ===================================================== */

    $("newFixtureButton")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openFixtureForm();

            }
        );


    /* =====================================================
       FIXTURE SAVE
    ===================================================== */

    $("fixtureForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("fixtureId")
                        ?.value
                        .trim() || "";


                const home =
                    $("fixtureHome")
                        ?.value
                        .trim() || "";


                const away =
                    $("fixtureAway")
                        ?.value
                        .trim() || "";


                const date =
                    $("fixtureDate")
                        ?.value || "";


                const time =
                    $("fixtureTime")
                        ?.value ||
                    null;


                const venue =
                    $("fixtureVenue")
                        ?.value
                        .trim() ||
                    null;


                const type =
                    $("fixtureType")
                        ?.value ||
                    "FRIENDLY MATCH";


                const published =
                    $("fixturePublished")
                        ?.checked !== false;


                if (
                    !home ||
                    !away ||
                    !date
                ) {

                    alert(
                        "Please enter Home Team, Away Team and Date."
                    );

                    return;

                }


                const payload = {

                    home_team:
                        home,

                    away_team:
                        away,

                    match_date:
                        date,

                    match_time:
                        time,

                    venue:
                        venue,

                    type:
                        type,

                    published:
                        published

                };


                try {

                    let response;


                    if (id) {

                        response =
                            await supabaseClient
                                .from("fixtures")
                                .update(payload)
                                .eq(
                                    "id",
                                    id
                                );

                    } else {

                        response =
                            await supabaseClient
                                .from("fixtures")
                                .insert([
                                    payload
                                ]);

                    }


                    if (response.error) {
                        throw response.error;
                    }


                    closeModal(
                        $("fixtureModal")
                    );


                    await loadFixtures();

                    await loadDashboardCounts();


                    alert(
                        id
                            ? "Fixture updated successfully."
                            : "Fixture added successfully."
                    );


                } catch (error) {

                    showError(error);

                }

            }
        );


    /* =====================================================
       FIXTURE ACTIONS
    ===================================================== */

    $("fixtureList")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-fixture-action]"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                const item =
                    fixtures.find(
                        row =>
                            String(row.id) ===
                            String(id)
                    );


                if (!item) {
                    return;
                }


                const action =
                    button.dataset.fixtureAction;


                if (
                    action ===
                    "edit"
                ) {

                    openFixtureForm(
                        item
                    );

                    return;

                }


                if (
                    action ===
                    "publish"
                ) {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("fixtures")
                            .update({
                                published:
                                    item.published === false
                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        showError(error);

                        return;

                    }


                    await loadFixtures();

                    return;

                }


                if (
                    action ===
                    "delete"
                ) {

                    if (
                        !confirm(
                            "Delete this fixture?"
                        )
                    ) {
                        return;
                    }


                    const {
                        error
                    } =
                        await supabaseClient
                            .from("fixtures")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        showError(error);

                        return;

                    }


                    await loadFixtures();

                    await loadDashboardCounts();

                }

            }
        );


/* =====================================================
   TOURNAMENTS
===================================================== */

let tournaments = [];


/* =====================================================
   LOAD TOURNAMENTS
===================================================== */

async function loadTournaments() {

    const list =
        $("tournamentList");

    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="loading-state">
            Loading tournaments...
        </div>
    `;


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
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Tournament loading error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">

                Unable to load tournaments.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>
        `;

        return;
    }


    tournaments =
        data || [];


    renderTournaments();

}


/* =====================================================
   RENDER TOURNAMENTS
===================================================== */

function renderTournaments() {

    const list =
        $("tournamentList");

    if (!list) {
        return;
    }


    if (!tournaments.length) {

        list.innerHTML = `
            <div class="empty-state">
                No tournaments found.
            </div>
        `;

        return;
    }


    list.innerHTML =
        tournaments
            .map(
                tournament => {

                    const published =
                        tournament.published === true;


                    return `

                    <article class="content-card">

                        <div class="content-card-top">

                            <div>

                                <div class="notice-meta">

                                    <span class="badge">
                                        ${escapeHTML(
                                            tournament.status ||
                                            "UPCOMING"
                                        )}
                                    </span>


                                    <span class="badge ${
                                        published
                                            ? "published"
                                            : "draft"
                                    }">

                                        ${
                                            published
                                                ? "Published"
                                                : "Draft"
                                        }

                                    </span>

                                </div>


                                <h3>
                                    ${escapeHTML(
                                        tournament.name
                                    )}
                                </h3>


                                ${
                                    tournament.season
                                        ? `
                                        <p>
                                            ${escapeHTML(
                                                tournament.season
                                            )}
                                        </p>
                                        `
                                        : ""
                                }


                                ${
                                    tournament.venue
                                        ? `
                                        <p>
                                            ${escapeHTML(
                                                tournament.venue
                                            )}
                                        </p>
                                        `
                                        : ""
                                }


                                ${
                                    tournament.date_details
                                        ? `
                                        <p>
                                            ${escapeHTML(
                                                tournament.date_details
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                            </div>


                            <div class="content-date">

                                ${formatDate(
                                    tournament.created_at
                                )}

                            </div>

                        </div>


                        <div class="card-actions">

                            <button
                                type="button"
                                class="small-button"
                                data-tournament-action="edit"
                                data-id="${escapeHTML(
                                    tournament.id
                                )}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="small-button"
                                data-tournament-action="publish"
                                data-id="${escapeHTML(
                                    tournament.id
                                )}"
                            >

                                ${
                                    published
                                        ? "Unpublish"
                                        : "Publish"
                                }

                            </button>


                            <button
                                type="button"
                                class="small-button danger"
                                data-tournament-action="delete"
                                data-id="${escapeHTML(
                                    tournament.id
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    </article>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   OPEN TOURNAMENT FORM
===================================================== */

function openTournamentForm(
    tournament = null
) {

    const form =
        $("tournamentForm");

    const modal =
        $("tournamentModal");


    if (!form || !modal) {

        alert(
            "Tournament form is missing."
        );

        return;
    }


    form.reset();


    $("tournamentId").value =
        tournament?.id || "";


    $("tournamentName").value =
        tournament?.name || "";


    $("tournamentSeason").value =
        tournament?.season || "";


    $("tournamentStatus").value =
        tournament?.status ||
        "UPCOMING";


    $("tournamentVenue").value =
        tournament?.venue || "";


    $("tournamentDate").value =
        tournament?.date_details || "";


    $("tournamentDescription").value =
        tournament?.description || "";


    $("tournamentPublished").checked =
        tournament
            ? tournament.published === true
            : true;


    $("tournamentModalTitle")
        .textContent =
        tournament
            ? "Edit Tournament"
            : "Add Tournament";


    openModal(modal);

}


/* =====================================================
   ADD TOURNAMENT
===================================================== */

$("newTournamentButton")
    ?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openTournamentForm();

        }
    );


/* =====================================================
   SAVE TOURNAMENT + POSTER UPLOAD
===================================================== */

$("tournamentForm")
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const id =
                $("tournamentId")
                    ?.value
                    .trim() || "";

            const name =
                $("tournamentName")
                    ?.value
                    .trim() || "";

            const season =
                $("tournamentSeason")
                    ?.value
                    .trim() || null;

            const status =
                $("tournamentStatus")
                    ?.value ||
                "UPCOMING";

            const venue =
                $("tournamentVenue")
                    ?.value
                    .trim() || null;

            const dateDetails =
                $("tournamentDate")
                    ?.value
                    .trim() || null;

            const description =
                $("tournamentDescription")
                    ?.value
                    .trim() || null;

            const published =
                $("tournamentPublished")
                    ?.checked === true;

            const posterInput =
                $("tournamentPoster");

            const posterFile =
                posterInput?.files?.[0] || null;


            if (!name) {

                alert(
                    "Please enter tournament name."
                );

                return;
            }


            try {

                showLoading(true);


                /* =====================================
                   UPLOAD POSTER
                ===================================== */

                let imageURL = null;


                if (posterFile) {

                    if (
                        !posterFile.type.startsWith(
                            "image/"
                        )
                    ) {

                        throw new Error(
                            "Please select a valid image."
                        );

                    }


                    const extension =
                        posterFile.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const filename =
                        `${Date.now()}-${crypto.randomUUID()}.${extension}`;


                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "tournament-posters"
                            )
                            .upload(
                                filename,
                                posterFile,
                                {
                                    cacheControl:
                                        "3600",

                                    upsert:
                                        false
                                }
                            );


                    if (uploadError) {
                        throw uploadError;
                    }


                    const {
                        data:
                            publicData
                    } =
                        supabaseClient
                            .storage
                            .from(
                                "tournament-posters"
                            )
                            .getPublicUrl(
                                filename
                            );


                    imageURL =
                        publicData.publicUrl;

                }


                /* =====================================
                   DATABASE PAYLOAD
                ===================================== */

                const payload = {

                    name,

                    season,

                    status,

                    venue,

                    date_details:
                        dateDetails,

                    description,

                    published,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                /*
                 * Only change image_url when
                 * a new poster was selected.
                 */

                if (imageURL) {

                    payload.image_url =
                        imageURL;

                }


                /* =====================================
                   INSERT / UPDATE
                ===================================== */

                let response;


                if (id) {

                    response =
                        await supabaseClient
                            .from("tournaments")
                            .update(payload)
                            .eq(
                                "id",
                                id
                            );

                } else {

                    response =
                        await supabaseClient
                            .from("tournaments")
                            .insert([
                                payload
                            ]);

                }


                if (response.error) {
                    throw response.error;
                }


                /* =====================================
                   RESET + CLOSE
                ===================================== */

                closeModal(
                    $("tournamentModal")
                );


                if (posterInput) {
                    posterInput.value = "";
                }


                if ($("tournamentPosterPreview")) {

                    $("tournamentPosterPreview")
                        .style.display =
                        "none";

                }


                if (
                    $("tournamentPosterPreviewImage")
                ) {

                    $("tournamentPosterPreviewImage")
                        .src = "";

                }


                await loadTournaments();


                alert(
                    id
                        ? "Tournament updated successfully."
                        : "Tournament added successfully."
                );


            } catch (error) {

                console.error(
                    "Tournament save error:",
                    error
                );

                showError(error);

            } finally {

                showLoading(false);

            }

        }
    );

/* =====================================================
   TOURNAMENT ACTIONS
===================================================== */

$("tournamentList")
    ?.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-tournament-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const tournament =
                tournaments.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!tournament) {
                return;
            }


            const action =
                button.dataset.tournamentAction;


            /* EDIT */

            if (
                action ===
                "edit"
            ) {

                openTournamentForm(
                    tournament
                );

                return;
            }


            /* PUBLISH / UNPUBLISH */

            if (
                action ===
                "publish"
            ) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("tournaments")
                        .update({

                            published:
                                !tournament.published,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            id
                        );


                if (error) {

                    showError(error);

                    return;
                }


                await loadTournaments();

                return;
            }


            /* DELETE */

            if (
                action ===
                "delete"
            ) {

                const confirmed =
                    confirm(
                        `Delete "${tournament.name}"?`
                    );


                if (!confirmed) {
                    return;
                }


                const {
                    error
                } =
                    await supabaseClient
                        .from("tournaments")
                        .delete()
                        .eq(
                            "id",
                            id
                        );


                if (error) {

                    showError(error);

                    return;
                }


                await loadTournaments();

            }

        }
    );

    /* =====================================================
       GALLERY
    ===================================================== */

    async function loadGallery() {

        const list =
            $("galleryList");

        if (!list) {
            return;
        }


        list.innerHTML =
            `<div class="loading-state">
                Loading photos...
             </div>`;


        const {
            data,
            error
        } =
            await supabaseClient
                .storage
                .from("gallery")
                .list(
                    "",
                    {
                        limit: 100,
                        sortBy: {
                            column:
                                "created_at",
                            order:
                                "desc"
                        }
                    }
                );


        if (error) {

            console.error(
                "Gallery:",
                error
            );

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load gallery.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
                 </div>`;

            return;

        }


        const files =
            (data || [])
                .filter(
                    file =>
                        file.name &&
                        file.name !==
                        ".emptyFolderPlaceholder"
                );


        if (!files.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No photos uploaded yet.
                 </div>`;

            return;

        }


        list.innerHTML =
            files.map(
                file => {

                    const {
                        data:
                            publicData
                    } =
                        supabaseClient
                            .storage
                            .from("gallery")
                            .getPublicUrl(
                                file.name
                            );


                    return `

                    <article
                        class="gallery-admin-card">

                        <img
                            src="${escapeHTML(
                                publicData.publicUrl
                            )}"
                            alt="GSA Gallery"
                            loading="lazy"
                        >


                        <button
                            type="button"
                            class="gallery-delete"
                            data-gallery-delete="${escapeHTML(
                                file.name
                            )}"
                            aria-label="Delete photo"
                        >
                            ×
                        </button>

                    </article>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       GALLERY UPLOAD
    ===================================================== */

    $("galleryUpload")
        ?.addEventListener(
            "change",
            async event => {

                const files =
                    Array.from(
                        event.target.files || []
                    );


                if (!files.length) {
                    return;
                }


                showLoading(true);


                try {

                    for (
                        const file
                        of files
                    ) {

                        if (
                            !file.type.startsWith(
                                "image/"
                            )
                        ) {

                            continue;

                        }


                        const extension =
                            file.name
                                .split(".")
                                .pop()
                                .toLowerCase();


                        const filename =
                            `${Date.now()}-${crypto.randomUUID()}.${extension}`;


                        const {
                            error
                        } =
                            await supabaseClient
                                .storage
                                .from("gallery")
                                .upload(
                                    filename,
                                    file,
                                    {
                                        cacheControl:
                                            "3600",
                                        upsert:
                                            false
                                    }
                                );


                        if (error) {
                            throw error;
                        }


                        /*
                         * Gallery database table is optional.
                         * Storage remains the main image source.
                         */

                    }


                    event.target.value =
                        "";


                    await loadGallery();


                    alert(
                        "Photo uploaded successfully."
                    );


                } catch (error) {

                    showError(error);

                } finally {

                    showLoading(false);

                }

            }
        );


    /* =====================================================
       GALLERY DELETE
    ===================================================== */

    $("galleryList")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-gallery-delete]"
                    );


                if (!button) {
                    return;
                }


                const filename =
                    button.dataset.galleryDelete;


                if (
                    !confirm(
                        "Delete this photo?"
                    )
                ) {
                    return;
                }


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .storage
                            .from("gallery")
                            .remove([
                                filename
                            ]);


                    if (error) {
                        throw error;
                    }


                    await loadGallery();


                } catch (error) {

                    showError(error);

                }

            }
        );

   /* =====================================================
   MEMBERSHIP APPLICATIONS
===================================================== */

let membershipApplications = [];


/* =====================================================
   LOAD MEMBERSHIP APPLICATIONS
===================================================== */

async function loadMembershipApplications() {

    const list = $("membershipList");

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="empty-state">
            Loading membership applications...
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("membership_applications")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        membershipApplications = data || [];

        renderMembershipApplications();

    } catch (error) {

        console.error(
            "Membership applications error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Failed to load membership applications.
            </div>
        `;
    }
}


/* =====================================================
   RENDER MEMBERSHIP APPLICATIONS
===================================================== */

function renderMembershipApplications() {

    const list = $("membershipList");

    if (!list) {
        return;
    }

    if (!membershipApplications.length) {

        list.innerHTML = `
            <div class="empty-state">
                No membership applications.
            </div>
        `;

        return;
    }

    list.innerHTML =
        membershipApplications.map(application => {

            const name =
                application.full_name_en ||
                application.full_name_bn ||
                "Unnamed Applicant";

            const phone =
                application.mobile_number ||
                "No phone";

            const sport =
                application.sports ||
                "Not specified";

            const status =
                application.status ||
                "pending";

            const statusClass =
                status.toLowerCase();

            return `

                <div class="application-card">

                    <div class="application-card-info">

                        <h4>
                            ${escapeHTML(name)}
                        </h4>

                        <p>
                            <strong>Phone:</strong>
                            ${escapeHTML(phone)}
                        </p>

                        <p>
                            <strong>Sport:</strong>
                            ${escapeHTML(sport)}
                        </p>

                        <p>
                            <strong>Submitted:</strong>
                            ${formatDate(
                                application.created_at
                            )}
                        </p>

                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(
                                status.toUpperCase()
                            )}
                        </span>

                    </div>

                    <div class="card-actions">

                        <button
                            type="button"
                            class="small-button"
                            data-membership-action="view"
                            data-id="${escapeHTML(
                                application.id
                            )}"
                        >
                            View Application
                        </button>

                        <button
                            type="button"
                            class="small-button danger"
                            data-membership-action="delete"
                            data-id="${escapeHTML(
                                application.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


/* =====================================================
   MEMBERSHIP ACTIONS
===================================================== */

document.addEventListener("click", async (event) => {

    const button =
        event.target.closest(
            "[data-membership-action]"
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.membershipAction;

    const id =
        button.dataset.id;

    const application =
        membershipApplications.find(
            item => item.id === id
        );

    if (!application) {
        return;
    }


    /* VIEW */

    if (action === "view") {

        openMembershipApplication(
            application
        );

        return;
    }


    /* DELETE */

    if (action === "delete") {

        const confirmed =
            confirm(
                "Are you sure you want to delete this membership application?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const {
                error
            } = await supabaseClient
                .from("membership_applications")
                .delete()
                .eq("id", id);

            if (error) {
                throw error;
            }

            membershipApplications =
                membershipApplications.filter(
                    item => item.id !== id
                );

            renderMembershipApplications();

            await loadDashboardCounts();

            alert(
                "Membership application deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete membership error:",
                error
            );

            alert(
                "Failed to delete membership application."
            );
        }
    }

});


/* =====================================================
   OPEN MEMBERSHIP APPLICATION
===================================================== */

function openMembershipApplication(application) {

    const modal = $("applicationModal");
    const title = $("applicationModalTitle");
    const details = $("applicationDetails");

    if (!modal || !title || !details) {
        return;
    }

    const status =
        application.status || "pending";

    title.textContent =
        "Membership Application";

    details.innerHTML = `

        <div class="application-details">

            <div class="detail-group">

                <h3>Personal Information</h3>

                <p>
                    <strong>Full Name (Bangla):</strong><br>
                    ${escapeHTML(application.full_name_bn || "—")}
                </p>

                <p>
                    <strong>Full Name (English):</strong><br>
                    ${escapeHTML(application.full_name_en || "—")}
                </p>

                <p>
                    <strong>Father's Name:</strong><br>
                    ${escapeHTML(application.father_name || "—")}
                </p>

                <p>
                    <strong>Mother's Name:</strong><br>
                    ${escapeHTML(application.mother_name || "—")}
                </p>

                <p>
                    <strong>Date of Birth:</strong><br>
                    ${escapeHTML(application.date_of_birth || "—")}
                </p>

                <p>
                    <strong>Blood Group:</strong><br>
                    ${escapeHTML(application.blood_group || "—")}
                </p>

                <p>
                    <strong>Profession:</strong><br>
                    ${escapeHTML(application.profession || "—")}
                </p>

                <p>
                    <strong>NID / Birth Registration:</strong><br>
                    ${escapeHTML(application.nid_birth_registration || "—")}
                </p>

            </div>


            <div class="detail-group">

                <h3>Contact Information</h3>

                <p>
                    <strong>Mobile:</strong><br>
                    ${escapeHTML(application.mobile_number || "—")}
                </p>

                <p>
                    <strong>Alternative Mobile:</strong><br>
                    ${escapeHTML(application.alternative_mobile_number || "—")}
                </p>

                <p>
                    <strong>Email:</strong><br>
                    ${escapeHTML(application.email || "—")}
                </p>

            </div>


            <div class="detail-group">

                <h3>Address</h3>

                <p>
                    <strong>Current Address:</strong><br>
                    ${escapeHTML(application.current_address || "—")}
                </p>

                <p>
                    <strong>Permanent Address:</strong><br>
                    ${escapeHTML(application.permanent_address || "—")}
                </p>

            </div>


            <div class="detail-group">

                <h3>Sports Information</h3>

                <p>
                    <strong>Sports:</strong><br>
                    ${escapeHTML(application.sports || "—")}
                </p>

                <p>
                    <strong>Other Sports:</strong><br>
                    ${escapeHTML(application.other_sports || "—")}
                </p>

            </div>


            <div class="detail-group">

                <h3>Additional Information</h3>

                <p>
                    <strong>Message:</strong><br>
                    ${escapeHTML(application.message || "—")}
                </p>

                <p>
                    <strong>Submitted:</strong><br>
                    ${formatDate(application.created_at)}
                </p>

                <p>
                    <strong>Status:</strong><br>

                    <span class="status-badge ${escapeHTML(status.toLowerCase())}">
                        ${escapeHTML(status.toUpperCase())}
                    </span>

                </p>

            </div>


            <div class="card-actions">

                <button
                    type="button"
                    class="small-button"
                    data-membership-pdf="application"
                    data-id="${escapeHTML(application.id)}">
                    Download Application PDF
                </button>

                ${
                    status.toLowerCase() === "pending"
                    ? `
                        <button
                            type="button"
                            class="small-button"
                            data-membership-decision="approve"
                            data-id="${escapeHTML(application.id)}">
                            Approve
                        </button>

                        <button
                            type="button"
                            class="small-button danger"
                            data-membership-decision="reject"
                            data-id="${escapeHTML(application.id)}">
                            Reject
                        </button>
                    `
                    : ""
                }

            </div>

        </div>

    `;


    openModal(modal);
}


/* =====================================================
   MEMBERSHIP APPROVE / REJECT
===================================================== */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-membership-decision]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.membershipDecision;

        const id =
            button.dataset.id;

        const application =
            membershipApplications.find(
                item => item.id === id
            );

        if (!application) {

            alert(
                "Application not found."
            );

            return;
        }


        let newStatus = "";

        if (action === "approve") {
            newStatus = "approved";
        }

        if (action === "reject") {
            newStatus = "rejected";
        }

        if (!newStatus) {
            return;
        }


        const confirmMessage =
            newStatus === "approved"
                ? "Are you sure you want to approve this membership application?"
                : "Are you sure you want to reject this membership application?";


        if (!confirm(confirmMessage)) {
            return;
        }


        try {

            button.disabled = true;
            button.textContent = "Processing...";


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("membership_applications")
                    .update({
                        status: newStatus,
                        decided_at:
                            new Date().toISOString(),
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq("id", id)
                    .select()
                    .single();


            if (error) {
                throw error;
            }


            const index =
                membershipApplications.findIndex(
                    item => item.id === id
                );


            if (index !== -1) {

                membershipApplications[index] =
                    data;

            }


            renderMembershipApplications();


            await loadDashboardCounts();


            closeModal(
                $("applicationModal")
            );


            alert(
                newStatus === "approved"
                    ? "Membership application approved successfully."
                    : "Membership application rejected successfully."
            );


        } catch (error) {

            console.error(
                "Membership decision error:",
                error
            );


            alert(
                error?.message ||
                "Failed to update membership application."
            );


            button.disabled = false;


            button.textContent =
                newStatus === "approved"
                    ? "Approve"
                    : "Reject";

        }

    }
);

/* =====================================================
   MEMBERSHIP APPLICATION PDF
   LOGO + MEMBER PHOTO
===================================================== */

async function generateMembershipApplicationPDF(application) {

    if (!application) {
        throw new Error("Application data not found.");
    }


    /* =================================================
       IMAGE LOADER
    ================================================= */

    function loadImage(src) {

        return new Promise((resolve) => {

            if (!src) {
                resolve(null);
                return;
            }

            const img = new Image();

            img.crossOrigin = "anonymous";

            img.onload = () => {
                resolve(img);
            };

            img.onerror = () => {

                console.warn(
                    "Image failed to load:",
                    src
                );

                resolve(null);
            };


            const separator =
                src.includes("?")
                    ? "&"
                    : "?";


            img.src =
                src +
                separator +
                "pdf_image=" +
                Date.now();

        });

    }


    /* =================================================
       GSA LOGO
       gsa.png is in repository ROOT
    ================================================= */

    const logoURL =
        `${window.location.origin}/gsa.png`;


    const logoImage =
        await loadImage(
            logoURL
        );


    /* =================================================
       MEMBER PHOTO
       Supabase Storage:
       membership-photos
    ================================================= */

    let memberPhoto = null;


    if (
        application.photo_url &&
        String(
            application.photo_url
        ).trim() !== ""
    ) {

        memberPhoto =
            await loadImage(
                String(
                    application.photo_url
                ).trim()
            );

    }


    console.log(
        "GSA LOGO:",
        logoImage
            ? "LOADED"
            : "NOT LOADED"
    );


    console.log(
        "MEMBER PHOTO:",
        memberPhoto
            ? "LOADED"
            : "NOT AVAILABLE"
    );


    /* =================================================
       SAFE VALUE
    ================================================= */

    const value = (v) => {

        if (
            v === null ||
            v === undefined ||
            String(v).trim() === ""
        ) {

            return "—";

        }

        return String(v);

    };


    /* =================================================
       DATE FORMAT
    ================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }


        const d =
            new Date(date);


        if (
            Number.isNaN(
                d.getTime()
            )
        ) {

            return value(date);

        }


        return d.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    };


    /* =================================================
       MEMBER PHOTO HTML
    ================================================= */

    let photoHTML = `

        <div class="photo-box">

            <div class="photo-placeholder">
                Applicant Photo
            </div>

        </div>

    `;


    if (memberPhoto) {

        photoHTML = `

            <div class="photo-box photo-loaded">

                <img
                    src="${memberPhoto.src}"
                    crossorigin="anonymous"
                    alt="Applicant Photo"
                >

            </div>

        `;

    }


    /* =================================================
       LOGO HTML
    ================================================= */

    let logoHTML = `

        <div class="logo-placeholder">
            GSA
        </div>

    `;


    if (logoImage) {

        logoHTML = `

            <img
                class="gsa-logo"
                src="${logoImage.src}"
                crossorigin="anonymous"
                alt="GSA Logo"
            >

        `;

    }


    /* =================================================
       CREATE PDF CONTAINER
    ================================================= */

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.style.position =
        "fixed";


    wrapper.style.left =
        "-100000px";


    wrapper.style.top =
        "0";


    wrapper.style.width =
        "794px";


    wrapper.style.background =
        "#ffffff";


    wrapper.style.zIndex =
        "-1";


    wrapper.innerHTML = `

<style>

* {
    box-sizing: border-box;
}


.pdf-page {

    width: 794px;

    min-height: 1123px;

    padding:
        42px
        42px
        30px;

    background:
        #ffffff;

    color:
        #172033;

    font-family:
        Arial,
        "Noto Sans Bengali",
        "Noto Sans",
        sans-serif;

    font-size:
        11px;

    line-height:
        1.4;

}


/* =================================================
   HEADER
================================================= */

.header {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        flex-start;

    padding-bottom:
        20px;

    border-bottom:
        1px solid #dfe3e8;

}


.header-left {

    flex:
        1;

}


.club-title {

    font-size:
        25px;

    font-weight:
        800;

    letter-spacing:
        -0.5px;

    margin-bottom:
        3px;

}


.club-title-bn {

    font-size:
        17px;

    font-weight:
        700;

    margin-bottom:
        3px;

}


.established {

    font-size:
        10px;

    color:
        #697386;

}


.header-right {

    width:
        90px;

    height:
        90px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

}


.gsa-logo {

    width:
        82px;

    height:
        82px;

    object-fit:
        contain;

}


.logo-placeholder {

    width:
        82px;

    height:
        82px;

    border:
        1px solid #d9dde3;

    border-radius:
        50%;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    color:
        #7a8290;

    font-weight:
        700;

}


/* =================================================
   DOCUMENT TITLE
================================================= */

.document-title {

    margin-top:
        20px;

    margin-bottom:
        12px;

}


.document-title h1 {

    margin:
        0;

    font-size:
        20px;

    font-weight:
        800;

}


.document-subtitle {

    color:
        #737b89;

    margin-top:
        3px;

    font-size:
        10px;

}


/* =================================================
   META
================================================= */

.meta {

    display:
        flex;

    gap:
        10px;

    margin-bottom:
        14px;

}


.meta-box {

    flex:
        1;

    min-height:
        48px;

    padding:
        9px 11px;

    border:
        1px solid #dfe3e8;

    border-radius:
        9px;

    background:
        #f7f8fa;

}


.meta-label {

    font-size:
        8px;

    color:
        #727b89;

    font-weight:
        700;

    text-transform:
        uppercase;

    margin-bottom:
        3px;

}


.meta-value {

    font-size:
        10px;

    font-weight:
        700;

    word-break:
        break-word;

}


.status {

    display:
        inline-block;

    padding:
        3px 8px;

    border-radius:
        20px;

    background:
        #e8f6ec;

    color:
        #228447;

    font-size:
        8px;

    font-weight:
        800;

    text-transform:
        uppercase;

}


/* =================================================
   SECTION
================================================= */

.section {

    border:
        1px solid #dfe3e8;

    border-radius:
        10px;

    margin-bottom:
        11px;

    overflow:
        hidden;

    background:
        #ffffff;

}


.section-title {

    min-height:
        38px;

    display:
        flex;

    align-items:
        center;

    padding:
        0 14px;

    background:
        #f6f8fb;

    border-bottom:
        1px solid #dfe3e8;

    font-weight:
        800;

    font-size:
        11px;

}


.section-title::before {

    content:
        "";

    width:
        5px;

    height:
        16px;

    border-radius:
        4px;

    background:
        #1683e8;

    margin-right:
        10px;

}


.section-body {

    padding:
        13px 14px;

}


/* =================================================
   PERSONAL INFORMATION
================================================= */

.personal-layout {

    display:
        flex;

    gap:
        18px;

    align-items:
        flex-start;

}


.photo-box {

    width:
        108px;

    height:
        145px;

    flex:
        0 0 108px;

    border:
        1px dashed #cbd1d9;

    border-radius:
        9px;

    overflow:
        hidden;

    background:
        #fafbfc;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

}


.photo-box img {

    width:
        100%;

    height:
        100%;

    object-fit:
        cover;

    display:
        block;

}


.photo-placeholder {

    color:
        #9aa2ad;

    font-size:
        10px;

    text-align:
        center;

}


.personal-table {

    flex:
        1;

    border-collapse:
        collapse;

    table-layout:
        fixed;

    width:
        100%;

}


.personal-table td {

    padding:
        4px 5px;

    vertical-align:
        top;

}


.label {

    color:
        #6e7785;

    font-size:
        8px;

    font-weight:
        700;

    width:
        18%;

}


.data {

    font-size:
        10px;

    font-weight:
        700;

    width:
        32%;

    word-break:
        break-word;

}


/* =================================================
   DATA TABLE
================================================= */

.data-table {

    width:
        100%;

    border-collapse:
        collapse;

    table-layout:
        fixed;

}


.data-table td {

    padding:
        5px 7px;

    vertical-align:
        top;

    width:
        50%;

}


.field-label {

    display:
        block;

    color:
        #727b87;

    font-size:
        8px;

    font-weight:
        700;

    margin-bottom:
        2px;

}


.field-value {

    display:
        block;

    font-size:
        10px;

    font-weight:
        700;

    word-break:
        break-word;

}


/* =================================================
   SPORTS
================================================= */

.sports-box {

    padding:
        8px 10px;

    border:
        1px solid #d9e8f6;

    background:
        #eef7ff;

    border-radius:
        8px;

    font-weight:
        700;

    color:
        #285b8f;

    margin-bottom:
        8px;

}


/* =================================================
   DECLARATION
================================================= */

.declaration {

    padding:
        10px;

    border:
        1px solid #dfe3e8;

    border-radius:
        8px;

    color:
        #596273;

    font-size:
        9px;

    line-height:
        1.5;

    margin-bottom:
        17px;

}


.signatures {

    display:
        flex;

    gap:
        22px;

}


.signature {

    flex:
        1;

    text-align:
        center;

}


.signature-line {

    border-top:
        1px solid #aeb5bf;

    margin-bottom:
        7px;

}


.signature-label {

    color:
        #697386;

    font-size:
        8px;

    font-weight:
        700;

}


/* =================================================
   FOOTER
================================================= */

.footer {

    margin-top:
        10px;

    padding-top:
        8px;

    border-top:
        1px solid #dfe3e8;

    display:
        flex;

    justify-content:
        space-between;

    color:
        #747c88;

    font-size:
        7px;

}

</style>


<div class="pdf-page">


    <!-- HEADER -->

    <div class="header">

        <div class="header-left">

            <div class="club-title">
                GHOPKHALI SPORTS ARENA
            </div>

            <div class="club-title-bn">
                ঘোপখালী স্পোর্টস অ্যারিনা
            </div>

            <div class="established">
                স্থাপিত: ১৯-০৭-২০২৬
            </div>

        </div>


        <div class="header-right">

            ${logoHTML}

        </div>

    </div>


    <!-- TITLE -->

    <div class="document-title">

        <h1>
            CLUB MEMBERSHIP APPLICATION
        </h1>

        <div class="document-subtitle">
            Official Club Membership Application Form
        </div>

    </div>


    <!-- META -->

    <div class="meta">


        <div class="meta-box">

            <div class="meta-label">
                Application ID
            </div>

            <div class="meta-value">
                ${value(application.id)}
            </div>

        </div>


        <div class="meta-box">

            <div class="meta-label">
                Submitted
            </div>

            <div class="meta-value">
                ${formatDate(application.created_at)}
            </div>

        </div>


        <div class="meta-box">

            <div class="meta-label">
                Status
            </div>

            <div class="meta-value">

                <span class="status">
                    ${value(application.status)}
                </span>

            </div>

        </div>


    </div>


    <!-- =================================================
         PERSONAL INFORMATION
    ================================================= -->

    <div class="section">


        <div class="section-title">
            Personal Information
        </div>


        <div class="section-body">


            <div class="personal-layout">


                ${photoHTML}


                <table class="personal-table">


                    <tr>

                        <td class="label">
                            নাম (বাংলা)
                        </td>

                        <td class="data">
                            ${value(
                                application.full_name_bn
                            )}
                        </td>


                        <td class="label">
                            Full Name
                        </td>

                        <td class="data">
                            ${value(
                                application.full_name_en
                            )}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Father's Name
                        </td>

                        <td class="data">
                            ${value(
                                application.father_name
                            )}
                        </td>


                        <td class="label">
                            Mother's Name
                        </td>

                        <td class="data">
                            ${value(
                                application.mother_name
                            )}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Date of Birth
                        </td>

                        <td class="data">
                            ${formatDate(
                                application.date_of_birth
                            )}
                        </td>


                        <td class="label">
                            Blood Group
                        </td>

                        <td class="data">
                            ${value(
                                application.blood_group
                            )}
                        </td>

                    </tr>


                    <tr>

                        <td class="label">
                            Profession
                        </td>

                        <td class="data">
                            ${value(
                                application.profession
                            )}
                        </td>


                        <td class="label">
                            NID / Birth Reg.
                        </td>

                        <td class="data">
                            ${value(
                                application.nid_birth_registration
                            )}
                        </td>

                    </tr>


                </table>


            </div>


        </div>


    </div>


    <!-- =================================================
         CONTACT INFORMATION
    ================================================= -->

    <div class="section">


        <div class="section-title">
            Contact Information
        </div>


        <div class="section-body">


            <table class="data-table">


                <tr>


                    <td>

                        <span class="field-label">
                            Mobile Number
                        </span>

                        <span class="field-value">
                            ${value(
                                application.mobile_number
                            )}
                        </span>

                    </td>


                    <td>

                        <span class="field-label">
                            Alternative Mobile
                        </span>

                        <span class="field-value">
                            ${value(
                                application.alternative_mobile_number
                            )}
                        </span>

                    </td>


                </tr>


                <tr>


                    <td>

                        <span class="field-label">
                            Email
                        </span>

                        <span class="field-value">
                            ${value(
                                application.email
                            )}
                        </span>

                    </td>


                    <td>

                        <span class="field-label">
                            Current Address
                        </span>

                        <span class="field-value">
                            ${value(
                                application.current_address
                            )}
                        </span>

                    </td>


                </tr>


                <tr>


                    <td colspan="2">

                        <span class="field-label">
                            Permanent Address
                        </span>

                        <span class="field-value">
                            ${value(
                                application.permanent_address
                            )}
                        </span>

                    </td>


                </tr>


            </table>


        </div>


    </div>


    <!-- =================================================
         SPORTS INFORMATION
    ================================================= -->

    <div class="section">


        <div class="section-title">
            Sports Information
        </div>


        <div class="section-body">


            <span class="field-label">
                Selected Sports
            </span>


            <div class="sports-box">
                ${value(
                    application.sports
                )}
            </div>


            <table class="data-table">


                <tr>


                    <td>

                        <span class="field-label">
                            Other Sports
                        </span>

                        <span class="field-value">
                            ${value(
                                application.other_sports
                            )}
                        </span>

                    </td>


                    <td>

                        <span class="field-label">
                            Sports Skill
                        </span>

                        <span class="field-value">
                            ${value(
                                application.sports_skill
                            )}
                        </span>

                    </td>


                </tr>


                <tr>


                    <td colspan="2">

                        <span class="field-label">
                            Previous Club Experience
                        </span>

                        <span class="field-value">
                            ${value(
                                application.previous_club_experience
                            )}
                        </span>

                    </td>


                </tr>


            </table>


        </div>


    </div>


    <!-- =================================================
         EMERGENCY CONTACT
    ================================================= -->

    <div class="section">


        <div class="section-title">
            Emergency Contact
        </div>


        <div class="section-body">


            <table class="data-table">


                <tr>


                    <td>

                        <span class="field-label">
                            Name
                        </span>

                        <span class="field-value">
                            ${value(
                                application.emergency_contact_name
                            )}
                        </span>

                    </td>


                    <td>

                        <span class="field-label">
                            Relation
                        </span>

                        <span class="field-value">
                            ${value(
                                application.emergency_contact_relation
                            )}
                        </span>

                    </td>


                </tr>


                <tr>


                    <td colspan="2">

                        <span class="field-label">
                            Mobile
                        </span>

                        <span class="field-value">
                            ${value(
                                application.emergency_contact_mobile
                            )}
                        </span>

                    </td>


                </tr>


            </table>


        </div>


    </div>


    <!-- =================================================
         DECLARATION
    ================================================= -->

    <div class="section">


        <div class="section-title">
            Declaration
        </div>


        <div class="section-body">


            <div class="declaration">

                I hereby declare that the information provided in this
                membership application is true and correct to the best
                of my knowledge. I agree to follow the rules, regulations
                and discipline of Ghopkhali Sports Arena.

            </div>


            <div class="signatures">


                <div class="signature">

                    <div class="signature-line"></div>

                    <div class="signature-label">
                        Applicant Signature
                    </div>

                </div>


                <div class="signature">

                    <div class="signature-line"></div>

                    <div class="signature-label">
                        Verified By
                    </div>

                </div>


                <div class="signature">

                    <div class="signature-line"></div>

                    <div class="signature-label">
                        Authorized Signature
                    </div>

                </div>


            </div>


        </div>


    </div>


    <!-- FOOTER -->

    <div class="footer">

        <span>
            GHOPKHALI SPORTS ARENA • Membership Department
        </span>


        <span>
            Official Membership Application
        </span>

    </div>


</div>

`;


    document.body.appendChild(
        wrapper
    );


    /* =================================================
       WAIT FOR IMAGES
    ================================================= */

    const images =
        Array.from(
            wrapper.querySelectorAll(
                "img"
            )
        );


    await Promise.all(

        images.map(
            img => {

                if (
                    img.complete
                ) {

                    return Promise.resolve();

                }


                return new Promise(
                    resolve => {

                        img.onload =
                            resolve;

                        img.onerror =
                            resolve;

                    }
                );

            }
        )

    );


    /* =================================================
       HTML2CANVAS
    ================================================= */

    const canvas =
        await html2canvas(

            wrapper.querySelector(
                ".pdf-page"
            ),

            {

                scale:
                    3,

                useCORS:
                    true,

                allowTaint:
                    false,

                backgroundColor:
                    "#ffffff",

                logging:
                    false,

                imageTimeout:
                    15000

            }

        );


    document.body.removeChild(
        wrapper
    );


    /* =================================================
       JSPDF
    ================================================= */

    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({

            orientation:
                "portrait",

            unit:
                "mm",

            format:
                "a4",

            compress:
                true

        });


    const pageWidth =
        pdf.internal.pageSize.getWidth();


    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            0.96
        );


    pdf.addImage(

        imageData,

        "JPEG",

        0,

        0,

        pageWidth,

        pageHeight,

        undefined,

        "FAST"

    );


    /* =================================================
       FILE NAME
    ================================================= */

    const safeName =

        (

            application.full_name_en ||

            application.full_name_bn ||

            "Member"

        )

        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );


    const fileName =

        `GSA-Membership-Application-${safeName}.pdf`;


    /* =================================================
       PDF BLOB
    ================================================= */

    const pdfBlob =
        pdf.output(
            "blob"
        );


    /* =================================================
       DIRECT DOWNLOAD
    ================================================= */

    if (
        typeof generateMembershipApplicationPDF.downloadMode
        === "undefined" ||

        generateMembershipApplicationPDF.downloadMode
        === true
    ) {

        pdf.save(
            fileName
        );

    }


    /* =================================================
       RETURN
    ================================================= */

    return {

        pdfBlob,

        fileName

    };

}

/* =====================================================
   MEMBERSHIP APPLICATION PDF BUTTON
===================================================== */

document.addEventListener("click", async (event) => {

    const button =
        event.target.closest(
            "[data-membership-pdf]"
        );

    if (!button) {
        return;
    }

    const id =
        button.dataset.id;

    const application =
        membershipApplications.find(
            item =>
                String(item.id) === String(id)
        );

    if (!application) {

        alert(
            "Application data not found."
        );

        return;
    }

    const originalText =
        button.innerHTML;

    button.disabled = true;

    button.innerHTML =
        "Preparing PDF...";

    try {

        await generateMembershipApplicationPDF(
            application
        );

    } catch (error) {

        console.error(
            "PDF GENERATION ERROR:",
            error
        );

        alert(
            "PDF download failed.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );

    } finally {

        button.disabled = false;

        button.innerHTML =
            originalText;

    }

});
   
/* =====================================================
   LOAD FRIENDLY APPLICATIONS
===================================================== */

async function loadFriendlyApplications() {

    const list =
        $("friendlyList");

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="loading-state">
            Loading Friendly Match applications...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("friendly_applications")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Friendly applications:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">

                Unable to load applications.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>
        `;

        return;
    }


    friendlyApplications =
        data || [];


    renderFriendlyApplications();

}


/* =====================================================
   RENDER FRIENDLY APPLICATIONS
===================================================== */

function renderFriendlyApplications() {

    const list =
        $("friendlyList");

    if (!list) {
        return;
    }


    if (!friendlyApplications.length) {

        list.innerHTML = `
            <div class="empty-state">
                No Friendly Match applications.
            </div>
        `;

        return;
    }


    list.innerHTML =
        friendlyApplications
            .map(
                application => {

                    const status =
                        String(
                            application.status ||
                            "pending"
                        ).toLowerCase();


                    const message =
                        application.message ||
                        "";


                    let sport =
                        "";

                    let players =
                        "";


                    const sportMatch =
                        message.match(
                            /Sport:\s*(.+)/i
                        );


                    const playersMatch =
                        message.match(
                            /Number of Players:\s*(.+)/i
                        );


                    if (sportMatch) {

                        sport =
                            sportMatch[1]
                                .split("\n")[0]
                                .trim();

                    }


                    if (playersMatch) {

                        players =
                            playersMatch[1]
                                .split("\n")[0]
                                .trim();

                    }


                    return `

                    <article
                        class="content-card friendly-application-card"
                    >

                        <div class="content-card-top">

                            <div>

                                <div class="notice-meta">

                                    <span class="badge">

                                        FRIENDLY MATCH

                                    </span>


                                    <span class="badge ${
                                        status === "approved"
                                            ? "published"
                                            : status === "rejected"
                                                ? "draft"
                                                : ""
                                    }">

                                        ${
                                            status
                                                .toUpperCase()
                                        }

                                    </span>

                                </div>


                                <h3>

                                    ${escapeHTML(
                                        application.team_name ||
                                        application.club_name ||
                                        "Unknown Team"
                                    )}

                                </h3>


                                <p>

                                    <strong>
                                        Contact:
                                    </strong>

                                    ${escapeHTML(
                                        application.contact_person ||
                                        application.full_name ||
                                        application.name ||
                                        "N/A"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Phone:
                                    </strong>

                                    ${escapeHTML(
                                        application.phone ||
                                        "N/A"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Email:
                                    </strong>

                                    ${escapeHTML(
                                        application.email ||
                                        "N/A"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Sport:
                                    </strong>

                                    ${escapeHTML(
                                        sport ||
                                        "N/A"
                                    )}

                                    &nbsp; • &nbsp;

                                    <strong>
                                        Players:
                                    </strong>

                                    ${escapeHTML(
                                        players ||
                                        "N/A"
                                    )}

                                </p>


                                <p>

                                    <strong>
                                        Match Date:
                                    </strong>

                                    ${formatDate(
                                        application.preferred_date
                                    )}

                                    ${
                                        application.preferred_time
                                            ? `
                                            &nbsp; • &nbsp;
                                            ${escapeHTML(
                                                String(
                                                    application.preferred_time
                                                ).slice(
                                                    0,
                                                    5
                                                )
                                            )}
                                            `
                                            : ""
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Venue:
                                    </strong>

                                    ${escapeHTML(
                                        application.venue ||
                                        "Venue not specified"
                                    )}

                                </p>


                            </div>


                            <div class="content-date">

                                ${formatDate(
                                    application.created_at
                                )}

                            </div>

                        </div>


                        <div class="card-actions">

    <button
        type="button"
        class="small-button"
        data-friendly-action="view"
        data-id="${escapeHTML(
            application.id
        )}"
    >
        View Application
    </button>


    <button
        type="button"
        class="small-button danger"
        data-friendly-action="delete"
        data-id="${escapeHTML(
            application.id
        )}"
    >
        Delete
    </button>

</div>

                    </article>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   FRIENDLY APPLICATION VIEW
===================================================== */

$("friendlyList")
    ?.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-friendly-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const action =
                button.dataset.friendlyAction;


            const application =
                friendlyApplications.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!application) {
                return;
            }


            /* =====================================
               VIEW APPLICATION
            ===================================== */

            if (
                action ===
                "view"
            ) {

                openFriendlyApplication(
                    application
                );

                return;
            }


            /* =====================================
               DELETE APPLICATION
            ===================================== */

            if (
                action ===
                "delete"
            ) {

                const teamName =
                    application.team_name ||
                    application.club_name ||
                    "this application";


                const confirmed =
                    confirm(
                        `Delete "${teamName}"?\n\n` +
                        `This will permanently delete the Friendly Match application.`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    showLoading(true);


                    /* =================================
                       1. DELETE DECISION PDF
                    ================================= */

                    if (
                        application.decision_pdf_url
                    ) {

                        const {
                            error:
                                pdfDeleteError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "friendly-applications"
                                )
                                .remove([
                                    application
                                        .decision_pdf_url
                                ]);


                        if (pdfDeleteError) {

                            console.warn(
                                "Decision PDF delete warning:",
                                pdfDeleteError
                            );

                        }

                    }


                    /* =================================
                       2. DELETE APPLICATION
                    ================================= */

                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "friendly_applications"
                            )
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                    if (error) {
                        throw error;
                    }


                    /* =================================
                       3. CLOSE MODAL IF OPEN
                    ================================= */

                    closeModal(
                        $("applicationModal")
                    );


                    /* =================================
                       4. REMOVE FROM LOCAL ARRAY
                    ================================= */

                    friendlyApplications =
                        friendlyApplications.filter(
                            item =>
                                String(item.id) !==
                                String(id)
                        );


                    /* =================================
                       5. REFRESH LIST
                    ================================= */

                    renderFriendlyApplications();


                    /* =================================
                       6. UPDATE DASHBOARD COUNT
                    ================================= */

                    await loadDashboardCounts();


                    alert(
                        "Friendly Match application deleted successfully."
                    );


                } catch (error) {

                    console.error(
                        "Friendly application delete error:",
                        error
                    );


                    alert(
                        "Unable to delete application.\n\n" +
                        error.message
                    );


                } finally {

                    showLoading(false);

                }

            }

        }
    );


/* =====================================================
   FRIENDLY APPLICATION DETAILS
===================================================== */

function openFriendlyApplication(application) {

    const modal =
        $("applicationModal");

    const title =
        $("applicationModalTitle");

    const details =
        $("applicationDetails");

    if (
        !modal ||
        !title ||
        !details
    ) {
        return;
    }

    const message =
        application.message || "";

    const status =
        String(
            application.status || "pending"
        ).toLowerCase();


    details.innerHTML = `

        <div class="application-detail-card">

            <p>
                <strong>Application ID</strong><br>
                ${escapeHTML(application.id)}
            </p>

            <p>
                <strong>Team / Club</strong><br>
                ${escapeHTML(
                    application.team_name ||
                    application.club_name ||
                    "N/A"
                )}
            </p>

            <p>
                <strong>Contact Person</strong><br>
                ${escapeHTML(
                    application.contact_person ||
                    application.full_name ||
                    application.name ||
                    "N/A"
                )}
            </p>

            <p>
                <strong>Phone</strong><br>
                ${escapeHTML(
                    application.phone || "N/A"
                )}
            </p>

            <p>
                <strong>Email</strong><br>
                ${escapeHTML(
                    application.email || "N/A"
                )}
            </p>

            <p>
                <strong>Sport / Players</strong><br>
                ${escapeHTML(
                    message
                        .split("\n")
                        .slice(0, 2)
                        .join(" • ")
                )}
            </p>

            <p>
                <strong>Match Date</strong><br>
                ${formatDate(
                    application.preferred_date
                )}
            </p>

            <p>
                <strong>Match Time</strong><br>
                ${escapeHTML(
                    application.preferred_time
                        ? String(
                            application.preferred_time
                        ).slice(0, 5)
                        : "Not specified"
                )}
            </p>

            <p>
                <strong>Venue</strong><br>
                ${escapeHTML(
                    application.venue ||
                    "Not specified"
                )}
            </p>

            <p>
                <strong>Message</strong><br>
                ${escapeHTML(
                    message ||
                    "No additional message."
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>

            <p>
                <strong>Status</strong><br>

                <span class="application-status ${status}">
                    ${escapeHTML(
                        status.toUpperCase()
                    )}
                </span>

            </p>


            ${
                status === "pending"
                    ? `
                        <div class="application-decision-actions">

                            <button
                                type="button"
                                class="small-button approve-button"
                                data-application-decision="approve"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ✓ Approve Application
                            </button>

                            <button
                                type="button"
                                class="small-button reject-button"
                                data-application-decision="reject"
                                data-id="${escapeHTML(application.id)}"
                            >
                                ✕ Reject Application
                            </button>

                        </div>
                    `
                : `
    <div class="application-decision-result">

        ${
            status === "approved"
                ? "✓ This application has been approved."
                : "✕ This application has been rejected."
        }


        ${
            application.decision_pdf_url
                ? `
                    <div
                        style="
                            margin-top:16px;
                        "
                    >

                        <button
                            type="button"
                            class="small-button"
                            data-download-decision-pdf
                            data-id="${escapeHTML(
                                application.id
                            )}"
                        >
                            ↓ Download Decision PDF
                        </button>

                    </div>
                `
                : `
                    <div
                        style="
                            margin-top:12px;
                            font-size:13px;
                            opacity:0.7;
                        "
                    >
                        Decision PDF is not available.
                    </div>
                `
        }

    </div>
`
            }

        </div>

    `;

    title.textContent =
        "Friendly Match Application";

    openModal(modal);
}

/* =====================================================
   FRIENDLY APPLICATION — APPROVE / REJECT CLICK
===================================================== */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-application-decision]"
            );

        if (!button) return;

        const applicationId =
            button.dataset.id;

        const decision =
            button.dataset.applicationDecision;

        if (!applicationId || !decision) {
            return;
        }

        if (decision === "approve") {

            const confirmed =
                confirm(
                    "Are you sure you want to APPROVE this application?"
                );

            if (!confirmed) {
                return;
            }

            updateFriendlyApplicationStatus(
                applicationId,
                "approved"
            );
        }

        if (decision === "reject") {

            const confirmed =
                confirm(
                    "Are you sure you want to REJECT this application?"
                );

            if (!confirmed) {
                return;
            }

            updateFriendlyApplicationStatus(
                applicationId,
                "rejected"
            );
        }

    }
);

/* =====================================================
   FRIENDLY APPLICATION — ADMIN PDF
===================================================== */

async function generateAdminApplicationPDF(application) {

    const container =
        document.getElementById(
            "adminPdfContainer"
        );

    const page =
        document.getElementById(
            "adminPdfPage"
        );

    if (!container || !page) {
        throw new Error(
            "Admin PDF template not found."
        );
    }


    const message =
        application.message || "";


    let sport = "N/A";
    let players = "N/A";
    let additionalMessage = "N/A";


    const sportMatch =
        message.match(/Sport:\s*(.+)/i);

    const playersMatch =
        message.match(
            /Number of Players:\s*(.+)/i
        );

    const additionalMatch =
        message.match(
            /Additional Message:\s*([\s\S]*)/i
        );


    if (sportMatch) {

        sport =
            sportMatch[1]
                .split("\n")[0]
                .trim();

    }


    if (playersMatch) {

        players =
            playersMatch[1]
                .split("\n")[0]
                .trim();

    }


    if (additionalMatch) {

        additionalMessage =
            additionalMatch[1].trim() ||
            "N/A";

    }


    const setText = (
        id,
        value
    ) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value || "—";
        }

    };


    setText(
        "adminPdfApplicationId",
        application.id
    );


    setText(
        "adminPdfCreatedAt",
        application.created_at
            ? new Date(
                application.created_at
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
            : "—"
    );


    setText(
        "adminPdfTeamName",
        application.team_name ||
        application.club_name
    );


    setText(
        "adminPdfContactPerson",
        application.contact_person ||
        application.full_name ||
        application.name
    );


    setText(
        "adminPdfPhone",
        application.phone
    );


    setText(
        "adminPdfEmail",
        application.email
    );


    setText(
        "adminPdfSport",
        sport
    );


    setText(
        "adminPdfPlayers",
        players
    );


    setText(
        "adminPdfDate",
        application.preferred_date
    );


    setText(
        "adminPdfTime",
        application.preferred_time
            ? String(
                application.preferred_time
            ).slice(0, 5)
            : "Not specified"
    );


    setText(
        "adminPdfVenue",
        application.venue ||
        "Not specified"
    );


    setText(
        "adminPdfMessage",
        additionalMessage
    );


    const status =
        String(
            application.status ||
            "pending"
        ).toLowerCase();


    const statusElement =
        document.getElementById(
            "adminPdfStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            status === "approved"
                ? "APPROVED"
                : status === "rejected"
                    ? "REJECTED"
                    : "APPLICATION RECEIVED";

    }


    container.style.display =
        "block";


    try {

        const canvas =
            await html2canvas(
                page,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor:
                        "#ffffff"
                }
            );


        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true
            });


        const pageWidth =
            pdf.internal.pageSize.getWidth();


        const imageHeight =
            canvas.height *
            pageWidth /
            canvas.width;


        pdf.addImage(
            canvas.toDataURL(
                "image/jpeg",
                0.95
            ),
            "JPEG",
            0,
            0,
            pageWidth,
            imageHeight
        );


        /*
         * APPROVED / REJECTED SEAL
         */

        if (
            status === "approved" ||
            status === "rejected"
        ) {

            const approved =
                status === "approved";


            const sealText =
                approved
                    ? "APPROVED"
                    : "REJECTED";


            const sealColor =
                approved
                    ? [25, 125, 70]
                    : [185, 45, 45];


            const sealX =
                pageWidth - 42;


            const sealY =
                37;


            pdf.setDrawColor(
                ...sealColor
            );


            pdf.setTextColor(
                ...sealColor
            );


            pdf.setLineWidth(1.2);


            pdf.circle(
                sealX,
                sealY,
                19,
                "S"
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(10);


            pdf.text(
                sealText,
                sealX,
                sealY + 2,
                {
                    align: "center"
                }
            );


            pdf.setFontSize(5);


            pdf.text(
                "GHOPKHALI SPORTS ARENA",
                sealX,
                sealY + 8,
                {
                    align: "center"
                }
            );

        }


        /*
         * Convert PDF to Blob
         */

        const pdfBlob =
            pdf.output("blob");


        return {
            pdf,
            pdfBlob
        };


    } finally {

        container.style.display =
            "none";

    }

}

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    let initialized =
        false;


    async function initializeDashboard() {

    if (initialized) {
        return;
    }

    initialized = true;

    try {

        await Promise.all([

    loadDashboardCounts(),

    loadNotices(),

    loadFixtures(),

    loadTournaments(),

    loadGallery(),

    loadFriendlyApplications(),

    loadMembershipApplications(),

]);

        console.log(
            "GSA Admin CMS initialized successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

    }

}

/* =================================================
   TOURNAMENT POSTER PREVIEW
================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const posterInput =
        document.getElementById("tournamentPoster");

    const preview =
        document.getElementById(
            "tournamentPosterPreview"
        );

    const previewImage =
        document.getElementById(
            "tournamentPosterPreviewImage"
        );


    if (
        !posterInput ||
        !preview ||
        !previewImage
    ) {
        return;
    }


    posterInput.addEventListener(
        "change",
        () => {

            const file =
                posterInput.files[0];


            if (!file) {

                preview.style.display = "none";

                previewImage.src = "";

                return;
            }


            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select an image file."
                );

                posterInput.value = "";

                preview.style.display = "none";

                previewImage.src = "";

                return;
            }


            const imageURL =
                URL.createObjectURL(file);


            previewImage.src =
                imageURL;


            preview.style.display =
                "block";

        }
    );

});
 
/* =====================================================
   FRIENDLY APPLICATION — APPROVE / REJECT + PDF
===================================================== */

async function updateFriendlyApplicationStatus(
    applicationId,
    newStatus
) {

    if (
        !applicationId ||
        !["approved", "rejected"].includes(newStatus)
    ) {
        return;
    }


    const button =
        document.querySelector(
            `[data-application-decision][data-id="${applicationId}"]`
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Updating...";

    }


    try {

        /* =============================================
           1. UPDATE APPLICATION STATUS
        ============================================= */

        const decidedAt =
            new Date().toISOString();


        const {
            data: updatedRow,
            error
        } =
            await supabaseClient
                .from("friendly_applications")
                .update({
                    status: newStatus,
                    updated_at: decidedAt,
                    decided_at: decidedAt
                })
                .eq(
                    "id",
                    applicationId
                )
                .select("*")
                .single();


        if (error) {
            throw error;
        }


        /* =============================================
           2. UPDATE LOCAL APPLICATION DATA
        ============================================= */

        const applicationIndex =
            friendlyApplications.findIndex(
                item =>
                    String(item.id) ===
                    String(applicationId)
            );


        if (applicationIndex === -1) {

            throw new Error(
                "Application not found."
            );

        }


        friendlyApplications[
            applicationIndex
        ] = updatedRow;


        const application =
            friendlyApplications[
                applicationIndex
            ];


        /* =============================================
           3. GENERATE DECISION PDF
        ============================================= */

        const {
            pdfBlob
        } =
            await generateAdminApplicationPDF(
                application
            );


        /* =============================================
           4. UPLOAD PDF TO PRIVATE STORAGE
        ============================================= */

        const fileName =
            `${application.id}-${newStatus}.pdf`;


        const filePath =
            `friendly-applications/${fileName}`;


        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("friendly-applications")
                .upload(
                    filePath,
                    pdfBlob,
                    {
                        contentType:
                            "application/pdf",

                        upsert: true
                    }
                );


        if (uploadError) {
            throw uploadError;
        }


        /* =============================================
           5. SAVE STORAGE PATH IN DATABASE
        ============================================= */

        const {
            error: pathUpdateError
        } =
            await supabaseClient
                .from("friendly_applications")
                .update({
                    decision_pdf_url:
                        filePath,

                    decided_at:
                        decidedAt,

                    updated_at:
                        decidedAt
                })
                .eq(
                    "id",
                    application.id
                );
        /* =====================================================
           SEND DECISION EMAILS
        ===================================================== */

        let emailSent = false;
        let emailMessage = "";

        try {

            const {
                data: emailResult,
                error: emailError
            } = await supabaseClient.functions.invoke(
                "send-friendly-application-email",
                {
                    body: {
                        applicationId:
                            application.id
                    }
                }
            );

            if (emailError) {
                throw emailError;
            }

            if (!emailResult?.success) {
                throw new Error(
                    emailResult?.error ||
                    "Email sending failed."
                );
            }

            emailSent = true;

            emailMessage =
                "Applicant and GSA emails sent successfully.";

            console.log(
                "Decision emails sent:",
                emailResult
            );

        } catch (emailError) {

            console.error(
                "Decision email error:",
                emailError
            );

            emailMessage =
                "Application processed, but email could not be sent.";
        }

        if (pathUpdateError) {
            throw pathUpdateError;
        }


        /* =============================================
           6. UPDATE LOCAL DATA
        ============================================= */

        application.decision_pdf_url =
            filePath;

        application.decided_at =
            decidedAt;

        application.updated_at =
            decidedAt;


        /* =============================================
           7. REFRESH APPLICATION LIST
        ============================================= */

        renderFriendlyApplications();


        const updatedApplication =
            friendlyApplications.find(
                item =>
                    String(item.id) ===
                    String(applicationId)
            );


        if (updatedApplication) {

            openFriendlyApplication(
                updatedApplication
            );

        }


        /* =============================================
           8. SUCCESS MESSAGE
        ============================================= */

        alert(
    newStatus === "approved"
        ? (
            emailSent
                ? "Application approved successfully.\n\nPDF generated and both emails sent."
                : "Application approved successfully.\n\nPDF generated, but email could not be sent."
          )
        : (
            emailSent
                ? "Application rejected successfully.\n\nPDF generated and both emails sent."
                : "Application rejected successfully.\n\nPDF generated, but email could not be sent."
          )
);


    } catch (error) {

        console.error(
            "Application status update error:",
            error
        );


        alert(
            "Unable to process application.\n\n" +
            error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                newStatus === "approved"
                    ? "✓ Approve Application"
                    : "✕ Reject Application";

        }

    }

}

/* =====================================================
   DOWNLOAD FRIENDLY APPLICATION DECISION PDF
===================================================== */

async function downloadFriendlyApplicationPDF(
    applicationId
) {

    if (!applicationId) {
        return;
    }


    try {

        const application =
            friendlyApplications.find(
                item =>
                    String(item.id) ===
                    String(applicationId)
            );


        if (!application) {

            throw new Error(
                "Application not found."
            );

        }


        if (!application.decision_pdf_url) {

            throw new Error(
                "Decision PDF is not available."
            );

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .storage
                .from("friendly-applications")
                .createSignedUrl(
                    application.decision_pdf_url,
                    60 * 10
                );


        if (error) {
            throw error;
        }


        if (!data?.signedUrl) {

            throw new Error(
                "Could not create secure PDF link."
            );

        }


        window.open(
            data.signedUrl,
            "_blank"
        );

    } catch (error) {

        console.error(
            "Decision PDF download error:",
            error
        );


        alert(
            "Unable to download PDF.\n\n" +
            error.message
        );

    }

}

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-download-decision-pdf]"
            );


        if (!button) {
            return;
        }


        const applicationId =
            button.dataset.id;


        downloadFriendlyApplicationPDF(
            applicationId
        );

    }
);

/* =====================================================
   RULES & REGULATIONS MANAGEMENT
===================================================== */

(function () {

    "use strict";


    /* -------------------------------------------------
       ELEMENTS
    ------------------------------------------------- */

    const rulesTitle =
        document.getElementById("rulesAdminTitle");

    const rulesContent =
        document.getElementById("rulesAdminContent");

    const saveRulesButton =
        document.getElementById("saveRulesButton");

    const resetRulesButton =
        document.getElementById("resetRulesButton");

    const rulesUpdated =
        document.getElementById("rulesAdminUpdated");

    const rulesStatus =
        document.getElementById("rulesAdminStatus");


    /* Feature Card */

    const featureCard =
        document.getElementById("rulesFeatureCard");

    const featureTitle =
        document.getElementById("rulesFeatureTitle");

    const featurePreview =
        document.getElementById("rulesFeaturePreview");

    const featureUpdated =
        document.getElementById("rulesFeatureUpdated");

    const editFeatureButton =
        document.getElementById(
            "editRulesFeatureButton"
        );


    /* -------------------------------------------------
       CHECK ELEMENTS
    ------------------------------------------------- */

    if (
        !rulesTitle ||
        !rulesContent ||
        !saveRulesButton
    ) {
        return;
    }


    /* -------------------------------------------------
       ORIGINAL DATA
    ------------------------------------------------- */

    let originalRules = {

        title: "",

        content: "",

        updated_at: null

    };


    /* -------------------------------------------------
       ESCAPE HTML
    ------------------------------------------------- */

    function escapeHTML(value) {

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


    /* -------------------------------------------------
       STATUS
    ------------------------------------------------- */

    function showRulesStatus(
        message,
        type = "success"
    ) {

        if (!rulesStatus) {
            return;
        }

        rulesStatus.textContent =
            message;

        rulesStatus.className =
            "rules-admin-status " +
            type;

    }


    /* -------------------------------------------------
       DATE FORMAT
    ------------------------------------------------- */

    function formatRulesDate(date) {

        if (!date) {
            return "Official";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Official";
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",

                month: "short",

                year: "numeric"
            }
        );

    }


    /* -------------------------------------------------
       UPDATE FEATURE CARD
    ------------------------------------------------- */

    function updateRulesFeatureCard(
        title,
        content,
        updatedAt
    ) {

        if (featureTitle) {

            featureTitle.textContent =
                title ||
                "Rules & Regulations";

        }


        if (featurePreview) {

            const cleanContent =
                String(
                    content || ""
                ).trim();


            if (cleanContent) {

                featurePreview.textContent =
                    cleanContent;

            } else {

                featurePreview.textContent =
                    "No Rules & Regulations content has been published yet.";

            }

        }


        const dateText =
            updatedAt
                ? "Updated " +
                  formatRulesDate(
                      updatedAt
                  )
                : "Not saved yet";


        if (featureUpdated) {

            featureUpdated.textContent =
                dateText;

        }

    }


    /* -------------------------------------------------
       LOAD RULES
    ------------------------------------------------- */

    async function loadAdminRules() {

        try {

            if (rulesUpdated) {

                rulesUpdated.textContent =
                    "Loading...";

            }


            if (featurePreview) {

                featurePreview.textContent =
                    "Loading Rules & Regulations...";

            }


            const {
                data,
                error
            } = await supabaseClient

                .from("site_rules")

                .select(
                    "id, title, content, updated_at"
                )

                .limit(1)

                .maybeSingle();


            if (error) {
                throw error;
            }


            /* -----------------------------------------
               NO DATA
            ----------------------------------------- */

            if (!data) {

                originalRules = {

                    title:
                        "Rules & Regulations",

                    content:
                        "",

                    updated_at:
                        null

                };


                rulesTitle.value =
                    originalRules.title;

                rulesContent.value =
                    originalRules.content;


                updateRulesFeatureCard(
                    originalRules.title,
                    originalRules.content,
                    null
                );


                if (rulesUpdated) {

                    rulesUpdated.textContent =
                        "Not saved yet";

                }

                return;
            }


            /* -----------------------------------------
               DATA
            ----------------------------------------- */

            originalRules = {

                title:
                    data.title ||
                    "Rules & Regulations",

                content:
                    data.content || "",

                updated_at:
                    data.updated_at ||
                    null

            };


            rulesTitle.value =
                originalRules.title;


            rulesContent.value =
                originalRules.content;


            updateRulesFeatureCard(
                originalRules.title,
                originalRules.content,
                originalRules.updated_at
            );


            if (rulesUpdated) {

                rulesUpdated.textContent =
                    data.updated_at

                        ? "Updated " +
                          formatRulesDate(
                              data.updated_at
                          )

                        : "Official";

            }


        } catch (error) {

            console.error(
                "Rules loading error:",
                error
            );


            updateRulesFeatureCard(
                "Rules & Regulations",
                "Unable to load Rules & Regulations.",
                null
            );


            showRulesStatus(
                "Unable to load Rules & Regulations.",
                "error"
            );

        }

    }


    /* -------------------------------------------------
       SAVE RULES
    ------------------------------------------------- */

    async function saveAdminRules() {

        const title =
            rulesTitle.value.trim();

        const content =
            rulesContent.value.trim();


        if (!title) {

            showRulesStatus(
                "Please enter a Rules Page Title.",
                "error"
            );

            rulesTitle.focus();

            return;
        }


        if (!content) {

            showRulesStatus(
                "Please enter the Rules & Regulations content.",
                "error"
            );

            rulesContent.focus();

            return;
        }


        const originalButtonText =
            saveRulesButton.textContent;


        saveRulesButton.disabled =
            true;

        saveRulesButton.textContent =
            "Saving...";


        showRulesStatus(
            "Saving Rules & Regulations..."
        );


        try {

            /* -----------------------------------------
               FIND EXISTING RULES
            ----------------------------------------- */

            const {
                data: existing,
                error: findError
            } = await supabaseClient

                .from("site_rules")

                .select("id")

                .limit(1)

                .maybeSingle();


            if (findError) {
                throw findError;
            }


            let savedData;


            /* -----------------------------------------
               UPDATE
            ----------------------------------------- */

            if (
                existing &&
                existing.id
            ) {

                const {
                    data,
                    error
                } = await supabaseClient

                    .from("site_rules")

                    .update({

                        title:
                            title,

                        content:
                            content,

                        updated_at:
                            new Date().toISOString()

                    })

                    .eq(
                        "id",
                        existing.id
                    )

                    .select(
                        "id, title, content, updated_at"
                    )

                    .single();


                if (error) {
                    throw error;
                }


                savedData =
                    data;

            }


            /* -----------------------------------------
               INSERT
            ----------------------------------------- */

            else {

                const {
                    data,
                    error
                } = await supabaseClient

                    .from("site_rules")

                    .insert({

                        title:
                            title,

                        content:
                            content,

                        updated_at:
                            new Date().toISOString()

                    })

                    .select(
                        "id, title, content, updated_at"
                    )

                    .single();


                if (error) {
                    throw error;
                }


                savedData =
                    data;

            }


            /* -----------------------------------------
               UPDATE LOCAL DATA
            ----------------------------------------- */

            originalRules = {

                title:
                    savedData.title ||
                    "Rules & Regulations",

                content:
                    savedData.content || "",

                updated_at:
                    savedData.updated_at ||
                    null

            };


            /* -----------------------------------------
               UPDATE EDITOR DATE
            ----------------------------------------- */

            if (rulesUpdated) {

                rulesUpdated.textContent =
                    savedData.updated_at

                        ? "Updated " +
                          formatRulesDate(
                              savedData.updated_at
                          )

                        : "Saved";

            }


            /* -----------------------------------------
               UPDATE FEATURE CARD
            ----------------------------------------- */

            updateRulesFeatureCard(

                savedData.title ||
                "Rules & Regulations",

                savedData.content ||
                "",

                savedData.updated_at ||
                null

            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            showRulesStatus(
                "✓ Rules & Regulations saved successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Rules save error:",
                error
            );


            showRulesStatus(
                "Unable to save Rules. Please try again.",
                "error"
            );


        } finally {

            saveRulesButton.disabled =
                false;

            saveRulesButton.textContent =
                originalButtonText;

        }

    }


    /* -------------------------------------------------
       RESET
    ------------------------------------------------- */

    function resetAdminRules() {

        rulesTitle.value =
            originalRules.title ||
            "Rules & Regulations";


        rulesContent.value =
            originalRules.content ||
            "";


        updateRulesFeatureCard(

            originalRules.title ||
            "Rules & Regulations",

            originalRules.content ||
            "",

            originalRules.updated_at ||
            null

        );


        showRulesStatus(
            "Changes have been reset.",
            "success"
        );

    }


    /* -------------------------------------------------
       EDIT FEATURE CARD
    ------------------------------------------------- */

    if (editFeatureButton) {

        editFeatureButton.addEventListener(
            "click",
            function () {

                const editor =
                    document.getElementById(
                        "rulesAdminEditor"
                    );


                if (!editor) {
                    return;
                }


                editor.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


                setTimeout(
                    function () {

                        rulesTitle.focus();

                    },
                    350
                );

            }
        );

    }


    /* -------------------------------------------------
       SAVE BUTTON
    ------------------------------------------------- */

    saveRulesButton.addEventListener(
        "click",
        saveAdminRules
    );


    /* -------------------------------------------------
       RESET BUTTON
    ------------------------------------------------- */

    if (resetRulesButton) {

        resetRulesButton.addEventListener(
            "click",
            resetAdminRules
        );

    }


    /* -------------------------------------------------
       LOAD
    ------------------------------------------------- */

    loadAdminRules();


})();

/* =========================================================
   ACTIVITIES MANAGEMENT
   GHOPKHALI SPORTS ARENA
   Supabase Table: activities
   Supabase Storage Bucket: activities
========================================================= */

let activities = [];
let editingActivityId = null;
let currentActivityImageUrl = "";


/* =========================================================
   ACTIVITY ELEMENTS
========================================================= */

const activityList =
    $("activityList");

const activityModal =
    $("activityModal");

const activityForm =
    $("activityForm");

const activityModalTitle =
    $("activityModalTitle");

const activityId =
    $("activityId");

const activityNumber =
    $("activityNumber");

const activityCategory =
    $("activityCategory");

const activityTitle =
    $("activityTitle");

const activityDescription =
    $("activityDescription");

const activityImage =
    $("activityImage");

const activityImagePreview =
    $("activityImagePreview");

const activityPreviewImage =
    $("activityPreviewImage");

const removeActivityImage =
    $("removeActivityImage");

const newActivityButton =
    $("newActivityButton");

const saveActivityButton =
    $("saveActivityButton");

const activityFormStatus =
    $("activityFormStatus");


/* =========================================================
   LOAD ACTIVITIES
========================================================= */

async function loadActivities() {

    if (!activityList) {
        return;
    }

    activityList.innerHTML = `
        <div class="loading-state">
            Loading activities...
        </div>
    `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("activities")
                .select("*")
                .order("number", {
                    ascending: true
                });

        if (error) {
            throw error;
        }

        activities =
            data || [];

        renderActivities();

    } catch (error) {

        console.error(
            "Activities loading error:",
            error
        );

        activityList.innerHTML = `
            <div class="empty-state">
                Unable to load activities.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;

    }

}


/* =========================================================
   RENDER ACTIVITIES
========================================================= */

function renderActivities() {

    if (!activityList) {
        return;
    }

    if (!activities.length) {

        activityList.innerHTML = `
            <div class="empty-state">
                No activities added yet.
                <br><br>
                Click "Add Activity" to create your first activity.
            </div>
        `;

        return;
    }


    activityList.innerHTML =
        activities
            .map(activity => {

                const image =
                    activity.image_url
                        ? `
                            <div class="activity-admin-image">
                                <img
                                    src="${escapeHTML(
                                        activity.image_url
                                    )}"
                                    alt="${escapeHTML(
                                        activity.title ||
                                        "Activity"
                                    )}"
                                    loading="lazy"
                                >
                            </div>
                        `
                        : `
                            <div class="activity-admin-image activity-no-image">
                                <span>
                                    GSA
                                </span>
                            </div>
                        `;


                return `

                    <article
                        class="activity-admin-card"
                    >

                        ${image}


                        <div class="activity-admin-content">

                            <div class="activity-admin-meta">

                                <span>
                                    ${escapeHTML(
                                        activity.number ||
                                        ""
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        activity.category ||
                                        ""
                                    )}
                                </span>

                            </div>


                            <h3>
                                ${escapeHTML(
                                    activity.title ||
                                    "Untitled Activity"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    activity.description ||
                                    "No description."
                                )}
                            </p>


                            <div class="activity-admin-actions">

                                <button
                                    type="button"
                                    class="small-button"
                                    data-activity-action="edit"
                                    data-id="${escapeHTML(
                                        activity.id
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="small-button danger"
                                    data-activity-action="delete"
                                    data-id="${escapeHTML(
                                        activity.id
                                    )}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </article>

                `;

            })
            .join("");

}


/* =========================================================
   OPEN ACTIVITY MODAL
========================================================= */

function openActivityModal(
    activity = null
) {

    if (!activityModal) {
        return;
    }


    editingActivityId =
        activity?.id || null;


    if (activityModalTitle) {

        activityModalTitle.textContent =
            activity
                ? "Edit Activity"
                : "Add Activity";

    }


    if (activityId) {

        activityId.value =
            activity?.id || "";

    }


    if (activityNumber) {

        activityNumber.value =
            activity?.number || "";

    }


    if (activityCategory) {

        activityCategory.value =
            activity?.category || "";

    }


    if (activityTitle) {

        activityTitle.value =
            activity?.title || "";

    }


    if (activityDescription) {

        activityDescription.value =
            activity?.description || "";

    }


    currentActivityImageUrl =
        activity?.image_url || "";


    if (activityImage) {

        activityImage.value = "";

    }


    if (
        currentActivityImageUrl &&
        activityPreviewImage &&
        activityImagePreview
    ) {

        activityPreviewImage.src =
            currentActivityImageUrl;

        activityImagePreview.style.display =
            "block";

    } else {

        hideActivityImagePreview();

    }


    setActivityStatus("");


    openModal(
        activityModal
    );

}


/* =========================================================
   CLOSE ACTIVITY MODAL
========================================================= */

function closeActivityModal() {

    editingActivityId =
        null;

    currentActivityImageUrl =
        "";


    if (activityForm) {

        activityForm.reset();

    }


    if (activityId) {

        activityId.value = "";

    }


    if (activityImage) {

        activityImage.value = "";

    }


    hideActivityImagePreview();


    setActivityStatus("");


    closeModal(
        activityModal
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function hideActivityImagePreview() {

    if (activityImagePreview) {

        activityImagePreview.style.display =
            "none";

    }


    if (activityPreviewImage) {

        activityPreviewImage.src =
            "";

    }

}


/* =========================================================
   ACTIVITY STATUS
========================================================= */

function setActivityStatus(
    message,
    isError = false
) {

    if (!activityFormStatus) {
        return;
    }

    activityFormStatus.textContent =
        message || "";

    activityFormStatus.style.color =
        isError
            ? "#ff3b30"
            : "";

}


/* =========================================================
   UPLOAD ACTIVITY IMAGE
========================================================= */

async function uploadActivityImage(
    file
) {

    if (!file) {
        return null;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Please select a valid image file."
        );

    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            "Image size must be 10 MB or smaller."
        );

    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


    const filePath =
        `activities/${fileName}`;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("activities")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {
        throw uploadError;
    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("activities")
            .getPublicUrl(
                filePath
            );


    return {
        url:
            data?.publicUrl || "",

        path:
            filePath
    };

}


/* =========================================================
   DELETE STORAGE IMAGE
========================================================= */

async function deleteActivityStorageImage(
    imageUrl
) {

    if (!imageUrl) {
        return;
    }


    try {

        const marker =
            "/storage/v1/object/public/activities/";

        const index =
            imageUrl.indexOf(
                marker
            );


        if (index === -1) {
            return;
        }


        const filePath =
            decodeURIComponent(
                imageUrl.substring(
                    index + marker.length
                )
            );


        if (!filePath) {
            return;
        }


        const {
            error
        } =
            await supabaseClient
                .storage
                .from("activities")
                .remove([
                    filePath
                ]);


        if (error) {

            console.warn(
                "Storage image delete warning:",
                error
            );

        }

    } catch (error) {

        console.warn(
            "Could not delete activity image:",
            error
        );

    }

}


/* =========================================================
   SAVE ACTIVITY
========================================================= */

async function saveActivity() {

    if (
        !activityNumber ||
        !activityCategory ||
        !activityTitle
    ) {
        return;
    }


    const number =
        activityNumber.value.trim();

    const category =
        activityCategory.value.trim();

    const title =
        activityTitle.value.trim();

    const description =
        activityDescription?.value.trim() || "";


    if (
        !number ||
        !category ||
        !title
    ) {

        setActivityStatus(
            "Please fill in Number, Category and Title.",
            true
        );

        return;

    }


    try {

        if (saveActivityButton) {

            saveActivityButton.disabled =
                true;

            saveActivityButton.textContent =
                "Saving...";

        }


        setActivityStatus(
            "Saving activity..."
        );


        let imageUrl =
            currentActivityImageUrl;


        /*
         * Upload new image if selected
         */

        const selectedFile =
            activityImage?.files?.[0];


        if (selectedFile) {

            setActivityStatus(
                "Uploading photo..."
            );


            const uploaded =
                await uploadActivityImage(
                    selectedFile
                );


            imageUrl =
                uploaded.url;


            /*
             * Delete old image after
             * successful new upload
             */

            if (
                currentActivityImageUrl &&
                currentActivityImageUrl !== imageUrl
            ) {

                await deleteActivityStorageImage(
                    currentActivityImageUrl
                );

            }

        }


        const payload = {

            number:
                number,

            category:
                category,

            title:
                title,

            description:
                description,

            image_url:
                imageUrl || null

        };


        if (editingActivityId) {

            const {
                error
            } =
                await supabaseClient
                    .from("activities")
                    .update(payload)
                    .eq(
                        "id",
                        editingActivityId
                    );


            if (error) {
                throw error;
            }

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from("activities")
                    .insert(
                        payload
                    );


            if (error) {
                throw error;
            }

        }


        await loadActivities();


        closeActivityModal();


        alert(
            editingActivityId
                ? "Activity updated successfully."
                : "Activity added successfully."
        );


    } catch (error) {

        console.error(
            "Activity save error:",
            error
        );


        setActivityStatus(
            error.message ||
            "Unable to save activity.",
            true
        );


    } finally {

        if (saveActivityButton) {

            saveActivityButton.disabled =
                false;

            saveActivityButton.textContent =
                "Save Activity";

        }

    }

}


/* =========================================================
   DELETE ACTIVITY
========================================================= */

async function deleteActivity(
    id
) {

    const activity =
        activities.find(
            item =>
                item.id === id
        );


    if (!activity) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${activity.title}"?\n\nThis will also remove its uploaded photo.`
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
         * Delete database record first
         */

        const {
            error
        } =
            await supabaseClient
                .from("activities")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        /*
         * Delete Storage image
         */

        if (activity.image_url) {

            await deleteActivityStorageImage(
                activity.image_url
            );

        }


        await loadActivities();


        alert(
            "Activity deleted successfully."
        );


    } catch (error) {

        console.error(
            "Activity delete error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete activity."
        );

    }

}


/* =========================================================
   NEW ACTIVITY BUTTON
========================================================= */

newActivityButton?.addEventListener(
    "click",
    () => {

        openActivityModal();

    }
);


/* =========================================================
   ACTIVITY FORM
========================================================= */

activityForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        await saveActivity();

    }
);


/* =========================================================
   REMOVE IMAGE
========================================================= */

removeActivityImage?.addEventListener(
    "click",
    () => {

        currentActivityImageUrl =
            "";

        if (activityImage) {

            activityImage.value =
                "";

        }

        hideActivityImagePreview();

    }
);


/* =========================================================
   NEW IMAGE PREVIEW
========================================================= */

activityImage?.addEventListener(
    "change",
    () => {

        const file =
            activityImage.files?.[0];


        if (!file) {

            if (
                currentActivityImageUrl
            ) {

                if (
                    activityPreviewImage &&
                    activityImagePreview
                ) {

                    activityPreviewImage.src =
                        currentActivityImageUrl;

                    activityImagePreview.style.display =
                        "block";

                }

            } else {

                hideActivityImagePreview();

            }

            return;

        }


        const objectUrl =
            URL.createObjectURL(
                file
            );


        if (activityPreviewImage) {

            activityPreviewImage.src =
                objectUrl;

        }


        if (activityImagePreview) {

            activityImagePreview.style.display =
                "block";

        }

    }
);


/* =========================================================
   ACTIVITY CARD ACTIONS
========================================================= */

activityList?.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-activity-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.activityAction;

        const id =
            button.dataset.id;


        const activity =
            activities.find(
                item =>
                    item.id === id
            );


        if (
            action === "edit" &&
            activity
        ) {

            openActivityModal(
                activity
            );

        }


        if (
            action === "delete"
        ) {

            deleteActivity(
                id
            );

        }

    }
);


/* =========================================================
   LOAD ACTIVITIES AFTER ADMIN INIT
========================================================= */

if (currentSession) {

    loadActivities();

}

});

  /* =====================================================
       START
    ===================================================== */

    if (currentSession) {

        await initializeDashboard();

    }

});
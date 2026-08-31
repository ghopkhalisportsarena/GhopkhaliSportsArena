/* =========================================================
   GSA ADMIN CMS
   Login + Dashboard + Notices + Gallery
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


    const escapeHTML = value => {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    };


    const formatDate = value => {

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

    };


    function showError(error) {

        console.error(error);

        alert(
            error?.message ||
            "Something went wrong."
        );

    }


    /* =====================================================
       ELEMENTS
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
       CHECK CURRENT SESSION
    ===================================================== */

    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


    if (session) {

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
                emailInput
                    ?.value
                    .trim();

            const password =
                passwordInput
                    ?.value || "";


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

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({
                            email,
                            password
                        });


                if (error) {
                    throw error;
                }


                if (!data.session) {

                    throw new Error(
                        "Login failed. No active session."
                    );

                }


                showDashboard();

                await initializeDashboard();


            } catch (error) {

                console.error(error);

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
       AUTH STATE
    ===================================================== */

    supabaseClient
        .auth
        .onAuthStateChange(
            async (
                event,
                session
            ) => {

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


                await supabaseClient
                    .auth
                    .signOut();


                showLogin();

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
            friendly,
            gallery
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
                ),

                countTable(
                    "gallery"
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


        if ($("galleryCount")) {
            $("galleryCount")
                .textContent =
                gallery;
        }

    }


    /* =====================================================
       NOTICE DATA
    ===================================================== */

    let notices = [];


    async function loadNotices() {

        const list =
            $("noticeList");


        if (!list) {
            return;
        }


        list.innerHTML =
            `<div class="loading-state">
                Loading notices...
             </div>`;


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

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load notices.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
                 </div>`;

            return;

        }


        notices =
            data || [];


        renderNotices();

    }


    function renderNotices() {

        const list =
            $("noticeList");


        if (!list) {
            return;
        }


        if ($("noticeTotalCount")) {

            $("noticeTotalCount")
                .textContent =
                notices.length;

        }


        if ($("noticePublishedCount")) {

            $("noticePublishedCount")
                .textContent =
                notices.filter(
                    item =>
                        item.published === true
                ).length;

        }


        if ($("noticeDraftCount")) {

            $("noticeDraftCount")
                .textContent =
                notices.filter(
                    item =>
                        item.published !== true
                ).length;

        }


        if ($("noticeImportantCount")) {

            $("noticeImportantCount")
                .textContent =
                notices.filter(
                    item =>
                        item.important === true
                ).length;

        }


        if (!notices.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No notices yet.
                 </div>`;

            return;

        }


        list.innerHTML =
            notices.map(
                notice => {

                    const published =
                        notice.published === true;

                    const important =
                        notice.important === true;


                    return `

                    <article
                        class="notice-card">

                        <div class="notice-card-main">

                            <div>

                                <div class="notice-meta">

                                    <span class="badge ${
                                        published
                                            ? "published"
                                            : "draft"
                                    }">

                                        ${
                                            published
                                                ? "● Published"
                                                : "◐ Draft"
                                        }

                                    </span>


                                    ${
                                        important
                                            ? `
                                            <span class="badge important">
                                                ★ Important
                                            </span>
                                            `
                                            : ""
                                    }

                                </div>


                                <div class="content-date">
                                    ${formatDate(
                                        notice.created_at
                                    )}
                                </div>


                                <h3>
                                    ${escapeHTML(
                                        notice.title
                                    )}
                                </h3>


                                <div class="notice-card-content">
                                    ${escapeHTML(
                                        notice.content
                                    )}
                                </div>

                            </div>

                        </div>


                        <div class="card-actions">

                            <button
                                type="button"
                                class="small-button"
                                data-notice-action="edit"
                                data-id="${escapeHTML(
                                    notice.id
                                )}">
                                Edit
                            </button>


                            <button
                                type="button"
                                class="small-button"
                                data-notice-action="publish"
                                data-id="${escapeHTML(
                                    notice.id
                                )}">

                                ${
                                    published
                                        ? "Unpublish"
                                        : "Publish"
                                }

                            </button>


                            <button
                                type="button"
                                class="small-button ${
                                    important
                                        ? "active"
                                        : ""
                                }"
                                data-notice-action="important"
                                data-id="${escapeHTML(
                                    notice.id
                                )}">

                                ${
                                    important
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
                                )}">
                                Delete
                            </button>

                        </div>

                    </article>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       NOTICE MODAL
    ===================================================== */

    function openModal(
        modal
    ) {

        if (!modal) {
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


    function closeModal(
        modal
    ) {

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


    function openNoticeForm(
        notice = null
    ) {

        const form =
            $("noticeForm");

        if (!form) {
            return;
        }


        form.reset();


        if ($("noticeId")) {
            $("noticeId").value =
                notice?.id || "";
        }


        if ($("noticeTitle")) {
            $("noticeTitle").value =
                notice?.title || "";
        }


        if ($("noticeContent")) {
            $("noticeContent").value =
                notice?.content || "";
        }


        if ($("noticeCategory")) {
            $("noticeCategory").value =
                notice?.category ||
                "GENERAL";
        }


        if ($("noticePublished")) {
            $("noticePublished").checked =
                notice
                    ? notice.published === true
                    : true;
        }


        if ($("noticeImportant")) {
            $("noticeImportant").checked =
                notice?.important === true;
        }


        if ($("noticeModalTitle")) {

            $("noticeModalTitle")
                .textContent =
                notice
                    ? "Edit Notice"
                    : "New Notice";

        }


        openModal(
            $("noticeModal")
        );

    }


    $("newNoticeButton")
        ?.addEventListener(
            "click",
            () => {

                openNoticeForm();

            }
        );


    $("noticeForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("noticeId")
                        ?.value
                        .trim() || "";


                const title =
                    $("noticeTitle")
                        ?.value
                        .trim() || "";


                const content =
                    $("noticeContent")
                        ?.value
                        .trim() || "";


                const category =
                    $("noticeCategory")
                        ?.value
                        .trim() ||
                    "GENERAL";


                const published =
                    $("noticePublished")
                        ?.checked ??
                    true;


                const important =
                    $("noticeImportant")
                        ?.checked ??
                    false;


                if (
                    !title ||
                    !content
                ) {

                    alert(
                        "Please enter title and content."
                    );

                    return;

                }


                const payload = {

                    title,

                    content,

                    category,

                    published,

                    important,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                try {

                    let response;


                    if (id) {

                        response =
                            await supabaseClient
                                .from("notices")
                                .update(payload)
                                .eq(
                                    "id",
                                    id
                                );

                    } else {

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


                    closeModal(
                        $("noticeModal")
                    );


                    await loadNotices();

                    await loadDashboardCounts();


                    alert(
                        id
                            ? "Notice updated successfully."
                            : "Notice published successfully."
                    );


                } catch (error) {

                    showError(error);

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


                /* EDIT */

                if (
                    action === "edit"
                ) {

                    openNoticeForm(
                        notice
                    );

                    return;

                }


                /* PUBLISH */

                if (
                    action === "publish"
                ) {

                    const published =
                        notice.published !== true;


                    const {
                        error
                    } =
                        await supabaseClient
                            .from("notices")
                            .update({
                                published,
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


                    await loadNotices();

                    return;

                }


                /* IMPORTANT */

                if (
                    action === "important"
                ) {

                    const important =
                        notice.important !== true;


                    const {
                        error
                    } =
                        await supabaseClient
                            .from("notices")
                            .update({
                                important,
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


                    await loadNotices();

                    return;

                }


                /* DELETE */

                if (
                    action === "delete"
                ) {

                    const confirmed =
                        confirm(
                            `Delete "${notice.title}"?`
                        );


                    if (!confirmed) {
                        return;
                    }


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

                        showError(error);

                        return;

                    }


                    await loadNotices();

                    await loadDashboardCounts();

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


                        const {
                            data:
                                publicData
                        } =
                            supabaseClient
                                .storage
                                .from("gallery")
                                .getPublicUrl(
                                    filename
                                );


                        /*
                         * Save the public URL in gallery table.
                         */

                        const {
                            error:
                                databaseError
                        } =
                            await supabaseClient
                                .from("gallery")
                                .insert([
                                    {
                                        title:
                                            file.name,
                                        image_url:
                                            publicData.publicUrl
                                    }
                                ]);


                        if (databaseError) {

                            /*
                             * If database insert fails,
                             * remove uploaded file.
                             */

                            await supabaseClient
                                .storage
                                .from("gallery")
                                .remove([
                                    filename
                                ]);

                            throw databaseError;

                        }

                    }


                    event.target.value = "";


                    await loadGallery();

                    await loadDashboardCounts();


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


                    /*
                     * Delete matching database row.
                     */

                    await supabaseClient
                        .from("gallery")
                        .delete()
                        .like(
                            "image_url",
                            `%/${filename}`
                        );


                    await loadGallery();

                    await loadDashboardCounts();


                } catch (error) {

                    showError(error);

                }

            }
        );


    /* =====================================================
       MODAL CLOSE
    ===================================================== */

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
                    closeModal
                );

        }
    );


    /* =====================================================
       DASHBOARD INITIALIZATION
    ===================================================== */

    let initialized =
        false;


    async function initializeDashboard() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        try {

            await Promise.all([

                loadDashboardCounts(),

                loadNotices(),

                loadGallery()

            ]);


            console.log(
                "GSA Admin CMS initialized."
            );


        } catch (error) {

            console.error(
                "Dashboard initialization error:",
                error
            );

        }

    }


    /* =====================================================
       START
    ===================================================== */

    if (session) {

        await initializeDashboard();

    }

});
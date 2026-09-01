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
                emailInput
                    ?.value
                    .trim() || "";

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


                if (!data?.session) {

                    throw new Error(
                        "Login failed. No active session."
                    );

                }


                showDashboard();

                await initializeDashboard();


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

    supabaseClient
        .auth
        .onAuthStateChange(
            (event, session) => {

                if (session) {

                    showDashboard();

                    initializeDashboard();

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

            console.error(
                "Notices:",
                error
            );

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

                    <article class="notice-card">

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
                                    published
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
       NOTICE FORM
    ===================================================== */

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


    /* =====================================================
       NOTICE SAVE
    ===================================================== */

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


                if (
                    action ===
                    "edit"
                ) {

                    openNoticeForm(
                        notice
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

                        showError(error);

                        return;

                    }


                    await loadNotices();

                    return;

                }


                if (
                    action ===
                    "important"
                ) {

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

                        showError(error);

                        return;

                    }


                    await loadNotices();

                    return;

                }


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
   SAVE TOURNAMENT
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


            if (!name) {

                alert(
                    "Please enter tournament name."
                );

                return;
            }


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


            try {

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


                closeModal(
                    $("tournamentModal")
                );


                await loadTournaments();


                alert(
                    id
                        ? "Tournament updated successfully."
                        : "Tournament added successfully."
                );

            } catch (error) {

                showError(error);

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

            loadMembershipApplications()

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

/* =====================================================
   TOURNAMENT CMS
===================================================== */

let tournaments = [];


/* =====================================================
   LOAD TOURNAMENTS
===================================================== */

async function loadTournaments() {

    const list =
        document.getElementById("tournamentList");

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
    } = await supabaseClient
        .from("tournaments")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Tournament loading error:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">
                Unable to load tournaments.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    tournaments =
        data || [];


    renderTournaments();
}


/* =====================================================
   RENDER
===================================================== */

function renderTournaments() {

    const list =
        document.getElementById("tournamentList");

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
        tournaments.map(item => {

            const published =
                item.published !== false;


            return `

                <article class="content-card">

                    <div class="content-card-top">

                        <div>

                            <div class="notice-meta">

                                <span class="badge">
                                    ${escapeHTML(
                                        item.status ||
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
                                    item.name ||
                                    "Tournament"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    item.season ||
                                    ""
                                )}
                            </p>


                            <p>
                                ${escapeHTML(
                                    item.venue ||
                                    "Venue TBA"
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="card-actions">

                        <button
                            type="button"
                            class="small-button"
                            data-tournament-action="edit"
                            data-id="${escapeHTML(
                                item.id
                            )}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="small-button"
                            data-tournament-action="publish"
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
                            data-tournament-action="delete"
                            data-id="${escapeHTML(
                                item.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `;

        }).join("");
}


/* =====================================================
   OPEN TOURNAMENT FORM
===================================================== */

function openTournamentForm(
    tournament = null
) {

    const form =
        document.getElementById(
            "tournamentForm"
        );

    const modal =
        document.getElementById(
            "tournamentModal"
        );


    if (!form || !modal) {

        alert(
            "Tournament modal is missing from admin.html."
        );

        return;
    }


    form.reset();


    document.getElementById(
        "tournamentId"
    ).value =
        tournament?.id || "";


    document.getElementById(
        "tournamentName"
    ).value =
        tournament?.name || "";


    document.getElementById(
        "tournamentSeason"
    ).value =
        tournament?.season || "";


    document.getElementById(
        "tournamentStatus"
    ).value =
        tournament?.status ||
        "UPCOMING";


    document.getElementById(
        "tournamentVenue"
    ).value =
        tournament?.venue || "";


    document.getElementById(
        "tournamentDate"
    ).value =
        tournament?.date_details || "";


    document.getElementById(
        "tournamentDescription"
    ).value =
        tournament?.description || "";


    document.getElementById(
        "tournamentPublished"
    ).checked =
        tournament
            ? tournament.published !== false
            : true;


    const title =
        modal.querySelector("h2");


    if (title) {

        title.textContent =
            tournament
                ? "Edit Tournament"
                : "Add Tournament";

    }


    openModal(modal);
}


/* =====================================================
   ADD BUTTON
===================================================== */

document
    .getElementById("newTournamentButton")
    ?.addEventListener(
        "click",
        () => {

            openTournamentForm();

        }
    );


/* =====================================================
   SAVE TOURNAMENT
===================================================== */

document
    .getElementById("tournamentForm")
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                document
                    .getElementById(
                        "tournamentId"
                    )
                    ?.value
                    .trim() || "";


            const name =
                document
                    .getElementById(
                        "tournamentName"
                    )
                    ?.value
                    .trim() || "";


            const season =
                document
                    .getElementById(
                        "tournamentSeason"
                    )
                    ?.value
                    .trim() || null;


            const status =
                document
                    .getElementById(
                        "tournamentStatus"
                    )
                    ?.value ||
                "UPCOMING";


            const venue =
                document
                    .getElementById(
                        "tournamentVenue"
                    )
                    ?.value
                    .trim() || null;


            const dateDetails =
                document
                    .getElementById(
                        "tournamentDate"
                    )
                    ?.value
                    .trim() || null;


            const description =
                document
                    .getElementById(
                        "tournamentDescription"
                    )
                    ?.value
                    .trim() || null;


            const published =
                document
                    .getElementById(
                        "tournamentPublished"
                    )
                    ?.checked !== false;


            if (!name) {

                alert(
                    "Please enter tournament name."
                );

                return;
            }


            const payload = {

                name,

                season,

                status,

                venue,

                date_details:
                    dateDetails,

                description,

                published

            };


            try {

                let response;


                if (id) {

                    response =
                        await supabaseClient
                            .from("tournaments")
                            .update(payload)
                            .eq("id", id);

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


                closeModal(
                    document.getElementById(
                        "tournamentModal"
                    )
                );


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

                alert(
                    error.message ||
                    "Unable to save tournament."
                );

            }

        }
    );


/* =====================================================
   TOURNAMENT ACTIONS
===================================================== */

document
    .getElementById("tournamentList")
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


            if (action === "edit") {

                openTournamentForm(
                    tournament
                );

                return;
            }


            if (action === "publish") {

                const {
                    error
                } =
                    await supabaseClient
                        .from("tournaments")
                        .update({
                            published:
                                tournament.published === false
                        })
                        .eq("id", id);


                if (error) {

                    alert(error.message);

                    return;
                }


                await loadTournaments();

                return;
            }


            if (action === "delete") {

                if (
                    !confirm(
                        "Delete this tournament?"
                    )
                ) {
                    return;
                }


                const {
                    error
                } =
                    await supabaseClient
                        .from("tournaments")
                        .delete()
                        .eq("id", id);


                if (error) {

                    alert(error.message);

                    return;
                }


                await loadTournaments();
            }

        }
    );

    /* =====================================================
       START
    ===================================================== */

    if (currentSession) {

        await initializeDashboard();

    }

});
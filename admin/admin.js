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
   FRIENDLY MATCH APPLICATIONS — STEP 1
===================================================== */

let friendlyApplications = [];


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
        event => {

            const button =
                event.target.closest(
                    "[data-friendly-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const application =
                friendlyApplications.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!application) {
                return;
            }


            if (
                button.dataset.friendlyAction ===
                "view"
            ) {

                openFriendlyApplication(
                    application
                );

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
                ? "Application approved and PDF generated successfully."
                : "Application rejected and PDF generated successfully."
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
       START
    ===================================================== */

    if (currentSession) {

        await initializeDashboard();

    }

});

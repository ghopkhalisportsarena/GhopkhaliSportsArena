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
   MEMBERSHIP APPLICATION PDF — STABLE HD VERSION
===================================================== */

async function generateMembershipApplicationPDF(application) {

    if (!application) {
        throw new Error("Application data not found.");
    }

    if (
        typeof window.jspdf === "undefined" ||
        typeof window.html2canvas === "undefined"
    ) {
        throw new Error(
            "PDF libraries are not loaded."
        );
    }

    const { jsPDF } = window.jspdf;


    /* =================================================
       HELPERS
    ================================================= */

    const safe = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    const formatDate = (value) => {

        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return safe(value);
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    };


    /* =================================================
       IMAGE TO DATA URL
       Fixes logo/photo not appearing in PDF
    ================================================= */

    const imageToDataURL = async (src) => {

        if (!src) {
            return null;
        }

        try {

            const response =
                await fetch(
                    src,
                    {
                        mode: "cors",
                        cache: "no-cache"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Image request failed: " +
                    response.status
                );
            }

            const blob =
                await response.blob();

            return await new Promise(
                (resolve, reject) => {

                    const reader =
                        new FileReader();

                    reader.onload =
                        () => resolve(
                            reader.result
                        );

                    reader.onerror =
                        () => reject(
                            new Error(
                                "Image conversion failed."
                            )
                        );

                    reader.readAsDataURL(blob);
                }
            );

        } catch (error) {

            console.warn(
                "Image could not be loaded:",
                src,
                error
            );

            return null;
        }
    };


    /* =================================================
       LOAD LOGO
    ================================================= */

    const logoData =
        await imageToDataURL(
            new URL(
                "gsa.png",
                window.location.href
            ).href
        );


    /* =================================================
       LOAD MEMBER PHOTO
    ================================================= */

    let photoData = null;

    if (application.photo_url) {

        photoData =
            await imageToDataURL(
                application.photo_url
            );
    }


    /* =================================================
       DATA
    ================================================= */

    const applicationId =
        application.id
            ? String(application.id)
            : "N/A";

    const status =
        application.status ||
        "pending";

    const applicantName =
        application.full_name_en ||
        application.full_name_bn ||
        "Applicant";

    const cleanName =
        String(applicantName)
            .replace(
                /[^a-zA-Z0-9\u0980-\u09FF]+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );


    /* =================================================
       PDF HTML
    ================================================= */

    const page =
        document.createElement("div");


    page.style.position = "fixed";
    page.style.left = "-30000px";
    page.style.top = "0";
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.background = "#ffffff";
    page.style.zIndex = "999999";


    page.innerHTML = `

<style>

* {
    box-sizing: border-box;
}

.pdf-page {

    width: 794px;
    height: 1123px;

    background: #ffffff;

    color: #111827;

    font-family:
        Arial,
        "Noto Sans Bengali",
        sans-serif;

    padding:
        34px 42px 30px 42px;

    position: relative;

    overflow: hidden;
}


/* =====================================================
   TOP BAR
===================================================== */

.top-bar {

    height: 7px;

    width: 100%;

    background:
        linear-gradient(
            90deg,
            #007aff,
            #5856d6,
            #34c759
        );

    position: absolute;

    top: 0;
    left: 0;
}


/* =====================================================
   HEADER
===================================================== */

.header {

    width: 100%;

    height: 104px;

    display: flex;

    align-items: center;

    border-bottom:
        1px solid #dfe3e8;

    padding-bottom: 14px;

    margin-bottom: 18px;
}

.header-text {

    width: calc(100% - 105px);

}

.club-title {

    font-family:
        Arial,
        sans-serif;

    font-size: 27px;

    font-weight: 800;

    color: #111827;

    line-height: 1.15;

    margin-bottom: 6px;
}

.club-bangla {

    font-family:
        "Noto Sans Bengali",
        Arial,
        sans-serif;

    font-size: 18px;

    font-weight: 700;

    color: #1f2937;

    margin-bottom: 4px;
}

.established {

    font-size: 10px;

    color: #6b7280;

    font-weight: 600;
}


/* =====================================================
   LOGO
===================================================== */

.logo-area {

    width: 96px;

    height: 96px;

    display: flex;

    justify-content: center;

    align-items: center;

    flex-shrink: 0;

    margin-left: 9px;
}

.logo {

    width: 88px;

    height: 88px;

    object-fit: contain;

    display: block;
}


/* =====================================================
   TITLE
===================================================== */

.document-title {

    font-family:
        Arial,
        sans-serif;

    font-size: 20px;

    font-weight: 800;

    color: #111827;

    margin-bottom: 3px;
}

.document-subtitle {

    font-size: 10px;

    color: #6b7280;

    margin-bottom: 13px;
}


/* =====================================================
   META
===================================================== */

.meta-row {

    width: 100%;

    display: flex;

    gap: 10px;

    margin-bottom: 13px;
}

.meta-box {

    flex: 1;

    min-height: 48px;

    padding:
        8px 11px;

    background: #f7f9fc;

    border:
        1px solid #e2e6eb;

    border-radius: 9px;
}

.meta-label {

    font-size: 8px;

    color: #6b7280;

    font-weight: 700;

    text-transform: uppercase;

    margin-bottom: 4px;
}

.meta-value {

    font-size: 10px;

    color: #111827;

    font-weight: 700;
}

.status {

    display: inline-block;

    padding:
        3px 8px;

    background: #e8f5e9;

    color: #188038;

    border-radius: 20px;

    font-size: 8px;

    font-weight: 800;

    text-transform: uppercase;
}


/* =====================================================
   SECTION
===================================================== */

.section {

    width: 100%;

    border:
        1px solid #dfe3e8;

    border-radius: 9px;

    margin-bottom: 11px;

    overflow: hidden;

    background: #ffffff;
}

.section-title {

    height: 31px;

    line-height: 31px;

    padding-left: 12px;

    background: #f6f8fb;

    border-bottom:
        1px solid #e1e5ea;

    font-size: 10px;

    font-weight: 800;

    color: #111827;
}

.section-title:before {

    content: "";

    display: inline-block;

    width: 4px;

    height: 13px;

    background: #007aff;

    border-radius: 4px;

    margin-right: 7px;

    vertical-align: -2px;
}

.section-content {

    padding: 11px 12px;
}


/* =====================================================
   PERSONAL SECTION
===================================================== */

.personal {

    display: flex;

    width: 100%;
}

.photo-container {

    width: 108px;

    flex-shrink: 0;

    margin-right: 15px;
}

.member-photo {

    width: 100px;

    height: 125px;

    object-fit: cover;

    display: block;

    border:
        1px solid #cfd5dc;

    border-radius: 8px;

    background: #f3f4f6;
}

.photo-empty {

    width: 100px;

    height: 125px;

    border:
        1px dashed #c7ced8;

    border-radius: 8px;

    background: #f7f9fc;

    display: flex;

    align-items: center;

    justify-content: center;

    text-align: center;

    color: #9ca3af;

    font-size: 9px;

    font-weight: 700;
}


/* =====================================================
   DATA TABLE
===================================================== */

.data-table {

    width: 100%;

    border-collapse: collapse;

    table-layout: fixed;
}

.data-table td {

    padding:
        4px 7px;

    vertical-align: top;

    border: none;
}

.data-label {

    width: 110px;

    color: #6b7280;

    font-size: 8px;

    font-weight: 600;
}

.data-value {

    color: #111827;

    font-size: 9.5px;

    font-weight: 700;

    word-wrap: break-word;

    overflow-wrap: break-word;

    line-height: 1.3;
}


/* =====================================================
   TWO COLUMN TABLE
===================================================== */

.two-col {

    width: 100%;

    border-collapse: collapse;

    table-layout: fixed;
}

.two-col td {

    width: 50%;

    vertical-align: top;

    padding:
        4px 8px;
}

.field-label {

    font-size: 8px;

    color: #6b7280;

    font-weight: 600;

    margin-bottom: 2px;
}

.field-value {

    font-size: 9.5px;

    color: #111827;

    font-weight: 700;

    line-height: 1.3;

    word-break: break-word;
}


/* =====================================================
   SPORTS
===================================================== */

.sports-box {

    width: 100%;

    padding:
        8px 10px;

    background: #f0f7ff;

    border:
        1px solid #d6e8ff;

    border-radius: 7px;

    color: #1e40af;

    font-size: 9.5px;

    font-weight: 700;

    line-height: 1.4;
}


/* =====================================================
   DECLARATION
===================================================== */

.declaration {

    padding:
        9px 10px;

    background: #fafafa;

    border:
        1px solid #e3e6ea;

    border-radius: 7px;

    font-size: 8.5px;

    color: #374151;

    line-height: 1.55;
}


/* =====================================================
   SIGNATURE
===================================================== */

.signature-row {

    display: flex;

    gap: 20px;

    margin-top: 19px;
}

.signature-box {

    flex: 1;

    text-align: center;

    padding-top: 20px;

    border-top:
        1px solid #9ca3af;
}

.signature-label {

    font-size: 8px;

    color: #6b7280;

    font-weight: 600;
}


/* =====================================================
   FOOTER
===================================================== */

.footer {

    position: absolute;

    left: 42px;

    right: 42px;

    bottom: 17px;

    height: 22px;

    border-top:
        1px solid #e1e5ea;

    padding-top: 6px;

    display: flex;

    justify-content: space-between;
}

.footer-left,
.footer-right {

    font-size: 7px;

    color: #6b7280;

    font-weight: 600;
}

</style>


<div class="pdf-page">

    <div class="top-bar"></div>


    <!-- HEADER -->

    <div class="header">

        <div class="header-text">

            <div class="club-title">
                GHOPKHALI SPORTS ARENA
            </div>

            <div class="club-bangla">
                ঘোপখালী স্পোর্টস অ্যারিনা
            </div>

            <div class="established">
                স্থাপিত: ১৯-০৭-২০২৬
            </div>

        </div>


        <div class="logo-area">

            ${
                logoData
                    ? `
                        <img
                            src="${logoData}"
                            class="logo"
                            alt="GSA Logo"
                        >
                      `
                    : `
                        <div
                            style="
                                width:88px;
                                height:88px;
                                border:1px solid #d1d5db;
                                border-radius:50%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:11px;
                                font-weight:800;
                                color:#6b7280;
                            "
                        >
                            GSA
                        </div>
                      `
            }

        </div>

    </div>


    <!-- DOCUMENT TITLE -->

    <div class="document-title">
        CLUB MEMBERSHIP APPLICATION
    </div>

    <div class="document-subtitle">
        Official Club Membership Application Form
    </div>


    <!-- META -->

    <div class="meta-row">

        <div class="meta-box">

            <div class="meta-label">
                Application ID
            </div>

            <div class="meta-value">
                ${safe(applicationId)}
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
                    ${safe(status)}
                </span>

            </div>

        </div>

    </div>


    <!-- PERSONAL INFORMATION -->

    <div class="section">

        <div class="section-title">
            Personal Information
        </div>

        <div class="section-content">

            <div class="personal">

                <div class="photo-container">

                    ${
                        photoData
                            ? `
                                <img
                                    src="${photoData}"
                                    class="member-photo"
                                    alt="Applicant Photo"
                                >
                              `
                            : `
                                <div class="photo-empty">
                                    Applicant Photo
                                </div>
                              `
                    }

                </div>


                <div style="flex:1;">

                    <table class="data-table">

                        <tr>

                            <td class="data-label">
                                নাম (বাংলা)
                            </td>

                            <td class="data-value">
                                ${safe(application.full_name_bn)}
                            </td>

                            <td class="data-label">
                                Full Name
                            </td>

                            <td class="data-value">
                                ${safe(application.full_name_en)}
                            </td>

                        </tr>


                        <tr>

                            <td class="data-label">
                                Father's Name
                            </td>

                            <td class="data-value">
                                ${safe(application.father_name)}
                            </td>

                            <td class="data-label">
                                Mother's Name
                            </td>

                            <td class="data-value">
                                ${safe(application.mother_name)}
                            </td>

                        </tr>


                        <tr>

                            <td class="data-label">
                                Date of Birth
                            </td>

                            <td class="data-value">
                                ${formatDate(application.date_of_birth)}
                            </td>

                            <td class="data-label">
                                Blood Group
                            </td>

                            <td class="data-value">
                                ${safe(application.blood_group)}
                            </td>

                        </tr>


                        <tr>

                            <td class="data-label">
                                Profession
                            </td>

                            <td class="data-value">
                                ${safe(application.profession)}
                            </td>

                            <td class="data-label">
                                NID / Birth Reg.
                            </td>

                            <td class="data-value">
                                ${safe(application.nid_birth_registration)}
                            </td>

                        </tr>

                    </table>

                </div>

            </div>

        </div>

    </div>


    <!-- CONTACT -->

    <div class="section">

        <div class="section-title">
            Contact Information
        </div>

        <div class="section-content">

            <table class="two-col">

                <tr>

                    <td>

                        <div class="field-label">
                            Mobile Number
                        </div>

                        <div class="field-value">
                            ${safe(application.mobile_number)}
                        </div>

                    </td>


                    <td>

                        <div class="field-label">
                            Alternative Mobile
                        </div>

                        <div class="field-value">
                            ${safe(application.alternative_mobile_number)}
                        </div>

                    </td>

                </tr>


                <tr>

                    <td>

                        <div class="field-label">
                            Email
                        </div>

                        <div class="field-value">
                            ${safe(application.email)}
                        </div>

                    </td>


                    <td>

                        <div class="field-label">
                            Current Address
                        </div>

                        <div class="field-value">
                            ${safe(application.current_address)}
                        </div>

                    </td>

                </tr>


                <tr>

                    <td colspan="2">

                        <div class="field-label">
                            Permanent Address
                        </div>

                        <div class="field-value">
                            ${safe(application.permanent_address)}
                        </div>

                    </td>

                </tr>

            </table>

        </div>

    </div>


    <!-- SPORTS -->

    <div class="section">

        <div class="section-title">
            Sports Information
        </div>

        <div class="section-content">

            <div class="field-label">
                Selected Sports
            </div>

            <div class="sports-box">
                ${safe(application.sports)}
            </div>


            <table
                class="two-col"
                style="margin-top:8px;"
            >

                <tr>

                    <td>

                        <div class="field-label">
                            Other Sports
                        </div>

                        <div class="field-value">
                            ${safe(application.other_sports)}
                        </div>

                    </td>


                    <td>

                        <div class="field-label">
                            Sports Skill
                        </div>

                        <div class="field-value">
                            ${safe(application.sports_skill)}
                        </div>

                    </td>

                </tr>


                <tr>

                    <td colspan="2">

                        <div class="field-label">
                            Previous Club Experience
                        </div>

                        <div class="field-value">
                            ${safe(application.previous_club_experience)}
                        </div>

                    </td>

                </tr>

            </table>

        </div>

    </div>


    <!-- EMERGENCY -->

    <div class="section">

        <div class="section-title">
            Emergency Contact
        </div>

        <div class="section-content">

            <table class="two-col">

                <tr>

                    <td>

                        <div class="field-label">
                            Name
                        </div>

                        <div class="field-value">
                            ${safe(application.emergency_contact_name)}
                        </div>

                    </td>


                    <td>

                        <div class="field-label">
                            Relation
                        </div>

                        <div class="field-value">
                            ${safe(application.emergency_contact_relation)}
                        </div>

                    </td>

                </tr>


                <tr>

                    <td>

                        <div class="field-label">
                            Mobile
                        </div>

                        <div class="field-value">
                            ${safe(application.emergency_contact_mobile)}
                        </div>

                    </td>


                    <td></td>

                </tr>

            </table>

        </div>

    </div>


    <!-- DECLARATION -->

    <div class="section">

        <div class="section-title">
            Declaration
        </div>

        <div class="section-content">

            <div class="declaration">

                I hereby declare that the information
                provided in this membership application
                is true and correct to the best of my
                knowledge. I agree to follow the rules,
                regulations and discipline of
                Ghopkhali Sports Arena.

            </div>


            <div class="signature-row">

                <div class="signature-box">
                    <div class="signature-label">
                        Applicant Signature
                    </div>
                </div>

                <div class="signature-box">
                    <div class="signature-label">
                        Verified By
                    </div>
                </div>

                <div class="signature-box">
                    <div class="signature-label">
                        Authorized Signature
                    </div>
                </div>

            </div>

        </div>

    </div>


    <!-- FOOTER -->

    <div class="footer">

        <div class="footer-left">
            GHOPKHALI SPORTS ARENA • Membership Department
        </div>

        <div class="footer-right">
            Official Membership Application
        </div>

    </div>

</div>
`;


    document.body.appendChild(page);


    /* =================================================
       WAIT FOR RENDER
    ================================================= */

    await new Promise(
        resolve =>
            requestAnimationFrame(
                () => resolve()
            )
    );


    /* =================================================
       HTML2CANVAS
    ================================================= */

    let canvas;

    try {

        canvas =
            await html2canvas(
                page,
                {
                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#ffffff",

                    width: 794,

                    height: 1123,

                    windowWidth: 794,

                    windowHeight: 1123,

                    logging: false,

                    imageTimeout: 15000
                }
            );

    } finally {

        /*
         * Remove temporary HTML
         * after canvas is created.
         */

        page.remove();
    }


    /* =================================================
       CREATE PDF
    ================================================= */

    const pdf =
        new jsPDF(
            {
                orientation: "portrait",

                unit: "mm",

                format: "a4",

                compress: true
            }
        );


    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            0.98
        );


    pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST"
    );


    /* =================================================
       DOWNLOAD
    ================================================= */

    const fileName =
        `GSA_Membership_Application_${cleanName || "Applicant"}.pdf`;


    pdf.save(fileName);

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
       START
    ===================================================== */

    if (currentSession) {

        await initializeDashboard();

    }

});

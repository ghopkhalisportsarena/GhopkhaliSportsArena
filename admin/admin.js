/* =========================================================
   GHOPKHALI SPORTS ARENA
   ADMIN DASHBOARD
   Supabase Management System
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

        if (!value) return "No date";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
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
       SIDEBAR
    ===================================================== */

    const sidebar =
        $("adminSidebar");

    const overlay =
        $("adminSidebarOverlay");

    const toggle =
        $("sidebarToggle");


    function openSidebar() {

        sidebar?.classList.add("active");
        overlay?.classList.add("active");

    }


    function closeSidebar() {

        sidebar?.classList.remove("active");
        overlay?.classList.remove("active");

    }


    toggle?.addEventListener(
        "click",
        openSidebar
    );


    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".sidebar-link")
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
            console.error("Modal not found.");
            return;
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal(modal) {

        if (!modal) return;

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    document
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.closest(".modal")
                    );

                }
            );

        });


    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {
                        closeModal(modal);
                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            document
                .querySelectorAll(".modal.active")
                .forEach(modal => {
                    closeModal(modal);
                });

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    $("logoutButton")?.addEventListener(
        "click",
        async () => {

            if (
                !confirm(
                    "Are you sure you want to logout?"
                )
            ) {
                return;
            }

            await supabaseClient.auth.signOut();

            window.location.href =
                "../index.html";

        }
    );


    /* =====================================================
       DASHBOARD COUNTS
    ===================================================== */

    async function countTable(table) {

        const {
            count,
            error
        } = await supabaseClient
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
        ] = await Promise.all([

            countTable("notices"),

            countTable("fixtures"),

            countTable(
                "membership_applications"
            ),

            countTable(
                "friendly_applications"
            )

        ]);


        if ($("noticeCount")) {
            $("noticeCount").textContent =
                notices;
        }


        if ($("fixtureCount")) {
            $("fixtureCount").textContent =
                fixtures;
        }


        if ($("memberCount")) {
            $("memberCount").textContent =
                members;
        }


        if ($("applicationCount")) {
            $("applicationCount").textContent =
                members + friendly;
        }

    }


    /* =====================================================
       NOTICES
    ===================================================== */

    let notices = [];


    async function loadNotices() {

        const list =
            $("noticeList");

        if (!list) return;


        list.innerHTML =
            `<div class="loading-state">
                Loading notices...
             </div>`;


        const {
            data,
            error
        } = await supabaseClient
            .from("notices")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(error);

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load notices.
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

        if (!list) return;


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
            notices.map(notice => {

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
                            class="small-button"
                            data-notice-action="edit"
                            data-id="${escapeHTML(notice.id)}"
                        >
                            Edit
                        </button>


                        <button
                            class="small-button"
                            data-notice-action="publish"
                            data-id="${escapeHTML(notice.id)}"
                        >
                            ${
                                published
                                    ? "Unpublish"
                                    : "Publish"
                            }
                        </button>


                        <button
                            class="small-button"
                            data-notice-action="important"
                            data-id="${escapeHTML(notice.id)}"
                        >
                            ${
                                important
                                    ? "Remove Important"
                                    : "Important"
                            }
                        </button>


                        <button
                            class="small-button danger"
                            data-notice-action="delete"
                            data-id="${escapeHTML(notice.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    function openNoticeForm(
        notice = null
    ) {

        const form =
            $("noticeForm");

        if (!form) return;

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


        if ($("noticePublished")) {
            $("noticePublished").checked =
                notice
                    ? notice.published === true
                    : true;
        }


        if ($("noticeImportant")) {
            $("noticeImportant").checked =
                notice
                    ? notice.important === true
                    : false;
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
            () => openNoticeForm()
        );


    $("noticeForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("noticeId")
                        ?.value
                        .trim();


                const title =
                    $("noticeTitle")
                        ?.value
                        .trim();


                const content =
                    $("noticeContent")
                        ?.value
                        .trim();


                const published =
                    $("noticePublished")
                        ?.checked;


                const important =
                    $("noticeImportant")
                        ?.checked;


                if (!title || !content) {

                    alert(
                        "Please enter title and content."
                    );

                    return;

                }


                try {

                    let response;


                    const payload = {

                        title,
                        content,
                        published,
                        important

                    };


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
                            : "Notice added successfully."
                    );


                } catch (error) {

                    showError(error);

                }

            }
        );


    $("noticeList")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-notice-action]"
                    );

                if (!button) return;


                const id =
                    button.dataset.id;


                const notice =
                    notices.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (!notice) return;


                const action =
                    button.dataset.noticeAction;


                if (action === "edit") {

                    openNoticeForm(
                        notice
                    );

                    return;

                }


                if (action === "publish") {

                    const {
                        error
                    } = await supabaseClient
                        .from("notices")
                        .update({
                            published:
                                notice.published !== true
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


                if (action === "important") {

                    const {
                        error
                    } = await supabaseClient
                        .from("notices")
                        .update({
                            important:
                                notice.important !== true
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


                if (action === "delete") {

                    if (
                        !confirm(
                            `Delete "${notice.title}"?`
                        )
                    ) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
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

        if (!list) return;


        list.innerHTML =
            `<div class="loading-state">
                Loading fixtures...
             </div>`;


        const {
            data,
            error
        } = await supabaseClient
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

        if (!list) return;


        if (!fixtures.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No fixtures found.
                 </div>`;

            return;

        }


        list.innerHTML =
            fixtures.map(item => {

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
                            class="small-button"
                            data-fixture-action="edit"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Edit
                        </button>


                        <button
                            class="small-button"
                            data-fixture-action="publish"
                            data-id="${escapeHTML(item.id)}"
                        >
                            ${
                                published
                                    ? "Unpublish"
                                    : "Publish"
                            }
                        </button>


                        <button
                            class="small-button danger"
                            data-fixture-action="delete"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

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
                "fixtureForm not found in admin.html"
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
                "fixtureModal not found in admin.html"
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


        openModal(modal);

    }


    /* =====================================================
       FIXTURE BUTTON
    ===================================================== */

    const newFixtureButton =
        $("newFixtureButton");


    if (newFixtureButton) {

        newFixtureButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                console.log(
                    "Add Fixture clicked."
                );

                openFixtureForm();

            }
        );

    } else {

        console.warn(
            "newFixtureButton not found."
        );

    }


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
                        .trim();


                const home =
                    $("fixtureHome")
                        ?.value
                        .trim();


                const away =
                    $("fixtureAway")
                        ?.value
                        .trim();


                const date =
                    $("fixtureDate")
                        ?.value;


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


                console.log(
                    "Saving fixture:",
                    payload
                );


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

                        console.error(
                            "Fixture save error:",
                            response.error
                        );

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


                if (!button) return;


                const id =
                    button.dataset.id;


                const item =
                    fixtures.find(
                        row =>
                            String(row.id) ===
                            String(id)
                    );


                if (!item) return;


                const action =
                    button.dataset.fixtureAction;


                if (action === "edit") {

                    openFixtureForm(
                        item
                    );

                    return;

                }


                if (action === "publish") {

                    const {
                        error
                    } = await supabaseClient
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


                if (action === "delete") {

                    if (
                        !confirm(
                            "Delete this fixture?"
                        )
                    ) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
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


    async function loadTournaments() {

        const list =
            $("tournamentList");

        if (!list) return;


        const {
            data,
            error
        } = await supabaseClient
            .from("tournaments")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Tournaments:",
                error
            );

            list.innerHTML =
                `<div class="empty-state">
                    Tournament table is not available.
                 </div>`;

            return;

        }


        tournaments =
            data || [];

        renderTournaments();

    }


    function renderTournaments() {

        const list =
            $("tournamentList");

        if (!list) return;


        if (!tournaments.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No tournaments found.
                 </div>`;

            return;

        }


        list.innerHTML =
            tournaments.map(item => {

                return `

                <article class="content-card">

                    <div class="content-card-top">

                        <div>

                            <span class="badge">
                                ${escapeHTML(
                                    item.status ||
                                    "UPCOMING"
                                )}
                            </span>


                            <h3>
                                ${escapeHTML(
                                    item.name ||
                                    item.title ||
                                    "Tournament"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    item.subtitle ||
                                    item.season ||
                                    ""
                                )}
                            </p>

                        </div>


                        <div class="content-date">
                            ${formatDate(
                                item.date ||
                                item.start_date
                            )}
                        </div>

                    </div>


                    <div class="card-actions">

                        <button
                            class="small-button"
                            data-tournament-action="edit"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Edit
                        </button>


                        <button
                            class="small-button danger"
                            data-tournament-action="delete"
                            data-id="${escapeHTML(item.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    /* =====================================================
       GALLERY
    ===================================================== */

    async function loadGallery() {

        const list =
            $("galleryList");

        if (!list) return;


        list.innerHTML =
            `<div class="loading-state">
                Loading gallery...
             </div>`;


        const {
            data,
            error
        } = await supabaseClient
            .storage
            .from("gallery")
            .list(
                "",
                {
                    limit: 100,
                    sortBy: {
                        column: "created_at",
                        order: "desc"
                    }
                }
            );


        if (error) {

            console.error(error);

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load gallery.
                 </div>`;

            return;

        }


        const files =
            (data || []).filter(
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
            files.map(file => {

                const {
                    data: publicData
                } = supabaseClient
                    .storage
                    .from("gallery")
                    .getPublicUrl(
                        file.name
                    );


                return `

                <article class="gallery-admin-card">

                    <img
                        src="${escapeHTML(
                            publicData.publicUrl
                        )}"
                        alt="GSA Gallery"
                    >


                    <button
                        class="gallery-delete"
                        data-gallery-delete="${escapeHTML(
                            file.name
                        )}"
                    >
                        ×
                    </button>

                </article>

                `;

            }).join("");

    }


    $("galleryUpload")
        ?.addEventListener(
            "change",
            async event => {

                const files =
                    Array.from(
                        event.target.files || []
                    );


                if (!files.length) return;


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


                    const safeName =
                        file.name.replace(
                            /[^a-zA-Z0-9._-]/g,
                            "-"
                        );


                    const path =
                        `${Date.now()}-${safeName}`;


                    const {
                        error
                    } = await supabaseClient
                        .storage
                        .from("gallery")
                        .upload(
                            path,
                            file,
                            {
                                cacheControl:
                                    "3600",
                                upsert:
                                    false
                            }
                        );


                    if (error) {

                        showError(error);

                        break;

                    }

                }


                event.target.value =
                    "";

                await loadGallery();

            }
        );


    $("galleryList")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-gallery-delete]"
                    );


                if (!button) return;


                if (
                    !confirm(
                        "Delete this photo?"
                    )
                ) {
                    return;
                }


                const {
                    error
                } = await supabaseClient
                    .storage
                    .from("gallery")
                    .remove([
                        button.dataset.galleryDelete
                    ]);


                if (error) {

                    showError(error);

                    return;

                }


                await loadGallery();

            }
        );


    /* =====================================================
       FRIENDLY APPLICATIONS
    ===================================================== */

    let friendlyApplications = [];


    async function loadFriendlyApplications() {

        const list =
            $("friendlyList");

        if (!list) return;


        const {
            data,
            error
        } = await supabaseClient
            .from(
                "friendly_applications"
            )
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
                    Unable to load applications.
                 </div>`;

            return;

        }


        friendlyApplications =
            data || [];


        renderFriendlyApplications();

    }


    function renderFriendlyApplications() {

        const list =
            $("friendlyList");

        if (!list) return;


        if (!friendlyApplications.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No Friendly Match applications.
                 </div>`;

            return;

        }


        list.innerHTML =
            friendlyApplications.map(item => {

                return `

                <article class="application-card">

                    <div class="application-top">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    item.team_name ||
                                    "Unknown Team"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.contact_person ||
                                    ""
                                )}
                            </p>

                        </div>


                        <select
                            class="status-select"
                            data-friendly-status
                            data-id="${escapeHTML(item.id)}"
                        >

                            ${
                                [
                                    "pending",
                                    "approved",
                                    "rejected",
                                    "completed"
                                ]
                                .map(
                                    status => `
                                    <option
                                        value="${status}"
                                        ${
                                            item.status ===
                                            status
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${status}
                                    </option>
                                    `
                                )
                                .join("")
                            }

                        </select>

                    </div>


                    <div class="application-info">

                        <div class="info-box">
                            <span>PHONE</span>
                            <strong>
                                ${escapeHTML(
                                    item.phone
                                )}
                            </strong>
                        </div>


                        <div class="info-box">
                            <span>DATE</span>
                            <strong>
                                ${formatDate(
                                    item.preferred_date
                                )}
                            </strong>
                        </div>


                        <div class="info-box">
                            <span>TIME</span>
                            <strong>
                                ${escapeHTML(
                                    item.preferred_time ||
                                    "TBA"
                                )}
                            </strong>
                        </div>

                    </div>


                    <div class="card-actions">

                        <button
                            class="small-button"
                            data-view-friendly
                            data-id="${escapeHTML(item.id)}"
                        >
                            View Details
                        </button>


                        <button
                            class="small-button danger"
                            data-delete-friendly
                            data-id="${escapeHTML(item.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    $("friendlyList")
        ?.addEventListener(
            "change",
            async event => {

                const select =
                    event.target.closest(
                        "[data-friendly-status]"
                    );


                if (!select) return;


                const {
                    error
                } = await supabaseClient
                    .from(
                        "friendly_applications"
                    )
                    .update({
                        status:
                            select.value
                    })
                    .eq(
                        "id",
                        select.dataset.id
                    );


                if (error) {
                    showError(error);
                }

            }
        );


    $("friendlyList")
        ?.addEventListener(
            "click",
            async event => {

                const view =
                    event.target.closest(
                        "[data-view-friendly]"
                    );


                if (view) {

                    const item =
                        friendlyApplications.find(
                            row =>
                                String(row.id) ===
                                String(
                                    view.dataset.id
                                )
                        );


                    if (item) {

                        showApplication(
                            "Friendly Match Application",
                            item
                        );

                    }

                    return;

                }


                const deleteButton =
                    event.target.closest(
                        "[data-delete-friendly]"
                    );


                if (!deleteButton) return;


                if (
                    !confirm(
                        "Delete this application?"
                    )
                ) {
                    return;
                }


                const {
                    error
                } = await supabaseClient
                    .from(
                        "friendly_applications"
                    )
                    .delete()
                    .eq(
                        "id",
                        deleteButton.dataset.id
                    );


                if (error) {

                    showError(error);

                    return;

                }


                await loadFriendlyApplications();

                await loadDashboardCounts();

            }
        );


    /* =====================================================
       MEMBERSHIP APPLICATIONS
    ===================================================== */

    let membershipApplications = [];


    async function loadMembershipApplications() {

        const list =
            $("membershipList");

        if (!list) return;


        const {
            data,
            error
        } = await supabaseClient
            .from(
                "membership_applications"
            )
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
                    Unable to load membership applications.
                 </div>`;

            return;

        }


        membershipApplications =
            data || [];


        renderMembershipApplications();

    }


    function renderMembershipApplications() {

        const list =
            $("membershipList");

        if (!list) return;


        if (!membershipApplications.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No membership applications.
                 </div>`;

            return;

        }


        list.innerHTML =
            membershipApplications.map(item => {

                return `

                <article class="application-card">

                    <div class="application-top">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    item.full_name ||
                                    "Unknown Applicant"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.phone ||
                                    ""
                                )}
                            </p>

                        </div>


                        <select
                            class="status-select"
                            data-membership-status
                            data-id="${escapeHTML(item.id)}"
                        >

                            ${
                                [
                                    "pending",
                                    "approved",
                                    "rejected",
                                    "completed"
                                ]
                                .map(
                                    status => `
                                    <option
                                        value="${status}"
                                        ${
                                            item.status ===
                                            status
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${status}
                                    </option>
                                    `
                                )
                                .join("")
                            }

                        </select>

                    </div>


                    <div class="application-info">

                        <div class="info-box">

                            <span>
                                DATE OF BIRTH
                            </span>

                            <strong>
                                ${formatDate(
                                    item.date_of_birth
                                )}
                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                OCCUPATION
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.occupation ||
                                    "—"
                                )}
                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                POSITION / SKILL
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item.preferred_position ||
                                    "—"
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="card-actions">

                        <button
                            class="small-button"
                            data-view-membership
                            data-id="${escapeHTML(item.id)}"
                        >
                            View Details
                        </button>


                        <button
                            class="small-button danger"
                            data-delete-membership
                            data-id="${escapeHTML(item.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    $("membershipList")
        ?.addEventListener(
            "change",
            async event => {

                const select =
                    event.target.closest(
                        "[data-membership-status]"
                    );


                if (!select) return;


                const {
                    error
                } = await supabaseClient
                    .from(
                        "membership_applications"
                    )
                    .update({
                        status:
                            select.value
                    })
                    .eq(
                        "id",
                        select.dataset.id
                    );


                if (error) {
                    showError(error);
                }

            }
        );


    $("membershipList")
        ?.addEventListener(
            "click",
            async event => {

                const view =
                    event.target.closest(
                        "[data-view-membership]"
                    );


                if (view) {

                    const item =
                        membershipApplications.find(
                            row =>
                                String(row.id) ===
                                String(
                                    view.dataset.id
                                )
                        );


                    if (item) {

                        showApplication(
                            "Club Membership Application",
                            item
                        );

                    }

                    return;

                }


                const deleteButton =
                    event.target.closest(
                        "[data-delete-membership]"
                    );


                if (!deleteButton) return;


                if (
                    !confirm(
                        "Delete this membership application?"
                    )
                ) {
                    return;
                }


                const {
                    error
                } = await supabaseClient
                    .from(
                        "membership_applications"
                    )
                    .delete()
                    .eq(
                        "id",
                        deleteButton.dataset.id
                    );


                if (error) {

                    showError(error);

                    return;

                }


                await loadMembershipApplications();

                await loadDashboardCounts();

            }
        );


    /* =====================================================
       APPLICATION DETAILS
    ===================================================== */

    function showApplication(
        title,
        item
    ) {

        if (!$("applicationModal")) {
            return;
        }


        $("applicationModalTitle")
            .textContent =
            title;


        const fields =
            Object.entries(item)
                .filter(
                    ([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                );


        $("applicationDetails")
            .innerHTML = `

            <div class="detail-grid">

                ${
                    fields.map(
                        ([key, value]) => `

                        <div class="detail-item">

                            <span>
                                ${escapeHTML(
                                    key
                                        .replace(
                                            /_/g,
                                            " "
                                        )
                                        .toUpperCase()
                                )}
                            </span>

                            <strong>
                                ${escapeHTML(
                                    value
                                )}
                            </strong>

                        </div>

                        `
                    ).join("")
                }

            </div>

        `;


        openModal(
            $("applicationModal")
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    console.log(
        "GSA Admin Dashboard loading..."
    );


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
        "GSA Admin Dashboard initialized successfully."
    );

});

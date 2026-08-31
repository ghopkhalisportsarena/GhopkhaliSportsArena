/* =========================================================
   GSA ADMIN DASHBOARD
   Supabase
   Dashboard Based Management System
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof window.supabase === "undefined") {
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

    const $ = id => document.getElementById(id);

    const escapeHTML = value => {

        if (value === null || value === undefined) {
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
    };


    const formatDateTime = value => {

        if (!value) return "No date";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "No date";
        }

        return date.toLocaleString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const showError = error => {

        console.error(error);

        alert(
            error?.message ||
            "Something went wrong. Please try again."
        );
    };


    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar = $("adminSidebar");
    const overlay = $("adminSidebarOverlay");
    const toggle = $("sidebarToggle");


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
       SCROLL
    ===================================================== */

    function scrollToSection(id) {

        const section = $(id);

        if (!section) return;

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    document
        .querySelectorAll("[data-scroll]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    scrollToSection(
                        button.dataset.scroll
                    );
                }
            );

        });


    document
        .querySelectorAll("[data-section]")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    scrollToSection(
                        link.dataset.section
                    );

                }
            );

        });


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

            try {

                await supabaseClient.auth.signOut();

                window.location.href =
                    "../index.html";

            } catch (error) {

                console.error(error);

                window.location.href =
                    "../index.html";

            }

        }
    );


    /* =====================================================
       MODALS
    ===================================================== */

    function openModal(modal) {

        if (!modal) return;

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
        .querySelectorAll(
            "[data-close-modal]"
        )
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
                .forEach(closeModal);

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


        $("noticeCount").textContent =
            notices;

        $("fixtureCount").textContent =
            fixtures;

        $("memberCount").textContent =
            members;

        $("applicationCount").textContent =
            members + friendly;

    }


    /* =====================================================
       NOTICE MANAGEMENT
    ===================================================== */

    let notices = [];


    async function loadNotices() {

        const list = $("noticeList");

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

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load notices.
                </div>`;

            console.error(error);

            return;

        }


        notices = data || [];

        renderNotices();

    }


    function renderNotices() {

        const list = $("noticeList");

        $("noticeTotalCount").textContent =
            notices.length;

        $("noticePublishedCount").textContent =
            notices.filter(
                item => item.published === true
            ).length;

        $("noticeDraftCount").textContent =
            notices.filter(
                item => item.published !== true
            ).length;

        $("noticeImportantCount").textContent =
            notices.filter(
                item => item.important === true
            ).length;


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

                <article
                    class="notice-card"
                    data-id="${escapeHTML(notice.id)}">

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
                                ${formatDate(notice.created_at)}
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
                            data-id="${escapeHTML(notice.id)}">
                            Edit
                        </button>


                        <button
                            class="small-button"
                            data-notice-action="publish"
                            data-id="${escapeHTML(notice.id)}">

                            ${
                                published
                                    ? "Unpublish"
                                    : "Publish"
                            }

                        </button>


                        <button
                            class="small-button ${
                                important
                                    ? "active"
                                    : ""
                            }"
                            data-notice-action="important"
                            data-id="${escapeHTML(notice.id)}">

                            ${
                                important
                                    ? "Remove Important"
                                    : "Important"
                            }

                        </button>


                        <button
                            class="small-button danger"
                            data-notice-action="delete"
                            data-id="${escapeHTML(notice.id)}">
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    function openNoticeForm(notice = null) {

        const form = $("noticeForm");

        form.reset();

        $("noticeId").value =
            notice?.id || "";

        $("noticeTitle").value =
            notice?.title || "";

        $("noticeContent").value =
            notice?.content || "";

        $("noticePublished").checked =
            notice
                ? notice.published === true
                : true;

        $("noticeImportant").checked =
            notice
                ? notice.important === true
                : false;


        $("noticeModalTitle").textContent =
            notice
                ? "Edit Notice"
                : "New Notice";


        openModal(
            $("noticeModal")
        );

    }


    $("newNoticeButton")
        ?.addEventListener(
            "click",
            () => openNoticeForm()
        );


    document
        .querySelector(
            '[data-action="new-notice"]'
        )
        ?.addEventListener(
            "click",
            () => {

                scrollToSection("notices");

                setTimeout(
                    () => openNoticeForm(),
                    300
                );

            }
        );


    $("noticeForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("noticeId").value.trim();

                const title =
                    $("noticeTitle")
                        .value
                        .trim();

                const content =
                    $("noticeContent")
                        .value
                        .trim();

                const published =
                    $("noticePublished")
                        .checked;

                const important =
                    $("noticeImportant")
                        .checked;


                if (!title || !content) {

                    alert(
                        "Please enter title and content."
                    );

                    return;

                }


                try {

                    let response;


                    if (id) {

                        response =
                            await supabaseClient
                                .from("notices")
                                .update({
                                    title,
                                    content,
                                    published,
                                    important
                                })
                                .eq(
                                    "id",
                                    id
                                );

                    } else {

                        response =
                            await supabaseClient
                                .from("notices")
                                .insert([
                                    {
                                        title,
                                        content,
                                        published,
                                        important
                                    }
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


                if (
                    action === "publish"
                ) {

                    const value =
                        notice.published !== true;


                    if (
                        !confirm(
                            value
                                ? "Publish this notice?"
                                : "Unpublish this notice?"
                        )
                    ) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
                        .from("notices")
                        .update({
                            published: value
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
                    action === "important"
                ) {

                    const value =
                        notice.important !== true;


                    const {
                        error
                    } = await supabaseClient
                        .from("notices")
                        .update({
                            important: value
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
                    action === "delete"
                ) {

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
       
       Uses the common fields:
       home_team
       away_team
       match_date
       match_time
       venue
       type
       published
    ===================================================== */

    let fixtures = [];


    async function loadFixtures() {

        const list = $("fixtureList");

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

            console.error(error);

            list.innerHTML =
                `<div class="empty-state">
                    Unable to load fixtures.
                    <br><br>
                    Check the "fixtures" table columns.
                 </div>`;

            return;

        }


        fixtures = data || [];

        renderFixtures();

    }


    function renderFixtures() {

        const list = $("fixtureList");


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

                <article
                    class="content-card">

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
                                    item.home ||
                                    "Home Team"
                                )}

                                <span>
                                    VS
                                </span>

                                ${escapeHTML(
                                    item.away_team ||
                                    item.away ||
                                    "Away Team"
                                )}

                            </h3>


                            <p>
                                ${
                                    escapeHTML(
                                        item.venue ||
                                        "Venue TBA"
                                    )
                                }
                            </p>

                        </div>


                        <div class="content-date">

                            ${
                                formatDate(
                                    item.match_date ||
                                    item.date
                                )
                            }

                        </div>

                    </div>


                    <div class="card-actions">

                        <button
                            class="small-button"
                            data-fixture-action="edit"
                            data-id="${escapeHTML(item.id)}">
                            Edit
                        </button>


                        <button
                            class="small-button"
                            data-fixture-action="publish"
                            data-id="${escapeHTML(item.id)}">

                            ${
                                published
                                    ? "Unpublish"
                                    : "Publish"
                            }

                        </button>


                        <button
                            class="small-button danger"
                            data-fixture-action="delete"
                            data-id="${escapeHTML(item.id)}">
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    function openFixtureForm(item = null) {

        $("fixtureForm").reset();

        $("fixtureId").value =
            item?.id || "";

        $("fixtureHome").value =
            item?.home_team ||
            item?.home ||
            "";

        $("fixtureAway").value =
            item?.away_team ||
            item?.away ||
            "";

        $("fixtureDate").value =
            item?.match_date ||
            item?.date ||
            "";

        $("fixtureTime").value =
            item?.match_time ||
            item?.time ||
            "";

        $("fixtureVenue").value =
            item?.venue ||
            "";

        $("fixtureType").value =
            item?.type ||
            "FRIENDLY MATCH";

        $("fixturePublished").checked =
            item
                ? item.published !== false
                : true;


        openModal(
            $("fixtureModal")
        );

    }


    $("newFixtureButton")
        ?.addEventListener(
            "click",
            () => openFixtureForm()
        );


    document
        .querySelector(
            '[data-action="new-fixture"]'
        )
        ?.addEventListener(
            "click",
            () => {

                scrollToSection("fixtures");

                setTimeout(
                    () => openFixtureForm(),
                    300
                );

            }
        );


    $("fixtureForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("fixtureId").value;


                const payload = {

                    home_team:
                        $("fixtureHome")
                            .value
                            .trim(),

                    away_team:
                        $("fixtureAway")
                            .value
                            .trim(),

                    match_date:
                        $("fixtureDate")
                            .value,

                    match_time:
                        $("fixtureTime")
                            .value || null,

                    venue:
                        $("fixtureVenue")
                            .value
                            .trim() || null,

                    type:
                        $("fixtureType")
                            .value,

                    published:
                        $("fixturePublished")
                            .checked

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
                            ? "Fixture updated."
                            : "Fixture added."
                    );


                } catch (error) {

                    showError(error);

                }

            }
        );


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


                if (
                    action === "edit"
                ) {

                    openFixtureForm(item);

                    return;

                }


                if (
                    action === "publish"
                ) {

                    const value =
                        item.published === false;


                    const {
                        error
                    } = await supabaseClient
                        .from("fixtures")
                        .update({
                            published: value
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
                    action === "delete"
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
       
       IMPORTANT:
       If your Supabase project does not yet have a
       "tournaments" table, this section will show an
       error until that table is created.
    ===================================================== */

    let tournaments = [];


    async function loadTournaments() {

        const list = $("tournamentList");

        list.innerHTML =
            `<div class="loading-state">
                Loading tournaments...
             </div>`;


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

            console.error(error);

            list.innerHTML =
                `<div class="empty-state">
                    Tournament table is not available yet.
                    <br><br>
                    Create a "tournaments" table in Supabase first.
                 </div>`;

            return;

        }


        tournaments = data || [];

        renderTournaments();

    }


    function renderTournaments() {

        const list = $("tournamentList");


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

                                ${
                                    item.details
                                        ? "\n" +
                                          escapeHTML(
                                              item.details
                                          )
                                        : ""
                                }
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
                            data-id="${escapeHTML(item.id)}">
                            Edit
                        </button>


                        <button
                            class="small-button danger"
                            data-tournament-action="delete"
                            data-id="${escapeHTML(item.id)}">
                            Delete
                        </button>

                    </div>

                </article>

                `;

            }).join("");

    }


    function openTournamentForm(item = null) {

        $("tournamentForm").reset();

        $("tournamentId").value =
            item?.id || "";

        $("tournamentName").value =
            item?.name ||
            item?.title ||
            "";

        $("tournamentSubtitle").value =
            item?.subtitle ||
            item?.season ||
            "";

        $("tournamentDate").value =
            item?.date ||
            item?.start_date ||
            "";

        $("tournamentStatus").value =
            item?.status ||
            "UPCOMING";

        $("tournamentDetails").value =
            item?.details ||
            "";


        openModal(
            $("tournamentModal")
        );

    }


    $("newTournamentButton")
        ?.addEventListener(
            "click",
            () => openTournamentForm()
        );


    document
        .querySelector(
            '[data-action="new-tournament"]'
        )
        ?.addEventListener(
            "click",
            () => {

                scrollToSection("tournaments");

                setTimeout(
                    () => openTournamentForm(),
                    300
                );

            }
        );


    $("tournamentForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    $("tournamentId").value;


                const payload = {

                    name:
                        $("tournamentName")
                            .value
                            .trim(),

                    subtitle:
                        $("tournamentSubtitle")
                            .value
                            .trim() || null,

                    date:
                        $("tournamentDate")
                            .value || null,

                    status:
                        $("tournamentStatus")
                            .value,

                    details:
                        $("tournamentDetails")
                            .value
                            .trim() || null

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
                            ? "Tournament updated."
                            : "Tournament added."
                    );


                } catch (error) {

                    showError(error);

                }

            }
        );


    $("tournamentList")
        ?.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-tournament-action]"
                    );

                if (!button) return;


                const id =
                    button.dataset.id;

                const item =
                    tournaments.find(
                        row =>
                            String(row.id) ===
                            String(id)
                    );


                if (!item) return;


                if (
                    button.dataset.tournamentAction ===
                    "edit"
                ) {

                    openTournamentForm(item);

                    return;

                }


                if (
                    button.dataset.tournamentAction ===
                    "delete"
                ) {

                    if (
                        !confirm(
                            "Delete this tournament?"
                        )
                    ) {
                        return;
                    }


                    const {
                        error
                    } = await supabaseClient
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
       
       Supabase Storage bucket:
       gallery
    ===================================================== */

    let galleryFiles = [];


    async function loadGallery() {

        const list = $("galleryList");

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
                    Gallery storage could not be loaded.
                    <br><br>
                    Make sure a public Storage bucket named
                    <strong>gallery</strong> exists.
                 </div>`;

            return;

        }


        galleryFiles =
            (data || []).filter(
                file =>
                    file.name !== ".emptyFolderPlaceholder"
            );


        renderGallery();

    }


    function renderGallery() {

        const list = $("galleryList");


        if (!galleryFiles.length) {

            list.innerHTML =
                `<div class="empty-state">
                    No photos uploaded yet.
                 </div>`;

            return;

        }


        list.innerHTML =
            galleryFiles.map(file => {

                const {
                    data
                } = supabaseClient
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
                            data.publicUrl
                        )}"
                        alt="GSA Gallery">

                    <button
                        class="gallery-delete"
                        data-gallery-delete="${escapeHTML(
                            file.name
                        )}">
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


                if (!files.length) {
                    return;
                }


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
                        file.name
                            .replace(
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

                        console.error(
                            error
                        );

                        alert(
                            `Could not upload ${file.name}.\n\n` +
                            error.message
                        );

                        break;

                    }

                }


                event.target.value = "";

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


                const name =
                    button.dataset.galleryDelete;


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
                        name
                    ]);


                if (error) {

                    showError(error);

                    return;

                }


                await loadGallery();

            }
        );


    document
        .querySelector(
            '[data-action="upload-photo"]'
        )
        ?.addEventListener(
            "click",
            () => {

                scrollToSection(
                    "gallery"
                );

                setTimeout(
                    () => {
                        $("galleryUpload")?.click();
                    },
                    300
                );

            }
        );


    /* =====================================================
       APPLICATIONS
    ===================================================== */

    let friendlyApplications = [];
    let membershipApplications = [];


    async function loadFriendlyApplications() {

        const list =
            $("friendlyList");


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

            console.error(error);

            return;

        }


        friendlyApplications =
            data || [];


        renderFriendlyApplications();

    }


    function renderFriendlyApplications() {

        const list =
            $("friendlyList");


        if (
            !friendlyApplications.length
        ) {

            list.innerHTML =
                `<div class="empty-state">
                    No Friendly Match applications.
                 </div>`;

            return;

        }


        list.innerHTML =
            friendlyApplications.map(
                item => {

                    return `

                    <article
                        class="application-card">

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
                                data-id="${escapeHTML(item.id)}">

                                ${[
                                    "pending",
                                    "approved",
                                    "rejected",
                                    "completed"
                                ].map(
                                    status => `
                                    <option
                                        value="${status}"
                                        ${
                                            item.status ===
                                            status
                                                ? "selected"
                                                : ""
                                        }>
                                        ${status}
                                    </option>
                                    `
                                ).join("")}

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
                                data-id="${escapeHTML(item.id)}">
                                View Details
                            </button>

                            <button
                                class="small-button danger"
                                data-delete-friendly
                                data-id="${escapeHTML(item.id)}">
                                Delete
                            </button>

                        </div>

                    </article>

                    `;

                }
            ).join("");

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
                                String(view.dataset.id)
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
       MEMBERSHIP
    ===================================================== */

    async function loadMembershipApplications() {

        const list =
            $("membershipList");


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

            console.error(error);

            return;

        }


        membershipApplications =
            data || [];


        renderMembershipApplications();

    }


    function renderMembershipApplications() {

        const list =
            $("membershipList");


        if (
            !membershipApplications.length
        ) {

            list.innerHTML =
                `<div class="empty-state">
                    No membership applications.
                 </div>`;

            return;

        }


        list.innerHTML =
            membershipApplications.map(
                item => {

                    return `

                    <article
                        class="application-card">

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
                                data-id="${escapeHTML(item.id)}">

                                ${[
                                    "pending",
                                    "approved",
                                    "rejected",
                                    "completed"
                                ].map(
                                    status => `
                                    <option
                                        value="${status}"
                                        ${
                                            item.status ===
                                            status
                                                ? "selected"
                                                : ""
                                        }>
                                        ${status}
                                    </option>
                                    `
                                ).join("")}

                            </select>

                        </div>


                        <div class="application-info">

                            <div class="info-box">
                                <span>DATE OF BIRTH</span>
                                <strong>
                                    ${formatDate(
                                        item.date_of_birth
                                    )}
                                </strong>
                            </div>


                            <div class="info-box">
                                <span>OCCUPATION</span>
                                <strong>
                                    ${escapeHTML(
                                        item.occupation ||
                                        "—"
                                    )}
                                </strong>
                            </div>


                            <div class="info-box">
                                <span>POSITION / SKILL</span>
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
                                data-id="${escapeHTML(item.id)}">
                                View Details
                            </button>


                            <button
                                class="small-button danger"
                                data-delete-membership
                                data-id="${escapeHTML(item.id)}">
                                Delete
                            </button>

                        </div>

                    </article>

                    `;

                }
            ).join("");

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
                                String(view.dataset.id)
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

        $("applicationModalTitle")
            .textContent =
            title;


        const fields =
            Object.entries(item)
                .filter(
                    ([key, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                );


        $("applicationDetails")
            .innerHTML = `

            <div class="detail-grid">

                ${fields.map(
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
                ).join("")}

            </div>

        `;


        openModal(
            $("applicationModal")
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

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
        "GSA Dashboard Management System initialized."
    );

});
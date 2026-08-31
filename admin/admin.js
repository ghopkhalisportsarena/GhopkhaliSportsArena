/* =========================================================
   GSA ADMIN SYSTEM
   Ghopkhali Sports Arena
   Supabase Admin Panel

   Features:
   - Dashboard
   - Notices
   - Add Notice
   - Edit Notice
   - Delete Notice
   - Publish / Unpublish
   - Important Notice
   - Notice Count
   - Mobile Sidebar
   - Logout
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       SUPABASE
    ===================================================== */

    if (typeof window.supabase === "undefined") {

        console.error("Supabase library is not loaded.");

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


    console.log("GSA Admin: Supabase initialized.");



    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    const currentPage =
        document.body.dataset.page || "";



    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar =
        document.getElementById("adminSidebar");


    const sidebarToggle =
        document.getElementById("sidebarToggle");


    const sidebarOverlay =
        document.getElementById("adminSidebarOverlay");


    function openSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("open");

        if (sidebarOverlay) {

            sidebarOverlay.classList.add("active");

        }

    }


    function closeSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("open");

        if (sidebarOverlay) {

            sidebarOverlay.classList.remove("active");

        }

    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            () => {

                if (
                    sidebar &&
                    sidebar.classList.contains("open")
                ) {

                    closeSidebar();

                } else {

                    openSidebar();

                }

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    document
        .querySelectorAll(".sidebar-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });



    /* =====================================================
       ADMIN USER
    ===================================================== */

    const adminName =
        document.getElementById("adminName");


    const adminAvatar =
        document.getElementById("adminAvatar");


    if (adminName) {

        adminName.textContent =
            localStorage.getItem("gsaAdminName") ||
            "Administrator";

    }


    if (adminAvatar) {

        const name =
            adminName
                ? adminName.textContent.trim()
                : "Administrator";


        adminAvatar.textContent =
            name.charAt(0).toUpperCase();

    }



    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) return;


                try {

                    await supabaseClient.auth.signOut();

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }


                localStorage.removeItem(
                    "gsaAdminName"
                );


                localStorage.removeItem(
                    "gsaAdminLoggedIn"
                );


                window.location.href =
                    "admin.html";

            }
        );

    }



    /* =====================================================
       NOTICE SYSTEM
    ===================================================== */

    const noticeFormPanel =
        document.getElementById("noticeFormPanel");


    const newNoticeButton =
        document.getElementById("newNoticeButton");


    const cancelNoticeButton =
        document.getElementById("cancelNoticeButton");


    const cancelNoticeButton2 =
        document.getElementById("cancelNoticeButton2");


    const noticeForm =
        document.getElementById("noticeForm");


    const noticeId =
        document.getElementById("noticeId");


    const noticeTitle =
        document.getElementById("noticeTitle");


    const noticeDate =
        document.getElementById("noticeDate");


    const noticeTag =
        document.getElementById("noticeTag");


    const noticeDescription =
        document.getElementById("noticeDescription");


    const noticeImportant =
        document.getElementById("noticeImportant");


    const noticePublished =
        document.getElementById("noticePublished");


    const saveNoticeButton =
        document.getElementById("saveNoticeButton");


    const formTitle =
        document.getElementById("formTitle");


    const noticeList =
        document.getElementById("noticeList");


    const totalNoticeCount =
        document.getElementById(
            "totalNoticeCount"
        );


    const dashboardNoticeCount =
        document.getElementById(
            "noticeCount"
        );



    /* =====================================================
       SHOW NOTICE FORM
    ===================================================== */

    function showNoticeForm() {

        if (!noticeFormPanel) return;

        noticeFormPanel.hidden = false;

        noticeFormPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }



    /* =====================================================
       HIDE NOTICE FORM
    ===================================================== */

    function hideNoticeForm() {

        if (!noticeFormPanel) return;

        noticeFormPanel.hidden = true;

        resetNoticeForm();

    }



    /* =====================================================
       RESET NOTICE FORM
    ===================================================== */

    function resetNoticeForm() {

        if (noticeForm) {

            noticeForm.reset();

        }


        if (noticeId) {

            noticeId.value = "";

        }


        if (formTitle) {

            formTitle.textContent =
                "Create Notice";

        }


        if (saveNoticeButton) {

            saveNoticeButton.textContent =
                "Publish Notice ↗";

        }


        if (noticePublished) {

            noticePublished.checked = true;

        }


        if (noticeImportant) {

            noticeImportant.checked = false;

        }


        if (noticeDate) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            noticeDate.value = today;

        }

    }



    /* =====================================================
       NEW NOTICE
    ===================================================== */

    if (newNoticeButton) {

        newNoticeButton.addEventListener(
            "click",
            () => {

                resetNoticeForm();

                showNoticeForm();

            }
        );

    }



    /* =====================================================
       CANCEL NOTICE
    ===================================================== */

    if (cancelNoticeButton) {

        cancelNoticeButton.addEventListener(
            "click",
            hideNoticeForm
        );

    }


    if (cancelNoticeButton2) {

        cancelNoticeButton2.addEventListener(
            "click",
            hideNoticeForm
        );

    }



    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {

            return "No date";

        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(date.getTime())) {

            return dateValue;

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



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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



    /* =====================================================
       LOAD NOTICES
    ===================================================== */

    async function loadNotices() {

        if (!noticeList &&
            !dashboardNoticeCount) {

            return;

        }


        try {

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

                console.error(
                    "Notice loading error:",
                    error
                );


                showNoticeError(
                    error.message
                );


                return;

            }


            const notices =
                data || [];


            updateNoticeCount(
                notices
            );


            if (noticeList) {

                renderNoticeList(
                    notices
                );

            }

        } catch (error) {

            console.error(
                "Unexpected notice error:",
                error
            );


            showNoticeError(
                "Unable to load notices."
            );

        }

    }



    /* =====================================================
       NOTICE COUNT
    ===================================================== */

    function updateNoticeCount(
        notices
    ) {

        const publishedCount =
            notices.filter(
                notice =>
                    notice.published === true
            ).length;


        if (totalNoticeCount) {

            totalNoticeCount.textContent =
                notices.length;

        }


        if (dashboardNoticeCount) {

            dashboardNoticeCount.textContent =
                publishedCount;

        }

    }



    /* =====================================================
       RENDER NOTICE LIST
    ===================================================== */

    function renderNoticeList(
        notices
    ) {

        if (!noticeList) return;


        if (!notices.length) {

            noticeList.innerHTML = `

                <div class="notice-loading">

                    <strong>
                        No notices yet
                    </strong>

                    <p>
                        Click "+ New Notice"
                        to publish your first notice.
                    </p>

                </div>

            `;

            return;

        }


        noticeList.innerHTML =
            notices.map(
                notice =>
                    createNoticeHTML(
                        notice
                    )
            ).join("");


        attachNoticeActions();

    }



    /* =====================================================
       NOTICE HTML
    ===================================================== */

    function createNoticeHTML(
        notice
    ) {

        const id =
            escapeHTML(notice.id);


        const title =
            escapeHTML(notice.title);


        const description =
            escapeHTML(
                notice.description
            );


        const tag =
            escapeHTML(
                notice.tag || "NOTICE"
            );


        const date =
            formatDate(
                notice.date
            );


        const published =
            notice.published === true;


        const important =
            notice.important === true;


        const statusClass =
            published
                ? "published"
                : "draft";


        const statusText =
            published
                ? "PUBLISHED"
                : "DRAFT";


        return `

        <article
            class="admin-notice-card
            ${important ? "important" : ""}"
            data-notice-id="${id}"
        >

            <div class="admin-notice-top">

                <div class="admin-notice-date">

                    ${date}

                </div>


                <div class="admin-notice-badges">

                    <span class="notice-tag">
                        ${tag}
                    </span>


                    ${
                        important
                            ? `
                            <span
                                class="important-badge"
                            >
                                IMPORTANT
                            </span>
                            `
                            : ""
                    }


                    <span
                        class="notice-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="admin-notice-content">

                <h3>
                    ${title}
                </h3>


                <p>
                    ${description}
                </p>

            </div>


            <div class="admin-notice-actions">


                <button
                    type="button"
                    class="notice-action edit"
                    data-action="edit"
                    data-id="${id}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="notice-action toggle"
                    data-action="toggle"
                    data-id="${id}"
                >
                    ${
                        published
                            ? "Unpublish"
                            : "Publish"
                    }
                </button>


                <button
                    type="button"
                    class="notice-action delete"
                    data-action="delete"
                    data-id="${id}"
                >
                    Delete
                </button>


            </div>

        </article>

        `;

    }



    /* =====================================================
       NOTICE ACTION EVENTS
    ===================================================== */

    function attachNoticeActions() {

        document
            .querySelectorAll(
                ".notice-action"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.action;


                        const id =
                            button.dataset.id;


                        if (!id) return;


                        if (action === "edit") {

                            await editNotice(id);

                        }


                        if (action === "toggle") {

                            await toggleNotice(id);

                        }


                        if (action === "delete") {

                            await deleteNotice(id);

                        }

                    }
                );

            });

    }



    /* =====================================================
       EDIT NOTICE
    ===================================================== */

    async function editNotice(
        id
    ) {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("notices")
                .select("*")
                .eq("id", id)
                .single();


            if (error) {

                console.error(
                    "Edit notice error:",
                    error
                );


                alert(
                    "Unable to load this notice."
                );


                return;

            }


            if (!data) {

                alert(
                    "Notice not found."
                );


                return;

            }


            if (noticeId) {

                noticeId.value =
                    data.id;

            }


            if (noticeTitle) {

                noticeTitle.value =
                    data.title || "";

            }


            if (noticeDate) {

                noticeDate.value =
                    data.date || "";

            }


            if (noticeTag) {

                noticeTag.value =
                    data.tag || "NOTICE";

            }


            if (noticeDescription) {

                noticeDescription.value =
                    data.description || "";

            }


            if (noticeImportant) {

                noticeImportant.checked =
                    data.important === true;

            }


            if (noticePublished) {

                noticePublished.checked =
                    data.published === true;

            }


            if (formTitle) {

                formTitle.textContent =
                    "Edit Notice";

            }


            if (saveNoticeButton) {

                saveNoticeButton.textContent =
                    "Update Notice ↗";

            }


            showNoticeForm();

        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong."
            );

        }

    }



    /* =====================================================
       SAVE NOTICE
    ===================================================== */

    if (noticeForm) {

        noticeForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const id =
                    noticeId
                        ? noticeId.value.trim()
                        : "";


                const title =
                    noticeTitle
                        ? noticeTitle.value.trim()
                        : "";


                const date =
                    noticeDate
                        ? noticeDate.value
                        : "";


                const tag =
                    noticeTag
                        ? noticeTag.value
                        : "NOTICE";


                const description =
                    noticeDescription
                        ? noticeDescription.value.trim()
                        : "";


                const important =
                    noticeImportant
                        ? noticeImportant.checked
                        : false;


                const published =
                    noticePublished
                        ? noticePublished.checked
                        : true;


                if (!title) {

                    alert(
                        "Please enter a notice title."
                    );


                    return;

                }


                if (!date) {

                    alert(
                        "Please select a notice date."
                    );


                    return;

                }


                if (!description) {

                    alert(
                        "Please write the notice details."
                    );


                    return;

                }


                try {

                    if (saveNoticeButton) {

                        saveNoticeButton.disabled =
                            true;


                        saveNoticeButton.textContent =
                            "Saving...";

                    }


                    let result;


                    /* =================================
                       UPDATE
                    ================================= */

                    if (id) {

                        result =
                            await supabaseClient
                                .from("notices")
                                .update({

                                    title:
                                        title,

                                    description:
                                        description,

                                    date:
                                        date,

                                    tag:
                                        tag,

                                    important:
                                        important,

                                    published:
                                        published

                                })
                                .eq(
                                    "id",
                                    id
                                )
                                .select()
                                .single();

                    }


                    /* =================================
                       INSERT
                    ================================= */

                    else {

                        result =
                            await supabaseClient
                                .from("notices")
                                .insert([{

                                    title:
                                        title,

                                    description:
                                        description,

                                    date:
                                        date,

                                    tag:
                                        tag,

                                    important:
                                        important,

                                    published:
                                        published

                                }])
                                .select()
                                .single();

                    }


                    if (result.error) {

                        console.error(
                            "Save notice error:",
                            result.error
                        );


                        throw result.error;

                    }


                    alert(
                        id
                            ? "Notice updated successfully."
                            : "Notice published successfully."
                    );


                    hideNoticeForm();


                    await loadNotices();

                } catch (error) {

                    console.error(error);


                    alert(
                        "Notice could not be saved.\n\n" +
                        error.message
                    );

                } finally {

                    if (saveNoticeButton) {

                        saveNoticeButton.disabled =
                            false;


                        saveNoticeButton.textContent =
                            id
                                ? "Update Notice ↗"
                                : "Publish Notice ↗";

                    }

                }

            }
        );

    }



    /* =====================================================
       PUBLISH / UNPUBLISH
    ===================================================== */

    async function toggleNotice(
        id
    ) {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("notices")
                .select("published")
                .eq("id", id)
                .single();


            if (error) {

                throw error;

            }


            const newStatus =
                data.published !== true;


            const {
                error: updateError
            } = await supabaseClient
                .from("notices")
                .update({

                    published:
                        newStatus

                })
                .eq(
                    "id",
                    id
                );


            if (updateError) {

                throw updateError;

            }


            alert(
                newStatus
                    ? "Notice published."
                    : "Notice unpublished."
            );


            await loadNotices();

        } catch (error) {

            console.error(
                "Publish toggle error:",
                error
            );


            alert(
                "Unable to change notice status."
            );

        }

    }



    /* =====================================================
       DELETE NOTICE
    ===================================================== */

    async function deleteNotice(
        id
    ) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this notice?\n\nThis action cannot be undone."
            );


        if (!confirmed) return;


        try {

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

                throw error;

            }


            alert(
                "Notice deleted successfully."
            );


            await loadNotices();

        } catch (error) {

            console.error(
                "Delete notice error:",
                error
            );


            alert(
                "Unable to delete this notice.\n\n" +
                error.message
            );

        }

    }



    /* =====================================================
       NOTICE ERROR
    ===================================================== */

    function showNoticeError(
        message
    ) {

        if (!noticeList) return;


        noticeList.innerHTML = `

            <div class="notice-loading">

                <strong>
                    Unable to load notices
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;

    }



    /* =====================================================
       DASHBOARD COUNTS
    ===================================================== */

    async function loadDashboardCounts() {

        const memberCount =
            document.getElementById(
                "memberCount"
            );


        const applicationCount =
            document.getElementById(
                "applicationCount"
            );


        const fixtureCount =
            document.getElementById(
                "fixtureCount"
            );


        /* ================================================
           MEMBERS
        ================================================ */

        if (memberCount) {

            try {

                const {
                    count,
                    error
                } = await supabaseClient
                    .from(
                        "membership_applications"
                    )
                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    );


                if (!error) {

                    memberCount.textContent =
                        count || 0;

                }

            } catch (error) {

                console.error(
                    "Member count error:",
                    error
                );

            }

        }



        /* ================================================
           FRIENDLY APPLICATIONS
        ================================================ */

        if (applicationCount) {

            try {

                const {
                    count: friendlyCount,
                    error: friendlyError
                } = await supabaseClient
                    .from(
                        "friendly_applications"
                    )
                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    );


                const {
                    count: membershipCount,
                    error: membershipError
                } = await supabaseClient
                    .from(
                        "membership_applications"
                    )
                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    );


                if (
                    !friendlyError &&
                    !membershipError
                ) {

                    applicationCount.textContent =
                        (friendlyCount || 0) +
                        (membershipCount || 0);

                }

            } catch (error) {

                console.error(
                    "Application count error:",
                    error
                );

            }

        }



        /* ================================================
           FIXTURES
        ================================================ */

        if (fixtureCount) {

            try {

                const {
                    count,
                    error
                } = await supabaseClient
                    .from("fixtures")
                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    );


                if (!error) {

                    fixtureCount.textContent =
                        count || 0;

                }

            } catch (error) {

                console.error(
                    "Fixture count error:",
                    error
                );

            }

        }

    }



    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    if (
        currentPage === "notices" ||
        noticeList
    ) {

        loadNotices();

    }


    if (
        currentPage === "dashboard" ||
        document.getElementById(
            "memberCount"
        )
    ) {

        loadDashboardCounts();

        loadNotices();

    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });



    /* =====================================================
       CONSOLE
    ===================================================== */

    console.log(
        "GSA Admin System initialized successfully."
    );

});
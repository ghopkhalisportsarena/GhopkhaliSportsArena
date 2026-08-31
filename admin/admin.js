/* =========================================================
   GSA ADMIN SYSTEM
   Supabase
   Dashboard + Notices + Applications
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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


    /* =====================================================
       COMMON HELPERS
    ===================================================== */

    const page =
        document.body.dataset.page || "";


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

        if (!value) {
            return "No date";
        }

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


    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar =
        document.getElementById("adminSidebar");

    const overlay =
        document.getElementById("adminSidebarOverlay");

    const toggle =
        document.getElementById("sidebarToggle");


    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("active");
        }

        if (overlay) {
            overlay.classList.add("active");
        }

        document.body.classList.add("sidebar-open");
    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("active");
        }

        if (overlay) {
            overlay.classList.remove("active");
        }

        document.body.classList.remove("sidebar-open");
    }


    if (toggle) {
        toggle.addEventListener(
            "click",
            openSidebar
        );
    }


    if (overlay) {
        overlay.addEventListener(
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
       LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
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

                    await supabaseClient.auth.signOut();

                    window.location.href =
                        "../index.html";

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    window.location.href =
                        "../index.html";

                }

            }
        );

    }


    /* =====================================================
       NOTICE MANAGEMENT
    ===================================================== */

    if (page === "notices") {

        initNoticeManagement();

    }


    async function initNoticeManagement() {

        const noticeList =
            document.getElementById("noticeList");

        const noticeForm =
            document.getElementById("noticeForm");

        const modal =
            document.getElementById("noticeModal");

        const newButton =
            document.getElementById("newNoticeButton");

        const closeButton =
            document.getElementById("closeNoticeModal");

        const cancelButton =
            document.getElementById("cancelNoticeButton");


        let notices = [];


        /* -------------------------------------------------
           MODAL
        ------------------------------------------------- */

        function openNoticeModal(notice = null) {

            if (!modal || !noticeForm) {
                return;
            }

            noticeForm.reset();

            const id =
                document.getElementById("noticeId");

            const title =
                document.getElementById("noticeTitle");

            const content =
                document.getElementById("noticeContent");

            const published =
                document.getElementById("noticePublished");

            const important =
                document.getElementById("noticeImportant");

            const modalTitle =
                document.getElementById("noticeModalTitle");


            if (notice) {

                modalTitle.textContent =
                    "Edit Notice";

                id.value =
                    notice.id || "";

                title.value =
                    notice.title || "";

                content.value =
                    notice.content || "";

                published.checked =
                    notice.published === true;

                important.checked =
                    notice.important === true;

            } else {

                modalTitle.textContent =
                    "New Notice";

                id.value = "";

                published.checked = true;

                important.checked = false;

            }


            modal.classList.add("active");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            setTimeout(() => {

                title.focus();

            }, 100);

        }


        function closeNoticeModal() {

            if (!modal) {
                return;
            }

            modal.classList.remove("active");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (newButton) {

            newButton.addEventListener(
                "click",
                () => openNoticeModal()
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeNoticeModal
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeNoticeModal
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        closeNoticeModal();

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    modal &&
                    modal.classList.contains("active")
                ) {

                    closeNoticeModal();

                }

            }
        );


        /* -------------------------------------------------
           LOAD NOTICES
        ------------------------------------------------- */

        async function loadNotices() {

            if (!noticeList) {
                return;
            }

            noticeList.innerHTML = `
                <div class="notice-loading">
                    <div class="loading-spinner"></div>
                    <span>Loading notices...</span>
                </div>
            `;


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

                noticeList.innerHTML = `
                    <div class="notice-empty">
                        <div class="notice-empty-icon">!</div>
                        <h3>Unable to load notices</h3>
                        <p>
                            Please check your Supabase table and RLS policies.
                        </p>
                    </div>
                `;

                return;

            }


            notices = data || [];

            renderNotices();

            updateNoticeSummary();

            updateDashboardNoticeCount();

        }


        /* -------------------------------------------------
           RENDER
        ------------------------------------------------- */

        function renderNotices() {

            if (!noticeList) {
                return;
            }


            const count =
                document.getElementById(
                    "noticeListCount"
                );


            if (count) {

                count.textContent =
                    `${notices.length} ${
                        notices.length === 1
                            ? "notice"
                            : "notices"
                    }`;

            }


            if (!notices.length) {

                noticeList.innerHTML = `
                    <div class="notice-empty">

                        <div class="notice-empty-icon">
                            ▤
                        </div>

                        <h3>
                            No notices yet
                        </h3>

                        <p>
                            Create your first Ghopkhali Sports Arena notice.
                        </p>

                    </div>
                `;

                return;

            }


            noticeList.innerHTML =
                notices.map(notice => {

                    const isPublished =
                        notice.published === true;

                    const isImportant =
                        notice.important === true;


                    return `
                        <article
                            class="notice-management-card"
                            data-notice-id="${escapeHTML(notice.id)}">

                            <div class="notice-card-top">

                                <div>

                                    <div class="notice-card-meta">

                                        ${
                                            isPublished
                                                ? `
                                                    <span class="notice-badge published">
                                                        ● Published
                                                    </span>
                                                  `
                                                : `
                                                    <span class="notice-badge draft">
                                                        ◐ Draft
                                                    </span>
                                                  `
                                        }

                                        ${
                                            isImportant
                                                ? `
                                                    <span class="notice-badge important">
                                                        ★ Important
                                                    </span>
                                                  `
                                                : ""
                                        }

                                    </div>

                                    <div class="notice-card-date">
                                        ${formatDate(notice.created_at)}
                                    </div>

                                    <h3 class="notice-card-title">
                                        ${escapeHTML(notice.title)}
                                    </h3>

                                    <div class="notice-card-content">
                                        ${escapeHTML(notice.content)}
                                    </div>

                                </div>

                            </div>


                            <div class="notice-card-actions">

                                <button
                                    type="button"
                                    class="notice-action-button"
                                    data-action="edit"
                                    data-id="${escapeHTML(notice.id)}">

                                    Edit

                                </button>


                                <button
                                    type="button"
                                    class="notice-action-button publish"
                                    data-action="publish"
                                    data-id="${escapeHTML(notice.id)}">

                                    ${
                                        isPublished
                                            ? "Unpublish"
                                            : "Publish"
                                    }

                                </button>


                                <button
                                    type="button"
                                    class="notice-action-button ${
                                        isImportant
                                            ? "important-active"
                                            : ""
                                    }"
                                    data-action="important"
                                    data-id="${escapeHTML(notice.id)}">

                                    ${
                                        isImportant
                                            ? "Remove Important"
                                            : "Important"
                                    }

                                </button>


                                <button
                                    type="button"
                                    class="notice-action-button delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(notice.id)}">

                                    Delete

                                </button>

                            </div>

                        </article>
                    `;

                }).join("");

        }


        /* -------------------------------------------------
           SUMMARY
        ------------------------------------------------- */

        function updateNoticeSummary() {

            const total =
                notices.length;

            const published =
                notices.filter(
                    notice =>
                        notice.published === true
                ).length;

            const drafts =
                notices.filter(
                    notice =>
                        notice.published !== true
                ).length;

            const important =
                notices.filter(
                    notice =>
                        notice.important === true
                ).length;


            const totalElement =
                document.getElementById(
                    "noticeTotalCount"
                );

            const publishedElement =
                document.getElementById(
                    "noticePublishedCount"
                );

            const draftElement =
                document.getElementById(
                    "noticeDraftCount"
                );

            const importantElement =
                document.getElementById(
                    "noticeImportantCount"
                );


            if (totalElement) {
                totalElement.textContent = total;
            }

            if (publishedElement) {
                publishedElement.textContent =
                    published;
            }

            if (draftElement) {
                draftElement.textContent =
                    drafts;
            }

            if (importantElement) {
                importantElement.textContent =
                    important;
            }

        }


        /* -------------------------------------------------
           DASHBOARD COUNT
        ------------------------------------------------- */

        async function updateDashboardNoticeCount() {

            const countElement =
                document.getElementById(
                    "noticeCount"
                );

            if (!countElement) {
                return;
            }


            const {
                count,
                error
            } = await supabaseClient
                .from("notices")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


            if (!error) {

                countElement.textContent =
                    count || 0;

            }

        }


        /* -------------------------------------------------
           ADD / EDIT
        ------------------------------------------------- */

        if (noticeForm) {

            noticeForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const saveButton =
                        document.getElementById(
                            "saveNoticeButton"
                        );


                    const id =
                        document.getElementById(
                            "noticeId"
                        ).value.trim();


                    const title =
                        document.getElementById(
                            "noticeTitle"
                        ).value.trim();


                    const content =
                        document.getElementById(
                            "noticeContent"
                        ).value.trim();


                    const published =
                        document.getElementById(
                            "noticePublished"
                        ).checked;


                    const important =
                        document.getElementById(
                            "noticeImportant"
                        ).checked;


                    if (!title) {

                        alert(
                            "Please enter a notice title."
                        );

                        return;

                    }


                    if (!content) {

                        alert(
                            "Please write the notice content."
                        );

                        return;

                    }


                    const originalText =
                        saveButton
                            ? saveButton.textContent
                            : "Save Notice";


                    try {

                        if (saveButton) {

                            saveButton.disabled =
                                true;

                            saveButton.textContent =
                                id
                                    ? "Updating..."
                                    : "Saving...";

                        }


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
                                    )
                                    .select()
                                    .single();

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
                                    ])
                                    .select()
                                    .single();

                        }


                        if (response.error) {

                            throw response.error;

                        }


                        alert(
                            id
                                ? "Notice updated successfully."
                                : "Notice created successfully."
                        );


                        closeNoticeModal();

                        await loadNotices();


                    } catch (error) {

                        console.error(
                            "Notice save error:",
                            error
                        );

                        alert(
                            "Notice could not be saved.\n\n" +
                            (
                                error.message ||
                                "Please try again."
                            )
                        );


                    } finally {

                        if (saveButton) {

                            saveButton.disabled =
                                false;

                            saveButton.textContent =
                                originalText;

                        }

                    }

                }
            );

        }


        /* -------------------------------------------------
           EDIT / PUBLISH / IMPORTANT / DELETE
        ------------------------------------------------- */

        if (noticeList) {

            noticeList.addEventListener(
                "click",
                async event => {

                    const button =
                        event.target.closest(
                            "[data-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const action =
                        button.dataset.action;


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


                    /* EDIT */

                    if (action === "edit") {

                        openNoticeModal(notice);

                        return;

                    }


                    /* PUBLISH / UNPUBLISH */

                    if (action === "publish") {

                        const newValue =
                            notice.published !== true;


                        const confirmed =
                            confirm(
                                newValue
                                    ? "Publish this notice?"
                                    : "Unpublish this notice?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        button.disabled = true;


                        const {
                            error
                        } = await supabaseClient
                            .from("notices")
                            .update({
                                published:
                                    newValue
                            })
                            .eq(
                                "id",
                                id
                            );


                        button.disabled = false;


                        if (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Could not update notice status."
                            );

                            return;

                        }


                        await loadNotices();

                        return;

                    }


                    /* IMPORTANT */

                    if (action === "important") {

                        const newValue =
                            notice.important !== true;


                        const {
                            error
                        } = await supabaseClient
                            .from("notices")
                            .update({
                                important:
                                    newValue
                            })
                            .eq(
                                "id",
                                id
                            );


                        if (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Could not update Important status."
                            );

                            return;

                        }


                        await loadNotices();

                        return;

                    }


                    /* DELETE */

                    if (action === "delete") {

                        const confirmed =
                            confirm(
                                `Delete "${notice.title}"?\n\nThis action cannot be undone.`
                            );


                        if (!confirmed) {
                            return;
                        }


                        button.disabled = true;


                        const {
                            error
                        } = await supabaseClient
                            .from("notices")
                            .delete()
                            .eq(
                                "id",
                                id
                            );


                        button.disabled = false;


                        if (error) {

                            console.error(
                                "Delete error:",
                                error
                            );

                            alert(
                                "Notice could not be deleted.\n\n" +
                                (
                                    error.message ||
                                    "Please try again."
                                )
                            );

                            return;

                        }


                        await loadNotices();

                    }

                }
            );

        }


        /* -------------------------------------------------
           INITIAL LOAD
        ------------------------------------------------- */

        await loadNotices();

    }


    /* =====================================================
       DASHBOARD NOTICE COUNT
    ===================================================== */

    if (page === "dashboard") {

        loadDashboardCounts();

    }


    async function loadDashboardCounts() {

        const noticeCount =
            document.getElementById(
                "noticeCount"
            );


        if (noticeCount) {

            const {
                count,
                error
            } = await supabaseClient
                .from("notices")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


            if (!error) {

                noticeCount.textContent =
                    count || 0;

            }

        }


        const memberCount =
            document.getElementById(
                "memberCount"
            );


        if (memberCount) {

            const {
                count,
                error
            } = await supabaseClient
                .from("membership_applications")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


            if (!error) {

                memberCount.textContent =
                    count || 0;

            }

        }


        const applicationCount =
            document.getElementById(
                "applicationCount"
            );


        if (applicationCount) {

            const membership =
                await supabaseClient
                    .from(
                        "membership_applications"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    );


            const friendly =
                await supabaseClient
                    .from(
                        "friendly_applications"
                    )
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    );


            const membershipCount =
                membership.count || 0;

            const friendlyCount =
                friendly.count || 0;


            applicationCount.textContent =
                membershipCount +
                friendlyCount;

        }


        const fixtureCount =
            document.getElementById(
                "fixtureCount"
            );


        if (fixtureCount) {

            const {
                count,
                error
            } = await supabaseClient
                .from("fixtures")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


            if (!error) {

                fixtureCount.textContent =
                    count || 0;

            }

        }

    }


    /* =====================================================
       FRIENDLY MATCH APPLICATION
    ===================================================== */

    const friendlyModal =
        document.getElementById(
            "friendlyModal"
        );


    const friendlyForm =
        friendlyModal
            ? friendlyModal.querySelector(
                "form.application-form"
            )
            : null;


    if (friendlyForm) {

        friendlyForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const submitButton =
                    friendlyForm.querySelector(
                        ".form-submit"
                    );


                const originalText =
                    submitButton
                        ? submitButton.innerHTML
                        : "Submit Application ↗";


                try {

                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.innerHTML =
                            "Submitting...";

                    }


                    const formData =
                        new FormData(
                            friendlyForm
                        );


                    const teamName =
                        formData
                            .get(
                                "Team or Club Name"
                            )
                            ?.trim() || "";


                    const contactPerson =
                        formData
                            .get(
                                "Representative Name"
                            )
                            ?.trim() || "";


                    const phone =
                        formData
                            .get(
                                "Phone Number"
                            )
                            ?.trim() || "";


                    const email =
                        formData
                            .get(
                                "Email"
                            )
                            ?.trim() || "";


                    const preferredDate =
                        formData.get(
                            "Preferred Date"
                        ) || null;


                    const preferredTime =
                        formData.get(
                            "Preferred Time"
                        ) || null;


                    const sport =
                        formData.get(
                            "Sport"
                        ) || "";


                    const players =
                        formData.get(
                            "Number of Players"
                        ) || "";


                    const additionalMessage =
                        formData
                            .get(
                                "Additional Message"
                            )
                            ?.trim() || "";


                    const messageParts = [];


                    if (sport) {

                        messageParts.push(
                            `Sport: ${sport}`
                        );

                    }


                    if (players) {

                        messageParts.push(
                            `Number of Players: ${players}`
                        );

                    }


                    if (additionalMessage) {

                        messageParts.push(
                            `Additional Message: ${additionalMessage}`
                        );

                    }


                    const message =
                        messageParts.join(
                            "\n"
                        );


                    const {
                        data,
                        error
                    } = await supabaseClient
                        .from(
                            "friendly_applications"
                        )
                        .insert([
                            {
                                team_name:
                                    teamName,

                                contact_person:
                                    contactPerson,

                                phone:
                                    phone,

                                email:
                                    email ||
                                    null,

                                preferred_date:
                                    preferredDate,

                                preferred_time:
                                    preferredTime ||
                                    null,

                                venue:
                                    null,

                                message:
                                    message ||
                                    null,

                                status:
                                    "pending"
                            }
                        ])
                        .select()
                        .single();


                    if (error) {
                        throw error;
                    }


                    console.log(
                        "Friendly application submitted:",
                        data
                    );


                    alert(
                        "Your Friendly Match application has been submitted successfully."
                    );


                    friendlyForm.reset();


                    const modal =
                        friendlyModal;

                    if (modal) {

                        modal.classList.remove(
                            "active"
                        );

                    }


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "Application submission failed.\n\nPlease try again later."
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalText;

                    }

                }

            }
        );

    }


    /* =====================================================
       MEMBERSHIP APPLICATION
    ===================================================== */

    const membershipModal =
        document.getElementById(
            "membershipModal"
        );


    const membershipForm =
        membershipModal
            ? membershipModal.querySelector(
                "form.application-form"
            )
            : null;


    if (membershipForm) {

        membershipForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const submitButton =
                    membershipForm.querySelector(
                        ".form-submit"
                    );


                const originalText =
                    submitButton
                        ? submitButton.innerHTML
                        : "সদস্যপদ আবেদন জমা দিন ↗";


                try {

                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.innerHTML =
                            "জমা হচ্ছে...";

                    }


                    const formData =
                        new FormData(
                            membershipForm
                        );


                    const fullNameBangla =
                        formData
                            .get(
                                "পূর্ণ নাম বাংলায়"
                            )
                            ?.trim() || "";


                    const fullNameEnglish =
                        formData
                            .get(
                                "Full Name English"
                            )
                            ?.trim() || "";


                    const fatherName =
                        formData
                            .get(
                                "Father Name"
                            )
                            ?.trim() || "";


                    const motherName =
                        formData
                            .get(
                                "Mother Name"
                            )
                            ?.trim() || "";


                    const dateOfBirth =
                        formData.get(
                            "Date of Birth"
                        ) || null;


                    const profession =
                        formData
                            .get(
                                "Profession"
                            )
                            ?.trim() || "";


                    const nid =
                        formData
                            .get(
                                "NID or Birth Registration"
                            )
                            ?.trim() || "";


                    const currentAddress =
                        formData
                            .get(
                                "Current Address"
                            )
                            ?.trim() || "";


                    const permanentAddress =
                        formData
                            .get(
                                "Permanent Address"
                            )
                            ?.trim() || "";


                    const mobile =
                        formData
                            .get(
                                "Mobile Number"
                            )
                            ?.trim() || "";


                    const alternativeMobile =
                        formData
                            .get(
                                "Alternative Mobile Number"
                            )
                            ?.trim() || "";


                    const selectedSports =
                        formData.getAll(
                            "Sports[]"
                        );


                    const otherSports =
                        formData
                            .get(
                                "Other Sports"
                            )
                            ?.trim() || "";


                    const mainSkill =
                        formData
                            .get(
                                "Main Sports Skill"
                            )
                            ?.trim() || "";


                    const previousExperience =
                        formData
                            .get(
                                "Previous Club Experience"
                            )
                            ?.trim() || "";


                    const emergencyName =
                        formData
                            .get(
                                "Emergency Contact Name"
                            )
                            ?.trim() || "";


                    const emergencyRelationship =
                        formData
                            .get(
                                "Emergency Contact Relationship"
                            )
                            ?.trim() || "";


                    const emergencyMobile =
                        formData
                            .get(
                                "Emergency Contact Mobile"
                            )
                            ?.trim() || "";


                    const experienceParts = [];


                    if (
                        selectedSports.length
                    ) {

                        experienceParts.push(
                            `Interested Sports: ${selectedSports.join(", ")}`
                        );

                    }


                    if (otherSports) {

                        experienceParts.push(
                            `Other Sports: ${otherSports}`
                        );

                    }


                    if (mainSkill) {

                        experienceParts.push(
                            `Main Sports Skill: ${mainSkill}`
                        );

                    }


                    if (previousExperience) {

                        experienceParts.push(
                            `Previous Club Experience: ${previousExperience}`
                        );

                    }


                    const experience =
                        experienceParts.join(
                            "\n"
                        );


                    const messageParts = [];


                    if (fullNameBangla) {

                        messageParts.push(
                            `Full Name (Bangla): ${fullNameBangla}`
                        );

                    }


                    if (fatherName) {

                        messageParts.push(
                            `Father's Name: ${fatherName}`
                        );

                    }


                    if (motherName) {

                        messageParts.push(
                            `Mother's Name: ${motherName}`
                        );

                    }


                    if (profession) {

                        messageParts.push(
                            `Profession: ${profession}`
                        );

                    }


                    if (nid) {

                        messageParts.push(
                            `NID/Birth Registration: ${nid}`
                        );

                    }


                    if (currentAddress) {

                        messageParts.push(
                            `Current Address: ${currentAddress}`
                        );

                    }


                    if (permanentAddress) {

                        messageParts.push(
                            `Permanent Address: ${permanentAddress}`
                        );

                    }


                    if (alternativeMobile) {

                        messageParts.push(
                            `Alternative Mobile: ${alternativeMobile}`
                        );

                    }


                    if (emergencyName) {

                        messageParts.push(
                            `Emergency Contact: ${emergencyName}`
                        );

                    }


                    if (
                        emergencyRelationship
                    ) {

                        messageParts.push(
                            `Emergency Relationship: ${emergencyRelationship}`
                        );

                    }


                    if (emergencyMobile) {

                        messageParts.push(
                            `Emergency Mobile: ${emergencyMobile}`
                        );

                    }


                    const message =
                        messageParts.join(
                            "\n"
                        );


                    const {
                        data,
                        error
                    } = await supabaseClient
                        .from(
                            "membership_applications"
                        )
                        .insert([
                            {
                                full_name:
                                    fullNameEnglish ||
                                    fullNameBangla,

                                date_of_birth:
                                    dateOfBirth,

                                phone:
                                    mobile,

                                email:
                                    null,

                                address:
                                    currentAddress,

                                occupation:
                                    profession,

                                preferred_position:
                                    mainSkill ||
                                    null,

                                experience:
                                    experience ||
                                    null,

                                message:
                                    message ||
                                    null,

                                photo_url:
                                    null,

                                status:
                                    "pending",

                                admin_note:
                                    null
                            }
                        ])
                        .select()
                        .single();


                    if (error) {
                        throw error;
                    }


                    console.log(
                        "Membership application submitted:",
                        data
                    );


                    alert(
                        "সদস্যপদ আবেদন সফলভাবে জমা হয়েছে।\n\nক্লাব কর্তৃপক্ষ আপনার আবেদন পর্যালোচনা করবে।"
                    );


                    membershipForm.reset();


                    if (membershipModal) {

                        membershipModal.classList.remove(
                            "active"
                        );

                    }


                } catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "আবেদন জমা দেওয়া যায়নি।\n\nদয়া করে আবার চেষ্টা করুন।"
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalText;

                    }

                }

            }
        );

    }


    /* =====================================================
       MODAL OPEN / CLOSE FOR OTHER PAGES
    ===================================================== */

    const friendlyModalElement =
        document.getElementById(
            "friendlyModal"
        );

    const membershipModalElement =
        document.getElementById(
            "membershipModal"
        );

    const rulesModalElement =
        document.getElementById(
            "rulesModal"
        );


    function openModal(modal) {

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
            "[data-open-friendly]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openModal(
                        friendlyModalElement
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-open-membership]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openModal(
                        membershipModalElement
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-open-rules]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openModal(
                        rulesModalElement
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-close-friendly]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    closeModal(
                        friendlyModalElement
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-close-membership]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    closeModal(
                        membershipModalElement
                    )
            );

        });


    document
        .querySelectorAll(
            "[data-close-rules]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    closeModal(
                        rulesModalElement
                    )
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

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeModal(
                friendlyModalElement
            );

            closeModal(
                membershipModalElement
            );

            closeModal(
                rulesModalElement
            );

        }
    );


    console.log(
        "GSA Admin System initialized."
    );

});
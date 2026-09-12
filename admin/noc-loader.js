(function () {
    "use strict";

    const SUPABASE_URL =
        "https://cmygmswzokyrmgdnuszq.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

    const GSA_NOC_API =
        "https://script.google.com/macros/s/AKfycbw1-V2LrlBmMb9yK-xfDHDQDzxfiJ2ORCVFTkZPeiqC6ItOmsNFHsXehdfiXahVY-4Q/exec";

    let applications = [];
    let activeFilter = "all";
    let selectedApplication = null;

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function client() {
        if (!window.supabaseClient) {
            if (!window.supabase) {
                throw new Error(
                    "Supabase library is not loaded."
                );
            }

            window.supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );
        }

        return window.supabaseClient;
    }

    async function getSession() {
        const result =
            await client().auth.getSession();

        if (result.error) {
            throw result.error;
        }

        const session =
            result.data?.session;

        if (!session?.access_token) {
            throw new Error(
                "Your admin session has expired. Please login again."
            );
        }

        return session;
    }

    async function api(action, extra = {}) {
        const session =
            await getSession();

        const response =
            await fetch(
                GSA_NOC_API,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify({
                        action,
                        access_token:
                            session.access_token,
                        ...extra
                    })
                }
            );

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "NOC API request failed."
            );
        }

        return result;
    }

    function date(value) {
        if (!value) return "—";

        const d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return "—";
        }

        return d.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function time(value) {
        if (!value) return "—";

        const d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return "—";
        }

        return d.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    function listElement() {
        return document.getElementById(
            "nocList"
        );
    }

    function setList(html) {
        const list =
            listElement();

        if (list) {
            list.innerHTML = html;
        }
    }

    function updateCounts() {
        const total =
            applications.length;

        const pending =
            applications.filter(
                x => x.status === "pending"
            ).length;

        const approved =
            applications.filter(
                x => x.status === "approved"
            ).length;

        const rejected =
            applications.filter(
                x => x.status === "rejected"
            ).length;

        const values = {
            nocCount: total,
            nocTotalCount: total,
            nocPendingCount: pending,
            nocApprovedCount: approved,
            nocRejectedCount: rejected
        };

        Object.entries(values)
            .forEach(([id, value]) => {
                const el =
                    document.getElementById(id);

                if (el) {
                    el.textContent =
                        value;
                }
            });
    }

    function filtered() {
        if (activeFilter === "all") {
            return applications;
        }

        return applications.filter(
            x =>
                x.status ===
                activeFilter
        );
    }

    function render() {
        updateCounts();

        const rows =
            filtered();

        if (!rows.length) {
            setList(`
                <div class="noc-empty">
                    No NOC applications found.
                </div>
            `);

            return;
        }

        setList(
            rows.map(app => {

                const status =
                    app.status ||
                    "pending";

                return `
                    <article class="noc-card">

                        <div class="noc-card-top">

                            <div>
                                <h3 class="noc-card-title">
                                    ${esc(
                                        app.player_name ||
                                        "Unnamed Player"
                                    )}
                                </h3>

                                <div class="noc-card-number">
                                    ${esc(
                                        app.application_no ||
                                        "Application"
                                    )}
                                </div>
                            </div>

                            <span class="noc-status ${esc(status)}">
                                ${esc(
                                    status.toUpperCase()
                                )}
                            </span>

                        </div>

                        <div class="noc-card-grid">

                            <div class="noc-info-box">
                                <span>Sport</span>
                                <strong>
                                    ${esc(
                                        app.sport_type ||
                                        "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>GSA Player ID</span>
                                <strong>
                                    ${esc(
                                        app.gsa_player_id ||
                                        "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>Email</span>
                                <strong>
                                    ${esc(
                                        app.applicant_email ||
                                        "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>Submitted</span>
                                <strong>
                                    ${date(
                                        app.created_at
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="noc-card-actions">

                            <button
                                type="button"
                                class="secondary-button"
                                data-gsa-noc-view="${esc(app.id)}">
                                View Application
                            </button>

                            <button
                                type="button"
                                class="secondary-button"
                                data-gsa-noc-pdf="${esc(app.id)}">
                                Download PDF
                            </button>

                            <button
                                type="button"
                                class="danger-button"
                                data-gsa-noc-delete="${esc(app.id)}">
                                Delete
                            </button>

                            ${
                                status === "pending"
                                ? `
                                    <button
                                        type="button"
                                        class="primary-button"
                                        data-gsa-noc-approve="${esc(app.id)}">
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        class="danger-button"
                                        data-gsa-noc-reject="${esc(app.id)}">
                                        Reject
                                    </button>
                                `
                                : ""
                            }

                            ${
                                status === "approved"
                                ? `
                                    <button
                                        type="button"
                                        class="primary-button"
                                        data-gsa-noc-official-pdf="${esc(app.id)}">
                                        Download Official NOC
                                    </button>
                                `
                                : ""
                            }

                        </div>

                    </article>
                `;

            }).join("")
        );
    }

    async function load() {
        const list =
            listElement();

        if (!list) {
            setTimeout(load, 300);
            return;
        }

        setList(`
            <div class="loading-state">
                NOC: Loading applications...
            </div>
        `);

        try {

            await getSession();

            const result =
                await client()
                    .from(
                        "noc_applications"
                    )
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (result.error) {
                throw result.error;
            }

            applications =
                result.data || [];

            window.gsaNocApplications =
                applications;

            console.log(
                "GSA NOC:",
                applications.length,
                "applications loaded."
            );

            render();

        } catch (error) {

            console.error(
                "GSA NOC load error:",
                error
            );

            setList(`
                <div class="empty-state">
                    <strong>NOC LOAD ERROR</strong><br><br>
                    ${esc(
                        error?.message ||
                        "Unknown error"
                    )}
                </div>
            `);
        }
    }

    function openApplication(app) {
        selectedApplication =
            app;

        const modal =
            document.getElementById(
                "nocModal"
            );

        const details =
            document.getElementById(
                "nocDetails"
            );

        if (!modal || !details) {
            alert(
                "NOC application modal is not available."
            );
            return;
        }

        const note =
            document.getElementById(
                "nocAdminNote"
            );

        if (note) {
            note.value =
                app.admin_note || "";
            note.style.display = "";
        }

        details.innerHTML = `

            <div class="noc-details-header">

                <div class="noc-detail-item">
                    <span>Application No</span>
                    <strong>
                        ${esc(
                            app.application_no ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Player Name</span>
                    <strong>
                        ${esc(
                            app.player_name ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Father / Guardian</span>
                    <strong>
                        ${esc(
                            app.father_name ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Applicant Type</span>
                    <strong>
                        ${esc(
                            app.applicant_type ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Sport</span>
                    <strong>
                        ${esc(
                            app.sport_type ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Jersey / Player Number</span>
                    <strong>
                        ${esc(
                            app.jersey_number ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>GSA Player ID</span>
                    <strong>
                        ${esc(
                            app.gsa_player_id ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Email</span>
                    <strong>
                        ${esc(
                            app.applicant_email ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Phone</span>
                    <strong>
                        ${esc(
                            app.applicant_phone ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Destination Organization</span>
                    <strong>
                        ${esc(
                            app.destination_organization ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Tournament / Event</span>
                    <strong>
                        ${esc(
                            app.tournament_or_event ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>NOC Reason</span>
                    <strong style="white-space:pre-wrap;">
                        ${esc(
                            app.noc_reason ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Applicant Statement</span>
                    <strong style="white-space:pre-wrap;">
                        ${esc(
                            app.applicant_statement ||
                            "—"
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Status</span>
                    <strong>
                        ${esc(
                            (app.status || "pending")
                                .toUpperCase()
                        )}
                    </strong>
                </div>

                <div class="noc-detail-item">
                    <span>Submitted</span>
                    <strong>
                        ${date(app.created_at)}
                        ${time(app.created_at)}
                    </strong>
                </div>

            </div>
        `;

        const approve =
            document.getElementById(
                "nocApproveButton"
            );

        const reject =
            document.getElementById(
                "nocRejectButton"
            );

        if (approve) {
            approve.style.display =
                app.status === "pending"
                    ? ""
                    : "none";
        }

        if (reject) {
            reject.style.display =
                app.status === "pending"
                    ? ""
                    : "none";
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

    function closeModal() {
        const modal =
            document.getElementById(
                "nocModal"
            );

        if (!modal) return;

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

        selectedApplication =
            null;
    }

    async function process(app, status) {

        if (!app) return;

        if (app.status !== "pending") {
            alert(
                "This NOC application has already been processed."
            );
            return;
        }

        const action =
            status === "approved"
                ? "approve"
                : "reject";

        const confirmed =
            confirm(
                `Are you sure you want to ${action} this NOC application?`
            );

        if (!confirmed) {
            return;
        }

        const note =
            document.getElementById(
                "nocAdminNote"
            )?.value.trim() || "";

        try {

            const result =
                await api(
                    action,
                    {
                        id: app.id,
                        note: note
                    }
                );

            closeModal();

            await load();

            alert(
                result.message ||
                (
                    status === "approved"
                        ? "NOC application approved."
                        : "NOC application rejected."
                )
            );

        } catch (error) {

            console.error(
                "NOC process error:",
                error
            );

            alert(
                error?.message ||
                "Unable to process NOC application."
            );
        }
    }

    async function deleteApplication(app) {

        if (!app) return;

        const player =
            app.player_name ||
            "this application";

        const confirmed =
            confirm(
                `Delete NOC application for ${player}?\n\n` +
                "This action will permanently delete the application."
            );

        if (!confirmed) {
            return;
        }

        try {

            const session =
                await getSession();

            const result =
                await client()
                    .from("noc_applications")
                    .delete()
                    .eq("id", app.id);

            if (result.error) {
                throw result.error;
            }

            applications =
                applications.filter(
                    item =>
                        String(item.id) !==
                        String(app.id)
                );

            window.gsaNocApplications =
                applications;

            if (
                selectedApplication &&
                String(selectedApplication.id) ===
                String(app.id)
            ) {
                closeModal();
            }

            render();

            alert(
                "NOC application deleted successfully."
            );

        } catch (error) {

            console.error(
                "GSA NOC delete error:",
                error
            );

            alert(
                error?.message ||
                "Unable to delete NOC application."
            );
        }
    }

    async function downloadPDF(app, official = false) {

        if (!app) {
            return;
        }

        if (
            !window.jspdf?.jsPDF ||
            !window.html2canvas
        ) {
            alert(
                "PDF libraries are not loaded. Please refresh the page."
            );
            return;
        }

        const jsPDF =
            window.jspdf.jsPDF;

        const fontUrl =
            new URL(
                "/admin/fonts/NotoSansBengali-Regular.ttf",
                window.location.origin
            ).href;

        const logoUrl =
            new URL(
                "/gsa.png",
                window.location.origin
            ).href;

        function escPdf(value) {
            return esc(
                value === null ||
                value === undefined ||
                value === ""
                    ? "—"
                    : value
            );
        }

        function makeField(label, value, wide = false) {

            return `
                <div class="gsa-pdf-field ${wide ? "wide" : ""}">

                    <div class="gsa-pdf-label">
                        ${escPdf(label)}
                    </div>

                    <div class="gsa-pdf-value">
                        ${escPdf(value)}
                    </div>

                </div>
            `;
        }

        const status =
            String(
                app.status || "pending"
            ).toLowerCase();

        const statusText =
            status === "approved"
                ? "APPROVED"
                : status === "rejected"
                    ? "REJECTED"
                    : "PENDING";

        const statusClass =
            status === "approved"
                ? "approved"
                : status === "rejected"
                    ? "rejected"
                    : "pending";

        const title =
            official
                ? "OFFICIAL NOC"
                : "NOC APPLICATION";

        const subtitle =
            official
                ? "NO OBJECTION CERTIFICATE"
                : "APPLICATION FORM";

        const statement =
            app.applicant_statement ||
            "—";

        const reason =
            app.noc_reason ||
            "—";

        const adminNote =
            app.admin_note ||
            "—";

        const submittedDate =
            date(app.created_at);

        const submittedTime =
            time(app.created_at);

        const pdfContainer =
            document.createElement("div");

        pdfContainer.style.position =
            "fixed";

        pdfContainer.style.left =
            "-100000px";

        pdfContainer.style.top =
            "0";

        pdfContainer.style.width =
            "794px";

        pdfContainer.style.background =
            "#ffffff";

        pdfContainer.style.zIndex =
            "-9999";

        pdfContainer.innerHTML = `

            <style>

                @font-face {
                    font-family: "NotoSansBengaliGSA";
                    src: url("${fontUrl}") format("truetype");
                    font-style: normal;
                    font-weight: 400;
                }

                * {
                    box-sizing: border-box;
                }

                .gsa-pdf-page {
                    width: 794px;
                    min-height: 1123px;
                    padding: 42px 48px 46px;
                    background: #ffffff;
                    color: #172033;
                    font-family:
                        "NotoSansBengaliGSA",
                        "Noto Sans Bengali",
                        Arial,
                        sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .gsa-pdf-border {
                    position: absolute;
                    inset: 20px;
                    border: 2px solid #b99645;
                    pointer-events: none;
                }

                .gsa-pdf-inner-border {
                    position: absolute;
                    inset: 26px;
                    border: 1px solid #e6d3a0;
                    pointer-events: none;
                }

                .gsa-pdf-header {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 130px;
                    border-bottom: 2px solid #b99645;
                    padding-bottom: 22px;
                    margin-bottom: 24px;
                }

                .gsa-pdf-logo {
                    position: absolute;
                    left: 8px;
                    top: 4px;
                    width: 92px;
                    height: 92px;
                    object-fit: contain;
                }

                .gsa-pdf-header-text {
                    text-align: center;
                    padding: 0 100px;
                }

                .gsa-pdf-club {
                    font-size: 27px;
                    font-weight: 700;
                    letter-spacing: .2px;
                    line-height: 1.35;
                    color: #15213b;
                    margin-bottom: 6px;
                }

                .gsa-pdf-english {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    letter-spacing: 2.3px;
                    color: #6d7687;
                    margin-bottom: 13px;
                }

                .gsa-pdf-title {
                    font-family: Arial, sans-serif;
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: 5px;
                    color: #b28a35;
                    line-height: 1;
                }

                .gsa-pdf-subtitle {
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    color: #7b8494;
                    margin-top: 7px;
                }

                .gsa-pdf-status {
                    position: absolute;
                    right: 7px;
                    top: 4px;
                    padding: 8px 13px;
                    border-radius: 5px;
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .gsa-pdf-status.approved {
                    background: #e8f5ed;
                    color: #166534;
                    border: 1px solid #9bd0ad;
                }

                .gsa-pdf-status.rejected {
                    background: #fdecec;
                    color: #991b1b;
                    border: 1px solid #e7aaaa;
                }

                .gsa-pdf-status.pending {
                    background: #fff7df;
                    color: #856404;
                    border: 1px solid #dfc77e;
                }

                .gsa-pdf-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .gsa-pdf-meta-box {
                    border: 1px solid #dfe4ec;
                    border-radius: 7px;
                    padding: 11px 14px;
                    background: #f8fafc;
                }

                .gsa-pdf-meta-label {
                    font-family: Arial, sans-serif;
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #7a8495;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .gsa-pdf-meta-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: #172033;
                }

                .gsa-pdf-section {
                    margin-top: 18px;
                }

                .gsa-pdf-section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: Arial, sans-serif;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                    color: #26334d;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                .gsa-pdf-section-title::before {
                    content: "";
                    display: block;
                    width: 4px;
                    height: 18px;
                    background: #b99645;
                    border-radius: 2px;
                }

                .gsa-pdf-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .gsa-pdf-field {
                    min-height: 58px;
                    border: 1px solid #e0e5ed;
                    border-radius: 6px;
                    padding: 9px 12px;
                    background: #ffffff;
                }

                .gsa-pdf-field.wide {
                    grid-column: 1 / -1;
                }

                .gsa-pdf-label {
                    font-family: Arial, sans-serif;
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: .6px;
                    color: #7b8494;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }

                .gsa-pdf-value {
                    font-size: 12px;
                    line-height: 1.55;
                    color: #172033;
                    word-break: break-word;
                    white-space: pre-wrap;
                }

                .gsa-pdf-statement {
                    border: 1px solid #e0e5ed;
                    border-left: 4px solid #b99645;
                    border-radius: 6px;
                    padding: 13px 15px;
                    background: #fafbfc;
                    font-size: 12px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                }

                .gsa-pdf-official-box {
                    margin-top: 20px;
                    padding: 17px;
                    border: 1.5px solid #b99645;
                    border-radius: 8px;
                    background: #fffdf7;
                }

                .gsa-pdf-official-heading {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 1.3px;
                    color: #8b6a26;
                    margin-bottom: 8px;
                }

                .gsa-pdf-official-text {
                    font-size: 12px;
                    line-height: 1.7;
                    color: #30394a;
                }

                .gsa-pdf-signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 55px;
                    margin-top: 48px;
                }

                .gsa-pdf-signature {
                    text-align: center;
                    padding-top: 8px;
                    border-top: 1px solid #6f7785;
                }

                .gsa-pdf-signature-name {
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    color: #293247;
                    margin-top: 7px;
                }

                .gsa-pdf-signature-role {
                    font-family: Arial, sans-serif;
                    font-size: 8px;
                    color: #7b8494;
                    margin-top: 3px;
                }

                .gsa-pdf-footer {
                    position: absolute;
                    left: 48px;
                    right: 48px;
                    bottom: 31px;
                    padding-top: 9px;
                    border-top: 1px solid #e0e5ed;
                    text-align: center;
                    font-family: Arial, sans-serif;
                    font-size: 8px;
                    color: #7b8494;
                    letter-spacing: .5px;
                }

            </style>

            <div class="gsa-pdf-page">

                <div class="gsa-pdf-border"></div>
                <div class="gsa-pdf-inner-border"></div>

                <div class="gsa-pdf-header">

                    <img
                        class="gsa-pdf-logo"
                        src="${logoUrl}"
                        crossorigin="anonymous"
                    >

                    <div class="gsa-pdf-header-text">

                        <div class="gsa-pdf-club">
                            ঘোপখালী স্পোর্টস অ্যারিনা
                        </div>

                        <div class="gsa-pdf-english">
                            GHOPKHALI SPORTS ARENA
                        </div>

                        <div class="gsa-pdf-title">
                            NOC
                        </div>

                        <div class="gsa-pdf-subtitle">
                            ${title}
                        </div>

                    </div>

                    <div class="gsa-pdf-status ${statusClass}">
                        ${statusText}
                    </div>

                </div>

                <div class="gsa-pdf-meta">

                    <div class="gsa-pdf-meta-box">
                        <div class="gsa-pdf-meta-label">
                            Application No
                        </div>
                        <div class="gsa-pdf-meta-value">
                            ${escPdf(app.application_no)}
                        </div>
                    </div>

                    <div class="gsa-pdf-meta-box">
                        <div class="gsa-pdf-meta-label">
                            Submitted
                        </div>
                        <div class="gsa-pdf-meta-value">
                            ${escPdf(submittedDate)}
                            ${escPdf(submittedTime)}
                        </div>
                    </div>

                </div>

                <div class="gsa-pdf-section">

                    <div class="gsa-pdf-section-title">
                        Applicant Information
                    </div>

                    <div class="gsa-pdf-grid">

                        ${makeField(
                            "Player Name",
                            app.player_name
                        )}

                        ${makeField(
                            "Father / Guardian",
                            app.father_name
                        )}

                        ${makeField(
                            "Applicant Type",
                            app.applicant_type
                        )}

                        ${makeField(
                            "Sport",
                            app.sport_type
                        )}

                        ${makeField(
                            "Jersey / Player Number",
                            app.jersey_number
                        )}

                        ${makeField(
                            "GSA Player ID",
                            app.gsa_player_id
                        )}

                        ${makeField(
                            "Applicant Email",
                            app.applicant_email
                        )}

                        ${makeField(
                            "Applicant Phone",
                            app.applicant_phone
                        )}

                    </div>

                </div>

                <div class="gsa-pdf-section">

                    <div class="gsa-pdf-section-title">
                        NOC Information
                    </div>

                    <div class="gsa-pdf-grid">

                        ${makeField(
                            "Destination Organization",
                            app.destination_organization,
                            true
                        )}

                        ${makeField(
                            "Tournament / Event",
                            app.tournament_or_event,
                            true
                        )}

                        ${makeField(
                            "NOC Reason",
                            reason,
                            true
                        )}

                        ${makeField(
                            "Applicant Statement",
                            statement,
                            true
                        )}

                    </div>

                </div>

                ${
                    official
                        ? `
                            <div class="gsa-pdf-official-box">

                                <div class="gsa-pdf-official-heading">
                                    OFFICIAL NO OBJECTION CERTIFICATE
                                </div>

                                <div class="gsa-pdf-official-text">
                                    This document confirms that the above-mentioned
                                    player has been granted a No Objection Certificate
                                    by Ghopkhali Sports Arena for the stated purpose,
                                    subject to the information and conditions recorded
                                    in the application.
                                </div>

                            </div>

                            ${
                                adminNote !== "—"
                                    ? `
                                        <div class="gsa-pdf-section">

                                            <div class="gsa-pdf-section-title">
                                                Administrative Note
                                            </div>

                                            <div class="gsa-pdf-statement">
                                                ${escPdf(adminNote)}
                                            </div>

                                        </div>
                                    `
                                    : ""
                            }

                            <div class="gsa-pdf-signatures">

                                <div class="gsa-pdf-signature">
                                    <div class="gsa-pdf-signature-name">
                                        Authorized Representative
                                    </div>
                                    <div class="gsa-pdf-signature-role">
                                        Ghopkhali Sports Arena
                                    </div>
                                </div>

                                <div class="gsa-pdf-signature">
                                    <div class="gsa-pdf-signature-name">
                                        Official Seal
                                    </div>
                                    <div class="gsa-pdf-signature-role">
                                        Ghopkhali Sports Arena
                                    </div>
                                </div>

                            </div>
                        `
                        : ""
                }

                <div class="gsa-pdf-footer">
                    Ghopkhali Sports Arena • ঘোপখালী, বেতমোর রাজপাড়া, মঠবাড়িয়া, পিরোজপুর
                    • Official NOC Document
                </div>

            </div>
        `;

        document.body.appendChild(
            pdfContainer
        );

        try {

            const fontFace =
                new FontFace(
                    "NotoSansBengaliGSA",
                    `url(${fontUrl})`
                );

            await fontFace.load();

            document.fonts.add(
                fontFace
            );

            await document.fonts.ready;

            const logo =
                pdfContainer.querySelector(
                    ".gsa-pdf-logo"
                );

            if (logo) {
                await new Promise(
                    resolve => {

                        if (logo.complete) {
                            resolve();
                            return;
                        }

                        logo.onload =
                            resolve;

                        logo.onerror =
                            resolve;
                    }
                );
            }

            const canvas =
                await window.html2canvas(
                    pdfContainer.querySelector(
                        ".gsa-pdf-page"
                    ),
                    {
                        scale: 2,
                        useCORS: true,
                        allowTaint: false,
                        backgroundColor:
                            "#ffffff",
                        logging: false
                    }
                );

            const pdf =
                new jsPDF(
                    {
                        orientation: "portrait",
                        unit: "mm",
                        format: "a4",
                        compress: true
                    }
                );

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            const margin =
                0;

            const imageWidth =
                pageWidth - margin * 2;

            const imageHeight =
                canvas.height *
                imageWidth /
                canvas.width;

            let remainingHeight =
                imageHeight;

            let position = 0;

            pdf.addImage(
                canvas,
                "PNG",
                margin,
                position,
                imageWidth,
                imageHeight,
                undefined,
                "FAST"
            );

            remainingHeight -=
                pageHeight;

            while (
                remainingHeight > 0
            ) {

                position =
                    remainingHeight -
                    imageHeight;

                pdf.addPage();

                pdf.addImage(
                    canvas,
                    "PNG",
                    margin,
                    position,
                    imageWidth,
                    imageHeight,
                    undefined,
                    "FAST"
                );

                remainingHeight -=
                    pageHeight;
            }

            const safeName =
                String(
                    app.application_no ||
                    app.player_name ||
                    "NOC"
                )
                .replace(
                    /[^a-z0-9_-]/gi,
                    "_"
                );

            pdf.save(
                official
                    ? `GSA-Official-NOC-${safeName}.pdf`
                    : `GSA-NOC-Application-${safeName}.pdf`
            );

        } catch (error) {

            console.error(
                "GSA Premium PDF error:",
                error
            );

            alert(
                error?.message ||
                "Unable to generate PDF."
            );

        } finally {

            pdfContainer.remove();
        }
    }

    document.addEventListener(
        "click",
        async event => {

            const filter =
                event.target.closest(
                    "[data-noc-filter]"
                );

            if (filter) {

                activeFilter =
                    filter.dataset.nocFilter;

                document
                    .querySelectorAll(
                        ".noc-filter"
                    )
                    .forEach(button => {
                        button.classList.toggle(
                            "active",
                            button === filter
                        );
                    });

                render();

                return;
            }

            const view =
                event.target.closest(
                    "[data-gsa-noc-view]"
                );

            if (view) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                view.dataset
                                    .gsaNocView
                            )
                    );

                if (app) {
                    openApplication(app);
                }

                return;
            }

            const pdf =
                event.target.closest(
                    "[data-gsa-noc-pdf]"
                );

            if (pdf) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                pdf.dataset
                                    .gsaNocPdf
                            )
                    );

                if (app) {
                    downloadPDF(
                        app,
                        false
                    );
                }

                return;
            }

            const officialPdf =
                event.target.closest(
                    "[data-gsa-noc-official-pdf]"
                );

            if (officialPdf) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                officialPdf.dataset
                                    .gsaNocOfficialPdf
                            )
                    );

                if (app) {
                    downloadPDF(
                        app,
                        true
                    );
                }

                return;
            }

            const approve =
                event.target.closest(
                    "[data-gsa-noc-approve]"
                );

            if (approve) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                approve.dataset
                                    .gsaNocApprove
                            )
                    );

                if (app) {
                    openApplication(app);
                    await process(
                        app,
                        "approved"
                    );
                }

                return;
            }

            const reject =
                event.target.closest(
                    "[data-gsa-noc-reject]"
                );

            if (reject) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                reject.dataset
                                    .gsaNocReject
                            )
                    );

                if (app) {
                    openApplication(app);
                    await process(
                        app,
                        "rejected"
                    );
                }

                return;
            }

            const deleteButton =
                event.target.closest(
                    "[data-gsa-noc-delete]"
                );

            if (deleteButton) {

                const app =
                    applications.find(
                        x =>
                            String(x.id) ===
                            String(
                                deleteButton.dataset
                                    .gsaNocDelete
                            )
                    );

                if (app) {
                    await deleteApplication(app);
                }

                return;
            }

            const modal =
                document.getElementById(
                    "nocModal"
                );

            if (
                event.target === modal ||
                event.target.closest(
                    "[data-close-modal]"
                )
            ) {
                closeModal();
            }
        }
    );

    document
        .getElementById(
            "nocApproveButton"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (!selectedApplication) {
                    return;
                }

                await process(
                    selectedApplication,
                    "approved"
                );
            }
        );

    document
        .getElementById(
            "nocRejectButton"
        )
        ?.addEventListener(
            "click",
            async () => {

                if (!selectedApplication) {
                    return;
                }

                await process(
                    selectedApplication,
                    "rejected"
                );
            }
        );

    window.gsaIndependentNocLoader =
        load;

    function start() {

        if (!document.getElementById("nocList")) {
            setTimeout(
                start,
                250
            );
            return;
        }

        load();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    } else {
        start();
    }

})();

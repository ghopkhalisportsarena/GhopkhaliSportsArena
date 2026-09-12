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
    if (!app) return;

    try {
        if (!window.jspdf || !window.html2canvas) {
            throw new Error("PDF library is not available.");
        }

        const { jsPDF } = window.jspdf;

        const fontUrl =
            "/admin/fonts/NotoSansBengali-Regular.ttf";

        const logoUrl = "/gsa.png";

        const escHtml = (value) =>
            String(value ?? "—")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const value = (key) =>
            app[key] === null ||
            app[key] === undefined ||
            String(app[key]).trim() === ""
                ? "—"
                : String(app[key]);

        const safeName =
            (value("player_name") === "—"
                ? "Applicant"
                : value("player_name"))
                .replace(/[^a-zA-Z0-9-_]+/g, "-")
                .replace(/^-+|-+$/g, "") ||
            "Applicant";

        const status =
            String(app.status || "pending")
                .toUpperCase();

        const statusClass =
            status === "APPROVED"
                ? "approved"
                : status === "REJECTED"
                    ? "rejected"
                    : "pending";

        const submitted = app.created_at
            ? new Date(app.created_at)
                .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                })
            : "—";

        if (!document.fonts.check(
            '16px "NotoSansBengaliGSA"'
        )) {
            try {
                const face =
                    new FontFace(
                        "NotoSansBengaliGSA",
                        `url(${fontUrl})`
                    );

                await face.load();
                document.fonts.add(face);
            } catch (fontError) {
                console.warn(
                    "Bengali font loading failed:",
                    fontError
                );
            }
        }

        const waitImage = (src) =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = src;
            });

        await waitImage(logoUrl);

        const field = (label, val, wide = false) => `
            <div class="field ${wide ? "wide" : ""}">
                <div class="field-label">
                    ${escHtml(label)}
                </div>
                <div class="field-value">
                    ${escHtml(val)}
                </div>
            </div>
        `;

        const section = (title, body) => `
            <section class="section">
                <div class="section-title">
                    <span class="section-mark"></span>
                    <span>${title}</span>
                </div>
                ${body}
            </section>
        `;

        const page = document.createElement("div");

        page.style.position = "fixed";
        page.style.left = "-100000px";
        page.style.top = "0";
        page.style.width = "794px";
        page.style.background = "#f5f5f7";
        page.style.zIndex = "-1";

        page.innerHTML = `
<style>
@font-face {
    font-family: "NotoSansBengaliGSA";
    src: url("${fontUrl}") format("truetype");
    font-weight: 400;
}

* {
    box-sizing: border-box;
}

.gsa-pdf {
    width: 794px;
    min-height: 1123px;
    padding: 30px;
    background: #f5f5f7;
    color: #1d1d1f;
    font-family:
        "NotoSansBengaliGSA",
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Arial,
        sans-serif;
}

.sheet {
    position: relative;
    min-height: 1063px;
    padding: 34px 34px 30px;
    background: #ffffff;
    border-radius: 24px;
    box-shadow:
        0 12px 40px rgba(0,0,0,.08);
    overflow: hidden;
}

.sheet::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid rgba(0,0,0,.07);
    border-radius: 24px;
}

.header {
    position: relative;
    display: grid;
    grid-template-columns: 92px 1fr 120px;
    align-items: center;
    min-height: 148px;
    padding-bottom: 24px;
    border-bottom: 1px solid #d2d2d7;
}

.logo-wrap {
    width: 78px;
    height: 78px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
}

.brand {
    text-align: center;
}

.brand-name {
    margin: 0;
    font-size: 25px;
    font-weight: 700;
    letter-spacing: 2.4px;
    color: #1d1d1f;
}

.brand-sub {
    margin-top: 5px;
    font-size: 9px;
    letter-spacing: 3px;
    color: #86868b;
    font-weight: 600;
}

.noc {
    margin-top: 17px;
    font-size: 39px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: 8px;
    color: #1d1d1f;
}

.noc-sub {
    margin-top: 7px;
    font-size: 9px;
    letter-spacing: 2.5px;
    color: #6e6e73;
}

.status {
    justify-self: end;
    align-self: start;
    padding: 8px 13px;
    border-radius: 999px;
    font-size: 8px;
    letter-spacing: 1.5px;
    font-weight: 800;
    border: 1px solid;
}

.status.approved {
    color: #248a3d;
    background: #f0f9f2;
    border-color: #b7dfc0;
}

.status.rejected {
    color: #c62828;
    background: #fff4f4;
    border-color: #f0bcbc;
}

.status.pending {
    color: #0071e3;
    background: #f0f7ff;
    border-color: #b8d8f7;
}

.section {
    margin-top: 25px;
    break-inside: avoid;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 11px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.6px;
    color: #515154;
}

.section-mark {
    width: 4px;
    height: 17px;
    border-radius: 4px;
    background: #0071e3;
}

.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.field {
    min-height: 73px;
    padding: 13px 15px;
    background: #fbfbfd;
    border: 1px solid #e5e5ea;
    border-radius: 14px;
    break-inside: avoid;
}

.field.wide {
    min-height: 76px;
}

.field-label {
    margin-bottom: 9px;
    font-size: 7.5px;
    line-height: 1.3;
    font-weight: 800;
    letter-spacing: 1.1px;
    color: #86868b;
}

.field-value {
    font-size: 13px;
    line-height: 1.65;
    font-weight: 500;
    color: #1d1d1f;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.long-field {
    min-height: 100px;
}

.long-field .field-value {
    line-height: 1.75;
}

.statement {
    min-height: 125px;
}

.note {
    min-height: 92px;
}

.authorization {
    margin-top: 26px;
    padding: 18px;
    border: 1px solid #e5e5ea;
    border-radius: 16px;
    background: #fbfbfd;
    break-inside: avoid;
}

.auth-title {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.4px;
    color: #515154;
    margin-bottom: 15px;
}

.auth-text {
    font-size: 11px;
    line-height: 1.7;
    color: #3a3a3c;
}

.signature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 35px;
    margin-top: 28px;
}

.signature {
    padding-top: 23px;
    border-top: 1px solid #8e8e93;
    font-size: 8px;
    color: #6e6e73;
    letter-spacing: .8px;
}

.footer {
    margin-top: 25px;
    padding-top: 13px;
    border-top: 1px solid #e5e5ea;
    text-align: center;
    font-size: 7.5px;
    line-height: 1.5;
    color: #86868b;
}

.page-break {
    height: 1px;
}

.meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

@media print {
    .gsa-pdf {
        box-shadow: none;
    }
}
</style>

<div class="gsa-pdf">
    <div class="sheet">

        <div class="header">
            <div class="logo-wrap">
                <img
                    class="logo"
                    src="${logoUrl}"
                    crossorigin="anonymous"
                >
            </div>

            <div class="brand">
                <div class="brand-name">
                    GHOPKHALI SPORTS ARENA
                </div>

                <div class="brand-sub">
                    OFFICIAL SPORTS ORGANIZATION
                </div>

                <div class="noc">
                    NOC
                </div>

                <div class="noc-sub">
                    NO OBJECTION CERTIFICATE
                </div>
            </div>

            <div class="status ${statusClass}">
                ${escHtml(status)}
            </div>
        </div>

        ${section(
            "APPLICATION DETAILS",
            `
            <div class="meta">
                ${field(
                    "APPLICATION NO",
                    value("application_no") !== "—"
                        ? value("application_no")
                        : value("application_number")
                )}

                ${field(
                    "SUBMITTED",
                    submitted
                )}
            </div>
            `
        )}

        ${section(
            "APPLICANT INFORMATION",
            `
            <div class="grid">
                ${field("PLAYER NAME", value("player_name"))}
                ${field("FATHER / GUARDIAN", value("father_guardian"))}

                ${field("APPLICANT TYPE", value("applicant_type"))}
                ${field("SPORT", value("sport"))}

                ${field(
                    "JERSEY / PLAYER NUMBER",
                    value("jersey_number")
                )}

                ${field(
                    "GSA PLAYER ID",
                    value("gsa_player_id")
                )}

                ${field(
                    "APPLICANT EMAIL",
                    value("email")
                )}

                ${field(
                    "APPLICANT PHONE",
                    value("phone")
                )}
            </div>
            `
        )}

        ${section(
            "NOC INFORMATION",
            `
            <div class="grid">
                ${field(
                    "DESTINATION ORGANIZATION",
                    value("destination_organization"),
                    true
                )}

                ${field(
                    "TOURNAMENT / EVENT",
                    value("tournament_event"),
                    true
                )}
            </div>

            <div style="height:10px"></div>

            ${field(
                "NOC REASON",
                value("noc_reason"),
                true
            )}

            <div style="height:10px"></div>

            <div class="field statement">
                <div class="field-label">
                    APPLICANT STATEMENT
                </div>

                <div class="field-value">
                    ${escHtml(value("applicant_statement"))}
                </div>
            </div>
            `
        )}

        ${
            official
                ? `
                ${section(
                    "ADMINISTRATION",
                    `
                    <div class="grid">
                        ${field(
                            "STATUS",
                            status
                        )}

                        ${field(
                            "ADMIN NOTE",
                            value("admin_note")
                        )}
                    </div>
                    `
                )}

                <div class="authorization">
                    <div class="auth-title">
                        OFFICIAL AUTHORIZATION
                    </div>

                    <div class="auth-text">
                        This document confirms that Ghopkhali
                        Sports Arena has reviewed the application
                        and issued this No Objection Certificate
                        subject to the organization's official
                        records and applicable rules.
                    </div>

                    <div class="signature-row">
                        <div class="signature">
                            AUTHORIZED SIGNATURE
                        </div>

                        <div class="signature">
                            OFFICIAL SEAL
                        </div>
                    </div>
                </div>
                `
                : ""
        }

        <div class="footer">
            Ghopkhali Sports Arena
            • ঘোপখালী, বেতমোর রাজপাড়া, মঠবাড়িয়া, পিরোজপুর
            • Official NOC Document
        </div>

    </div>
</div>
`;

        document.body.appendChild(page);

        await new Promise((resolve) =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );

        await document.fonts.ready;

        const canvas =
            await window.html2canvas(
                page.querySelector(".sheet"),
                {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: "#f5f5f7",
                    logging: false,
                    imageTimeout: 15000
                }
            );

        document.body.removeChild(page);

        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true
            });

        const pageWidth = 210;
        const pageHeight = 297;

        const imgWidth = pageWidth;
        const imgHeight =
            canvas.height *
            imgWidth /
            canvas.width;

        let offset = 0;
        let pageNo = 0;

        while (offset < imgHeight) {
            if (pageNo > 0) {
                pdf.addPage();
            }

            pdf.addImage(
                canvas,
                "PNG",
                0,
                -offset,
                imgWidth,
                imgHeight,
                undefined,
                "FAST"
            );

            offset += pageHeight;
            pageNo++;
        }

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
            "Unable to generate NOC PDF."
        );
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

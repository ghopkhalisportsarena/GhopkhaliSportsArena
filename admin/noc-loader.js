(function () {
    "use strict";

    const SUPABASE_URL =
        "https://cmygmswzokyrmgdnuszq.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

    const GSA_NOC_API =
        "https://script.google.com/macros/s/AKfycbw1-V2VrlBmMb9yK-xfDHDQDzxfiJ2ORCVFTkZPeiqC6ItOmsNFHsXehdfiXahVY-4Q/exec";

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

    function downloadPDF(app, official = false) {

        if (!window.jspdf?.jsPDF) {
            alert(
                "PDF library is not loaded. Please refresh the page."
            );
            return;
        }

        const jsPDF =
            window.jspdf.jsPDF;

        const pdf =
            new jsPDF();

        let y = 20;

        function line(label, value) {

            pdf.setFontSize(10);

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.text(
                label,
                20,
                y
            );

            pdf.setFont(
                "helvetica",
                "normal"
            );

            const text =
                String(value || "—");

            const lines =
                pdf.splitTextToSize(
                    text,
                    150
                );

            pdf.text(
                lines,
                60,
                y
            );

            y +=
                Math.max(
                    8,
                    lines.length * 6
                );
        }

        pdf.setFontSize(
            official ? 18 : 16
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "GHOPKHALI SPORTS ARENA",
            20,
            y
        );

        y += 9;

        pdf.setFontSize(11);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            official
                ? "OFFICIAL NO OBJECTION CERTIFICATE"
                : "NOC APPLICATION",
            20,
            y
        );

        y += 12;

        pdf.line(
            20,
            y,
            190,
            y
        );

        y += 12;

        line(
            "Application No:",
            app.application_no
        );

        line(
            "Player Name:",
            app.player_name
        );

        line(
            "Father/Guardian:",
            app.father_name
        );

        line(
            "Applicant Type:",
            app.applicant_type
        );

        line(
            "Sport:",
            app.sport_type
        );

        line(
            "Jersey No:",
            app.jersey_number
        );

        line(
            "GSA Player ID:",
            app.gsa_player_id
        );

        line(
            "Email:",
            app.applicant_email
        );

        line(
            "Phone:",
            app.applicant_phone
        );

        line(
            "Destination:",
            app.destination_organization
        );

        line(
            "Tournament/Event:",
            app.tournament_or_event
        );

        line(
            "NOC Reason:",
            app.noc_reason
        );

        if (official) {

            y += 5;

            pdf.setFont(
                "helvetica",
                "bold"
            );

            pdf.text(
                "STATUS: APPROVED",
                20,
                y
            );

            y += 10;

            if (app.admin_note) {
                line(
                    "Admin Note:",
                    app.admin_note
                );
            }

            y += 12;

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.text(
                "Ghopkhali Sports Arena",
                20,
                y
            );

            y += 6;

            pdf.text(
                "Official NOC Document",
                20,
                y
            );
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

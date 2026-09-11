(function () {
    "use strict";

    const SUPABASE_URL =
        "https://cmygmswzokyrmgdnuszq.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

    let nocApplications = [];

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

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function setList(html) {
        const list = document.getElementById("nocList");

        if (list) {
            list.innerHTML = html;
        }
    }

    function updateCounts() {
        const total = nocApplications.length;

        const pending =
            nocApplications.filter(
                item => item.status === "pending"
            ).length;

        const approved =
            nocApplications.filter(
                item => item.status === "approved"
            ).length;

        const rejected =
            nocApplications.filter(
                item => item.status === "rejected"
            ).length;

        const ids = {
            nocCount: total,
            nocTotalCount: total,
            nocPendingCount: pending,
            nocApprovedCount: approved,
            nocRejectedCount: rejected
        };

        Object.keys(ids).forEach(id => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = ids[id];
            }
        });
    }

    function render() {
        if (!nocApplications.length) {
            setList(`
                <div class="noc-empty">
                    No NOC applications found.
                </div>
            `);

            updateCounts();
            return;
        }

        setList(
            nocApplications.map(application => {
                const status =
                    application.status || "pending";

                const statusLabel =
                    status === "approved"
                        ? "APPROVED"
                        : status === "rejected"
                            ? "REJECTED"
                            : "PENDING";

                return `
                    <article class="noc-card">

                        <div class="noc-card-top">
                            <div>
                                <h3 class="noc-card-title">
                                    ${escapeHTML(
                                        application.player_name ||
                                        "Unnamed Player"
                                    )}
                                </h3>

                                <div class="noc-card-number">
                                    ${escapeHTML(
                                        application.application_no ||
                                        "Application number pending"
                                    )}
                                </div>
                            </div>

                            <span class="noc-status ${escapeHTML(status)}">
                                ${statusLabel}
                            </span>
                        </div>

                        <div class="noc-card-grid">

                            <div class="noc-info-box">
                                <span>Sport</span>
                                <strong>
                                    ${escapeHTML(
                                        application.sport_type || "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>GSA Player ID</span>
                                <strong>
                                    ${escapeHTML(
                                        application.gsa_player_id || "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>Email</span>
                                <strong>
                                    ${escapeHTML(
                                        application.applicant_email || "—"
                                    )}
                                </strong>
                            </div>

                            <div class="noc-info-box">
                                <span>Submitted</span>
                                <strong>
                                    ${formatDate(
                                        application.created_at
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="noc-card-actions">

                            <button
                                type="button"
                                class="secondary-button"
                                data-independent-noc-view="${escapeHTML(
                                    application.id
                                )}">
                                View Details
                            </button>

                            ${
                                status === "pending"
                                    ? `
                                        <button
                                            type="button"
                                            class="primary-button"
                                            data-independent-noc-approve="${escapeHTML(
                                                application.id
                                            )}">
                                            Approve
                                        </button>

                                        <button
                                            type="button"
                                            class="danger-button"
                                            data-independent-noc-reject="${escapeHTML(
                                                application.id
                                            )}">
                                            Reject
                                        </button>
                                      `
                                    : ""
                            }

                            ${
                                application.application_pdf_url
                                    ? `
                                        <a
                                            class="secondary-button"
                                            href="${escapeHTML(
                                                application.application_pdf_url
                                            )}"
                                            target="_blank"
                                            rel="noopener">
                                            Application PDF
                                        </a>
                                      `
                                    : ""
                            }

                            ${
                                application.approved_noc_pdf_url &&
                                status === "approved"
                                    ? `
                                        <a
                                            class="primary-button"
                                            href="${escapeHTML(
                                                application.approved_noc_pdf_url
                                            )}"
                                            target="_blank"
                                            rel="noopener">
                                            Official NOC PDF
                                        </a>
                                      `
                                    : ""
                            }

                        </div>

                    </article>
                `;
            }).join("")
        );

        updateCounts();
    }

    async function load() {
        const list = document.getElementById("nocList");

        if (!list) {
            return;
        }

        setList(`
            <div class="loading-state">
                NOC: Connecting to database...
            </div>
        `);

        try {
            if (!window.supabase) {
                throw new Error(
                    "Supabase library is not loaded."
                );
            }

            if (!window.supabaseClient) {
                window.supabaseClient =
                    window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_KEY
                    );
            }

            const client =
                window.supabaseClient;

            setList(`
                <div class="loading-state">
                    NOC: Checking admin session...
                </div>
            `);

            const sessionResult =
                await client.auth.getSession();

            if (sessionResult.error) {
                throw sessionResult.error;
            }

            const session =
                sessionResult.data?.session;

            if (!session) {
                throw new Error(
                    "No active admin session."
                );
            }

            setList(`
                <div class="loading-state">
                    NOC: Loading applications...
                </div>
            `);

            const result =
                await client
                    .from("noc_applications")
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

            nocApplications =
                result.data || [];

            console.log(
                "Independent NOC loader:",
                nocApplications.length,
                "applications loaded."
            );

            render();

        } catch (error) {
            console.error(
                "Independent NOC loader error:",
                error
            );

            setList(`
                <div class="empty-state">
                    <strong>NOC LOAD ERROR</strong><br><br>
                    ${escapeHTML(
                        error?.message ||
                        "Unknown error"
                    )}
                </div>
            `);
        }
    }

    window.gsaIndependentNocLoader = load;

    function start() {
        const list =
            document.getElementById("nocList");

        if (!list) {
            setTimeout(start, 250);
            return;
        }

        load();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    } else {
        start();
    }

})();

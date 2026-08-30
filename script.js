<script>
/* =========================================================
   GHOPKHALI SPORTS ARENA
   COMPLETE SUPABASE WEBSITE SCRIPT
   ========================================================= */

/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

let gsaSupabase = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {
    gsaSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
} else {
    console.error("Supabase library was not loaded.");
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        const opened = navMenu.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            opened ? "true" : "false"
        );

    });

    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });
}


/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

document.addEventListener("click", event => {

    if (!navMenu || !menuToggle) return;

    if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

});


/* =========================================================
   HEADER SCROLL
   ========================================================= */

const header = document.querySelector(".site-header");

window.addEventListener(
    "scroll",
    () => {

        if (!header) return;

        header.style.boxShadow =
            window.scrollY > 20
                ? "0 8px 35px rgba(0,0,0,.07)"
                : "none";

    },
    { passive: true }
);


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-menu a");

if (sections.length && navLinks.length) {

    const navObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    const id =
                        entry.target.getAttribute("id");

                    navLinks.forEach(link => {

                        link.classList.remove("active");

                        if (
                            link.getAttribute("href") ===
                            `#${id}`
                        ) {
                            link.classList.add("active");
                        }

                    });

                });

            },
            {
                rootMargin:
                    "-35% 0px -55% 0px"
            }
        );

    sections.forEach(section => {
        navObserver.observe(section);
    });

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements = document.querySelectorAll(`
    .activity-card,
    .fixture-card,
    .coming-soon,
    .committee-person,
    .social-card,
    .update-card,
    .tournament-card,
    .form-card,
    .gallery-item,
    .leader-card
`);

if (revealElements.length) {

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add(
                        "revealed"
                    );

                    revealObserver.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );

    revealElements.forEach(element => {

        element.classList.add("reveal");

        revealObserver.observe(element);

    });

}


/* =========================================================
   NOTICE DATE
   ========================================================= */

function formatNoticeDate(dateValue) {

    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
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


/* =========================================================
   NOTICE TICKER
   ========================================================= */

const noticeTrack =
    document.querySelector("#homeNoticeTicker");

let noticeAnimationFrame = null;

function stopNoticeTicker() {

    if (noticeAnimationFrame) {

        cancelAnimationFrame(
            noticeAnimationFrame
        );

        noticeAnimationFrame = null;
    }

}


function startNoticeTicker() {

    if (!noticeTrack) return;

    stopNoticeTicker();

    let position = 0;

    function animate() {

        position -= 0.35;

        const resetPoint =
            noticeTrack.scrollWidth / 2;

        if (
            resetPoint > 0 &&
            Math.abs(position) >= resetPoint
        ) {
            position = 0;
        }

        noticeTrack.style.transform =
            `translateX(${position}px)`;

        noticeAnimationFrame =
            requestAnimationFrame(animate);
    }

    animate();
}


function renderNoticeTicker(notices) {

    if (!noticeTrack) return;

    stopNoticeTicker();

    if (!notices || !notices.length) {

        noticeTrack.innerHTML = `
            <span class="notice-ticker-item">
                No latest notices available.
            </span>
        `;

        return;
    }

    const html = notices.map(notice => {

        return `
            <span class="notice-ticker-item">
                <strong>NOTICE</strong>
                ${escapeHTML(notice.title)}
            </span>
        `;

    }).join("");

    noticeTrack.innerHTML =
        html + html;

    startNoticeTicker();
}


/* =========================================================
   NOTICE CARDS
   ========================================================= */

function renderNoticeCards(notices) {

    const container =
        document.querySelector("#home-notices");

    if (!container) return;

    if (!notices || !notices.length) {

        container.innerHTML = `
            <article class="update-card revealed">

                <div class="update-date">
                    —
                </div>

                <div class="update-tag">
                    NOTICE
                </div>

                <h3>
                    No latest notices
                </h3>

                <p>
                    There are currently no published
                    notices from Ghopkhali Sports Arena.
                </p>

            </article>
        `;

        return;
    }

    container.innerHTML =
        notices.map((notice, index) => {

            const title =
                escapeHTML(
                    notice.title ||
                    "Untitled Notice"
                );

            const content =
                escapeHTML(
                    notice.content || ""
                );

            const category =
                escapeHTML(
                    notice.category ||
                    "GENERAL"
                );

            const date =
                formatNoticeDate(
                    notice.created_at
                );

            const imageURL =
                notice.image_url
                    ? escapeHTML(
                        notice.image_url
                    )
                    : "";

            const imageHTML =
                imageURL
                    ? `
                        <div class="update-image">
                            <img
                                src="${imageURL}"
                                alt="${title}"
                                loading="lazy"
                            >
                        </div>
                    `
                    : "";

            return `
                <article
                    class="update-card reveal revealed"
                    data-notice-id="${escapeHTML(
                        notice.id
                    )}"
                >

                    ${imageHTML}

                    <div class="update-date">
                        ${date}
                    </div>

                    <div class="update-tag">
                        ${category}
                    </div>

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${content}
                    </p>

                </article>
            `;

        }).join("");

}


/* =========================================================
   LOAD NOTICES FROM SUPABASE
   ========================================================= */

async function loadHomeNotices() {

    if (!gsaSupabase) return;

    const container =
        document.querySelector("#home-notices");

    const ticker =
        document.querySelector("#homeNoticeTicker");

    if (!container && !ticker) return;

    try {

        const {
            data,
            error
        } = await gsaSupabase
            .from("notices")
            .select(`
                id,
                title,
                content,
                category,
                image_url,
                published,
                created_at,
                updated_at
            `)
            .eq("published", true)
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(10);

        if (error) {

            console.error(
                "Supabase Notices Error:",
                error
            );

            return;
        }

        const notices =
            Array.isArray(data)
                ? data
                : [];

        renderNoticeTicker(notices);
        renderNoticeCards(notices);

    } catch (error) {

        console.error(
            "Notice loading failed:",
            error
        );

    }

}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

function setupModal(
    modalSelector,
    openSelector,
    closeSelector
) {

    const modal =
        document.querySelector(modalSelector);

    if (!modal) return null;

    const openButtons =
        document.querySelectorAll(
            openSelector
        );

    const closeButton =
        document.querySelector(
            closeSelector
        );

    function open() {

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }

    function close() {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }

    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            open
        );

    });

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            close
        );

    }

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                close();
            }

        }
    );

    return {
        modal,
        open,
        close
    };
}


/* =========================================================
   MODALS
   ========================================================= */

const rulesModal =
    setupModal(
        "#rulesModal",
        "[data-open-rules]",
        "[data-close-rules]"
    );

const friendlyModal =
    setupModal(
        "#friendlyModal",
        "[data-open-friendly]",
        "[data-close-friendly]"
    );

const membershipModal =
    setupModal(
        "#membershipModal",
        "[data-open-membership]",
        "[data-close-membership]"
    );


/* =========================================================
   GET FORM DATA
   ========================================================= */

function getFormData(form) {

    const data = {};

    const fields =
        form.querySelectorAll(
            "input, select, textarea"
        );

    fields.forEach(field => {

        let key =
            field.name ||
            field.id;

        if (!key) return;

        key = key
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/-/g, "_");

        if (
            field.type === "submit" ||
            field.type === "button" ||
            field.type === "reset"
        ) {
            return;
        }

        if (field.type === "checkbox") {

            data[key] =
                field.checked;

            return;
        }

        if (field.type === "radio") {

            if (field.checked) {

                data[key] =
                    field.value.trim();
            }

            return;
        }

        data[key] =
            field.value.trim();

    });

    return data;
}


/* =========================================================
   SHOW FORM MESSAGE
   ========================================================= */

function showFormMessage(
    form,
    type,
    message
) {

    let box =
        form.querySelector(
            ".application-form-message"
        );

    if (!box) {

        box =
            document.createElement("div");

        box.className =
            "application-form-message";

        form.prepend(box);
    }

    box.className =
        `application-form-message ${type}`;

    box.textContent =
        message;

    box.style.padding =
        "12px 15px";

    box.style.marginBottom =
        "15px";

    box.style.borderRadius =
        "8px";

}


/* =========================================================
   GENERIC SUPABASE APPLICATION INSERT
   ========================================================= */

async function submitApplication(
    tableName,
    form
) {

    if (!gsaSupabase) {

        throw new Error(
            "Supabase client unavailable."
        );
    }

    const formData =
        getFormData(form);

    /*
       IMPORTANT:
       Remove common frontend-only fields.
    */

    delete formData.submit;
    delete formData.button;

    /*
       Admin panel expects pending
       if status exists.
    */

    if (
        formData.status === undefined
    ) {

        formData.status =
            "pending";
    }

    console.log(
        "Submitting to:",
        tableName
    );

    console.log(
        "Application data:",
        formData
    );

    const {
        data,
        error
    } = await gsaSupabase
        .from(tableName)
        .insert([formData])
        .select();

    if (error) {

        console.error(
            "Supabase Insert Error:",
            error
        );

        throw error;
    }

    return data;
}


/* =========================================================
   VALIDATE FORM
   ========================================================= */

function validateForm(form) {

    const requiredFields =
        form.querySelectorAll(
            "[required]"
        );

    let valid = true;
    let firstError = null;

    requiredFields.forEach(field => {

        field.classList.remove(
            "input-error"
        );

        let empty = false;

        if (field.type === "checkbox") {

            empty =
                !field.checked;

        } else {

            empty =
                !field.value ||
                !field.value.trim();
        }

        if (empty) {

            valid = false;

            field.classList.add(
                "input-error"
            );

            if (!firstError) {
                firstError = field;
            }
        }

    });

    if (!valid && firstError) {
        firstError.focus();
    }

    return valid;
}


/* =========================================================
   SETUP APPLICATION FORM
   ========================================================= */

function setupApplicationForm(
    form,
    tableName,
    successMessage
) {

    if (!form) return;

    if (
        form.dataset.supabaseReady ===
        "true"
    ) {
        return;
    }

    form.dataset.supabaseReady =
        "true";

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!validateForm(form)) {
                return;
            }

            const submitButton =
                form.querySelector(
                    'button[type="submit"], input[type="submit"]'
                );

            let originalText = "";

            if (submitButton) {

                originalText =
                    submitButton.tagName
                        .toLowerCase() ===
                    "input"
                        ? submitButton.value
                        : submitButton.innerHTML;

                submitButton.disabled =
                    true;

                if (
                    submitButton.tagName
                        .toLowerCase() ===
                    "input"
                ) {

                    submitButton.value =
                        "Submitting...";

                } else {

                    submitButton.innerHTML =
                        "Submitting...";

                }

            }

            try {

                await submitApplication(
                    tableName,
                    form
                );

                showFormMessage(
                    form,
                    "success",
                    successMessage
                );

                form.reset();

                setTimeout(() => {

                    if (
                        tableName ===
                        "membership_applications" &&
                        membershipModal
                    ) {

                        membershipModal.close();
                    }

                    if (
                        tableName ===
                        "friendly_applications" &&
                        friendlyModal
                    ) {

                        friendlyModal.close();
                    }

                }, 1800);

            } catch (error) {

                console.error(
                    "Application failed:",
                    error
                );

                let message =
                    "Could not submit your application. Please try again.";

                if (
                    error &&
                    error.code === "42501"
                ) {

                    message =
                        "Permission denied. Please check Supabase RLS policies.";

                } else if (
                    error &&
                    error.code === "23505"
                ) {

                    message =
                        "This application already exists.";

                } else if (
                    error &&
                    (
                        error.code ===
                        "PGRST204" ||
                        error.code ===
                        "PGRST205"
                    )
                ) {

                    message =
                        "Your HTML form field does not match the Supabase table column.";

                } else if (
                    error &&
                    error.message
                ) {

                    console.error(
                        "Supabase message:",
                        error.message
                    );
                }

                showFormMessage(
                    form,
                    "error",
                    message
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    if (
                        submitButton.tagName
                            .toLowerCase() ===
                        "input"
                    ) {

                        submitButton.value =
                            originalText;

                    } else {

                        submitButton.innerHTML =
                            originalText;

                    }

                }

            }

        }
    );

}


/* =========================================================
   FIND MEMBERSHIP FORMS
   ========================================================= */

function initializeMembershipForms() {

    const forms =
        document.querySelectorAll(
            "#membershipModal form"
        );

    forms.forEach(form => {

        setupApplicationForm(
            form,
            "membership_applications",
            "Membership application submitted successfully. We will contact you soon."
        );

    });

}


/* =========================================================
   FIND FRIENDLY MATCH FORMS
   ========================================================= */

function initializeFriendlyForms() {

    const forms =
        document.querySelectorAll(
            "#friendlyModal form"
        );

    forms.forEach(form => {

        setupApplicationForm(
            form,
            "friendly_applications",
            "Friendly Match application submitted successfully. We will contact you soon."
        );

    });

}


/* =========================================================
   GALLERY SLIDER
   ========================================================= */

const galleryTrack =
    document.querySelector(
        ".gallery-track"
    );

const galleryItems =
    document.querySelectorAll(
        ".gallery-item"
    );

if (
    galleryTrack &&
    galleryItems.length > 1
) {

    let galleryIndex = 0;

    function getGalleryStep() {

        const width =
            galleryItems[0]
                .getBoundingClientRect()
                .width;

        const style =
            getComputedStyle(
                galleryTrack
            );

        const gap =
            parseFloat(style.gap) || 0;

        return width + gap;
    }

    function moveGallery() {

        galleryTrack.style.transform =
            `translateX(-${
                galleryIndex *
                getGalleryStep()
            }px)`;
    }

    setInterval(() => {

        galleryIndex++;

        if (
            galleryIndex >=
            galleryItems.length
        ) {

            galleryIndex = 0;
        }

        moveGallery();

    }, 4500);

    window.addEventListener(
        "resize",
        moveGallery
    );
}


/* =========================================================
   GALLERY LIGHTBOX
   ========================================================= */

const galleryImages =
    document.querySelectorAll(
        ".gallery-item img"
    );

const lightbox =
    document.querySelector(
        ".gallery-lightbox"
    );

const lightboxImage =
    document.querySelector(
        ".gallery-lightbox img"
    );

const lightboxClose =
    document.querySelector(
        ".gallery-lightbox-close"
    );

if (
    galleryImages.length &&
    lightbox &&
    lightboxImage
) {

    galleryImages.forEach(image => {

        image.addEventListener(
            "click",
            () => {

                lightboxImage.src =
                    image.src;

                lightboxImage.alt =
                    image.alt ||
                    "GSA Gallery";

                lightbox.classList.add(
                    "active"
                );

                lightbox.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.classList.add(
                    "modal-open"
                );

            }
        );

    });

    function closeLightbox() {

        lightbox.classList.remove(
            "active"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }

    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );
    }

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                lightbox
            ) {
                closeLightbox();
            }

        }
    );

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        if (rulesModal) {
            rulesModal.close();
        }

        if (friendlyModal) {
            friendlyModal.close();
        }

        if (membershipModal) {
            membershipModal.close();
        }

        if (
            lightbox &&
            lightbox.classList.contains(
                "active"
            )
        ) {

            lightbox.classList.remove(
                "active"
            );

            lightbox.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        document.body.classList.remove(
            "modal-open"
        );

    }
);


/* =========================================================
   DOWNLOAD BUTTON FEEDBACK
   ========================================================= */

document
    .querySelectorAll("a[download]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                button.style.transform =
                    "scale(.97)";

                setTimeout(() => {

                    button.style.transform =
                        "";

                }, 180);

            }
        );

    });


/* =========================================================
   CURRENT YEAR
   ========================================================= */

document
    .querySelectorAll(
        "[data-current-year]"
    )
    .forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


/* =========================================================
   SMOOTH SCROLL
   ========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const id =
                    link.getAttribute(
                        "href"
                    );

                if (
                    !id ||
                    id === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        id
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHomeNotices();

        initializeMembershipForms();

        initializeFriendlyForms();

    }
);


/* =========================================================
   PAGE LOADED
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    }
);

</script>
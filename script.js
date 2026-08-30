/* =========================================================
   GHOPKHALI SPORTS ARENA
   PREMIUM WEBSITE JAVASCRIPT
   SUPABASE VERSION
========================================================= */


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
   HEADER SCROLL EFFECT
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

    const navObserver = new IntersectionObserver(
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
            rootMargin: "-35% 0px -55% 0px"
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

                    entry.target.classList.add("revealed");

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
   CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
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
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

let homeSupabase = null;

if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {

    homeSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

} else {

    console.error(
        "Supabase library was not loaded."
    );

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
   DATE FORMAT
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

let noticeAnimationStarted = false;
let noticeAnimationFrame = null;


function startNoticeTicker() {

    if (
        !noticeTrack ||
        noticeAnimationStarted
    ) {
        return;
    }

    noticeAnimationStarted = true;

    let position = 0;

    const tickerMove = () => {

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
            requestAnimationFrame(
                tickerMove
            );

    };

    noticeAnimationFrame =
        requestAnimationFrame(tickerMove);

}


function stopNoticeTicker() {

    if (noticeAnimationFrame) {

        cancelAnimationFrame(
            noticeAnimationFrame
        );

        noticeAnimationFrame = null;

    }

    noticeAnimationStarted = false;

}


function renderNoticeTicker(notices) {

    if (!noticeTrack) return;

    stopNoticeTicker();

    if (
        !notices ||
        notices.length === 0
    ) {

        noticeTrack.innerHTML = `
            <span class="notice-ticker-item">
                No latest notices available.
            </span>
        `;

        return;
    }


    const noticesHTML =
        notices.map(notice => {

            return `
                <span class="notice-ticker-item">
                    <strong>NOTICE</strong>
                    ${escapeHTML(notice.title)}
                </span>
            `;

        }).join("");


    /*
       Duplicate content so the ticker
       can continuously scroll.
    */

    noticeTrack.innerHTML =
        noticesHTML + noticesHTML;

    startNoticeTicker();

}


/* =========================================================
   NOTICE CARDS
========================================================= */

function renderNoticeCards(notices) {

    const noticesContainer =
        document.querySelector("#home-notices");

    if (!noticesContainer) return;


    if (
        !notices ||
        notices.length === 0
    ) {

        noticesContainer.innerHTML = `

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


    noticesContainer.innerHTML =
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


    const cards =
        noticesContainer.querySelectorAll(
            ".update-card"
        );


    cards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 80}ms`;

    });

}


/* =========================================================
   LOAD NOTICES FROM SUPABASE
========================================================= */

async function loadHomeNotices() {

    const noticesContainer =
        document.querySelector("#home-notices");


    if (
        !noticeTrack &&
        !noticesContainer
    ) {
        return;
    }


    if (!homeSupabase) {

        console.error(
            "Supabase client is unavailable."
        );

        return;

    }


    try {

        const {
            data,
            error
        } = await homeSupabase

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

            .eq(
                "published",
                true
            )

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

            renderNoticeTicker([]);

            renderNoticeCards([]);

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

        renderNoticeTicker([]);

        renderNoticeCards([]);

    }

}


/* =========================================================
   GALLERY SLIDER
========================================================= */

const galleryTrack =
    document.querySelector(".gallery-track");

const galleryItems =
    document.querySelectorAll(
        ".gallery-item"
    );


if (
    galleryTrack &&
    galleryItems.length > 1
) {

    let galleryIndex = 0;


    const getGalleryStep = () => {

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

    };


    const moveGallery = () => {

        galleryTrack.style.transform =
            `translateX(-${
                galleryIndex *
                getGalleryStep()
            }px)`;

    };


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


    const closeLightbox = () => {

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

    };


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
                event.target === lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


/* =========================================================
   MODAL HELPER
========================================================= */

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

    /*
       Only remove modal-open if no other
       modal is currently open.
    */

    const activeModal =
        document.querySelector(
            ".modal.active"
        );

    if (!activeModal) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   RULES MODAL
========================================================= */

const rulesModal =
    document.querySelector(
        "#rulesModal"
    );

const rulesButtons =
    document.querySelectorAll(
        "[data-open-rules]"
    );

const rulesClose =
    document.querySelector(
        "[data-close-rules]"
    );


rulesButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => openModal(rulesModal)
    );

});


if (rulesClose) {

    rulesClose.addEventListener(
        "click",
        () => closeModal(rulesModal)
    );

}


if (rulesModal) {

    rulesModal.addEventListener(
        "click",
        event => {

            if (
                event.target === rulesModal
            ) {

                closeModal(rulesModal);

            }

        }
    );

}


/* =========================================================
   FRIENDLY MATCH MODAL
========================================================= */

const friendlyModal =
    document.querySelector(
        "#friendlyModal"
    );

const friendlyButtons =
    document.querySelectorAll(
        "[data-open-friendly]"
    );

const friendlyClose =
    document.querySelector(
        "[data-close-friendly]"
    );


friendlyButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => openModal(friendlyModal)
    );

});


if (friendlyClose) {

    friendlyClose.addEventListener(
        "click",
        () => closeModal(friendlyModal)
    );

}


if (friendlyModal) {

    friendlyModal.addEventListener(
        "click",
        event => {

            if (
                event.target === friendlyModal
            ) {

                closeModal(friendlyModal);

            }

        }
    );

}


/* =========================================================
   MEMBERSHIP MODAL
========================================================= */

const membershipModal =
    document.querySelector(
        "#membershipModal"
    );

const membershipButtons =
    document.querySelectorAll(
        "[data-open-membership]"
    );

const membershipClose =
    document.querySelector(
        "[data-close-membership]"
    );


membershipButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => openModal(membershipModal)
    );

});


if (membershipClose) {

    membershipClose.addEventListener(
        "click",
        () => closeModal(membershipModal)
    );

}


if (membershipModal) {

    membershipModal.addEventListener(
        "click",
        event => {

            if (
                event.target === membershipModal
            ) {

                closeModal(membershipModal);

            }

        }
    );

}


/* =========================================================
   FORM DATA HELPER
========================================================= */

function getFieldValue(form, selector) {

    const field =
        form.querySelector(selector);

    if (!field) return "";

    return field.value.trim();

}


/* =========================================================
   MEMBERSHIP DATA
   IMPORTANT:
   These column names must match the
   Supabase membership_applications table.
========================================================= */

function collectMembershipData(form) {

    const selectedSports = [];

    form.querySelectorAll(
        'input[name="Sports[]"]:checked'
    ).forEach(checkbox => {

        selectedSports.push(
            checkbox.value
        );

    });


    return {

        full_name_bn:
            getFieldValue(
                form,
                '[name="পূর্ণ নাম বাংলায়"]'
            ),

        full_name_en:
            getFieldValue(
                form,
                '[name="Full Name English"]'
            ),

        father_name:
            getFieldValue(
                form,
                '[name="Father Name"]'
            ),

        mother_name:
            getFieldValue(
                form,
                '[name="Mother Name"]'
            ),

        date_of_birth:
            getFieldValue(
                form,
                '[name="Date of Birth"]'
            ) || null,

        blood_group:
            getFieldValue(
                form,
                '[name="Blood Group"]'
            ),

        profession:
            getFieldValue(
                form,
                '[name="Profession"]'
            ),

        nid_or_birth_registration:
            getFieldValue(
                form,
                '[name="NID or Birth Registration"]'
            ),

        current_address:
            getFieldValue(
                form,
                '[name="Current Address"]'
            ),

        permanent_address:
            getFieldValue(
                form,
                '[name="Permanent Address"]'
            ),

        mobile_number:
            getFieldValue(
                form,
                '[name="Mobile Number"]'
            ),

        alternative_mobile:
            getFieldValue(
                form,
                '[name="Alternative Mobile Number"]'
            ),

        sports:
            selectedSports,

        other_sports:
            getFieldValue(
                form,
                '[name="Other Sports"]'
            ),

        main_sports_skill:
            getFieldValue(
                form,
                '[name="Main Sports Skill"]'
            ),

        previous_club_experience:
            getFieldValue(
                form,
                '[name="Previous Club Experience"]'
            ),

        emergency_contact_name:
            getFieldValue(
                form,
                '[name="Emergency Contact Name"]'
            ),

        emergency_contact_relationship:
            getFieldValue(
                form,
                '[name="Emergency Contact Relationship"]'
            ),

        emergency_contact_mobile:
            getFieldValue(
                form,
                '[name="Emergency Contact Mobile"]'
            ),

        agreement:
            Boolean(
                form.querySelector(
                    '[name="Agreement"]'
                )?.checked
            ),

        status:
            "pending"

    };

}


/* =========================================================
   MEMBERSHIP FORM MESSAGE
========================================================= */

function showMembershipMessage(
    form,
    type,
    message
) {

    let messageElement =
        form.querySelector(
            ".membership-form-message"
        );


    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );

        messageElement.className =
            "membership-form-message";

        form.prepend(
            messageElement
        );

    }


    messageElement.className =
        `membership-form-message ${type}`;

    messageElement.textContent =
        message;


    messageElement.style.padding =
        "12px 15px";

    messageElement.style.marginBottom =
        "15px";

    messageElement.style.borderRadius =
        "8px";

}


/* =========================================================
   SUBMIT MEMBERSHIP TO SUPABASE
========================================================= */

async function submitMembershipApplication(form) {

    if (!homeSupabase) {

        throw new Error(
            "Supabase client is unavailable."
        );

    }


    const membershipData =
        collectMembershipData(form);


    console.log(
        "GSA Membership Data:",
        membershipData
    );


    const {
        data,
        error
    } = await homeSupabase

        .from(
            "membership_applications"
        )

        .insert(
            membershipData
        )

        .select();


    if (error) {

        console.error(
            "Membership Supabase Error:",
            error
        );

        throw error;

    }


    return data;

}


/* =========================================================
   MEMBERSHIP FORM VALIDATION
========================================================= */

function validateMembershipForm(form) {

    let valid = true;
    let firstError = null;


    form.querySelectorAll(
        "[required]"
    ).forEach(field => {

        field.classList.remove(
            "input-error"
        );


        if (field.type === "checkbox") {

            if (!field.checked) {

                valid = false;

                field.classList.add(
                    "input-error"
                );

                if (!firstError) {
                    firstError = field;
                }

            }

            return;

        }


        if (
            !field.value ||
            !field.value.trim()
        ) {

            valid = false;

            field.classList.add(
                "input-error"
            );

            if (!firstError) {
                firstError = field;
            }

        }

    });


    if (
        !valid &&
        firstError
    ) {

        firstError.focus();

    }


    return valid;

}


/* =========================================================
   MEMBERSHIP FORM SETUP
========================================================= */

function setupMembershipForm() {

    if (!membershipModal) return;


    const form =
        membershipModal.querySelector(
            "form"
        );


    if (!form) {

        console.warn(
            "GSA Membership form not found."
        );

        return;

    }


    if (
        form.dataset.membershipReady ===
        "true"
    ) {

        return;

    }


    form.dataset.membershipReady =
        "true";


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* -------------------------
               VALIDATION
            ------------------------- */

            if (
                !validateMembershipForm(
                    form
                )
            ) {

                return;

            }


            /* -------------------------
               SUBMIT BUTTON
            ------------------------- */

            const submitButton =
                form.querySelector(
                    'button[type="submit"], input[type="submit"]'
                );


            const originalText =
                submitButton
                    ? (
                        submitButton.tagName
                            .toLowerCase() ===
                        "input"
                            ? submitButton.value
                            : submitButton.innerHTML
                    )
                    : "";


            if (submitButton) {

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

                await submitMembershipApplication(
                    form
                );


                /* -------------------------
                   SUCCESS
                ------------------------- */

                showMembershipMessage(
                    form,
                    "success",
                    "সদস্যপদ আবেদন সফলভাবে জমা হয়েছে।"
                );


                form.reset();


                setTimeout(
                    () => {

                        closeModal(
                            membershipModal
                        );

                    },
                    1800
                );


            } catch (error) {

                console.error(
                    "Membership submission failed:",
                    error
                );


                let message =
                    "আবেদন জমা দেওয়া যায়নি। আবার চেষ্টা করুন।";


                if (
                    error &&
                    error.code ===
                    "42501"
                ) {

                    message =
                        "Permission denied. Supabase RLS policy check করুন.";

                }


                else if (
                    error &&
                    error.code ===
                    "23505"
                ) {

                    message =
                        "এই আবেদনটি আগে থেকেই জমা দেওয়া হয়েছে.";

                }


                else if (
                    error &&
                    error.code ===
                    "PGRST204"
                ) {

                    message =
                        "Supabase table-এর column name এবং form field-এর মধ্যে মিল নেই.";

                }


                else if (
                    error &&
                    error.code ===
                    "42703"
                ) {

                    message =
                        "Supabase table-এর কোনো column পাওয়া যাচ্ছে না.";

                }


                showMembershipMessage(
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
   GENERAL APPLICATION FORM
   FRIENDLY MATCH FORM
========================================================= */

document.addEventListener(
    "submit",
    event => {

        const form =
            event.target;


        /*
           Membership form is already
           handled separately.
        */

        if (
            membershipModal &&
            membershipModal.contains(form)
        ) {

            return;

        }


        if (
            !form.classList.contains(
                "application-form"
            )
        ) {

            return;

        }


        /*
           Friendly Match form currently
           uses FormSubmit, so allow it
           to submit normally after validation.
        */

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


            if (
                !field.value ||
                !field.value.trim()
            ) {

                valid = false;

                field.classList.add(
                    "input-error"
                );


                if (!firstError) {

                    firstError = field;

                }

            }

        });


        if (!valid) {

            event.preventDefault();


            if (firstError) {

                firstError.focus();

            }

        }

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closeModal(rulesModal);

        closeModal(friendlyModal);

        closeModal(membershipModal);


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

const downloadButtons =
    document.querySelectorAll(
        "a[download]"
    );


downloadButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            button.style.transform =
                "scale(.97)";


            setTimeout(
                () => {

                    button.style.transform =
                        "";

                },
                180
            );

        }
    );

});


/* =========================================================
   CURRENT YEAR
========================================================= */

const yearElements =
    document.querySelectorAll(
        "[data-current-year]"
    );


yearElements.forEach(element => {

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


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHomeNotices();

        setupMembershipForm();

    }
);


/* =========================================================
   FINISHED
========================================================= */

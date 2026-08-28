/* ==================================================
   GHOPKHALI SPORTS ARENA
   PREMIUM WEBSITE JAVASCRIPT
   GSA Sports Club
================================================== */


/* ==================================================
   MOBILE NAVIGATION
================================================== */

const menuToggle =
  document.querySelector(".menu-toggle");

const navMenu =
  document.querySelector(".nav-menu");


if (menuToggle && navMenu) {

  menuToggle.addEventListener("click", () => {

    const opened =
      navMenu.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      opened ? "true" : "false"
    );

  });


  navMenu
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener("click", () => {

        navMenu.classList.remove("open");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

}


/* ==================================================
   HEADER SCROLL EFFECT
================================================== */

const header =
  document.querySelector(".site-header");


window.addEventListener(
  "scroll",
  () => {

    if (!header) return;

    if (window.scrollY > 20) {

      header.style.boxShadow =
        "0 8px 35px rgba(0,0,0,.07)";

    } else {

      header.style.boxShadow =
        "none";

    }

  },
  { passive: true }
);


/* ==================================================
   ACTIVE NAVIGATION
================================================== */

const sections =
  document.querySelectorAll(
    "section[id]"
  );

const navLinks =
  document.querySelectorAll(
    ".nav-menu a"
  );


if (sections.length && navLinks.length) {

  const navObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting)
            return;

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


/* ==================================================
   SCROLL REVEAL ANIMATION
================================================== */

const revealElements =
  document.querySelectorAll(
    `
    .activity-card,
    .fixture-card,
    .coming-soon,
    .committee-person,
    .social-card,
    .update-card,
    .notice-card,
    .gallery-item,
    .tournament-card,
    .rule-card,
    .form-card,
    .application-card
    `
  );


if (revealElements.length) {

  const revealObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting)
            return;


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


/* ==================================================
   CLOSE MOBILE MENU
   WHEN CLICKING OUTSIDE
================================================== */

document.addEventListener(
  "click",
  event => {

    if (!navMenu || !menuToggle)
      return;


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

  }
);


/* ==================================================
   SMOOTH SCROLL
================================================== */

document
  .querySelectorAll('a[href^="#"]')
  .forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) return;


        const target =
          document.querySelector(targetId);


        if (!target) return;


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });


/* ==================================================
   NOTICE / UPDATE TICKER
================================================== */

const noticeTicker =
  document.querySelector(".notice-ticker-track");


if (noticeTicker) {

  let position = 0;

  const moveTicker = () => {

    position -= 0.45;

    if (
      Math.abs(position) >=
      noticeTicker.scrollWidth / 2
    ) {

      position = 0;

    }

    noticeTicker.style.transform =
      `translateX(${position}px)`;

    requestAnimationFrame(moveTicker);

  };


  requestAnimationFrame(moveTicker);

}


/* ==================================================
   IMAGE GALLERY AUTO SLIDER
================================================== */

const galleryTrack =
  document.querySelector(".gallery-track");

const galleryItems =
  document.querySelectorAll(".gallery-item");


if (
  galleryTrack &&
  galleryItems.length > 1
) {

  let galleryIndex = 0;


  const updateGallery = () => {

    const itemWidth =
      galleryItems[0].getBoundingClientRect().width;


    const gap =
      parseFloat(
        getComputedStyle(galleryTrack).gap
      ) || 0;


    galleryTrack.style.transform =
      `translateX(-${galleryIndex * (itemWidth + gap)}px)`;

  };


  setInterval(() => {

    galleryIndex++;

    if (
      galleryIndex >=
      galleryItems.length
    ) {

      galleryIndex = 0;

    }

    updateGallery();

  }, 4500);


  window.addEventListener(
    "resize",
    updateGallery
  );

}


/* ==================================================
   GALLERY IMAGE LIGHTBOX
================================================== */

const galleryImages =
  document.querySelectorAll(
    ".gallery-item img"
  );


const lightbox =
  document.querySelector(".gallery-lightbox");


const lightboxImage =
  document.querySelector(
    ".gallery-lightbox img"
  );


const lightboxClose =
  document.querySelector(
    ".gallery-lightbox-close"
  );


if (
  lightbox &&
  lightboxImage &&
  galleryImages.length
) {

  galleryImages.forEach(image => {

    image.addEventListener(
      "click",
      () => {

        lightboxImage.src =
          image.src;

        lightboxImage.alt =
          image.alt || "GSA Gallery";

        lightbox.classList.add(
          "active"
        );

        document.body.style.overflow =
          "hidden";

      }
    );

  });


  const closeLightbox = () => {

    lightbox.classList.remove(
      "active"
    );

    document.body.style.overflow =
      "";

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


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        lightbox.classList.contains("active")
      ) {

        closeLightbox();

      }

    }
  );

}


/* ==================================================
   RULES MODAL
================================================== */

const rulesButton =
  document.querySelector(
    "[data-open-rules]"
  );


const rulesModal =
  document.querySelector(
    "#rulesModal"
  );


const rulesClose =
  document.querySelector(
    "[data-close-rules]"
  );


if (rulesButton && rulesModal) {

  rulesButton.addEventListener(
    "click",
    () => {

      rulesModal.classList.add(
        "active"
      );

      document.body.style.overflow =
        "hidden";

    }
  );


  const closeRules = () => {

    rulesModal.classList.remove(
      "active"
    );

    document.body.style.overflow =
      "";

  };


  if (rulesClose) {

    rulesClose.addEventListener(
      "click",
      closeRules
    );

  }


  rulesModal.addEventListener(
    "click",
    event => {

      if (
        event.target === rulesModal
      ) {

        closeRules();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        rulesModal.classList.contains("active")
      ) {

        closeRules();

      }

    }
  );

}


/* ==================================================
   APPLICATION FORM MODAL
================================================== */

const applicationButtons =
  document.querySelectorAll(
    "[data-open-application]"
  );


const applicationModal =
  document.querySelector(
    "#applicationModal"
  );


const applicationClose =
  document.querySelector(
    "[data-close-application]"
  );


if (
  applicationButtons.length &&
  applicationModal
) {

  applicationButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const applicationType =
          button.getAttribute(
            "data-open-application"
          );


        const typeInput =
          applicationModal.querySelector(
            "[name='application_type']"
          );


        if (typeInput) {

          typeInput.value =
            applicationType || "";

        }


        applicationModal.classList.add(
          "active"
        );

        document.body.style.overflow =
          "hidden";

      }
    );

  });


  const closeApplication = () => {

    applicationModal.classList.remove(
      "active"
    );

    document.body.style.overflow =
      "";

  };


  if (applicationClose) {

    applicationClose.addEventListener(
      "click",
      closeApplication
    );

  }


  applicationModal.addEventListener(
    "click",
    event => {

      if (
        event.target === applicationModal
      ) {

        closeApplication();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        applicationModal.classList.contains("active")
      ) {

        closeApplication();

      }

    }
  );

}


/* ==================================================
   FORM VALIDATION
================================================== */

const applicationForms =
  document.querySelectorAll(
    ".application-form"
  );


applicationForms.forEach(form => {

  form.addEventListener(
    "submit",
    event => {

      const requiredFields =
        form.querySelectorAll(
          "[required]"
        );


      let valid = true;


      requiredFields.forEach(field => {

        field.classList.remove(
          "input-error"
        );


        if (!field.value.trim()) {

          valid = false;

          field.classList.add(
            "input-error"
          );

        }

      });


      if (!valid) {

        event.preventDefault();


        const firstError =
          form.querySelector(
            ".input-error"
          );


        if (firstError) {

          firstError.focus();

        }

        return;

      }

    }
  );

});


/* ==================================================
   DOWNLOAD BUTTON FEEDBACK
================================================== */

const downloadButtons =
  document.querySelectorAll(
    "a[download]"
  );


downloadButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      button.classList.add(
        "download-started"
      );


      setTimeout(() => {

        button.classList.remove(
          "download-started"
        );

      }, 1200);

    }
  );

});


/* ==================================================
   CURRENT YEAR
================================================== */

const yearElements =
  document.querySelectorAll(
    "[data-current-year]"
  );


yearElements.forEach(element => {

  element.textContent =
    new Date().getFullYear();

});


/* ==================================================
   CURRENT DATE
================================================== */

const dateElements =
  document.querySelectorAll(
    "[data-current-date]"
  );


dateElements.forEach(element => {

  const today =
    new Date();


  element.textContent =
    today.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

});


/* ==================================================
   BACK TO TOP
================================================== */

const backToTop =
  document.querySelector(
    ".back-to-top"
  );


if (backToTop) {

  window.addEventListener(
    "scroll",
    () => {

      if (
        window.scrollY > 500
      ) {

        backToTop.classList.add(
          "show"
        );

      } else {

        backToTop.classList.remove(
          "show"
        );

      }

    },
    { passive: true }
  );


  backToTop.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* ==================================================
   PAGE LOADED
================================================== */

window.addEventListener(
  "load",
  () => {

    document.body.classList.add(
      "page-loaded"
    );

  }
);

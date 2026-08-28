/* ==================================================
   GHOPKHALI SPORTS ARENA
   Premium Website JavaScript
================================================== */


/* ==================================================
   MOBILE NAVIGATION
================================================== */

const menuToggle =
  document.querySelector(".menu-toggle");

const navMenu =
  document.querySelector(".nav-menu");


if (menuToggle && navMenu) {

  menuToggle.addEventListener(
    "click",
    () => {

      const opened =
        navMenu.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        opened
      );

    }
  );


  navMenu
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          navMenu.classList.remove("open");

          menuToggle.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });

}


/* ==================================================
   HEADER SCROLL
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
   ACTIVE NAV
================================================== */

const sections =
  document.querySelectorAll(
    "section[id]"
  );

const navLinks =
  document.querySelectorAll(
    ".nav-menu a"
  );


const navObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting)
          return;

        const id =
          entry.target.getAttribute(
            "id"
          );


        navLinks.forEach(link => {

          link.classList.remove(
            "active"
          );


          if (
            link.getAttribute("href") ===
            `#${id}`
          ) {

            link.classList.add(
              "active"
            );

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


/* ==================================================
   SCROLL REVEAL
================================================== */

const revealElements =
  document.querySelectorAll(
    ".activity-card, .fixture-card, .coming-soon, .committee-person, .social-card"
  );


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
      threshold: .12
    }

  );


revealElements.forEach(element => {

  element.classList.add(
    "reveal"
  );

  revealObserver.observe(
    element
  );

});


/* ==================================================
   CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
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

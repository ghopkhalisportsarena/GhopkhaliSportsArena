/* =========================================
   GHOPKHALI SPORTS ARENA
   Main JavaScript
========================================= */


/* =========================================
   MOBILE NAVIGATION
========================================= */

const menuToggle =
  document.querySelector(".menu-toggle");

const navMenu =
  document.querySelector(".nav-menu");


if (menuToggle && navMenu) {

  menuToggle.addEventListener("click", () => {

    const isOpen =
      navMenu.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      isOpen
    );

  });


  /* Close menu after clicking a link */

  const navLinks =
    navMenu.querySelectorAll("a");

  navLinks.forEach(link => {

    link.addEventListener("click", () => {

      navMenu.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

}


/* =========================================
   HEADER SCROLL EFFECT
========================================= */

const header =
  document.querySelector(".site-header");


window.addEventListener(
  "scroll",
  () => {

    if (!header) return;

    if (window.scrollY > 20) {

      header.style.boxShadow =
        "0 8px 30px rgba(0,0,0,.06)";

    } else {

      header.style.boxShadow =
        "none";

    }

  },
  { passive: true }
);


/* =========================================
   ACTIVE NAVIGATION
========================================= */

const sections =
  document.querySelectorAll("section[id]");

const links =
  document.querySelectorAll(".nav-menu a");


const observer =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const id =
          entry.target.getAttribute("id");

        links.forEach(link => {

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

  observer.observe(section);

});


/* =========================================
   SIMPLE REVEAL ANIMATION
========================================= */

const revealElements =
  document.querySelectorAll(
    ".activity-card, .fixture-card, .coming-soon, .committee-person"
  );


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
      threshold: .12
    }

  );


revealElements.forEach(element => {

  element.classList.add("reveal");

  revealObserver.observe(element);

});


/* =========================================
   PREVENT EMPTY HASH JUMP
========================================= */

document
  .querySelectorAll('a[href="#"]')
  .forEach(link => {

    link.addEventListener(
      "click",
      event => event.preventDefault()
    );

  });

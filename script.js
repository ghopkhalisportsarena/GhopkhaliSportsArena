/* ==================================================
   GHOPKHALI SPORTS ARENA
   PREMIUM WEBSITE JAVASCRIPT
================================================== */


/* ==================================================
   MOBILE NAVIGATION
================================================== */

const menuToggle =
document.querySelector(".menu-toggle");

const navMenu =
document.querySelector(".nav-menu");


if(menuToggle && navMenu){

menuToggle.addEventListener("click",()=>{

const opened =
navMenu.classList.toggle("open");

menuToggle.setAttribute(
"aria-expanded",
opened ? "true" : "false"
);

});


navMenu
.querySelectorAll("a")
.forEach(link=>{

link.addEventListener("click",()=>{

navMenu.classList.remove("open");

menuToggle.setAttribute(
"aria-expanded",
"false"
);

});

});

}


/* ==================================================
   HEADER SCROLL
================================================== */

const header =
document.querySelector(".site-header");


window.addEventListener(
"scroll",
()=>{

if(!header)return;

header.style.boxShadow =
window.scrollY > 20
?
"0 8px 35px rgba(0,0,0,.07)"
:
"none";

},
{passive:true}
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


if(sections.length && navLinks.length){

const navObserver =
new IntersectionObserver(

entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting)return;

const id =
entry.target.getAttribute("id");

navLinks.forEach(link=>{

link.classList.remove("active");

if(
link.getAttribute("href") ===
`#${id}`
){

link.classList.add("active");

}

});

});

},

{
rootMargin:"-35% 0px -55% 0px"
}

);


sections.forEach(section=>{
navObserver.observe(section);
});

}


/* ==================================================
   SCROLL REVEAL
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
.tournament-card,
.form-card,
.gallery-item
`
);


if(revealElements.length){

const revealObserver =
new IntersectionObserver(

entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting)return;

entry.target.classList.add(
"revealed"
);

revealObserver.unobserve(
entry.target
);

});

},

{
threshold:.12
}

);


revealElements.forEach(element=>{

element.classList.add("reveal");

revealObserver.observe(element);

});

}


/* ==================================================
   CLOSE MOBILE MENU
================================================== */

document.addEventListener(
"click",
event=>{

if(!navMenu || !menuToggle)return;

if(
navMenu.classList.contains("open") &&
!navMenu.contains(event.target) &&
!menuToggle.contains(event.target)
){

navMenu.classList.remove("open");

menuToggle.setAttribute(
"aria-expanded",
"false"
);

}

}
);


/* ==================================================
   NOTICE TICKER
================================================== */

const noticeTrack =
document.querySelector(
".notice-ticker-track"
);


if(noticeTrack){

let position=0;

const tickerMove=()=>{

position-=.35;

const resetPoint =
noticeTrack.scrollWidth/2;

if(
Math.abs(position)>=resetPoint
){

position=0;

}

noticeTrack.style.transform =
`translateX(${position}px)`;

requestAnimationFrame(tickerMove);

};

requestAnimationFrame(tickerMove);

}


/* ==================================================
   GALLERY SLIDER
================================================== */

const galleryTrack =
document.querySelector(
".gallery-track"
);

const galleryItems =
document.querySelectorAll(
".gallery-item"
);


if(
galleryTrack &&
galleryItems.length>1
){

let galleryIndex=0;


const getStep=()=>{

const width =
galleryItems[0]
.getBoundingClientRect()
.width;

const style =
getComputedStyle(galleryTrack);

const gap =
parseFloat(style.gap)||0;

return width+gap;

};


const moveGallery=()=>{

galleryTrack.style.transform =
`translateX(-${
galleryIndex*getStep()
}px`;

};


setInterval(()=>{

galleryIndex++;

if(
galleryIndex>=galleryItems.length
){

galleryIndex=0;

}

moveGallery();

},4500);


window.addEventListener(
"resize",
moveGallery
);

}


/* ==================================================
   GALLERY LIGHTBOX
================================================== */

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


if(
galleryImages.length &&
lightbox &&
lightboxImage
){

galleryImages.forEach(image=>{

image.addEventListener(
"click",
()=>{

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


const closeLightbox=()=>{

lightbox.classList.remove(
"active"
);

document.body.style.overflow="";

};


if(lightboxClose){

lightboxClose.addEventListener(
"click",
closeLightbox
);

}


lightbox.addEventListener(
"click",
event=>{

if(
event.target===lightbox
){

closeLightbox();

}

}
);


document.addEventListener(
"keydown",
event=>{

if(
event.key==="Escape" &&
lightbox.classList.contains("active")
){

closeLightbox();

}

}
);

}


/* ==================================================
   RULES MODAL
================================================== */

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


const openRules=()=>{

if(!rulesModal)return;

rulesModal.classList.add(
"active"
);

rulesModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

};


const closeRules=()=>{

if(!rulesModal)return;

rulesModal.classList.remove(
"active"
);

rulesModal.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"modal-open"
);

};


rulesButtons.forEach(button=>{

button.addEventListener(
"click",
openRules
);

});


if(rulesClose){

rulesClose.addEventListener(
"click",
closeRules
);

}


if(rulesModal){

rulesModal.addEventListener(
"click",
event=>{

if(
event.target===rulesModal
){

closeRules();

}

}
);

}


/* ==================================================
   APPLICATION MODAL
================================================== */

const applicationModal =
document.querySelector(
"#applicationModal"
);

const applicationButtons =
document.querySelectorAll(
"[data-open-application]"
);

const applicationClose =
document.querySelector(
"[data-close-application]"
);

const applicationType =
document.querySelector(
"[name='application_type']"
);


const openApplication=type=>{

if(!applicationModal)return;

if(applicationType){

applicationType.value =
type || "";

}

applicationModal.classList.add(
"active"
);

applicationModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

};


const closeApplication=()=>{

if(!applicationModal)return;

applicationModal.classList.remove(
"active"
);

applicationModal.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"modal-open"
);

};


applicationButtons.forEach(button=>{

button.addEventListener(
"click",
()=>{

const type =
button.getAttribute(
"data-open-application"
);

openApplication(type);

}
);

});


if(applicationClose){

applicationClose.addEventListener(
"click",
closeApplication
);

}


if(applicationModal){

applicationModal.addEventListener(
"click",
event=>{

if(
event.target===applicationModal
){

closeApplication();

}

}
);

}


/* ==================================================
   ESCAPE KEY
================================================== */

document.addEventListener(
"keydown",
event=>{

if(event.key!=="Escape")
return;

closeRules();

closeApplication();

}
);


/* ==================================================
   APPLICATION FORM VALIDATION
================================================== */

const forms =
document.querySelectorAll(
".application-form"
);


forms.forEach(form=>{

form.addEventListener(
"submit",
event=>{

const requiredFields =
form.querySelectorAll(
"[required]"
);

let valid=true;


requiredFields.forEach(field=>{

field.classList.remove(
"input-error"
);

if(!field.value.trim()){

valid=false;

field.classList.add(
"input-error"
);

}

});


if(!valid){

event.preventDefault();

const firstError =
form.querySelector(
".input-error"
);

if(firstError){

firstError.focus();

}

}

}
);

});


/* ==================================================
   DOWNLOAD FEEDBACK
================================================== */

const downloadButtons =
document.querySelectorAll(
"a[download]"
);


downloadButtons.forEach(button=>{

button.addEventListener(
"click",
()=>{

button.style.transform=
"scale(.97)";

setTimeout(()=>{

button.style.transform="";

},180);

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


yearElements.forEach(element=>{

element.textContent =
new Date().getFullYear();

});


/* ==================================================
   SMOOTH SCROLL
================================================== */

document
.querySelectorAll(
'a[href^="#"]'
)
.forEach(link=>{

link.addEventListener(
"click",
event=>{

const id =
link.getAttribute("href");

if(!id || id==="#")
return;

const target =
document.querySelector(id);

if(!target)
return;

event.preventDefault();

target.scrollIntoView({
behavior:"smooth",
block:"start"
});

}
);

});


/* ==================================================
   PAGE LOADED
================================================== */

window.addEventListener(
"load",
()=>{

document.body.classList.add(
"page-loaded"
);

});

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


/*
   Supabase notices will replace
   the default ticker content later.
*/

let noticeAnimationStarted = false;


function startNoticeTicker(){

if(!noticeTrack || noticeAnimationStarted)
return;

noticeAnimationStarted = true;

let position = 0;

const tickerMove = ()=>{

position -= .35;

const resetPoint =
noticeTrack.scrollWidth / 2;

if(
resetPoint > 0 &&
Math.abs(position) >= resetPoint
){

position = 0;

}

noticeTrack.style.transform =
`translateX(${position}px)`;

requestAnimationFrame(
tickerMove
);

};

requestAnimationFrame(
tickerMove
);

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
galleryItems.length > 1
){

let galleryIndex = 0;


const getGalleryStep = ()=>{

const width =
galleryItems[0]
.getBoundingClientRect()
.width;

const style =
getComputedStyle(galleryTrack);

const gap =
parseFloat(style.gap) || 0;

return width + gap;

};


const moveGallery = ()=>{

galleryTrack.style.transform =
`translateX(-${galleryIndex * getGalleryStep()}px)`;

};


setInterval(()=>{

galleryIndex++;

if(
galleryIndex >= galleryItems.length
){

galleryIndex = 0;

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


const closeLightbox = ()=>{

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
event.target === lightbox
){

closeLightbox();

}

}
);


/* ESC */

document.addEventListener(
"keydown",
event=>{

if(
event.key === "Escape" &&
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


const openRules = ()=>{

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


const closeRules = ()=>{

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
event.target === rulesModal
){

closeRules();

}

}
);

}


/* ==================================================
   FRIENDLY MATCH MODAL
================================================== */

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


const openFriendly = ()=>{

if(!friendlyModal)return;

friendlyModal.classList.add(
"active"
);

friendlyModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

};


const closeFriendly = ()=>{

if(!friendlyModal)return;

friendlyModal.classList.remove(
"active"
);

friendlyModal.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"modal-open"
);

};


friendlyButtons.forEach(button=>{

button.addEventListener(
"click",
openFriendly
);

});


if(friendlyClose){

friendlyClose.addEventListener(
"click",
closeFriendly
);

}


if(friendlyModal){

friendlyModal.addEventListener(
"click",
event=>{

if(
event.target === friendlyModal
){

closeFriendly();

}

}
);

}


/* ==================================================
   MEMBERSHIP MODAL
================================================== */

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


const openMembership = ()=>{

if(!membershipModal)return;

membershipModal.classList.add(
"active"
);

membershipModal.setAttribute(
"aria-hidden",
"false"
);

document.body.classList.add(
"modal-open"
);

};


const closeMembership = ()=>{

if(!membershipModal)return;

membershipModal.classList.remove(
"active"
);

membershipModal.setAttribute(
"aria-hidden",
"true"
);

document.body.classList.remove(
"modal-open"
);

};


membershipButtons.forEach(button=>{

button.addEventListener(
"click",
openMembership
);

});


if(membershipClose){

membershipClose.addEventListener(
"click",
closeMembership
);

}


if(membershipModal){

membershipModal.addEventListener(
"click",
event=>{

if(
event.target === membershipModal
){

closeMembership();

}

}
);

}


/* ==================================================
   ESCAPE KEY — CLOSE ALL MODALS
================================================== */

document.addEventListener(
"keydown",
event=>{

if(event.key !== "Escape")
return;

closeRules();
closeFriendly();
closeMembership();

if(
lightbox &&
lightbox.classList.contains("active")
){

lightbox.classList.remove("active");

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


/* ==================================================
   APPLICATION FORM VALIDATION
================================================== */

document.addEventListener(
"submit",
event=>{

const form =
event.target;


if(
!form.classList.contains(
"application-form"
)
)return;


const requiredFields =
form.querySelectorAll(
"[required]"
);

let valid = true;

let firstError = null;


requiredFields.forEach(field=>{

field.classList.remove(
"input-error"
);


/* CHECK CHECKBOX */

if(field.type === "checkbox"){

if(!field.checked){

valid = false;

field.classList.add(
"input-error"
);

if(!firstError){

firstError = field;

}

}

}


/* CHECK OTHER FIELDS */

else if(
!field.value ||
!field.value.trim()
){

valid = false;

field.classList.add(
"input-error"
);

if(!firstError){

firstError = field;

}

}

});


if(!valid){

event.preventDefault();

if(firstError){

firstError.focus();

}

}

}
);


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

button.style.transform =
"scale(.97)";

setTimeout(()=>{

button.style.transform =
"";

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

if(!id || id === "#")
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


/* ==================================================
   LEADERSHIP SCROLL ANIMATION
================================================== */

const leaderCards =
document.querySelectorAll(
".leader-card"
);


if(leaderCards.length){

const leaderObserver =
new IntersectionObserver(

entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting)
return;

entry.target.classList.add(
"revealed"
);

leaderObserver.unobserve(
entry.target
);

});

},

{
threshold:.15
}

);


leaderCards.forEach(card=>{

leaderObserver.observe(card);

});

}


/* ==================================================
   SUPABASE — PUBLIC NOTICES
================================================== */

const SUPABASE_URL =
"https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


/* ==================================================
   CREATE SUPABASE CLIENT SAFELY
================================================== */

let homeSupabase = null;


if(
window.supabase &&
typeof window.supabase.createClient ===
"function"
){

homeSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

}


/* ==================================================
   LOAD NOTICES
================================================== */

async function loadHomeNotices(){

const track =
document.querySelector(
".notice-ticker-track"
);

if(!track)
return;


/* If Supabase library is unavailable */

if(!homeSupabase){

console.warn(
"Supabase library not loaded."
);

startNoticeTicker();

return;

}


try{

const {
data,
error
} =
await homeSupabase
.from("notices")
.select(
"id,title,content,created_at"
)
.order(
"created_at",
{
ascending:false
}
)
.limit(10);


if(error){

console.error(
"Supabase Notices Error:",
error
);

startNoticeTicker();

return;

}


if(!data || data.length === 0){

track.innerHTML = `
<span class="notice-ticker-item">
No latest notices available.
</span>
`;

startNoticeTicker();

return;

}


/* ==================================================
   ESCAPE HTML
================================================== */

const escapeHTML = value=>{

return String(value || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

};


/* ==================================================
   CREATE TICKER
================================================== */

const noticesHTML =
data.map(notice=>{

return `
<span class="notice-ticker-item">
<strong>NOTICE</strong>
${escapeHTML(notice.title)}
</span>
`;

}).join("");


/*
   Duplicate notices for continuous
   scrolling animation.
*/

track.innerHTML =
noticesHTML +
noticesHTML;


/* ==================================================
   START SUPABASE TICKER
================================================== */

startNoticeTicker();

}catch(error){

console.error(
"Notice loading failed:",
error
);

startNoticeTicker();

}

}


/* ==================================================
   INITIAL LOAD
================================================== */

document.addEventListener(
"DOMContentLoaded",
()=>{

loadHomeNotices();

}
);
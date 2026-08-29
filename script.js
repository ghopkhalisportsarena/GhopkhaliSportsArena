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


if(noticeTrack){

let position = 0;

const tickerMove = ()=>{

position -= .35;

const resetPoint =
noticeTrack.scrollWidth / 2;

if(
Math.abs(position) >= resetPoint
){

position = 0;

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

const applicationForm =
document.querySelector(
".application-form"
);

const applicationTitle =
document.querySelector(
"#applicationModal h2"
);

const applicationKicker =
document.querySelector(
"#applicationModal .section-kicker"
);

const formGrid =
document.querySelector(
"#applicationModal .form-grid"
);

const formNote =
document.querySelector(
"#applicationModal .form-note"
);


/* ==================================================
   FRIENDLY MATCH FORM
================================================== */

const friendlyMatchFields = `

<div class="input-group">

<label>
Full Name / Team Representative
</label>

<input
type="text"
name="representative_name"
placeholder="Enter representative name"
required
>

</div>


<div class="input-group">

<label>
Phone Number
</label>

<input
type="tel"
name="phone"
placeholder="01XXXXXXXXX"
required
>

</div>


<div class="input-group">

<label>
Email Address
</label>

<input
type="email"
name="email"
placeholder="your@email.com"
>

</div>


<div class="input-group">

<label>
Team / Club Name
</label>

<input
type="text"
name="team_name"
placeholder="Enter team or club name"
required
>

</div>


<div class="input-group">

<label>
Preferred Date
</label>

<input
type="date"
name="preferred_date"
required
>

</div>


<div class="input-group">

<label>
Preferred Time
</label>

<input
type="time"
name="preferred_time"
required
>

</div>


<div class="input-group">

<label>
Sport
</label>

<select
name="sport"
required
>

<option value="">
Select Sport
</option>

<option value="Football">
Football
</option>

<option value="Mini Football">
Mini Football
</option>

<option value="Cricket">
Cricket
</option>

<option value="Other">
Other
</option>

</select>

</div>


<div class="input-group">

<label>
Number of Players
</label>

<input
type="number"
name="players"
min="1"
placeholder="Number of players"
required
>

</div>


<div class="input-group full-input">

<label>
Additional Message
</label>

<textarea
name="message"
rows="5"
placeholder="Tell us about your match request..."
></textarea>

</div>

`;


/* ==================================================
   CLUB MEMBERSHIP FORM
================================================== */

const membershipFields = `

<div class="membership-form-heading full-input">

<strong>
সদস্যপদ আবেদন ফরম
</strong>

<span>
(পাসপোর্ট সাইজের ছবি আঠার সাহায্যে যুক্ত করুন)
</span>

</div>


<div class="form-section-title full-input">
১. ব্যক্তিগত তথ্য
</div>


<div class="input-group">

<label>
আবেদনকারীর পূর্ণ নাম (বাংলায়)
</label>

<input
type="text"
name="name_bangla"
placeholder="আপনার বাংলা নাম লিখুন"
required
>

</div>


<div class="input-group">

<label>
আবেদনকারীর পূর্ণ নাম (ইংরেজিতে)
</label>

<input
type="text"
name="name_english"
placeholder="Enter full name in English"
required
>

</div>


<div class="input-group">

<label>
পিতার নাম
</label>

<input
type="text"
name="father_name"
placeholder="পিতার নাম লিখুন"
required
>

</div>


<div class="input-group">

<label>
মাতার নাম
</label>

<input
type="text"
name="mother_name"
placeholder="মাতার নাম লিখুন"
required
>

</div>


<div class="input-group">

<label>
জন্ম তারিখ
</label>

<input
type="date"
name="date_of_birth"
required
>

</div>


<div class="input-group">

<label>
রক্তের গ্রুপ
</label>

<select
name="blood_group"
required
>

<option value="">
নির্বাচন করুন
</option>

<option>A+</option>
<option>A-</option>
<option>B+</option>
<option>B-</option>
<option>AB+</option>
<option>AB-</option>
<option>O+</option>
<option>O-</option>

</select>

</div>


<div class="input-group">

<label>
পেশা
</label>

<input
type="text"
name="occupation"
placeholder="আপনার পেশা লিখুন"
>

</div>


<div class="input-group">

<label>
জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর
</label>

<input
type="text"
name="nid_birth_registration"
placeholder="NID / জন্ম নিবন্ধন নম্বর"
required
>

</div>


<div class="form-section-title full-input">
২. যোগাযোগের তথ্য
</div>


<div class="input-group full-input">

<label>
বর্তমান ঠিকানা
</label>

<textarea
name="present_address"
rows="3"
placeholder="বর্তমান ঠিকানা লিখুন"
required
></textarea>

</div>


<div class="input-group full-input">

<label>
স্থায়ী ঠিকানা
</label>

<textarea
name="permanent_address"
rows="3"
placeholder="স্থায়ী ঠিকানা লিখুন"
required
></textarea>

</div>


<div class="input-group">

<label>
মোবাইল নম্বর
</label>

<input
type="tel"
name="mobile"
placeholder="01XXXXXXXXX"
required
>

</div>


<div class="input-group">

<label>
বিকল্প মোবাইল নম্বর
</label>

<input
type="tel"
name="alternative_mobile"
placeholder="যদি থাকে"
>

</div>


<div class="form-section-title full-input">
৩. ক্রীড়া সংক্রান্ত তথ্য
</div>


<div class="input-group full-input">

<label>
আপনি কোন কোন খেলায় অংশগ্রহণ করতে ইচ্ছুক?
</label>

<div class="sports-checkboxes">

<label>
<input
type="checkbox"
name="sports[]"
value="ক্রিকেট"
>
ক্রিকেট
</label>

<label>
<input
type="checkbox"
name="sports[]"
value="ফুটবল"
>
ফুটবল
</label>

<label>
<input
type="checkbox"
name="sports[]"
value="ব্যাডমিন্টন"
>
ব্যাডমিন্টন
</label>

<label>
<input
type="checkbox"
name="sports[]"
value="ভলিবল"
>
ভলিবল
</label>

<label>
<input
type="checkbox"
name="sports[]"
value="অ্যাথলেটিক্স"
>
অ্যাথলেটিক্স
</label>

<label>
<input
type="checkbox"
name="sports[]"
value="ইনডোর গেমস"
>
ইনডোর গেমস
</label>

</div>

</div>


<div class="input-group">

<label>
অন্যান্য খেলা
</label>

<input
type="text"
name="other_sport"
placeholder="অন্যান্য খেলার নাম"
>

</div>


<div class="input-group">

<label>
খেলার প্রধান দক্ষতা
</label>

<input
type="text"
name="sports_skill"
placeholder="যেমন: স্ট্রাইকার, অলরাউন্ডার"
>

</div>


<div class="input-group full-input">

<label>
পূর্বে অন্য কোনো ক্লাবে খেলার অভিজ্ঞতা
</label>

<textarea
name="previous_club_experience"
rows="3"
placeholder="যদি থাকে লিখুন"
></textarea>

</div>


<div class="form-section-title full-input">
৪. জরুরি প্রয়োজনে যোগাযোগের তথ্য
</div>


<div class="input-group">

<label>
নাম
</label>

<input
type="text"
name="emergency_name"
placeholder="জরুরি যোগাযোগের ব্যক্তির নাম"
required
>

</div>


<div class="input-group">

<label>
সম্পর্ক
</label>

<input
type="text"
name="emergency_relation"
placeholder="আপনার সাথে সম্পর্ক"
required
>

</div>


<div class="input-group">

<label>
মোবাইল নম্বর
</label>

<input
type="tel"
name="emergency_phone"
placeholder="01XXXXXXXXX"
required
>

</div>


<div class="input-group">

<label>
সদস্যপদের ধরন
</label>

<select
name="membership_type"
required
>

<option value="">
নির্বাচন করুন
</option>

<option>সাধারণ সদস্য</option>

<option>ক্রীড়া সদস্য</option>

<option>সক্রিয় সদস্য</option>

</select>

</div>


<div class="membership-agreement full-input">

<strong>
অঙ্গীকারনামা
</strong>

<p>

আমি সজ্ঞানে ঘোষণা করছি যে, এই ফরমে প্রদত্ত
আমার সকল তথ্য সম্পূর্ণ সত্য ও নির্ভুল।

আমি 'ঘোপখালী স্পোর্টস অ্যারিনা ক্লাব'-এর একজন
গর্বিত সদস্য হিসেবে ক্লাবের সকল নিয়ম-কানুন ও
গঠনতন্ত্র যথাযথভাবে মেনে চলব।

ক্লাবের আয়োজিত ইনডোর বা আউটডোর যেকোনো
ক্রীড়া কার্যক্রমে আমি স্বতঃস্ফূর্তভাবে অংশগ্রহণ
করতে আগ্রহী এবং এমন কোনো কার্যকলাপে জড়িত
হব না যা ক্লাবের সম্মান ক্ষুণ্ন করে।

</p>

<label class="agreement-check">

<input
type="checkbox"
name="agreement"
value="Agreed"
required
>

আমি উপরোক্ত অঙ্গীকারনামা পড়েছি এবং সম্মত।

</label>

</div>

`;


/* ==================================================
   OPEN APPLICATION
================================================== */

const openApplication = type=>{

if(!applicationModal)return;


/* SET APPLICATION TYPE */

if(applicationType){

applicationType.value =
type || "";

}


/* RESET FORM */

if(applicationForm){

applicationForm.reset();

}


/* ==================================================
   FRIENDLY MATCH MODE
================================================== */

if(type === "Friendly Match"){

if(applicationKicker){

applicationKicker.textContent =
"GHOPKHALI SPORTS ARENA";

}


if(applicationTitle){

applicationTitle.innerHTML =
`
Friendly Match
<span>Application.</span>
`;

}


if(formGrid){

formGrid.innerHTML =
friendlyMatchFields;

}


if(formNote){

formNote.textContent =
"Your friendly match application will be sent to the official Ghopkhali Sports Arena email.";

}

}


/* ==================================================
   CLUB MEMBERSHIP MODE
================================================== */

else if(type === "Club Membership"){

if(applicationKicker){

applicationKicker.textContent =
"GHOPKHALI SPORTS ARENA • MEMBERSHIP";

}


if(applicationTitle){

applicationTitle.innerHTML =
`
Club Membership
<span>Application.</span>
`;

}


if(formGrid){

formGrid.innerHTML =
membershipFields;

}


if(formNote){

formNote.textContent =
"আপনার সদস্যপদ আবেদনটি Ghopkhali Sports Arena কর্তৃপক্ষের কাছে পাঠানো হবে।";

}

}


/* ==================================================
   SHOW MODAL
================================================== */

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


/* ==================================================
   CLOSE APPLICATION
================================================== */

const closeApplication = ()=>{

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


/* ==================================================
   APPLICATION BUTTONS
================================================== */

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


/* ==================================================
   CLOSE BUTTON
================================================== */

if(applicationClose){

applicationClose.addEventListener(
"click",
closeApplication
);

}


/* ==================================================
   OUTSIDE CLICK
================================================== */

if(applicationModal){

applicationModal.addEventListener(
"click",
event=>{

if(
event.target === applicationModal
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

if(event.key !== "Escape")
return;

closeRules();

closeApplication();

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

else if(!field.value.trim()){

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
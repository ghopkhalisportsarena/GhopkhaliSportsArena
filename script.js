/* =========================================================
   GSA APPLICATION SYSTEM
   Supabase — Friendly Match + Membership
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------------------------------
     SUPABASE
  ------------------------------------------------------- */

  if (typeof window.supabase === "undefined") {
    console.error("Supabase library is not loaded.");
    return;
  }

  const SUPABASE_URL = "https://cmygmswzokyrmgdnuszq.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


  /* -------------------------------------------------------
     MODAL HELPERS
  ------------------------------------------------------- */

  const friendlyModal = document.getElementById("friendlyModal");
  const membershipModal = document.getElementById("membershipModal");
  const rulesModal = document.getElementById("rulesModal");


  function openModal(modal) {
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
  }


  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
  }


  /* -------------------------------------------------------
     OPEN FRIENDLY MATCH
  ------------------------------------------------------- */

  document.querySelectorAll("[data-open-friendly]").forEach(button => {

    button.addEventListener("click", () => {
      openModal(friendlyModal);
    });

  });


  /* -------------------------------------------------------
     OPEN MEMBERSHIP
  ------------------------------------------------------- */

  document.querySelectorAll("[data-open-membership]").forEach(button => {

    button.addEventListener("click", () => {
      openModal(membershipModal);
    });

  });


  /* -------------------------------------------------------
     OPEN RULES
  ------------------------------------------------------- */

  document.querySelectorAll("[data-open-rules]").forEach(button => {

    button.addEventListener("click", () => {
      openModal(rulesModal);
    });

  });


  /* -------------------------------------------------------
     CLOSE FRIENDLY
  ------------------------------------------------------- */

  document.querySelectorAll("[data-close-friendly]").forEach(button => {

    button.addEventListener("click", () => {
      closeModal(friendlyModal);
    });

  });


  /* -------------------------------------------------------
     CLOSE MEMBERSHIP
  ------------------------------------------------------- */

  document.querySelectorAll("[data-close-membership]").forEach(button => {

    button.addEventListener("click", () => {
      closeModal(membershipModal);
    });

  });


  /* -------------------------------------------------------
     CLOSE RULES
  ------------------------------------------------------- */

  document.querySelectorAll("[data-close-rules]").forEach(button => {

    button.addEventListener("click", () => {
      closeModal(rulesModal);
    });

  });


  /* -------------------------------------------------------
     CLOSE WHEN CLICKING OUTSIDE MODAL
  ------------------------------------------------------- */

  document.querySelectorAll(".modal").forEach(modal => {

    modal.addEventListener("click", event => {

      if (event.target === modal) {
        closeModal(modal);
      }

    });

  });


  /* -------------------------------------------------------
     ESC KEY
  ------------------------------------------------------- */

  document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;

    closeModal(friendlyModal);
    closeModal(membershipModal);
    closeModal(rulesModal);

  });


  /* =======================================================
     FRIENDLY MATCH APPLICATION
  ======================================================= */

  const friendlyForm = friendlyModal
    ? friendlyModal.querySelector("form.application-form")
    : null;


  if (friendlyForm) {

    friendlyForm.addEventListener("submit", async event => {

      event.preventDefault();

      const submitButton =
        friendlyForm.querySelector(".form-submit");

      const originalText = submitButton
        ? submitButton.innerHTML
        : "Submit Application ↗";


      try {

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = "Submitting...";
        }


        const formData = new FormData(friendlyForm);


        const teamName =
          formData.get("Team or Club Name")?.trim() || "";


        const contactPerson =
          formData.get("Representative Name")?.trim() || "";


        const phone =
          formData.get("Phone Number")?.trim() || "";


        const email =
          formData.get("Email")?.trim() || "";


        const preferredDate =
          formData.get("Preferred Date") || null;


        const preferredTime =
          formData.get("Preferred Time") || null;


        const sport =
          formData.get("Sport") || "";


        const players =
          formData.get("Number of Players") || "";


        const additionalMessage =
          formData.get("Additional Message")?.trim() || "";


        /* -----------------------------------------------
           Combine fields which don't have separate columns
        ------------------------------------------------ */

        const messageParts = [];

        if (sport) {
          messageParts.push(`Sport: ${sport}`);
        }

        if (players) {
          messageParts.push(`Number of Players: ${players}`);
        }

        if (additionalMessage) {
          messageParts.push(
            `Additional Message: ${additionalMessage}`
          );
        }


        const message = messageParts.join("\n");


        /* -----------------------------------------------
           SUPABASE INSERT
        ------------------------------------------------ */

        const { data, error } =
          await supabaseClient
            .from("friendly_applications")
            .insert([
              {
                team_name: teamName,
                contact_person: contactPerson,
                phone: phone,
                email: email || null,
                preferred_date: preferredDate,
                preferred_time: preferredTime || null,
                venue: null,
                message: message || null,
                status: "pending"
              }
            ])
            .select()
            .single();


        if (error) {
          console.error(
            "Friendly application error:",
            error
          );

          throw error;
        }


        console.log(
          "Friendly application submitted:",
          data
        );


        alert(
          "Your Friendly Match application has been submitted successfully."
        );


        friendlyForm.reset();

        closeModal(friendlyModal);


      } catch (error) {

        console.error(error);

        alert(
          "Application submission failed.\n\n" +
          "Please try again later."
        );


      } finally {

        if (submitButton) {

          submitButton.disabled = false;
          submitButton.innerHTML = originalText;

        }

      }

    });

  }


  /* =======================================================
     MEMBERSHIP APPLICATION
  ======================================================= */

  const membershipForm = membershipModal
    ? membershipModal.querySelector("form.application-form")
    : null;


  if (membershipForm) {

    membershipForm.addEventListener("submit", async event => {

      event.preventDefault();


      const submitButton =
        membershipForm.querySelector(".form-submit");


      const originalText = submitButton
        ? submitButton.innerHTML
        : "সদস্যপদ আবেদন জমা দিন ↗";


      try {

        if (submitButton) {

          submitButton.disabled = true;
          submitButton.innerHTML = "জমা হচ্ছে...";

        }


        const formData = new FormData(membershipForm);


        /* -----------------------------------------------
           BASIC INFORMATION
        ------------------------------------------------ */

        const fullNameBangla =
          formData.get("পূর্ণ নাম বাংলায়")?.trim() || "";


        const fullNameEnglish =
          formData.get("Full Name English")?.trim() || "";


        const fatherName =
          formData.get("Father Name")?.trim() || "";


        const motherName =
          formData.get("Mother Name")?.trim() || "";


        const dateOfBirth =
          formData.get("Date of Birth") || null;


        const profession =
          formData.get("Profession")?.trim() || "";


        const nid =
          formData.get("NID or Birth Registration")?.trim() || "";


        /* -----------------------------------------------
           CONTACT
        ------------------------------------------------ */

        const currentAddress =
          formData.get("Current Address")?.trim() || "";


        const permanentAddress =
          formData.get("Permanent Address")?.trim() || "";


        const mobile =
          formData.get("Mobile Number")?.trim() || "";


        const alternativeMobile =
          formData.get("Alternative Mobile Number")?.trim() || "";


        /* -----------------------------------------------
           SPORTS
        ------------------------------------------------ */

        const selectedSports =
          formData.getAll("Sports[]");


        const otherSports =
          formData.get("Other Sports")?.trim() || "";


        const mainSkill =
          formData.get("Main Sports Skill")?.trim() || "";


        const previousExperience =
          formData.get("Previous Club Experience")?.trim() || "";


        /* -----------------------------------------------
           EMERGENCY CONTACT
        ------------------------------------------------ */

        const emergencyName =
          formData.get("Emergency Contact Name")?.trim() || "";


        const emergencyRelationship =
          formData.get("Emergency Contact Relationship")?.trim() || "";


        const emergencyMobile =
          formData.get("Emergency Contact Mobile")?.trim() || "";


        /* -----------------------------------------------
           BUILD EXPERIENCE
        ------------------------------------------------ */

        const experienceParts = [];


        if (selectedSports.length) {

          experienceParts.push(
            `Interested Sports: ${selectedSports.join(", ")}`
          );

        }


        if (otherSports) {

          experienceParts.push(
            `Other Sports: ${otherSports}`
          );

        }


        if (mainSkill) {

          experienceParts.push(
            `Main Sports Skill: ${mainSkill}`
          );

        }


        if (previousExperience) {

          experienceParts.push(
            `Previous Club Experience: ${previousExperience}`
          );

        }


        const experience =
          experienceParts.join("\n");


        /* -----------------------------------------------
           BUILD MESSAGE
        ------------------------------------------------ */

        const messageParts = [];


        if (fullNameBangla) {

          messageParts.push(
            `Full Name (Bangla): ${fullNameBangla}`
          );

        }


        if (fatherName) {

          messageParts.push(
            `Father's Name: ${fatherName}`
          );

        }


        if (motherName) {

          messageParts.push(
            `Mother's Name: ${motherName}`
          );

        }


        if (profession) {

          messageParts.push(
            `Profession: ${profession}`
          );

        }


        if (nid) {

          messageParts.push(
            `NID/Birth Registration: ${nid}`
          );

        }


        if (currentAddress) {

          messageParts.push(
            `Current Address: ${currentAddress}`
          );

        }


        if (permanentAddress) {

          messageParts.push(
            `Permanent Address: ${permanentAddress}`
          );

        }


        if (alternativeMobile) {

          messageParts.push(
            `Alternative Mobile: ${alternativeMobile}`
          );

        }


        if (emergencyName) {

          messageParts.push(
            `Emergency Contact: ${emergencyName}`
          );

        }


        if (emergencyRelationship) {

          messageParts.push(
            `Emergency Relationship: ${emergencyRelationship}`
          );

        }


        if (emergencyMobile) {

          messageParts.push(
            `Emergency Mobile: ${emergencyMobile}`
          );

        }


        const message =
          messageParts.join("\n");


        /* -----------------------------------------------
           SUPABASE INSERT
        ------------------------------------------------ */

        const { data, error } =
          await supabaseClient
            .from("membership_applications")
            .insert([
              {
                full_name:
                  fullNameEnglish || fullNameBangla,

                date_of_birth:
                  dateOfBirth,

                phone:
                  mobile,

                email:
                  null,

                address:
                  currentAddress,

                occupation:
                  profession,

                preferred_position:
                  mainSkill || null,

                experience:
                  experience || null,

                message:
                  message || null,

                photo_url:
                  null,

                status:
                  "pending",

                admin_note:
                  null
              }
            ])
            .select()
            .single();


        if (error) {

          console.error(
            "Membership application error:",
            error
          );

          throw error;

        }


        console.log(
          "Membership application submitted:",
          data
        );


        alert(
          "সদস্যপদ আবেদন সফলভাবে জমা হয়েছে।\n\nক্লাব কর্তৃপক্ষ আপনার আবেদন পর্যালোচনা করবে।"
        );


        membershipForm.reset();

        closeModal(membershipModal);


      } catch (error) {

        console.error(error);


        alert(
          "আবেদন জমা দেওয়া যায়নি।\n\n" +
          "দয়া করে আবার চেষ্টা করুন।"
        );


      } finally {

        if (submitButton) {

          submitButton.disabled = false;
          submitButton.innerHTML = originalText;

        }

      }

    });

  }


  console.log(
    "GSA Application System initialized."
  );

});

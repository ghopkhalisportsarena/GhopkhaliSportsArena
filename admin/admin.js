"use strict";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://cmygmswzokyrmgdnuszq.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_w1Hq5KwIxMjyiWf7HL10qg_9bYRwz1L";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   AUTH CHECK
========================================================= */

async function checkAuthentication(){

  try{

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if(error){
      throw error;
    }


    if(!data?.session){

      window.location.replace(
        "admin.html"
      );

      return false;
    }


    return true;

  }catch(error){

    console.error(
      "Authentication error:",
      error
    );

    window.location.replace(
      "admin.html"
    );

    return false;
  }
}


/* =========================================================
   USER
========================================================= */

async function loadUser(){

  try{

    const {
      data,
      error
    } =
      await supabaseClient.auth.getUser();


    if(error || !data?.user){
      return;
    }


    const email =
      data.user.email ||
      "Administrator";


    let name =
      email.split("@")[0];


    name =
      name
        .replace(/[._-]+/g," ")
        .replace(/\b\w/g,c=>c.toUpperCase());


    const nameElement =
      document.getElementById(
        "userName"
      );

    const avatarElement =
      document.getElementById(
        "avatar"
      );


    if(nameElement){
      nameElement.textContent =
        name;
    }


    if(avatarElement){
      avatarElement.textContent =
        name.charAt(0).toUpperCase();
    }


  }catch(error){

    console.error(
      "User loading error:",
      error
    );

  }
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupSidebar(){

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  const menuButton =
    document.getElementById(
      "menuButton"
    );

  const overlay =
    document.getElementById(
      "overlay"
    );


  if(!sidebar) return;


  function open(){

    sidebar.classList.add("open");

    if(overlay){
      overlay.classList.add("open");
    }
  }


  function close(){

    sidebar.classList.remove("open");

    if(overlay){
      overlay.classList.remove("open");
    }
  }


  if(menuButton){

    menuButton.addEventListener(
      "click",
      open
    );

  }


  if(overlay){

    overlay.addEventListener(
      "click",
      close
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(link=>{

      link.addEventListener(
        "click",
        close
      );

    });

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout(){

  const button =
    document.getElementById(
      "logoutButton"
    );


  if(!button) return;


  button.addEventListener(
    "click",
    async function(){

      button.disabled=true;
      button.innerHTML=
        "<span>...</span> Signing out";


      try{

        await supabaseClient.auth.signOut();

      }catch(error){

        console.error(
          "Logout error:",
          error
        );

      }


      window.location.replace(
        "admin.html"
      );

    }
  );

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  function(event){

    if(event === "SIGNED_OUT"){

      window.location.replace(
        "admin.html"
      );

    }

  }
);


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function(){

    const authenticated =
      await checkAuthentication();


    if(!authenticated){
      return;
    }


    setupSidebar();

    setupLogout();

    await loadUser();

  }
);
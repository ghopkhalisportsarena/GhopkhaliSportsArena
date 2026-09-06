/* =====================================================
   GHOPKHALI SPORTS ARENA
   ORIGINAL LUDO BOARD ENGINE
   STEP 1 — BOARD ONLY
===================================================== */

"use strict";


/* =====================================================
   BOARD CONFIGURATION
===================================================== */

const LUDO_SIZE = 15;


/* =====================================================
   COLORS
===================================================== */

const LUDO_COLORS = {

    red: "#e53935",
    green: "#43a047",
    yellow: "#fbc02d",
    blue: "#1e88e5",

    track: "#ffffff",
    safe: "#f1f5f9",
    center: "#f8fafc",

    line: "#cbd5e1"

};


/* =====================================================
   CREATE BOARD
===================================================== */

function createLudoBoard(container) {

    if (!container) {

        console.error(
            "Ludo board container not found."
        );

        return;

    }


    /* -------------------------------------------------
       Clear old board
    ------------------------------------------------- */

    container.innerHTML = "";


    /* -------------------------------------------------
       Board wrapper
    ------------------------------------------------- */

    const board = document.createElement("div");

    board.className = "ludo-board";

    board.style.setProperty(
        "--ludo-size",
        LUDO_SIZE
    );


    /* -------------------------------------------------
       Create 15 × 15 cells
    ------------------------------------------------- */

    for (
        let row = 0;
        row < LUDO_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < LUDO_SIZE;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.className = "ludo-cell";


            cell.dataset.row = row;
            cell.dataset.col = col;


            /* -----------------------------------------
               Determine cell type
            ----------------------------------------- */

            const type =
                getCellType(row, col);


            cell.dataset.type = type;


            /* -----------------------------------------
               Home areas
            ----------------------------------------- */

            if (type === "red-home") {

                cell.classList.add("red-home");

            }

            else if (type === "green-home") {

                cell.classList.add("green-home");

            }

            else if (type === "yellow-home") {

                cell.classList.add("yellow-home");

            }

            else if (type === "blue-home") {

                cell.classList.add("blue-home");

            }

            else if (type === "center") {

                cell.classList.add("center");

            }

            else if (type === "track") {

                cell.classList.add("track");

            }


            board.appendChild(cell);

        }

    }


    /* -------------------------------------------------
       Add board to page
    ------------------------------------------------- */

    container.appendChild(board);


    return board;

}


/* =====================================================
   CELL TYPE
===================================================== */

function getCellType(row, col) {


    /* -------------------------------------------------
       RED HOME
       Top-left
    ------------------------------------------------- */

    if (
        row < 6 &&
        col < 6
    ) {

        return "red-home";

    }


    /* -------------------------------------------------
       GREEN HOME
       Top-right
    ------------------------------------------------- */

    if (
        row < 6 &&
        col > 8
    ) {

        return "green-home";

    }


    /* -------------------------------------------------
       YELLOW HOME
       Bottom-right
    ------------------------------------------------- */

    if (
        row > 8 &&
        col > 8
    ) {

        return "yellow-home";

    }


    /* -------------------------------------------------
       BLUE HOME
       Bottom-left
    ------------------------------------------------- */

    if (
        row > 8 &&
        col < 6
    ) {

        return "blue-home";

    }


    /* -------------------------------------------------
       CENTER
    ------------------------------------------------- */

    if (
        row >= 6 &&
        row <= 8 &&
        col >= 6 &&
        col <= 8
    ) {

        return "center";

    }


    /* -------------------------------------------------
       TRACK
    ------------------------------------------------- */

    return "track";

}


/* =====================================================
   AUTO START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const container =
            document.getElementById(
                "ludo-board"
            );


        if (container) {

            createLudoBoard(container);

        }

    }
);
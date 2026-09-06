/* =========================================================
   GHOPKHALI SPORTS ARENA
   ORIGINAL LUDO BOARD ENGINE
   STEP 1 — BOARD ENGINE
========================================================= */

"use strict";


/* =========================================================
   BOARD CONSTANTS
========================================================= */

const LUDO_SIZE = 15;


/* =========================================================
   COLORS
========================================================= */

const LUDO_COLORS = {

    red: "#ed1c24",
    green: "#18b66a",
    yellow: "#f5c400",
    blue: "#1687ff",

    track: "#ffffff",
    safe: "#ffffff",

    line: "rgba(0,0,0,.16)"

};


/* =========================================================
   ORIGINAL 52-CELL TRACK
   15 x 15 BOARD COORDINATES

   Row / Column start from 0.
========================================================= */

const LUDO_TRACK = [

    /* RED START */

    [6, 1],
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],

    [5, 6],
    [4, 6],
    [3, 6],
    [2, 6],
    [1, 6],
    [0, 6],

    /* GREEN SIDE */

    [0, 7],
    [0, 8],

    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],

    [6, 9],
    [6, 10],
    [6, 11],
    [6, 12],
    [6, 13],
    [6, 14],

    /* YELLOW SIDE */

    [7, 14],
    [8, 14],

    [8, 13],
    [8, 12],
    [8, 11],
    [8, 10],
    [8, 9],

    [9, 8],
    [10, 8],
    [11, 8],
    [12, 8],
    [13, 8],
    [14, 8],

    /* BLUE SIDE */

    [14, 7],
    [14, 6],

    [13, 6],
    [12, 6],
    [11, 6],
    [10, 6],
    [9, 6],

    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],

    [7, 0],
    [6, 0]

];


/* =========================================================
   PLAYER START INDEX

   Each player enters the common 52-cell track
   from a different location.
========================================================= */

const LUDO_START_INDEX = {

    red: 0,

    green: 13,

    yellow: 26,

    blue: 39

};


/* =========================================================
   HOME LANES

   Six cells per player.
========================================================= */

const LUDO_HOME_LANES = {

    red: [

        [7, 1],
        [7, 2],
        [7, 3],
        [7, 4],
        [7, 5],
        [7, 6]

    ],

    green: [

        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7]

    ],

    yellow: [

        [7, 13],
        [7, 12],
        [7, 11],
        [7, 10],
        [7, 9],
        [7, 8]

    ],

    blue: [

        [13, 7],
        [12, 7],
        [11, 7],
        [10, 7],
        [9, 7],
        [8, 7]

    ]

};


/* =========================================================
   START CELLS
========================================================= */

const LUDO_START_CELLS = {

    red: [6, 1],

    green: [1, 8],

    yellow: [8, 13],

    blue: [13, 6]

};


/* =========================================================
   SAFE CELLS

   Standard safe locations plus player starts.
========================================================= */

const LUDO_SAFE_CELLS = [

    [6, 1],
    [1, 8],
    [8, 13],
    [13, 6],

    [2, 6],
    [6, 12],
    [12, 8],
    [8, 2]

];


/* =========================================================
   HOME YARDS
========================================================= */

const LUDO_YARDS = {

    red: {

        rowStart: 0,
        rowEnd: 5,

        colStart: 0,
        colEnd: 5

    },

    green: {

        rowStart: 0,
        rowEnd: 5,

        colStart: 9,
        colEnd: 14

    },

    yellow: {

        rowStart: 9,
        rowEnd: 14,

        colStart: 9,
        colEnd: 14

    },

    blue: {

        rowStart: 9,
        rowEnd: 14,

        colStart: 0,
        colEnd: 5

    }

};


/* =========================================================
   TOKEN YARD POSITIONS

   Four positions per player.
========================================================= */

const LUDO_TOKEN_SLOTS = {

    red: [

        [1.6, 1.6],
        [1.6, 3.4],
        [3.4, 1.6],
        [3.4, 3.4]

    ],

    green: [

        [1.6, 10.6],
        [1.6, 12.4],
        [3.4, 10.6],
        [3.4, 12.4]

    ],

    yellow: [

        [10.6, 10.6],
        [10.6, 12.4],
        [12.4, 10.6],
        [12.4, 12.4]

    ],

    blue: [

        [10.6, 1.6],
        [10.6, 3.4],
        [12.4, 1.6],
        [12.4, 3.4]

    ]

};


/* =========================================================
   UTILITY
========================================================= */

function sameCell(a, b) {

    return (

        a &&
        b &&
        a[0] === b[0] &&
        a[1] === b[1]

    );

}


/* =========================================================
   TRACK LOOKUP
========================================================= */

function getTrackIndex(row, col) {

    return LUDO_TRACK.findIndex(

        cell =>
            cell[0] === row &&
            cell[1] === col

    );

}


/* =========================================================
   CELL TYPE
========================================================= */

function getCellType(row, col) {

    /* CENTER */

    if (

        row >= 6 &&
        row <= 8 &&
        col >= 6 &&
        col <= 8

    ) {

        return "center";

    }


    /* HOME YARDS */

    if (

        row <= 5 &&
        col <= 5

    ) {

        return "red-home";

    }


    if (

        row <= 5 &&
        col >= 9

    ) {

        return "green-home";

    }


    if (

        row >= 9 &&
        col >= 9

    ) {

        return "yellow-home";

    }


    if (

        row >= 9 &&
        col <= 5

    ) {

        return "blue-home";

    }


    /* HOME LANES */

    for (const player of Object.keys(LUDO_HOME_LANES)) {

        if (

            LUDO_HOME_LANES[player]
                .some(cell => sameCell(cell, [row, col]))

        ) {

            return `${player}-lane`;

        }

    }


    /* MAIN TRACK */

    if (

        getTrackIndex(row, col) !== -1

    ) {

        return "track";

    }


    return "empty";

}


/* =========================================================
   SAFE CHECK
========================================================= */

function isSafeCell(row, col) {

    return LUDO_SAFE_CELLS.some(

        cell =>
            cell[0] === row &&
            cell[1] === col

    );

}


/* =========================================================
   START CHECK
========================================================= */

function getStartPlayer(row, col) {

    for (const player of Object.keys(LUDO_START_CELLS)) {

        if (

            sameCell(

                LUDO_START_CELLS[player],

                [row, col]

            )

        ) {

            return player;

        }

    }

    return null;

}


/* =========================================================
   CREATE HOME YARD
========================================================= */

function createHomeYard(player) {

    const yard = document.createElement("div");

    yard.className = `yard ${player}`;

    const inner = document.createElement("div");

    inner.className = "yard-inner";


    const slots = LUDO_TOKEN_SLOTS[player];


    slots.forEach(

        (position, index) => {

            const slot =
                document.createElement("div");

            slot.className = "slot";

            slot.dataset.player = player;

            slot.dataset.tokenIndex = index;


            inner.appendChild(slot);

        }

    );


    yard.appendChild(inner);

    return yard;

}


/* =========================================================
   CREATE HOME CENTER
========================================================= */

function createHomeCenter() {

    const center =
        document.createElement("div");

    center.className = "home-center";

    center.setAttribute(

        "aria-label",

        "Ludo Finish"

    );

    return center;

}


/* =========================================================
   CREATE START MARK
========================================================= */

function createStartMark(player) {

    const mark =
        document.createElement("div");

    mark.className = "start-mark";

    mark.dataset.player = player;

    return mark;

}


/* =========================================================
   CREATE BOARD
========================================================= */

function createLudoBoard(container) {

    if (!container) {

        console.error(
            "Ludo board container not found."
        );

        return null;

    }


    container.innerHTML = "";


    /* ==============================================
       BOARD
    ============================================== */

    const board =
        document.createElement("div");

    board.className = "ludo-board";


    board.style.setProperty(

        "--ludo-size",

        LUDO_SIZE

    );


    /* ==============================================
       CELLS
    ============================================== */

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


            cell.className = "cell";


            cell.dataset.row = row;

            cell.dataset.col = col;


            const type =
                getCellType(row, col);


            cell.dataset.type = type;


            /* --------------------------------------
               TRACK
            -------------------------------------- */

            if (type === "track") {

                cell.classList.add("path");

            }


            /* --------------------------------------
               HOME LANES
            -------------------------------------- */

            if (

                type.endsWith("-lane")

            ) {

                const player =
                    type.replace("-lane", "");

                cell.classList.add(
                    "home-lane",
                    `home-${player}`
                );

            }


            /* --------------------------------------
               SAFE
            -------------------------------------- */

            if (

                isSafeCell(row, col)

            ) {

                cell.classList.add("safe");

            }


            /* --------------------------------------
               START
            -------------------------------------- */

            const startPlayer =
                getStartPlayer(row, col);


            if (startPlayer) {

                cell.classList.add(
                    `start-${startPlayer}`
                );


                cell.appendChild(

                    createStartMark(
                        startPlayer
                    )

                );

            }


            /* --------------------------------------
               APPEND
            -------------------------------------- */

            board.appendChild(cell);

        }

    }


    /* =================================================
       HOME YARDS
    ================================================= */

    board.appendChild(

        createHomeYard("red")

    );

    board.appendChild(

        createHomeYard("green")

    );

    board.appendChild(

        createHomeYard("yellow")

    );

    board.appendChild(

        createHomeYard("blue")

    );


    /* =================================================
       CENTER
    ================================================= */

    board.appendChild(

        createHomeCenter()

    );


    /* =================================================
       TOKEN LAYER
    ================================================= */

    const tokenLayer =
        document.createElement("div");

    tokenLayer.className =
        "token-layer";

    tokenLayer.id =
        "ludo-token-layer";


    board.appendChild(
        tokenLayer
    );


    /* =================================================
       BOARD
    ================================================= */

    container.appendChild(
        board
    );


    return board;

}


/* =========================================================
   PUBLIC BOARD API
========================================================= */

window.LudoBoard = {

    size: LUDO_SIZE,

    track: LUDO_TRACK,

    startIndex: LUDO_START_INDEX,

    startCells: LUDO_START_CELLS,

    homeLanes: LUDO_HOME_LANES,

    safeCells: LUDO_SAFE_CELLS,

    tokenSlots: LUDO_TOKEN_SLOTS,

    yards: LUDO_YARDS,

    getCellType,

    getTrackIndex,

    isSafeCell,

    getStartPlayer,

    createLudoBoard

};


/* =========================================================
   AUTO INIT
========================================================= */

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
/* =========================================================
   GHOPKHALI SPORTS ARENA
   ONLINE LUDO TOURNAMENT
   STEP 1 — ORIGINAL LUDO BOARD ENGINE

   IMPORTANT:
   This file ONLY creates the board.
   No New Game.
   No Reset.
   No local game state.
   No Supabase mutation.
========================================================= */

"use strict";


/* =========================================================
   BOARD CONFIG
========================================================= */

const LUDO_BOARD_SIZE = 15;


/* =========================================================
   PLAYERS / COLORS
========================================================= */

const LUDO_COLORS = {

    red: "#e53935",

    green: "#43a047",

    yellow: "#fbc02d",

    blue: "#1e88e5"

};


/* =========================================================
   52-CELL MAIN TRACK

   Coordinate:
   [row, column]

   0-based 15 × 15 board.
========================================================= */

const LUDO_TRACK = [

    /* -----------------------------------------
       RED START → TOP
    ----------------------------------------- */

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

    /* -----------------------------------------
       TOP → GREEN
    ----------------------------------------- */

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

    /* -----------------------------------------
       GREEN → YELLOW
    ----------------------------------------- */

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

    /* -----------------------------------------
       YELLOW → BLUE
    ----------------------------------------- */

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

    /* -----------------------------------------
       BLUE → RED
    ----------------------------------------- */

    [7, 0],
    [6, 0]

];


/* =========================================================
   PLAYER START INDEX
========================================================= */

const LUDO_START_INDEX = {

    red: 0,

    green: 13,

    yellow: 26,

    blue: 39

};


/* =========================================================
   PLAYER START CELLS
========================================================= */

const LUDO_START_CELLS = {

    red: [6, 1],

    green: [1, 8],

    yellow: [8, 13],

    blue: [13, 6]

};


/* =========================================================
   HOME LANES
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
   SAFE CELLS

   These are visual safe positions only.
   Game-rule handling comes later.
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
   HOME YARD CONFIGURATION
========================================================= */

const LUDO_HOME_YARDS = {

    red: {

        row: 0,

        col: 0

    },

    green: {

        row: 0,

        col: 9

    },

    yellow: {

        row: 9,

        col: 9

    },

    blue: {

        row: 9,

        col: 0

    }

};


/* =========================================================
   TOKEN SLOT POSITIONS
========================================================= */

const LUDO_TOKEN_SLOTS = {

    red: [

        [1, 1],

        [1, 4],

        [4, 1],

        [4, 4]

    ],

    green: [

        [1, 10],

        [1, 13],

        [4, 10],

        [4, 13]

    ],

    yellow: [

        [10, 10],

        [10, 13],

        [13, 10],

        [13, 13]

    ],

    blue: [

        [10, 1],

        [10, 4],

        [13, 1],

        [13, 4]

    ]

};


/* =========================================================
   CELL COMPARISON
========================================================= */

function ludoSameCell(a, b) {

    return (

        a[0] === b[0] &&

        a[1] === b[1]

    );

}


/* =========================================================
   TRACK INDEX
========================================================= */

function getLudoTrackIndex(row, col) {

    return LUDO_TRACK.findIndex(

        cell =>

            cell[0] === row &&

            cell[1] === col

    );

}


/* =========================================================
   IS TRACK
========================================================= */

function isLudoTrackCell(row, col) {

    return (

        getLudoTrackIndex(
            row,
            col
        ) !== -1

    );

}


/* =========================================================
   SAFE CELL
========================================================= */

function isLudoSafeCell(row, col) {

    return LUDO_SAFE_CELLS.some(

        cell =>

            cell[0] === row &&

            cell[1] === col

    );

}


/* =========================================================
   START PLAYER
========================================================= */

function getLudoStartPlayer(row, col) {

    for (

        const player of Object.keys(
            LUDO_START_CELLS
        )

    ) {

        if (

            ludoSameCell(

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
   HOME LANE PLAYER
========================================================= */

function getLudoHomeLanePlayer(row, col) {

    for (

        const player of Object.keys(
            LUDO_HOME_LANES
        )

    ) {

        if (

            LUDO_HOME_LANES[player].some(

                cell =>

                    cell[0] === row &&

                    cell[1] === col

            )

        ) {

            return player;

        }

    }

    return null;

}


/* =========================================================
   HOME AREA
========================================================= */

function getLudoHomePlayer(row, col) {

    if (

        row <= 5 &&

        col <= 5

    ) {

        return "red";

    }


    if (

        row <= 5 &&

        col >= 9

    ) {

        return "green";

    }


    if (

        row >= 9 &&

        col >= 9

    ) {

        return "yellow";

    }


    if (

        row >= 9 &&

        col <= 5

    ) {

        return "blue";

    }


    return null;

}


/* =========================================================
   CELL TYPE
========================================================= */

function getLudoCellType(row, col) {

    /* -----------------------------------------
       CENTER
    ----------------------------------------- */

    if (

        row >= 6 &&

        row <= 8 &&

        col >= 6 &&

        col <= 8

    ) {

        return "center";

    }


    /* -----------------------------------------
       HOME
    ----------------------------------------- */

    const home =
        getLudoHomePlayer(
            row,
            col
        );


    if (home) {

        return `${home}-home`;

    }


    /* -----------------------------------------
       HOME LANE
    ----------------------------------------- */

    const lane =
        getLudoHomeLanePlayer(
            row,
            col
        );


    if (lane) {

        return `${lane}-lane`;

    }


    /* -----------------------------------------
       TRACK
    ----------------------------------------- */

    if (

        isLudoTrackCell(
            row,
            col
        )

    ) {

        return "track";

    }


    return "empty";

}


/* =========================================================
   CREATE CELL
========================================================= */

function createLudoCell(row, col) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "ludo-cell";


    cell.dataset.row =
        row;


    cell.dataset.col =
        col;


    const type =
        getLudoCellType(
            row,
            col
        );


    cell.dataset.type =
        type;


    /* -----------------------------------------
       TRACK
    ----------------------------------------- */

    if (
        type === "track"
    ) {

        cell.classList.add(
            "ludo-track"
        );

    }


    /* -----------------------------------------
       HOME
    ----------------------------------------- */

    if (

        type.endsWith(
            "-home"
        )

    ) {

        const player =
            type.replace(
                "-home",
                ""
            );


        cell.classList.add(
            "ludo-home",
            `ludo-home-${player}`
        );

    }


    /* -----------------------------------------
       HOME LANE
    ----------------------------------------- */

    if (

        type.endsWith(
            "-lane"
        )

    ) {

        const player =
            type.replace(
                "-lane",
                ""
            );


        cell.classList.add(
            "ludo-home-lane",
            `ludo-lane-${player}`
        );

    }


    /* -----------------------------------------
       SAFE
    ----------------------------------------- */

    if (

        isLudoSafeCell(
            row,
            col
        )

    ) {

        cell.classList.add(
            "ludo-safe"
        );


        const star =
            document.createElement(
                "span"
            );


        star.className =
            "ludo-safe-star";


        star.textContent =
            "★";


        cell.appendChild(
            star
        );

    }


    /* -----------------------------------------
       START
    ----------------------------------------- */

    const startPlayer =
        getLudoStartPlayer(
            row,
            col
        );


    if (startPlayer) {

        cell.classList.add(
            "ludo-start",
            `ludo-start-${startPlayer}`
        );

    }


    return cell;

}


/* =========================================================
   CREATE HOME
========================================================= */

function createLudoHome(player) {

    const home =
        document.createElement(
            "div"
        );


    home.className =
        `ludo-yard ludo-yard-${player}`;


    home.dataset.player =
        player;


    const inner =
        document.createElement(
            "div"
        );


    inner.className =
        "ludo-yard-inner";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const slot =
            document.createElement(
                "div"
            );


        slot.className =
            "ludo-token-slot";


        slot.dataset.player =
            player;


        slot.dataset.token =
            i;


        inner.appendChild(
            slot
        );

    }


    home.appendChild(
        inner
    );


    return home;

}


/* =========================================================
   CREATE CENTER
========================================================= */

function createLudoCenter() {

    const center =
        document.createElement(
            "div"
        );


    center.className =
        "ludo-center";


    const colors = [

        "red",

        "green",

        "yellow",

        "blue"

    ];


    colors.forEach(

        color => {

            const triangle =
                document.createElement(
                    "div"
                );


            triangle.className =
                `ludo-center-${color}`;


            center.appendChild(
                triangle
            );

        }

    );


    const finish =
        document.createElement(
            "div"
        );


    finish.className =
        "ludo-finish";


    finish.textContent =
        "★";


    center.appendChild(
        finish
    );


    return center;

}


/* =========================================================
   CREATE TOKEN LAYER
========================================================= */

function createLudoTokenLayer() {

    const layer =
        document.createElement(
            "div"
        );


    layer.id =
        "ludo-token-layer";


    layer.className =
        "ludo-token-layer";


    return layer;

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


    /* -----------------------------------------
       IMPORTANT

       Only render.
       Never create/reset game state.
    ----------------------------------------- */

    container.innerHTML = "";


    const board =
        document.createElement(
            "div"
        );


    board.className =
        "ludo-board";


    board.dataset.board =
        "online-tournament";


    board.dataset.size =
        LUDO_BOARD_SIZE;


    /* -----------------------------------------
       15 × 15 CELLS
    ----------------------------------------- */

    for (
        let row = 0;
        row < LUDO_BOARD_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < LUDO_BOARD_SIZE;
            col++
        ) {

            board.appendChild(

                createLudoCell(
                    row,
                    col
                )

            );

        }

    }


    /* -----------------------------------------
       HOME YARDS
    ----------------------------------------- */

    board.appendChild(
        createLudoHome("red")
    );


    board.appendChild(
        createLudoHome("green")
    );


    board.appendChild(
        createLudoHome("yellow")
    );


    board.appendChild(
        createLudoHome("blue")
    );


    /* -----------------------------------------
       CENTER
    ----------------------------------------- */

    board.appendChild(
        createLudoCenter()
    );


    /* -----------------------------------------
       TOKEN LAYER

       Step 2 will use this.
    ----------------------------------------- */

    board.appendChild(
        createLudoTokenLayer()
    );


    container.appendChild(
        board
    );


    return board;

}


/* =========================================================
   PUBLIC API
========================================================= */

window.LudoBoard = {

    size:
        LUDO_BOARD_SIZE,

    colors:
        LUDO_COLORS,

    track:
        LUDO_TRACK,

    startIndex:
        LUDO_START_INDEX,

    startCells:
        LUDO_START_CELLS,

    homeLanes:
        LUDO_HOME_LANES,

    safeCells:
        LUDO_SAFE_CELLS,

    homeYards:
        LUDO_HOME_YARDS,

    tokenSlots:
        LUDO_TOKEN_SLOTS,

    getCellType:
        getLudoCellType,

    getTrackIndex:
        getLudoTrackIndex,

    isTrackCell:
        isLudoTrackCell,

    isSafeCell:
        isLudoSafeCell,

    getStartPlayer:
        getLudoStartPlayer,

    getHomeLanePlayer:
        getLudoHomeLanePlayer,

    createBoard:
        createLudoBoard

};


/* =========================================================
   AUTO RENDER
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        const container =
            document.getElementById(
                "ludo-board"
            );


        if (container) {

            createLudoBoard(
                container
            );

        }

    }

);
/* =========================================================
   GHOPKHALI SPORTS ARENA
   ONLINE LUDO
   STEP 2 — TOKEN SYSTEM
========================================================= */

"use strict";


/* =========================================================
   BOARD CONSTANTS
========================================================= */

const LUDO_SIZE = 15;

const TOKEN_COUNT = 4;


/* =========================================================
   COLORS
========================================================= */

const LUDO_COLORS = {

    red: "#e53935",

    green: "#43a047",

    yellow: "#fbc02d",

    blue: "#1e88e5"

};


/* =========================================================
   PLAYER CONFIGURATION
========================================================= */

const LUDO_PLAYERS = {

    red: {

        name: "Player 1",

        color: "red",

        homeClass: "red-home",

        startIndex: 0

    },

    blue: {

        name: "Player 2",

        color: "blue",

        homeClass: "blue-home",

        startIndex: 39

    }

};


/* =========================================================
   STANDARD 52-CELL TRACK
========================================================= */

const LUDO_TRACK = [

    /* Red side */

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

    /* Green side */

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

    /* Yellow side */

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

    /* Blue side */

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
   TOKEN HOME SLOTS
========================================================= */

const LUDO_HOME_SLOTS = {

    red: [

        [2, 2],
        [2, 4],
        [4, 2],
        [4, 4]

    ],

    green: [

        [2, 10],
        [2, 12],
        [4, 10],
        [4, 12]

    ],

    yellow: [

        [10, 10],
        [10, 12],
        [12, 10],
        [12, 12]

    ],

    blue: [

        [10, 2],
        [10, 4],
        [12, 2],
        [12, 4]

    ]

};


/* =========================================================
   GAME BOARD STATE
   STEP 2 ONLY
========================================================= */

const ludoBoardState = {

    tokens: {

        red: [

            {
                id: "red-1",
                state: "home",
                position: -1
            },

            {
                id: "red-2",
                state: "home",
                position: -1
            },

            {
                id: "red-3",
                state: "home",
                position: -1
            },

            {
                id: "red-4",
                state: "home",
                position: -1
            }

        ],

        blue: [

            {
                id: "blue-1",
                state: "home",
                position: -1
            },

            {
                id: "blue-2",
                state: "home",
                position: -1
            },

            {
                id: "blue-3",
                state: "home",
                position: -1
            },

            {
                id: "blue-4",
                state: "home",
                position: -1
            }

        ]

    }

};


/* =========================================================
   UTILITY
========================================================= */

function cellKey(row, col) {

    return `${row}-${col}`;

}


/* =========================================================
   CREATE BOARD
========================================================= */

function createLudoBoard(container) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    const board =
        document.createElement("div");


    board.className =
        "ludo-board";


    board.setAttribute(
        "data-board",
        "ludo"
    );


    /* -----------------------------------------------------
       CREATE 15 × 15 CELLS
    ----------------------------------------------------- */

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


            cell.className =
                "cell";


            cell.dataset.row =
                row;


            cell.dataset.col =
                col;


            const type =
                getCellType(
                    row,
                    col
                );


            cell.classList.add(
                type
            );


            /* Safe cell */

            if (
                isSafeCell(
                    row,
                    col
                )
            ) {

                cell.classList.add(
                    "safe"
                );

            }


            /* Start cells */

            const startColor =
                getStartColor(
                    row,
                    col
                );


            if (startColor) {

                cell.classList.add(
                    `start-${startColor}`
                );

            }


            board.appendChild(
                cell
            );

        }

    }


    /* -----------------------------------------------------
       HOME YARDS
    ----------------------------------------------------- */

    createHomeYards(
        board
    );


    /* -----------------------------------------------------
       CENTER
    ----------------------------------------------------- */

    createHomeCenter(
        board
    );


    /* -----------------------------------------------------
       TOKEN LAYER
    ----------------------------------------------------- */

    const tokenLayer =
        document.createElement(
            "div"
        );


    tokenLayer.className =
        "token-layer";


    tokenLayer.id =
        "ludo-token-layer";


    board.appendChild(
        tokenLayer
    );


    container.appendChild(
        board
    );


    /* -----------------------------------------------------
       INITIAL TOKEN RENDER
    ----------------------------------------------------- */

    renderTokens();

}


/* =========================================================
   CELL TYPE
========================================================= */

function getCellType(row, col) {


    /* Red home */

    if (
        row < 6 &&
        col < 6
    ) {

        return "yard red-yard";

    }


    /* Green home */

    if (
        row < 6 &&
        col > 8
    ) {

        return "yard green-yard";

    }


    /* Yellow home */

    if (
        row > 8 &&
        col > 8
    ) {

        return "yard yellow-yard";

    }


    /* Blue home */

    if (
        row > 8 &&
        col < 6
    ) {

        return "yard blue-yard";

    }


    /* Center */

    if (
        row >= 6 &&
        row <= 8 &&
        col >= 6 &&
        col <= 8
    ) {

        return "center-cell";

    }


    /* Home lanes */

    for (
        const color of Object.keys(
            LUDO_HOME_LANES
        )
    ) {

        const lane =
            LUDO_HOME_LANES[
                color
            ];


        for (
            const coordinate of lane
        ) {

            if (
                coordinate[0] === row &&
                coordinate[1] === col
            ) {

                return `home-lane ${color}-lane`;

            }

        }

    }


    /* Track */

    return "track";

}


/* =========================================================
   SAFE CELL CHECK
========================================================= */

function isSafeCell(
    row,
    col
) {

    return LUDO_SAFE_CELLS.some(
        coordinate =>

            coordinate[0] === row &&
            coordinate[1] === col

    );

}


/* =========================================================
   START COLOR
========================================================= */

function getStartColor(
    row,
    col
) {

    const starts = {

        red: [6, 1],

        green: [1, 8],

        yellow: [8, 13],

        blue: [13, 6]

    };


    for (
        const color of Object.keys(
            starts
        )
    ) {

        if (

            starts[color][0] === row &&
            starts[color][1] === col

        ) {

            return color;

        }

    }


    return null;

}


/* =========================================================
   HOME YARDS
========================================================= */

function createHomeYards(
    board
) {


    const yards = [

        {
            color: "red",
            row: 0,
            col: 0
        },

        {
            color: "green",
            row: 0,
            col: 9
        },

        {
            color: "yellow",
            row: 9,
            col: 9
        },

        {
            color: "blue",
            row: 9,
            col: 0
        }

    ];


    yards.forEach(
        yardData => {


            const yard =
                document.createElement(
                    "div"
                );


            yard.className =
                `yard-overlay ${yardData.color}-yard-overlay`;


            yard.style.gridRow =
                `${yardData.row + 1} / span 6`;


            yard.style.gridColumn =
                `${yardData.col + 1} / span 6`;


            /* Inner yard */

            const inner =
                document.createElement(
                    "div"
                );


            inner.className =
                "yard-inner";


            /* Four token slots */

            const slots =
                LUDO_HOME_SLOTS[
                    yardData.color
                ];


            slots.forEach(
                (slot, index) => {


                    const tokenSlot =
                        document.createElement(
                            "div"
                        );


                    tokenSlot.className =
                        "token-slot";


                    tokenSlot.dataset.color =
                        yardData.color;


                    tokenSlot.dataset.slot =
                        index;


                    inner.appendChild(
                        tokenSlot
                    );

                }
            );


            yard.appendChild(
                inner
            );


            board.appendChild(
                yard
            );

        }
    );

}


/* =========================================================
   HOME CENTER
========================================================= */

function createHomeCenter(
    board
) {

    const center =
        document.createElement(
            "div"
        );


    center.className =
        "home-center";


    center.style.gridRow =
        "7 / span 3";


    center.style.gridColumn =
        "7 / span 3";


    const red =
        document.createElement(
            "div"
        );


    red.className =
        "center-triangle center-red";


    const green =
        document.createElement(
            "div"
        );


    green.className =
        "center-triangle center-green";


    const yellow =
        document.createElement(
            "div"
        );


    yellow.className =
        "center-triangle center-yellow";


    const blue =
        document.createElement(
            "div"
        );


    blue.className =
        "center-triangle center-blue";


    const star =
        document.createElement(
            "div"
        );


    star.className =
        "center-star";


    star.textContent =
        "★";


    center.appendChild(
        red
    );


    center.appendChild(
        green
    );


    center.appendChild(
        yellow
    );


    center.appendChild(
        blue
    );


    center.appendChild(
        star
    );


    board.appendChild(
        center
    );

}


/* =========================================================
   CREATE TOKEN ELEMENT
========================================================= */

function createTokenElement(
    token,
    color,
    index
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        `ludo-token token-${color}`;


    element.dataset.tokenId =
        token.id;


    element.dataset.color =
        color;


    element.dataset.index =
        index;


    element.setAttribute(
        "aria-label",
        `${color} token ${index + 1}`
    );


    /* Token inner circle */

    const inner =
        document.createElement(
            "div"
        );


    inner.className =
        "token-inner";


    /* Token number */

    const number =
        document.createElement(
            "span"
        );


    number.className =
        "token-number";


    number.textContent =
        index + 1;


    inner.appendChild(
        number
    );


    element.appendChild(
        inner
    );


    return element;

}


/* =========================================================
   RENDER TOKENS
========================================================= */

function renderTokens() {


    const layer =
        document.getElementById(
            "ludo-token-layer"
        );


    if (!layer) {

        return;

    }


    layer.innerHTML = "";


    Object.keys(
        ludoBoardState.tokens
    ).forEach(
        color => {


            ludoBoardState.tokens[
                color
            ].forEach(
                (
                    token,
                    index
                ) => {


                    const element =
                        createTokenElement(
                            token,
                            color,
                            index
                        );


                    positionToken(
                        element,
                        token,
                        color,
                        index
                    );


                    layer.appendChild(
                        element
                    );

                }
            );

        }
    );

}


/* =========================================================
   POSITION TOKEN
========================================================= */

function positionToken(
    element,
    token,
    color,
    index
) {


    /* -----------------------------------------------------
       TOKEN IN HOME YARD
    ----------------------------------------------------- */

    if (
        token.state ===
        "home"
    ) {

        const slot =
            LUDO_HOME_SLOTS[
                color
            ][index];


        const row =
            slot[0];


        const col =
            slot[1];


        element.style.gridRow =
            row + 1;


        element.style.gridColumn =
            col + 1;


        element.classList.add(
            "token-in-home"
        );


        return;

    }


    /* -----------------------------------------------------
       TOKEN ON TRACK
    ----------------------------------------------------- */

    if (
        token.state ===
        "track"
    ) {

        const coordinate =
            LUDO_TRACK[
                token.position
            ];


        if (!coordinate) {

            return;

        }


        element.style.gridRow =
            coordinate[0] + 1;


        element.style.gridColumn =
            coordinate[1] + 1;


        element.classList.add(
            "token-on-track"
        );


        return;

    }


    /* -----------------------------------------------------
       TOKEN IN HOME LANE
    ----------------------------------------------------- */

    if (
        token.state ===
        "lane"
    ) {

        const lane =
            LUDO_HOME_LANES[
                color
            ];


        const coordinate =
            lane[
                token.position
            ];


        if (!coordinate) {

            return;

        }


        element.style.gridRow =
            coordinate[0] + 1;


        element.style.gridColumn =
            coordinate[1] + 1;


        element.classList.add(
            "token-in-lane"
        );


        return;

    }


    /* -----------------------------------------------------
       TOKEN FINISHED
    ----------------------------------------------------- */

    if (
        token.state ===
        "finished"
    ) {

        element.style.gridRow =
            "8";


        element.style.gridColumn =
            "8";


        element.classList.add(
            "token-finished"
        );

    }

}


/* =========================================================
   PUBLIC TOKEN API
========================================================= */

function getLudoTokenState() {

    return structuredClone(
        ludoBoardState.tokens
    );

}


/* =========================================================
   MOVE TOKEN — PREPARATION ONLY
========================================================= */

function setLudoTokenPosition(
    color,
    tokenIndex,
    state,
    position
) {


    if (
        !ludoBoardState.tokens[
            color
        ]
    ) {

        return false;

    }


    if (
        !ludoBoardState.tokens[
            color
        ][tokenIndex]
    ) {

        return false;

    }


    ludoBoardState.tokens[
        color
    ][tokenIndex].state =
        state;


    ludoBoardState.tokens[
        color
    ][tokenIndex].position =
        position;


    renderTokens();


    return true;

}


/* =========================================================
   BOARD API
========================================================= */

window.LudoBoard = {

    create:
        createLudoBoard,

    renderTokens:
        renderTokens,

    getTokenState:
        getLudoTokenState,

    setTokenPosition:
        setLudoTokenPosition,

    track:
        LUDO_TRACK,

    homeLanes:
        LUDO_HOME_LANES,

    safeCells:
        LUDO_SAFE_CELLS,

    players:
        LUDO_PLAYERS

};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const board =
            document.getElementById(
                "ludo-board"
            );


        if (!board) {

            return;

        }


        createLudoBoard(
            board
        );

    }
);
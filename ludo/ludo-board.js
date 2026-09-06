/* =========================================================
   GHOPKHALI SPORTS ARENA
   ONLINE LUDO
   STEP 3 — TOKEN MOVEMENT ENGINE
========================================================= */

"use strict";


/* =========================================================
   CONSTANTS
========================================================= */

const LUDO_SIZE = 15;

const TOKEN_COUNT = 4;

const TRACK_LENGTH = 52;

const HOME_ENTRY_STEP = 51;

const FINISH_STEP = 57;


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
   PLAYER CONFIG
========================================================= */

const LUDO_PLAYERS = {

    red: {

        name: "Player 1",

        color: "red",

        startIndex: 0

    },

    blue: {

        name: "Player 2",

        color: "blue",

        startIndex: 39

    },

    green: {

        name: "Player 3",

        color: "green",

        startIndex: 13

    },

    yellow: {

        name: "Player 4",

        color: "yellow",

        startIndex: 26

    }

};

const ACTIVE_PLAYERS = [
    "red",
    "blue"
];

/* =========================================================
   52 CELL TRACK
========================================================= */

const LUDO_TRACK = [

    [6, 0],
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

    [7, 0]

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
   HOME SLOTS
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
   GAME STATE
========================================================= */

const ludoGameState = {

    currentPlayer: "red",

    dice: null,

    diceRolled: false,

    waitingForToken: false,

    gameStarted: false,

    winner: null,

    tokens: {

        red: createTokens("red"),

        blue: createTokens("blue"),

        green: createTokens("green"),

        yellow: createTokens("yellow")

    }

};


/* =========================================================
   CREATE TOKENS
========================================================= */

function createTokens(color) {

    return [

        createToken(
            `${color}-1`
        ),

        createToken(
            `${color}-2`
        ),

        createToken(
            `${color}-3`
        ),

        createToken(
            `${color}-4`
        )

    ];

}


function createToken(id) {

    return {

        id: id,

        state: "home",

        position: -1,

        progress: -1,

        finished: false

    };

}


/* =========================================================
   CELL KEY
========================================================= */

function cellKey(
    row,
    col
) {

    return `${row}-${col}`;

}


/* =========================================================
   CELL TYPE
========================================================= */

function getCellType(
    row,
    col
) {

    if (
        row < 6 &&
        col < 6
    ) {

        return "yard red-yard";

    }


    if (
        row < 6 &&
        col > 8
    ) {

        return "yard green-yard";

    }


    if (
        row > 8 &&
        col > 8
    ) {

        return "yard yellow-yard";

    }


    if (
        row > 8 &&
        col < 6
    ) {

        return "yard blue-yard";

    }


    if (
        row >= 6 &&
        row <= 8 &&
        col >= 6 &&
        col <= 8
    ) {

        return "center-cell";

    }


    for (
        const color of Object.keys(
            LUDO_HOME_LANES
        )
    ) {

        for (
            const coordinate
            of LUDO_HOME_LANES[color]
        ) {

            if (
                coordinate[0] === row &&
                coordinate[1] === col
            ) {

                return `home-lane ${color}-lane`;

            }

        }

    }


    return "track";

}


/* =========================================================
   SAFE CELL
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
   START CELL
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
   CREATE BOARD
========================================================= */

function createLudoBoard(
    container
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    const board =
        document.createElement(
            "div"
        );


    board.className =
        "ludo-board";


    board.setAttribute(
        "data-board",
        "ludo"
    );


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
                document.createElement(
                    "div"
                );


            cell.className =
                "cell";


            cell.dataset.row =
                row;


            cell.dataset.col =
                col;


            cell.classList.add(
                getCellType(
                    row,
                    col
                )
            );


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


    createHomeYards(
        board
    );


    createHomeCenter(
        board
    );


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


    renderTokens();

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


            const inner =
                document.createElement(
                    "div"
                );


            inner.className =
                "yard-inner";


            LUDO_HOME_SLOTS[
                yardData.color
            ].forEach(
                (
                    slot,
                    index
                ) => {

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
   CENTER
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


    [
        "red",
        "green",
        "yellow",
        "blue"
    ].forEach(
        color => {

            const triangle =
                document.createElement(
                    "div"
                );


            triangle.className =
                `center-triangle center-${color}`;


            center.appendChild(
                triangle
            );

        }
    );


    const star =
        document.createElement(
            "div"
        );


    star.className =
        "center-star";


    star.textContent =
        "★";


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
        "role",
        "button"
    );


    element.setAttribute(
        "aria-label",
        `${color} token ${index + 1}`
    );


    const inner =
        document.createElement(
            "div"
        );


    inner.className =
        "token-inner";


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
        ludoGameState.tokens
    ).forEach(
        color => {

            ludoGameState.tokens[
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


                    if (
                        isValidTokenChoice(
                            color,
                            index
                        )
                    ) {

                        element.classList.add(
                            "token-selectable"
                        );


                        element.addEventListener(
                            "click",
                            () => {

                                moveSelectedToken(
                                    color,
                                    index
                                );

                            }
                        );

                    }


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

    if (
        token.state ===
        "home"
    ) {

        const slot =
            LUDO_HOME_SLOTS[
                color
            ][index];


        element.style.gridRow =
            slot[0] + 1;


        element.style.gridColumn =
            slot[1] + 1;


        element.classList.add(
            "token-in-home"
        );


        return;

    }


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
   GET ABSOLUTE TRACK INDEX
========================================================= */

function getTrackIndex(
    color,
    progress
) {

    const player =
        LUDO_PLAYERS[color];

    if (!player) {
        return null;
    }

    if (
        progress < 0 ||
        progress >= TRACK_LENGTH
    ) {
        return null;
    }

    return (
        player.startIndex +
        progress
    ) % TRACK_LENGTH;

}

/* =========================================================
   GET TOKEN COORDINATE
========================================================= */

function getTokenCoordinate(
    color,
    token
) {

    if (
        token.state ===
        "track"
    ) {

        return LUDO_TRACK[
            token.position
        ];

    }


    if (
        token.state ===
        "lane"
    ) {

        return LUDO_HOME_LANES[
            color
        ][
            token.position
        ];

    }


    return null;

}


/* =========================================================
   CAN TOKEN LEAVE HOME?
========================================================= */

function canTokenLeaveHome(
    color,
    token,
    dice
) {

    if (
        token.state !==
        "home"
    ) {

        return false;

    }


    return dice === 6;

}


/* =========================================================
   CAN TOKEN MOVE?
========================================================= */

function canTokenMove(
    color,
    token,
    dice
) {

    if (
        !Number.isInteger(dice) ||
        dice < 1 ||
        dice > 6
    ) {
        return false;
    }


    if (
        !ACTIVE_PLAYERS.includes(color)
    ) {
        return false;
    }


    if (
        !token ||
        token.state === "finished"
    ) {
        return false;
    }


    /* -----------------------------------------
       TOKEN IN HOME
       Only 6 can bring token out
    ----------------------------------------- */

    if (
        token.state === "home"
    ) {

        return dice === 6;

    }


    /* -----------------------------------------
       TOKEN ON MAIN TRACK
    ----------------------------------------- */

    if (
        token.state === "track"
    ) {

        /*
         * Main track progress:
         *
         * 0 → starting cell
         * 0–51 → 52 main cells
         *
         * After the final main-track cell,
         * token enters its own home lane.
         */

        const targetProgress =
            token.progress + dice;


        /*
         * Maximum progress:
         *
         * 52–57 = six home-lane cells
         */

        return (
            targetProgress <= 57
        );

    }


    /* -----------------------------------------
       TOKEN IN HOME LANE
    ----------------------------------------- */

    if (
        token.state === "lane"
    ) {

        const targetPosition =
            token.position + dice;


        return (
            targetPosition <=
            HOME_LANE_LENGTH
        );

    }


    return false;

}

/* =========================================================
   GET VALID TOKENS
========================================================= */

function getValidTokens(
    color,
    dice
) {

    const tokens =
        ludoGameState.tokens[
            color
        ];


    const valid = [];


    tokens.forEach(
        (
            token,
            index
        ) => {

            if (
                canTokenMove(
                    color,
                    token,
                    dice
                )
            ) {

                valid.push(
                    index
                );

            }

        }
    );


    return valid;

}


/* =========================================================
   TOKEN CHOICE
========================================================= */

function isValidTokenChoice(
    color,
    index
) {

    if (
        ludoGameState.currentPlayer !==
        color
    ) {

        return false;

    }


    if (
        !ludoGameState.diceRolled
    ) {

        return false;

    }


    return getValidTokens(
        color,
        ludoGameState.dice
    ).includes(
        index
    );

}


/* =========================================================
   MOVE SELECTED TOKEN
========================================================= */

function moveSelectedToken(
    color,
    index
) {

    if (
        ludoGameState.currentPlayer !==
        color
    ) {

        return false;

    }


    if (
        !ludoGameState.diceRolled
    ) {

        return false;

    }


    const dice =
        ludoGameState.dice;


    const token =
        ludoGameState.tokens[
            color
        ][index];


    if (
        !canTokenMove(
            color,
            token,
            dice
        )
    ) {

        return false;

    }


    /* -----------------------------------------------------
       TOKEN FROM HOME
    ----------------------------------------------------- */

    if (
        token.state ===
        "home"
    ) {

        /*
         * Token can leave home only
         * when dice = 6.
         */

        token.state =
            "track";


        token.progress =
            0;


        token.position =
            LUDO_PLAYERS[
                color
            ].startIndex;

    }


    /* -----------------------------------------------------
       TOKEN ON TRACK
    ----------------------------------------------------- */

    else if (
        token.state ===
        "track"
    ) {

        const newProgress =
            token.progress +
            dice;


        /*
         * Token is still on
         * the main 52-cell track.
         */

        if (
            newProgress <
            HOME_ENTRY_STEP
        ) {

            token.progress =
                newProgress;


            token.position =
                getTrackIndex(
                    color,
                    newProgress
                );

        }


        /*
         * Token enters its
         * own home lane.
         */

        else {

            const lanePosition =
                newProgress -
                HOME_ENTRY_STEP;


            /*
             * Still inside home lane
             */

            if (
                lanePosition >= 0 &&
                lanePosition <
                LUDO_HOME_LANES[
                    color
                ].length
            ) {

                token.state =
                    "lane";


                token.progress =
                    newProgress;


                token.position =
                    lanePosition;

            }


            /*
             * Reached final home
             */

            else {

                token.state =
                    "finished";


                token.finished =
                    true;


                token.progress =
                    FINISH_STEP;


                token.position =
                    LUDO_HOME_LANES[
                        color
                    ].length;

            }

        }

    }


    /* -----------------------------------------------------
       TOKEN IN HOME LANE
    ----------------------------------------------------- */

    else if (
        token.state ===
        "lane"
    ) {

        const newPosition =
            token.position +
            dice;


        /*
         * Still inside home lane
         */

        if (
            newPosition <
            LUDO_HOME_LANES[
                color
            ].length
        ) {

            token.position =
                newPosition;


            token.progress =
                HOME_ENTRY_STEP +
                newPosition;

        }


        /*
         * Token reaches final home
         */

        else {

            token.state =
                "finished";


            token.finished =
                true;


            token.progress =
                FINISH_STEP;


            token.position =
                LUDO_HOME_LANES[
                    color
                ].length;

        }

    }


    /* -----------------------------------------------------
       AFTER MOVEMENT
    ----------------------------------------------------- */

    ludoGameState.diceRolled =
        false;


    ludoGameState.waitingForToken =
        false;


    /*
     * Capture opponent token
     * if landing on a non-safe cell.
     */

    handleCapture(
        color,
        token
    );


    /*
     * Check whether this player
     * has finished all tokens.
     */

    checkWinner(
        color
    );


    /*
     * Re-render board.
     */

    renderTokens();


    /* -----------------------------------------------------
       SIX = EXTRA TURN
    ----------------------------------------------------- */

    if (
        dice === 6 &&
        !ludoGameState.winner
    ) {

        ludoGameState.dice =
            null;


        ludoGameState.diceRolled =
            false;


        updateGameMessage(
            `${getPlayerName(color)} — ৬ এসেছে। অতিরিক্ত চাল।`
        );


        return true;

    }


    /* -----------------------------------------------------
       NORMAL TURN CHANGE
    ----------------------------------------------------- */

    if (
        !ludoGameState.winner
    ) {

        changeTurn();

    }


    return true;

}


/* =========================================================
   CAPTURE
========================================================= */

function handleCapture(
    movingColor,
    movingToken
) {

    const coordinate =
        getTokenCoordinate(
            movingColor,
            movingToken
        );


    if (!coordinate) {

        return;

    }


    if (
        isSafeCell(
            coordinate[0],
            coordinate[1]
        )
    ) {

        return;

    }


    ACTIVE_PLAYERS.forEach(color => {

            if (
                color ===
                movingColor
            ) {

                return;

            }


            ludoGameState.tokens[
                color
            ].forEach(
                opponent => {

                    const opponentCoordinate =
                        getTokenCoordinate(
                            color,
                            opponent
                        );


                    if (
                        !opponentCoordinate
                    ) {

                        return;

                    }


                    if (

                        opponentCoordinate[0] ===
                            coordinate[0] &&

                        opponentCoordinate[1] ===
                            coordinate[1]

                    ) {

                        opponent.state =
                            "home";


                        opponent.position =
                            -1;


                        opponent.progress =
                            -1;


                        opponent.finished =
                            false;

                    }

                }
            );

        }
    );

}


/* =========================================================
   CHECK WINNER
========================================================= */

function checkWinner(
    color
) {

    const tokens =
        ludoGameState.tokens[
            color
        ];


    const finishedCount =
        tokens.filter(
            token =>
                token.finished
        ).length;


    if (
        finishedCount ===
        TOKEN_COUNT
    ) {

        ludoGameState.winner =
            color;


        updateGameMessage(
            `🏆 ${getPlayerName(color)} বিজয়ী!`
        );

    }

}


/* =========================================================
   CHANGE TURN
========================================================= */

function changeTurn() {

    const order = ACTIVE_PLAYERS;

    const currentIndex =
        order.indexOf(
            ludoGameState.currentPlayer
        );

    const nextIndex =
        (currentIndex + 1) %
        order.length;

    ludoGameState.currentPlayer =
        order[nextIndex];

    ludoGameState.dice = null;

    ludoGameState.diceRolled = false;

    ludoGameState.waitingForToken = false;

    updateTurnUI();
}


/* =========================================================
   SET DICE RESULT
========================================================= */

function setDiceResult(
    result
) {

    /* -----------------------------------------------------
       GAME ALREADY FINISHED
    ----------------------------------------------------- */

    if (
        ludoGameState.winner
    ) {

        return false;

    }


    /* -----------------------------------------------------
       DICE ALREADY ROLLED
    ----------------------------------------------------- */

    if (
        ludoGameState.diceRolled
    ) {

        return false;

    }


    /* -----------------------------------------------------
       VALIDATE DICE
    ----------------------------------------------------- */

    if (
        !Number.isInteger(result) ||
        result < 1 ||
        result > 6
    ) {

        return false;

    }


    /* -----------------------------------------------------
       SAVE DICE RESULT
    ----------------------------------------------------- */

    ludoGameState.dice =
        result;


    ludoGameState.diceRolled =
        true;


    ludoGameState.gameStarted =
        true;


    ludoGameState.waitingForToken =
        false;


    const color =
        ludoGameState.currentPlayer;


    /* -----------------------------------------------------
       FIND VALID TOKENS
    ----------------------------------------------------- */

    const valid =
        getValidTokens(
            color,
            result
        );


    /* -----------------------------------------------------
       NO VALID MOVE
    ----------------------------------------------------- */

    if (
        valid.length === 0
    ) {

        updateGameMessage(
            `${getPlayerName(color)} — ${result} এসেছে, কোনো বৈধ চাল নেই।`
        );


        ludoGameState.waitingForToken =
            false;


        /*
         * No token can move.
         *
         * Even if dice = 6, there is
         * no playable token, so turn
         * moves to the next player.
         */

        setTimeout(
            () => {

                ludoGameState.dice =
                    null;


                ludoGameState.diceRolled =
                    false;


                ludoGameState.waitingForToken =
                    false;


                changeTurn();

            },
            800
        );


        return true;

    }


    /* -----------------------------------------------------
       VALID MOVE AVAILABLE
    ----------------------------------------------------- */

    ludoGameState.waitingForToken =
        true;


    /* -----------------------------------------------------
       ONLY ONE TOKEN CAN MOVE
    ----------------------------------------------------- */

    if (
        valid.length === 1
    ) {

        updateGameMessage(
            `${getPlayerName(color)} — Token চাল দেওয়ার জন্য প্রস্তুত।`
        );

    }


    /* -----------------------------------------------------
       MULTIPLE TOKENS CAN MOVE
    ----------------------------------------------------- */

    else {

        updateGameMessage(
            `${getPlayerName(color)} — চাল দেওয়ার জন্য একটি Token নির্বাচন করুন।`
        );

    }


    /* -----------------------------------------------------
       RENDER TOKEN STATES
    ----------------------------------------------------- */

    renderTokens();


    return true;

}


/* =========================================================
   PLAYER NAME
========================================================= */

function getPlayerName(
    color
) {

    return (
        LUDO_PLAYERS[
            color
        ]?.name ||
        color
    );

}


/* =========================================================
   UI TURN UPDATE
========================================================= */

function updateTurnUI() {

    const turnPlayer =
        document.getElementById(
            "turn-player"
        );


    const message =
        document.getElementById(
            "game-message"
        );


    if (
        turnPlayer
    ) {

        const color =
            ludoGameState.currentPlayer;


        const icons = {

            red: "🔴",

            blue: "🔵",

            green: "🟢",

            yellow: "🟡"

        };


        turnPlayer.textContent =
            `${icons[color]} ${getPlayerName(color)}`;

    }


    if (
        message &&
        !ludoGameState.diceRolled &&
        !ludoGameState.winner
    ) {

        message.textContent =
            `${getPlayerName(ludoGameState.currentPlayer)}-এর পালা। Dice Roll করুন।`;

    }


    updatePlayerCards();

}


/* =========================================================
   PLAYER CARDS
========================================================= */

function updatePlayerCards() {

    const cards = {

        red:
            document.getElementById(
                "player-red-card"
            ),

        blue:
            document.getElementById(
                "player-blue-card"
            )

    };


    Object.keys(cards).forEach(
        color => {

            if (
                !cards[color]
            ) {

                return;

            }


            cards[color].classList.toggle(
                "active",
                ludoGameState.currentPlayer ===
                    color
            );

        }
    );


    const redStatus =
        document.getElementById(
            "red-status"
        );


    const blueStatus =
        document.getElementById(
            "blue-status"
        );


    if (
        redStatus
    ) {

        redStatus.textContent =
            ludoGameState.currentPlayer ===
            "red"
                ? "আপনার পালা"
                : "অপেক্ষায়";

    }


    if (
        blueStatus
    ) {

        blueStatus.textContent =
            ludoGameState.currentPlayer ===
            "blue"
                ? "আপনার পালা"
                : "অপেক্ষায়";

    }


    updateTokenCounts();

}


/* =========================================================
   TOKEN COUNTS
========================================================= */

function updateTokenCounts() {

    const redCount =
        document.getElementById(
            "red-home-count"
        );


    const blueCount =
        document.getElementById(
            "blue-home-count"
        );


    if (
        redCount
    ) {

        redCount.textContent =
            ludoGameState.tokens.red
                .filter(
                    token =>
                        token.state ===
                        "home"
                )
                .length;

    }


    if (
        blueCount
    ) {

        blueCount.textContent =
            ludoGameState.tokens.blue
                .filter(
                    token =>
                        token.state ===
                        "home"
                )
                .length;

    }

}


/* =========================================================
   GAME MESSAGE
========================================================= */

function updateGameMessage(
    text
) {

    const message =
        document.getElementById(
            "game-message"
        );


    if (
        message
    ) {

        message.textContent =
            text;

    }

}


/* =========================================================
   PUBLIC API
========================================================= */

window.LudoBoard = {

    create:
        createLudoBoard,

    renderTokens:
        renderTokens,

    getState:
        () => structuredClone(
            ludoGameState
        ),

    setDice:
        setDiceResult,

    getValidTokens:
        getValidTokens,

    moveToken:
        moveSelectedToken,

    canMove:
        canTokenMove,

    getTrackIndex:
        getTrackIndex,

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


        updateTurnUI();

    }
);
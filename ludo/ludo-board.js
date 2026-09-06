/* =========================================================
   GHOPKHALI SPORTS ARENA
   ONLINE LUDO
   COMPLETE BOARD + TOKEN + DICE ENGINE
========================================================= */

console.log("LUDO JS FILE LOADED");

"use strict";


/* =========================================================
   CONSTANTS
========================================================= */

const LUDO_SIZE = 15;
const TOKEN_COUNT = 4;

const TRACK_LENGTH = 52;

/*
 * Progress:
 * 0 = starting cell
 * 0–50 = main track
 * 51–56 = home lane
 * 57 = finished
 */

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
   ACTIVE PLAYERS
========================================================= */

const ACTIVE_PLAYERS = [

    "red",
    "blue"

];


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


/* =========================================================
   52 CELL TRACK
========================================================= */

const LUDO_TRACK = [

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
   ANIMATION STATE
========================================================= */

let ludoAnimationRunning = false;


/* =========================================================
   CREATE TOKENS
========================================================= */

function createTokens(color) {

    return [

        createToken(`${color}-1`),
        createToken(`${color}-2`),
        createToken(`${color}-3`),
        createToken(`${color}-4`)

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
            const coordinate of
            LUDO_HOME_LANES[color]
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


    /* -----------------------------------------------------
       CREATE 15 × 15 GRID
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
                ...getCellType(
                    row,
                    col
                ).split(" ")
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


    /* -----------------------------------------------------
       CREATE ALL TOKEN ELEMENTS
    ----------------------------------------------------- */

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


                    tokenLayer.appendChild(
                        element
                    );

                }
            );

        }
    );


    board.appendChild(
        tokenLayer
    );


    container.appendChild(
        board
    );


    renderTokens();

}


/* =========================================================
   CREATE HOME YARDS
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
   CREATE CENTER
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


    element.dataset.tokenColor =
        color;


    element.dataset.tokenIndex =
        index;


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


    element.addEventListener(
        "click",
        handleTokenClick
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
   POSITION TOKEN
========================================================= */

function positionToken(
    element,
    token,
    color,
    index
) {

    element.classList.remove(

        "token-in-home",
        "token-on-track",
        "token-in-lane",
        "token-finished"

    );


    if (
        token.state ===
        "home"
    ) {

        const slot =
            LUDO_HOME_SLOTS[
                color
            ][index];


        if (!slot) {

            return;

        }


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
   RENDER TOKENS
========================================================= */

function renderTokens() {

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
                        document.querySelector(
                            `[data-token-color="${color}"][data-token-index="${index}"]`
                        );


                    if (!element) {

                        return;

                    }


                    positionToken(
                        element,
                        token,
                        color,
                        index
                    );


                    element.classList.remove(

                        "token-valid",
                        "token-disabled"

                    );


                    if (

                        color ===
                        ludoGameState.currentPlayer &&

                        ludoGameState.waitingForToken &&

                        isValidTokenChoice(
                            color,
                            index
                        )

                    ) {

                        element.classList.add(
                            "token-valid"
                        );

                    }


                    else if (

                        color ===
                        ludoGameState.currentPlayer &&

                        ludoGameState.waitingForToken

                    ) {

                        element.classList.add(
                            "token-disabled"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   GET ABSOLUTE TRACK INDEX
========================================================= */

function getTrackIndex(
    color,
    progress
) {

    const player =
        LUDO_PLAYERS[
            color
        ];


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
        !token
    ) {

        return null;

    }


    if (
        token.state ===
        "track"
    ) {

        return LUDO_TRACK[
            token.position
        ] || null;

    }


    if (
        token.state ===
        "lane"
    ) {

        return LUDO_HOME_LANES[
            color
        ][
            token.position
        ] || null;

    }


    return null;

}


/* =========================================================
   CAN TOKEN MOVE
========================================================= */

function canTokenMove(
    color,
    token,
    dice
) {

    if (
        !ACTIVE_PLAYERS.includes(
            color
        )
    ) {

        return false;

    }


    if (
        !token
    ) {

        return false;

    }


    if (
        !Number.isInteger(
            dice
        ) ||
        dice < 1 ||
        dice > 6
    ) {

        return false;

    }


    if (
        token.state ===
        "finished"
    ) {

        return false;

    }


    /* -----------------------------------------------------
       HOME
    ----------------------------------------------------- */

    if (
        token.state ===
        "home"
    ) {

        return dice === 6;

    }


    /* -----------------------------------------------------
       MAIN TRACK
    ----------------------------------------------------- */

    if (
        token.state ===
        "track"
    ) {

        return (
            token.progress +
            dice
        ) <= FINISH_STEP;

    }


    /* -----------------------------------------------------
       HOME LANE
    ----------------------------------------------------- */

    if (
        token.state ===
        "lane"
    ) {

        return (
            token.position +
            dice
        ) < LUDO_HOME_LANES[
            color
        ].length;

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


    if (!tokens) {

        return [];

    }


    return tokens
        .map(
            (
                token,
                index
            ) => {

                return canTokenMove(
                    color,
                    token,
                    dice
                )
                    ? index
                    : null;

            }
        )
        .filter(
            index =>
                index !== null
        );

}


/* =========================================================
   VALID TOKEN CHOICE
========================================================= */

function isValidTokenChoice(
    color,
    index
) {

    if (
        color !==
        ludoGameState.currentPlayer
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
   WAIT
========================================================= */

function waitForAnimation(
    milliseconds
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   ANIMATE MOVEMENT
========================================================= */

async function animateTokenMovement(
    color,
    index,
    fromProgress,
    toProgress
) {

    const token =
        ludoGameState.tokens[
            color
        ][index];


    if (!token) {

        return;

    }


    /*
     * HOME → START
     */

    if (
        fromProgress < 0 &&
        toProgress === 0
    ) {

        token.state =
            "track";


        token.progress =
            0;


        token.position =
            LUDO_PLAYERS[
                color
            ].startIndex;


        renderTokens();


        await waitForAnimation(
            180
        );


        return;

    }


    /*
     * NORMAL MOVEMENT
     */

    let currentProgress =
        fromProgress;


    const direction =
        toProgress >
        fromProgress
            ? 1
            : -1;


    while (
        currentProgress !==
        toProgress
    ) {

        currentProgress +=
            direction;


        if (
            currentProgress <
            0
        ) {

            continue;

        }


        if (
            currentProgress <
            HOME_ENTRY_STEP
        ) {

            token.state =
                "track";


            token.progress =
                currentProgress;


            token.position =
                getTrackIndex(
                    color,
                    currentProgress
                );

        }


        else if (
            currentProgress <
            FINISH_STEP
        ) {

            const lanePosition =
                currentProgress -
                HOME_ENTRY_STEP;


            token.state =
                "lane";


            token.progress =
                currentProgress;


            token.position =
                lanePosition;

        }


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


        renderTokens();


        await waitForAnimation(
            120
        );

    }

}


/* =========================================================
   MOVE SELECTED TOKEN
========================================================= */

async function moveSelectedToken(
    color,
    index
) {

    if (
        ludoAnimationRunning
    ) {

        return false;

    }


    if (
        color !==
        ludoGameState.currentPlayer
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


    if (!token) {

        return false;

    }


    if (
        !canTokenMove(
            color,
            token,
            dice
        )
    ) {

        return false;

    }


    ludoAnimationRunning =
        true;


    ludoGameState.waitingForToken =
        false;


    ludoGameState.diceRolled =
        false;


    const oldState =
        token.state;


    const oldProgress =
        token.progress;


    let finalProgress;


    /* -----------------------------------------------------
       HOME → START
    ----------------------------------------------------- */

    if (
        oldState ===
        "home"
    ) {

        finalProgress =
            0;

    }


    /* -----------------------------------------------------
       TRACK
    ----------------------------------------------------- */

    else if (
        oldState ===
        "track"
    ) {

        finalProgress =
            oldProgress +
            dice;

    }


    /* -----------------------------------------------------
       HOME LANE
    ----------------------------------------------------- */

    else {

        finalProgress =
            HOME_ENTRY_STEP +
            token.position +
            dice;

    }


    /*
     * Put token back at starting
     * position before animation.
     */

    token.state =
        oldState;


    token.progress =
        oldProgress;


    token.finished =
        false;


    if (
        oldState ===
        "home"
    ) {

        token.position =
            -1;

    }


    renderTokens();


    /*
     * Animate.
     */

    await animateTokenMovement(
        color,
        index,
        oldState === "home"
            ? -1
            : oldProgress,
        finalProgress
    );


    /*
     * Make sure final state
     * is correct.
     */

    if (
        finalProgress >=
        FINISH_STEP
    ) {

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


    renderTokens();


    /*
     * Capture
     */

    handleCapture(
        color,
        token
    );


    /*
     * Winner
     */

    checkWinner(
        color
    );


    /*
     * Animation finished.
     */

    ludoAnimationRunning =
        false;


    /*
     * Extra turn on 6.
     */

    if (
        dice === 6 &&
        !ludoGameState.winner
    ) {

        ludoGameState.dice =
            null;


        ludoGameState.diceRolled =
            false;


        ludoGameState.waitingForToken =
            false;


        updateGameMessage(
            `${getPlayerName(color)} — ৬ এসেছে। অতিরিক্ত চাল।`
        );


        renderTokens();


        return true;

    }


    /*
     * Next player.
     */

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


    ACTIVE_PLAYERS.forEach(
        color => {

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

                    if (
                        opponent.state ===
                        "home"
                    ) {

                        return;

                    }


                    if (
                        opponent.state ===
                        "finished"
                    ) {

                        return;

                    }


                    const opponentCoordinate =
                        getTokenCoordinate(
                            color,
                            opponent
                        );


                    if (!opponentCoordinate) {

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

    const currentIndex =
        ACTIVE_PLAYERS.indexOf(
            ludoGameState.currentPlayer
        );


    const nextIndex =
        (
            currentIndex + 1
        ) %
        ACTIVE_PLAYERS.length;


    ludoGameState.currentPlayer =
        ACTIVE_PLAYERS[
            nextIndex
        ];


    ludoGameState.dice =
        null;


    ludoGameState.diceRolled =
        false;


    ludoGameState.waitingForToken =
        false;


    updateTurnUI();


    renderTokens();

}


/* =========================================================
   SET DICE RESULT
========================================================= */

function setDiceResult(
    result
) {

    if (
        ludoAnimationRunning
    ) {

        return false;

    }


    if (
        ludoGameState.winner
    ) {

        return false;

    }


    if (
        ludoGameState.diceRolled
    ) {

        return false;

    }


    if (
        !Number.isInteger(
            result
        ) ||
        result < 1 ||
        result > 6
    ) {

        return false;

    }


    ludoGameState.dice =
        result;


    ludoGameState.diceRolled =
        true;


    ludoGameState.gameStarted =
        true;


    const color =
        ludoGameState.currentPlayer;


    const valid =
        getValidTokens(
            color,
            result
        );


    /*
     * No valid move.
     */

    if (
        valid.length === 0
    ) {

        ludoGameState.waitingForToken =
            false;


        updateGameMessage(
            `${getPlayerName(color)} — ${result} এসেছে, কোনো বৈধ চাল নেই।`
        );


        setTimeout(
            () => {

                if (
                    ludoGameState.winner
                ) {

                    return;

                }


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


    /*
     * Valid move exists.
     */

    ludoGameState.waitingForToken =
        true;


    if (
        valid.length === 1
    ) {

        updateGameMessage(
            `${getPlayerName(color)} — চলার জন্য Highlight হওয়া Token চাপুন।`
        );

    }

    else {

        updateGameMessage(
            `${getPlayerName(color)} — একটি Token নির্বাচন করুন।`
        );

    }


    renderTokens();


    return true;

}


/* =========================================================
   TOKEN CLICK
========================================================= */

function handleTokenClick(
    event
) {

    const element =
        event.currentTarget;


    const color =
        element.dataset.tokenColor;


    const index =
        Number(
            element.dataset.tokenIndex
        );


    if (
        ludoAnimationRunning
    ) {

        return;

    }


    if (
        color !==
        ludoGameState.currentPlayer
    ) {

        return;

    }


    if (
        !ludoGameState.diceRolled
    ) {

        return;

    }


    if (
        !ludoGameState.waitingForToken
    ) {

        return;

    }


    if (
        !isValidTokenChoice(
            color,
            index
        )
    ) {

        return;

    }


    moveSelectedToken(
        color,
        index
    );

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
   UPDATE TURN UI
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


    const color =
        ludoGameState.currentPlayer;


    const icons = {

        red: "🔴",
        blue: "🔵",
        green: "🟢",
        yellow: "🟡"

    };


    if (
        turnPlayer
    ) {

        turnPlayer.textContent =
            `${icons[color]} ${getPlayerName(color)}`;

    }


    if (
        message &&
        !ludoGameState.diceRolled &&
        !ludoGameState.winner &&
        !ludoAnimationRunning
    ) {

        message.textContent =
            `${getPlayerName(color)}-এর পালা। Dice Roll করুন।`;

    }


    updatePlayerCards();

}


/* =========================================================
   PLAYER CARDS
========================================================= */

function updatePlayerCards() {

    const redCard =
        document.getElementById(
            "player-red-card"
        );


    const blueCard =
        document.getElementById(
            "player-blue-card"
        );


    if (
        redCard
    ) {

        redCard.classList.toggle(
            "active",
            ludoGameState.currentPlayer ===
            "red"
        );

    }


    if (
        blueCard
    ) {

        blueCard.classList.toggle(
            "active",
            ludoGameState.currentPlayer ===
            "blue"
        );

    }


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
        () =>
            structuredClone(
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

    getTokenCoordinate:
        getTokenCoordinate,

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


        console.log(
            "Ghopkhali Sports Arena — Ludo Board Ready"
        );

    }
);

console.log("LUDO JS FILE LOADED");
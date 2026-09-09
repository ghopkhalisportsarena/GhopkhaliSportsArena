
"use strict";

const LUDO_SIZE = 15;
const TOKEN_COUNT = 4;
const TRACK_LENGTH = 52;
const HOME_LANE_LENGTH = 5;
const FINISH_STEP = 57;

const LUDO_PLAYERS = {
    red: {
        name: "লাল",
        className: "red"
    },

    green: {
        name: "সবুজ",
        className: "green"
    },

    yellow: {
        name: "হলুদ",
        className: "yellow"
    },

    blue: {
        name: "নীল",
        className: "blue"
    }
};

const ACTIVE_PLAYERS = [
    "red",
    "yellow"
];
const LUDO_TRACK = [
    [6,0],
    [6,1],
    [6,2],
    [6,3],
    [6,4],
    [6,5],

    [5,6],
    [4,6],
    [3,6],
    [2,6],
    [1,6],
    [0,6],

    [0,7],
    [0,8],

    [1,8],
    [2,8],
    [3,8],
    [4,8],
    [5,8],

    [6,9],
    [6,10],
    [6,11],
    [6,12],
    [6,13],
    [6,14],

    [7,14],
    [8,14]
];
LUDO_TRACK.push(
    [8,13],
    [8,12],
    [8,11],
    [8,10],
    [8,9],

    [9,8],
    [10,8],
    [11,8],
    [12,8],
    [13,8],
    [14,8],

    [14,7],
    [14,6],

    [13,6],
    [12,6],
    [11,6],
    [10,6],
    [9,6],

    [8,5],
    [8,4],
    [8,3],
    [8,2],
    [8,1],
    [8,0],

    [7,0]
);

const START_INDEX = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

const LUDO_HOME_LANES = {
    red: [
        [7,1],
        [7,2],
        [7,3],
        [7,4],
        [7,5]
    ],

    green: [
        [1,7],
        [2,7],
        [3,7],
        [4,7],
        [5,7]
    ],

    yellow: [
        [7,13],
        [7,12],
        [7,11],
        [7,10],
        [7,9]
    ],

    blue: [
        [13,7],
        [12,7],
        [11,7],
        [10,7],
        [9,7]
    ]
};

const LUDO_SAFE_CELLS = new Set([
    "6,0",
    "0,7",
    "0,8",
    "6,14",
    "8,14",
    "14,8",
    "14,6",
    "8,0"
]);const LUDO_HOME_SLOTS = {
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

function createTokens(color) {

    return Array.from(
        { length: TOKEN_COUNT },
        (_, index) => ({
            id: `${color}-${index + 1}`,
            color: color,
            state: "home",
            progress: -1,
            finished: false
        })
    );
}

const ludoGameState = {

    gameStarted: false,

    currentPlayer: ACTIVE_PLAYERS[0],

    dice: null,

    diceRolled: false,

    waitingForToken: false,

    winner: null,

    consecutiveSixes: 0,

    tokens: {

        red: createTokens("red"),

        green: createTokens("green"),

        yellow: createTokens("yellow"),

        blue: createTokens("blue")
    }
};function coordinateKey(row, col) {
    return `${row},${col}`;
}

function getPlayerName(color) {

    return (
        LUDO_PLAYERS[color]?.name ||
        color
    );
}

function getTrackIndex(color, token) {

    if (
        !token ||
        token.state !== "track"
    ) {
        return -1;
    }

    const start =
        START_INDEX[color];

    return (
        start +
        token.progress
    ) % TRACK_LENGTH;
}

function getTokenCoordinate(color, token) {

    if (!token) {
        return null;
    }

    if (token.state === "home") {
        return LUDO_HOME_SLOTS[color][
            Number(token.id.split("-")[1]) - 1
        ];
    }

    if (token.state === "finished") {

        const lane =
            LUDO_HOME_LANES[color];

        return lane[
            lane.length - 1
        ];
    }

    if (token.state === "home-lane") {

        const laneIndex =
            token.progress - 52;

        return (
            LUDO_HOME_LANES[color][
                laneIndex
            ] || null
        );
    }

    if (token.state === "track") {

        const index =
            getTrackIndex(
                color,
                token
            );

        return (
            LUDO_TRACK[index] ||
            null
        );
    }

    return null;
}function isSafeCell(row, col) {

    return LUDO_SAFE_CELLS.has(
        coordinateKey(row, col)
    );
}

function getStartColor(row, col) {

    for (const color of ACTIVE_PLAYERS) {

        const index =
            START_INDEX[color];

        const cell =
            LUDO_TRACK[index];

        if (
            cell &&
            cell[0] === row &&
            cell[1] === col
        ) {
            return color;
        }
    }

    return null;
}

function getCellType(row, col) {

    const key =
        coordinateKey(row, col);

    const trackIndex =
        LUDO_TRACK.findIndex(
            cell =>
                cell[0] === row &&
                cell[1] === col
        );

    if (trackIndex !== -1) {
        return "track-cell";
    }

    for (
        const color of
        Object.keys(LUDO_HOME_LANES)
    ) {

        const lane =
            LUDO_HOME_LANES[color];

        if (
            lane.some(
                cell =>
                    cell[0] === row &&
                    cell[1] === col
            )
        ) {

            return `home-lane ${color}-lane`;
        }
    }

    if (
        isSafeCell(row, col)
    ) {
        return "safe-cell";
    }

    return "empty-cell";
}function createTokenElement(
    token,
    color,
    index
) {

    const element =
        document.createElement("button");

    element.type = "button";

    element.className =
        `ludo-token token-${color}`;

    element.dataset.color =
        color;

    element.dataset.index =
        index;

    element.dataset.tokenId =
        token.id;

    element.setAttribute(
        "aria-label",
        `${getPlayerName(color)} টোকেন ${index + 1}`
    );

    element.textContent =
        index + 1;

    element.addEventListener(
        "click",
        () => {

            moveSelectedToken(
                color,
                index
            );
        }
    );

    return element;
}

function createLudoBoard(container) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const board =
        document.createElement("div");

    board.className =
        "ludo-board";

    board.dataset.board =
        "classic-ludo";

    board.setAttribute(
        "aria-label",
        "Ghopkhali Sports Arena Ludo Board"
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
                document.createElement("div");

            cell.className =
                "ludo-cell";

            cell.dataset.row =
                row;

            cell.dataset.col =
                col;

            cell.dataset.coordinate =
                coordinateKey(
                    row,
                    col
                );

            const type =
                getCellType(
                    row,
                    col
                );

            cell.classList.add(
                ...type.split(" ")
            );

            const startColor =
                getStartColor(
                    row,
                    col
                );

            if (startColor) {

                cell.classList.add(
                    "start-cell",
                    `start-${startColor}`
                );
            }

            if (
                isSafeCell(
                    row,
                    col
                )
            ) {

                const star =
                    document.createElement(
                        "span"
                    );

                star.className =
                    "safe-star";

                star.textContent =
                    "★";

                cell.appendChild(
                    star
                );
            }

            board.appendChild(
                cell
            );
        }
    }

    container.appendChild(
        board
    );
}function createHomeYards(board) {

    const yards = {

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

    Object.entries(yards).forEach(
        ([color, position]) => {

            const yard =
                document.createElement("div");

            yard.className =
                `ludo-yard yard-${color}`;

            yard.dataset.color =
                color;

            yard.style.gridRow =
                `${position.row + 1} / span 6`;

            yard.style.gridColumn =
                `${position.col + 1} / span 6`;

            const title =
                document.createElement("div");

            title.className =
                "yard-title";

            title.textContent =
                getPlayerName(color);

            yard.appendChild(title);

            const slots =
                document.createElement("div");

            slots.className =
                "yard-slots";

            LUDO_HOME_SLOTS[color].forEach(
                (_, index) => {

                    const slot =
                        document.createElement("div");

                    slot.className =
                        `yard-slot slot-${color}`;

                    slot.dataset.color =
                        color;

                    slot.dataset.index =
                        index;

                    slots.appendChild(slot);
                }
            );

            yard.appendChild(slots);

            board.appendChild(yard);
        }
    );
}

function createHomeCenter(board) {

    const center =
        document.createElement("div");

    center.className =
        "ludo-home-center";

    [
        "red",
        "green",
        "yellow",
        "blue"
    ].forEach(color => {

        const section =
            document.createElement("div");

        section.className =
            `center-${color}`;

        section.dataset.color =
            color;

        center.appendChild(
            section
        );
    });

    board.appendChild(center);
}function renderTokens() {

    const board =
        document.querySelector(".ludo-board");

    if (!board) {
        return;
    }

    let layer =
        document.getElementById(
            "ludo-token-layer"
        );

    if (!layer) {

        layer =
            document.createElement("div");

        layer.id =
            "ludo-token-layer";

        layer.className =
            "token-layer";

        board.appendChild(layer);
    }

    layer.innerHTML = "";

    Object.keys(
        ludoGameState.tokens
    ).forEach(color => {

        ludoGameState.tokens[color]
            .forEach((token, index) => {

                const element =
                    createTokenElement(
                        token,
                        color,
                        index
                    );

                const coordinate =
                    getTokenCoordinate(
                        color,
                        token
                    );

                if (!coordinate) {
                    return;
                }

                const row =
                    coordinate[0];

                const col =
                    coordinate[1];

                element.style.left =
                    `${((col + 0.5) / 15) * 100}%`;

                element.style.top =
                    `${((row + 0.5) / 15) * 100}%`;

                if (
                    token.finished
                ) {

                    element.classList.add(
                        "token-finished"
                    );
                }

                if (
                    color ===
                    ludoGameState.currentPlayer &&
                    ludoGameState.diceRolled &&
                    canTokenMove(
                        color,
                        token,
                        ludoGameState.dice
                    )
                ) {

                    element.classList.add(
                        "token-highlight"
                    );
                }

                layer.appendChild(
                    element
                );
            });
    });
}

function canTokenMove(color, token, dice) {

    if (!token) {
        return false;
    }

    if (!ACTIVE_PLAYERS.includes(color)) {
        return false;
    }

    if (!Number.isInteger(dice) || dice < 1 || dice > 6) {
        return false;
    }

    if (token.finished || token.state === "finished") {
        return false;
    }

    /*
     * HOME TOKEN
     * A token can leave home only with 6.
     */
    if (token.state === "home") {
        return dice === 6;
    }

    /*
     * MAIN TRACK + HOME LANE
     * Exact finish is required.
     */
    if (token.state === "track") {
        return token.progress + dice <= FINISH_STEP;
    }

    if (token.state === "home-lane") {
        return token.progress + dice <= FINISH_STEP;
    }

    return false;
}

function getValidTokens(color, dice) {

    if (!Number.isInteger(dice)) {
        return [];
    }

    const tokens =
        ludoGameState.tokens[color];

    if (!tokens) {
        return [];
    }

    return tokens
        .map((token, index) => ({
            token,
            index
        }))
        .filter(item =>
            canTokenMove(
                color,
                item.token,
                dice
            )
        );
}function rollDice() {

    if (
        ludoGameState.diceRolled ||
        ludoGameState.winner
    ) {
        return null;
    }

    const color =
        ludoGameState.currentPlayer;

    if (!ACTIVE_PLAYERS.includes(color)) {
        return null;
    }

    const dice =
        Math.floor(
            Math.random() * 6
        ) + 1;

    ludoGameState.dice =
        dice;

    ludoGameState.diceRolled =
        true;

    ludoGameState.waitingForToken =
        false;

    ludoGameState.gameStarted =
        true;

    if (dice === 6) {

        ludoGameState.consecutiveSixes++;

    } else {

        ludoGameState.consecutiveSixes = 0;
    }

    /*
     * Three consecutive sixes:
     * Current player's turn is cancelled.
     */

    if (
        ludoGameState.consecutiveSixes >= 3
    ) {

        ludoGameState.diceRolled =
            false;

        ludoGameState.waitingForToken =
            false;

        ludoGameState.dice =
            null;

        ludoGameState.consecutiveSixes =
            0;

        changeTurn();

        return null;
    }

    const validTokens =
        getValidTokens(
            color,
            dice
        );

    if (validTokens.length === 0) {

        ludoGameState.diceRolled =
            false;

        ludoGameState.waitingForToken =
            false;

        if (dice !== 6) {
            changeTurn();
        }

        return dice;
    }

    ludoGameState.waitingForToken =
        true;

    renderTokens();

    return dice;
}

function changeTurn() {

    const currentIndex =
        ACTIVE_PLAYERS.indexOf(
            ludoGameState.currentPlayer
        );

    const nextIndex =
        (
            currentIndex + 1
        ) % ACTIVE_PLAYERS.length;

    ludoGameState.currentPlayer =
        ACTIVE_PLAYERS[nextIndex];

    ludoGameState.dice =
        null;

    ludoGameState.diceRolled =
        false;

    ludoGameState.waitingForToken =
        false;

    ludoGameState.consecutiveSixes =
        0;

    renderTokens();
}async function moveSelectedToken(color, index) {

    if (
        ludoGameState.winner ||
        !ludoGameState.diceRolled ||
        !ludoGameState.waitingForToken
    ) {
        return false;
    }

    if (
        color !==
        ludoGameState.currentPlayer
    ) {
        return false;
    }

    const token =
        ludoGameState.tokens[color]?.[index];

    if (!token) {
        return false;
    }

    const dice =
        ludoGameState.dice;

    if (
        !canTokenMove(
            color,
            token,
            dice
        )
    ) {
        return false;
    }

    ludoGameState.waitingForToken =
        false;

    ludoGameState.diceRolled =
        false;

    const oldProgress =
        token.progress;

    /*
     * HOME → TRACK
     */

    if (
        token.state === "home"
    ) {

        token.state =
            "track";

        token.progress =
            0;

    } else {

        const newProgress =
            token.progress + dice;

        /*
         * TRACK → HOME LANE
         */

        if (
            token.state === "track" &&
            newProgress >= 52
        ) {

            token.state =
                "home-lane";

            token.progress =
                newProgress;

        } else {

            token.progress =
                newProgress;
        }
    }

    /*
     * FINISH
     */

    if (
        token.progress >=
        FINISH_STEP
    ) {

        token.progress =
            FINISH_STEP;

        token.state =
            "finished";

        token.finished =
            true;
    }

    renderTokens();

    /*
     * CAPTURE
     */

    const captured =
        handleCapture(
            color,
            token
        );

    renderTokens();

    /*
     * WINNER CHECK
     */

    if (
        checkWinner(color)
    ) {

        return true;
    }

    /*
     * EXTRA TURN
     *
     * 6 অথবা capture হলে
     * একই player আবার খেলবে।
     */

    if (
        dice === 6 ||
        captured
    ) {

        ludoGameState.dice =
            null;

        ludoGameState.diceRolled =
            false;

        ludoGameState.waitingForToken =
            false;

        renderTokens();

        return true;
    }

    /*
     * NORMAL TURN CHANGE
     */

    changeTurn();

    return true;
}function handleCapture(color, movedToken) {

    if (!movedToken || movedToken.state !== "track") {
        return false;
    }

    const coordinate =
        getTokenCoordinate(
            color,
            movedToken
        );

    if (!coordinate) {
        return false;
    }

    const row = coordinate[0];
    const col = coordinate[1];

    /*
     * Safe cells cannot be captured.
     */
    if (isSafeCell(row, col)) {
        return false;
    }

    const opponents = [];

    Object.keys(ludoGameState.tokens).forEach(opponentColor => {

        if (
            opponentColor === color ||
            !ACTIVE_PLAYERS.includes(opponentColor)
        ) {
            return;
        }

        ludoGameState.tokens[opponentColor].forEach(opponentToken => {

            if (opponentToken.state !== "track") {
                return;
            }

            const opponentCoordinate =
                getTokenCoordinate(
                    opponentColor,
                    opponentToken
                );

            if (
                opponentCoordinate &&
                opponentCoordinate[0] === row &&
                opponentCoordinate[1] === col
            ) {
                opponents.push(opponentToken);
            }
        });
    });

    /*
     * No opponent on this cell.
     */
    if (opponents.length === 0) {
        return false;
    }

    /*
     * Two or more opponent tokens form
     * a blockade.
     */
    if (opponents.length >= 2) {
        return false;
    }

    /*
     * Capture the single opponent token.
     */
    const capturedToken = opponents[0];

    capturedToken.state = "home";
    capturedToken.progress = -1;
    capturedToken.finished = false;

    return true;
}

function checkWinner(color) {

    const tokens =
        ludoGameState.tokens[color];

    if (!tokens) {
        return false;
    }

    const finishedCount =
        tokens.filter(
            token =>
                token.finished
        ).length;

    if (
        finishedCount !== TOKEN_COUNT
    ) {
        return false;
    }

    ludoGameState.winner =
        color;

    ludoGameState.dice =
        null;

    ludoGameState.diceRolled =
        false;

    ludoGameState.waitingForToken =
        false;

    renderTokens();

    return true;
}function resetGame() {

    ludoGameState.gameStarted =
        false;

    ludoGameState.currentPlayer =
        ACTIVE_PLAYERS[0];

    ludoGameState.dice =
        null;

    ludoGameState.diceRolled =
        false;

    ludoGameState.waitingForToken =
        false;

    ludoGameState.winner =
        null;

    ludoGameState.consecutiveSixes =
        0;

    Object.keys(
        ludoGameState.tokens
    ).forEach(color => {

        ludoGameState.tokens[color] =
            createTokens(color);
    });

    renderTokens();
}

function newGame() {

    resetGame();

    return getGameState();
}

function getGameState() {

    return JSON.parse(
        JSON.stringify(
            ludoGameState
        )
    );
}

function initializeLudoBoard(container) {

    if (!container) {
        return null;
    }

    container.innerHTML = "";

    const board =
        document.createElement("div");

    board.className =
        "ludo-board";

    board.dataset.board =
        "classic-ludo";

    board.setAttribute(
        "aria-label",
        "Ghopkhali Sports Arena Ludo Board"
    );

    /*
     * Create 15 × 15 cells
     */

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
                "ludo-cell";

            cell.dataset.row =
                row;

            cell.dataset.col =
                col;

            cell.dataset.coordinate =
                coordinateKey(
                    row,
                    col
                );

            const type =
                getCellType(
                    row,
                    col
                );

            cell.classList.add(
                ...type.split(" ")
            );

            const startColor =
                getStartColor(
                    row,
                    col
                );

            if (startColor) {

                cell.classList.add(
                    "start-cell",
                    `start-${startColor}`
                );
            }

            if (
                isSafeCell(
                    row,
                    col
                )
            ) {

                const star =
                    document.createElement(
                        "span"
                    );

                star.className =
                    "safe-star";

                star.textContent =
                    "★";

                cell.appendChild(
                    star
                );
            }

            board.appendChild(
                cell
            );
        }
    }

    /*
     * Home yards
     */

    createHomeYards(board);

    /*
     * Center finish area
     */

    createHomeCenter(board);

    container.appendChild(
        board
    );

    renderTokens();

    return board;
}

/*
 * Public Ludo API
 */

window.LudoBoard = {

    create:
        initializeLudoBoard,

    renderTokens:
        renderTokens,

    getState:
        getGameState,

    setDice:
        setDiceResult,

    rollDice:
        rollDice,

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

    reset:
        resetGame,

    newGame:
        newGame,

    track:
        LUDO_TRACK,

    homeLanes:
        LUDO_HOME_LANES,

    safeCells:
        LUDO_SAFE_CELLS,

    players:
        LUDO_PLAYERS
};

console.log(
    "GSA LUDO BOARD ENGINE LOADED"
);

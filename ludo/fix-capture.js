const fs = require("fs");

const file = "ludo-board.js";
let s = fs.readFileSync(file, "utf8");

const start = s.indexOf("function handleCapture(");
const end = s.indexOf("function checkWinner(", start);

if (start === -1 || end === -1) {
    console.log("handleCapture() section not found.");
    process.exit(1);
}

const newFunction = `function handleCapture(color, movedToken) {

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

`;

fs.writeFileSync(
    file,
    s.slice(0, start) +
    newFunction +
    s.slice(end)
);

console.log("handleCapture() replaced successfully.");

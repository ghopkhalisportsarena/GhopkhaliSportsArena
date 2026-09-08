const fs = require("fs");

const file = "ludo-board.js";
let s = fs.readFileSync(file, "utf8");

const start = s.indexOf("function canTokenMove(");
const end = s.indexOf("\nfunction getValidTokens", start);

if (start === -1 || end === -1) {
    console.log("ERROR: canTokenMove function not found.");
    process.exit(1);
}

const newFunction = `function canTokenMove(color, token, dice) {

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
`;

s = s.slice(0, start) + newFunction + s.slice(end);

fs.writeFileSync(file, s);

console.log("canTokenMove() fixed successfully.");

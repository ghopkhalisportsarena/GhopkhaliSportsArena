const fs = require("fs");

const file = "ludo-board.js";
let s = fs.readFileSync(file, "utf8");

const start = s.indexOf("function canTokenMove(");
const end = s.indexOf("\nfunction getValidTokens", start);

if (start === -1 || end === -1) {
    console.log("ERROR: canTokenMove() not found.");
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
     * Token can leave home only with 6.
     */
    if (token.state === "home") {
        return dice === 6;
    }

    /*
     * HOME LANE
     * Exact finish is required.
     */
    if (token.state === "home-lane") {
        return token.progress + dice <= FINISH_STEP;
    }

    /*
     * MAIN TRACK
     */
    if (token.state === "track") {

        const targetProgress =
            token.progress + dice;

        /*
         * Cannot overshoot the finish.
         */
        if (targetProgress > FINISH_STEP) {
            return false;
        }

        /*
         * Check every main-track cell crossed
         * by this move.
         */
        const startProgress =
            token.progress;

        const stepsOnTrack =
            Math.min(
                dice,
                51 - startProgress
            );

        for (
            let step = 1;
            step <= stepsOnTrack;
            step++
        ) {

            const progress =
                startProgress + step;

            const trackIndex =
                (
                    START_INDEX[color] +
                    progress
                ) % TRACK_LENGTH;

            const coordinate =
                LUDO_TRACK[trackIndex];

            if (!coordinate) {
                continue;
            }

            const row =
                coordinate[0];

            const col =
                coordinate[1];

            /*
             * Count opponent tokens
             * on this track cell.
             */
            let opponentCount = 0;

            Object.keys(
                ludoGameState.tokens
            ).forEach(opponentColor => {

                if (
                    opponentColor === color ||
                    !ACTIVE_PLAYERS.includes(
                        opponentColor
                    )
                ) {
                    return;
                }

                ludoGameState.tokens[
                    opponentColor
                ].forEach(opponentToken => {

                    if (
                        opponentToken.state !==
                        "track"
                    ) {
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
                        opponentCount++;
                    }
                });
            });

            /*
             * Two or more opponent tokens
             * create a blockade.
             *
             * A token cannot enter or cross
             * that blockade.
             */
            if (opponentCount >= 2) {
                return false;
            }
        }

        return true;
    }

    return false;
}
`;

s =
    s.slice(0, start) +
    newFunction +
    s.slice(end);

fs.writeFileSync(file, s);

console.log("Blockade movement rule added successfully.");

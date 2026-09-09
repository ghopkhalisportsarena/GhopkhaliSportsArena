const COLORS={
red:{name:"Red",className:"red"},
green:{name:"Green",className:"green"},
yellow:{name:"Yellow",className:"yellow"},
blue:{name:"Blue",className:"blue"}
};

const PLAYERS=["red","green","yellow","blue"];

const STARTS={
red:[6,1],green:[1,8],yellow:[8,13],blue:[13,6]
};

let game={
turn:0,
dice:0,
tokens:{
red:[-1,-1,-1,-1],
green:[-1,-1,-1,-1],
yellow:[-1,-1,-1,-1],
blue:[-1,-1,-1,-1]
}
};

const track=[
[6,1],[5,1],[4,1],[3,1],[2,1],[1,1],
[1,2],[1,3],[1,4],[1,5],[1,6],
[2,6],[3,6],[4,6],[5,6],[6,6],
[6,7],[6,8],[6,9],[6,10],[6,11],
[5,11],[4,11],[3,11],[2,11],[1,11],
[1,12],[1,13],[2,13],[3,13],[4,13],[5,13],
[6,13],[7,13],[8,13],
[8,12],[8,11],[8,10],[8,9],[8,8],
[9,8],[10,8],[11,8],[12,8],[13,8],
[13,9],[13,10],[13,11],[13,12],[13,13],
[13,14],[12,14],[11,14],[10,14],[9,14],[8,14],
[8,13],[8,12]
];

function createBoard(target){
    target.innerHTML="";
    target.className="board";

    for(let r=0;r<15;r++){
        for(let c=0;c<15;c++){

            const cell=document.createElement("div");
            cell.className="cell";

            if(r<6&&c<6) cell.classList.add("home-red");
            if(r<6&&c>8) cell.classList.add("home-green");
            if(r>8&&c>8) cell.classList.add("home-yellow");
            if(r>8&&c<6) cell.classList.add("home-blue");

            if(r===7&&c===7){
                cell.classList.add("center");
            }

            const index=track.findIndex(x=>x[0]===r&&x[1]===c);

            if(index>=0){
                cell.className="cell track";

                if(index%13===0)
                    cell.classList.add("safe");

                if(index===0)cell.classList.add("start-red");
                if(index===13)cell.classList.add("start-green");
                if(index===26)cell.classList.add("start-yellow");
                if(index===39)cell.classList.add("start-blue");

                cell.dataset.track=index;
            }

            target.appendChild(cell);
        }
    }
}

function drawTokens(target){
    target.querySelectorAll(".token").forEach(x=>x.remove());

    PLAYERS.forEach((color,playerIndex)=>{
        game.tokens[color].forEach((pos,tokenIndex)=>{

            if(pos<0)return;

            const cell=track[pos];
            if(!cell)return;

            const index=cell[0]*15+cell[1];
            const boardCell=target.children[index];

            if(!boardCell)return;

            const token=document.createElement("div");
            token.className="token "+color;
            token.title=color+" token "+(tokenIndex+1);

            boardCell.appendChild(token);
        });
    });
}

function renderGame(target,turnElement,diceElement){

    createBoard(target);
    drawTokens(target);

    const player=PLAYERS[game.turn];

    if(turnElement)
        turnElement.textContent=COLORS[player].name+"'s turn";

    if(diceElement)
        diceElement.textContent=game.dice||"Roll";
}

function rollDice(target,turnElement,diceElement){

    if(game.dice!==0)return;

    game.dice=Math.floor(Math.random()*6)+1;

    renderGame(target,turnElement,diceElement);

    setTimeout(()=>{

        if(game.dice!==6){
            game.turn=(game.turn+1)%4;
        }

        game.dice=0;

        renderGame(target,turnElement,diceElement);

    },900);
}

window.LudoV12={
    game,
    renderGame,
    rollDice
};

import { Board } from "./game";

export default function mcts(){

}


class Node{
    private wins: number;
    private visits: number;
    private nodes: Map<string, Map<string,Node>>;
    constructor(){
        this.wins = 0;
        this.visits = 0;
        this.nodes = new Map();
    }

    private simulate(board:Board){
        const posibleMoves:Array<[x:number,y:number]> = []
        board.getHorizontals().forEach((row, i) => {
            row.forEach((cell, j) => {
                if(cell === 0){
                    posibleMoves.push([i,j]);
                }
            });
        });

        board.getVerticals().forEach((row, i) => {
            row.forEach((cell, j) => {
                if(cell === 0){
                    posibleMoves.push([j,i]);
                }
            });
        });


        for(let i = 0; i < 100; i++){
            const move = posibleMoves[Math.floor(Math.random() * posibleMoves.length)];
        }

    }
}
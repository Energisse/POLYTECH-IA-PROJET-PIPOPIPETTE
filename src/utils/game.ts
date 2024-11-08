import { Board } from "./board";
import { Player } from "./player";
export default class Game extends EventTarget {
  private board: Board;
  private players: [Player, Player];

  constructor(size: number, player1: Player, player2: Player) {
    super();
    this.board = new Board(size);
    this.players = [player1, player2];
    this.play();
  }

  getBoard() {
    return this.board;
  }

  private async play() {
    while (!this.board.isFinished()) {
      await this.players[this.board.getTour()].play(this.board, this.board.getTour()).then((coup) => {
        const newBoard = this.board.play(coup.orientation, coup.x, coup.y)
        if (newBoard) {
          this.board = newBoard;
          this.dispatchEvent(new CustomEvent("played", {
            detail: {
              played: {
                x: coup.x, y: coup.y, orientation: coup.orientation, player: newBoard.previousBoard!.tour
              },
              board: {
                verticals: this.board.getVerticals(),
                horizontals: this.board.getHorizontals(),
                cells: this.board.getCells(),
                score: this.board.getScore(),
                player: this.board.getTour()
              }
            }
          }));
        }
      });
    }
    const [player1, player2] = this.board.getScore();

    this.dispatchEvent(new CustomEvent("end", {
      detail: {
        winner: player1 > player2 ? 0 : player1 < player2 ? 1 : -1
      }
    }));
  }

  public async start() {
    await this.play();
  }
}

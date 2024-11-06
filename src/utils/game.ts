import { Board } from "./board";
import { Player } from "./players/Player";
export default class Game extends EventTarget {
  private board: Board;
  private players: [Player, Player];
  private playing: boolean = false;

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
    if (this.playing) return;
    this.playing = true;
    while (!this.board.isFinished()) {
      await this.players[this.board.tour].play(this.board, this.board.tour).then((coup) => {
        const newBoard = this.board.play(coup.orientation, coup.x, coup.y)
        if (newBoard) {
          this.board = newBoard;
          this.dispatchEvent(new CustomEvent("played", {
            detail: {
              played: {
                x: coup.x, y: coup.y, orientation: coup.orientation, player: newBoard.previousBoard!.tour
              },
              board: this.board
            }
          }));
        }
      });
    }
    const [player1, player2] = this.board.score

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

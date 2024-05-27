import { Player } from "./player";

export default class Game extends EventTarget {
  readonly board: Board;
  private players: [Player, Player];

  constructor(size: number, player1: Player, player2: Player) {
    super();
    this.board = new Board(size);
    this.players = [player1, player2];
    this.play();
  }

  public async play() {
    await this.players[this.board.getTour() - 1].play(this.board, this.board.getTour() - 1).then((coup) => {
      this.board.play(coup.orientation, coup.x, coup.y);
      if (!this.board.isFinished()) this.play();
    });
  }
}

export class Board extends EventTarget {
  private cells: number[][] = [];
  private verticals: number[][] = [];
  private horizontals: number[][] = [];

  private score: [number, number] = [0, 0];

  private tour: number = 1;

  constructor(size: number);
  constructor(board: { cells: number[][]; verticals: number[][]; horizontals: number[][]; score: [number, number]; tour: number });
  constructor(BoardOrSize: number | { cells: number[][]; verticals: number[][]; horizontals: number[][]; score: [number, number]; tour: number }) {
    super();
    if (typeof BoardOrSize === "number") {
      this.cells = new Array(BoardOrSize).fill(0).map(() => new Array(BoardOrSize).fill(0));
      this.verticals = new Array(BoardOrSize)
        .fill(0)
        .map(() => new Array(BoardOrSize + 1).fill(0));
      this.horizontals = new Array(BoardOrSize + 1)
        .fill(0)
        .map(() => new Array(BoardOrSize).fill(0));
      this.score = [0, 0];
      this.tour = 1;
    } else {
      this.cells = BoardOrSize.cells;
      this.verticals = BoardOrSize.verticals;
      this.horizontals = BoardOrSize.horizontals;
      this.score = BoardOrSize.score;
      this.tour = BoardOrSize.tour;
    }
  }

  public getCells(): number[][] {
    return this.cells;
  }

  public getVerticals(): number[][] {
    return this.verticals;
  }

  public getHorizontals(): number[][] {
    return this.horizontals;
  }

  public getScore(): [number, number] {
    return this.score;
  }

  public getTour(): number {
    return this.tour;
  }

  public play(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ): void {
    if (orientation === "vertical") {
      if (this.verticals[y][x] !== 0) return;
      this.verticals[y][x] = this.tour;
    } else {
      if (this.horizontals[y][x] !== 0) return;
      this.horizontals[y][x] = this.tour;
    }

    const cells: Array<[x: number, y: number]> = [];

    if (orientation === "horizontal") {
      let result = this.check(x, y);
      if (result) cells.push(result);
      result = this.check(x, y - 1);
      if (result) cells.push(result);
    } else {
      let result = this.check(x, y);
      if (result) cells.push(result);
      result = this.check(x - 1, y);
      if (result) cells.push(result);
    }

    if (!cells.length) {
      this.tour = this.tour === 1 ? 2 : 1;
    } else {
      this.score[this.tour - 1] += cells.length;

      cells.forEach((cell) => {
        this.cells[cell[1]][cell[0]] = this.tour;
      });
    }

    this.dispatchEvent(
      new CustomEvent("boardChange", {
        detail: {
          verticals: this.verticals,
          horizontals: this.horizontals,
          cells: this.cells,
          score: this.score,
        },
      })
    );


    if (this.isFinished()) {
      const winner = this.score[0] === this.score[1] ? 0 : this.score[0] > this.score[1] ? 1 : 2;
      this.dispatchEvent(new CustomEvent("end", { detail: { winner } }));
    }
  }

  public isFinished() {
    return this.score[0] > this.cells.length ** 2 / 2 || this.score[1] > this.cells.length ** 2 / 2 || this.score[0] + this.score[1] === this.cells.length ** 2;
  }

  private check(x: number, y: number): false | [x: number, y: number] {
    if (x < 0 || x >= this.cells.length || y < 0 || y >= this.cells.length) {
      return false;
    }
    if (
      this.verticals[y][x] &&
      this.verticals[y][x + 1] &&
      this.horizontals[y][x] &&
      this.horizontals[y + 1]?.[x]
    ) {
      return [x, y];
    }
    return false;
  }

  public evaluation(idPlayer: number) {
    return this.score[idPlayer] - this.score[(idPlayer + 1) % 2];
  }

  public copy() {
    const board = new Board(this.cells.length);
    board.cells = this.cells.map((row) => [...row]);
    board.verticals = this.verticals.map((row) => [...row]);
    board.horizontals = this.horizontals.map((row) => [...row]);
    board.score = [...this.score];
    board.tour = this.tour;
    return board;
  }

  private *getNodesVertical(): Generator<
    {
      x: number;
      y: number;
      board: Board;
      orientation: "vertical" | "horizontal";
    },
    void,
    void
  > {
    const playable = this.verticals
      .flatMap((row, y) => row.map((value, x) => ({ x, y, value })))
      .filter(({ value }) => value === 0);

    while (playable.length > 0) {
      const { x, y } = playable.splice(
        Math.floor(Math.random() * playable.length),
        1
      )[0];
      const board = this.copy();
      const lastTour = board.tour;
      board.play("vertical", x, y);
      if (board.tour === lastTour && !board.isFinished()) {
        for (const node of board.getNodes()) {
          yield { ...node, x, y, orientation: "vertical" };
        }
      } else yield { x, y, board, orientation: "vertical" };
    }
  }

  private *getNodesHorizontal(): Generator<
    {
      x: number;
      y: number;
      board: Board;
      orientation: "vertical" | "horizontal";
    },
    void,
    void
  > {
    const playable = this.horizontals
      .flatMap((row, y) => row.map((value, x) => ({ x, y, value })))
      .filter(({ value }) => value === 0);

    while (playable.length > 0) {
      const { x, y } = playable.splice(
        Math.floor(Math.random() * playable.length),
        1
      )[0];
      const board = this.copy();
      const lastTour = board.tour;
      board.play("horizontal", x, y);
      if (board.tour === lastTour && !board.isFinished()) {
        for (const node of board.getNodes()) {
          yield { ...node, x, y, orientation: "horizontal" };
        }
      } else yield { x, y, board, orientation: "horizontal" };
    }
  }

  public *getNodes(): Generator<
    {
      x: number;
      y: number;
      board: Board;
      orientation: "vertical" | "horizontal";
    },
    void,
    void
  > {
    const verticals = this.getNodesVertical();
    const horizontals = this.getNodesHorizontal();

    let doneHorizontal = false;
    let doneVertical = false;

    while (!doneHorizontal && !doneVertical) {
      if (Math.random() < 0.5) {
        const { value, done } = verticals.next();
        if (done) doneVertical = true;
        else yield value;
      } else {
        const { value, done } = horizontals.next();
        if (done) doneHorizontal = true;
        else yield value;
      }
    }

    if (!doneHorizontal) {
      for (const value of horizontals) {
        yield value;
      }
    }

    if (!doneVertical) {
      for (const value of verticals) {
        yield value;
      }
    }
  }

  // public *getNodes(): Generator<{
  //   x: number;
  //   y: number;
  //   board: Board;
  //   orientation: "vertical" | "horizontal";
  // }, void, void> {
  //   for (let y = 0; y < this.verticals.length; y++) {
  //     for (let x = 0; x < this.verticals[y].length; x++) {
  //       if (this.verticals[y][x] === 0) {
  //         const board = this.copy();
  //         const lastTour = board.tour;
  //         board.play("vertical", x, y);
  //         if (board.tour === lastTour && !board.isFinished()) {
  //           for (const node of board.getNodes()) {
  //             yield { ...node, x, y, orientation: "vertical" };
  //           }
  //         }
  //         else yield { x, y, board, orientation: "vertical" };
  //       }
  //     }
  //   }

  //   for (let y = 0; y < this.horizontals.length; y++) {
  //     for (let x = 0; x < this.horizontals[y].length; x++) {
  //       if (this.horizontals[y][x] === 0) {
  //         const board = this.copy();
  //         const lastTour = board.tour;
  //         board.play("horizontal", x, y);
  //         if (board.tour === lastTour && !board.isFinished()) {
  //           for (const node of board.getNodes()) {
  //             yield { ...node, x, y, orientation: "horizontal" };
  //           }
  //         }
  //         else yield { x, y, board, orientation: "horizontal" };
  //       }
  //     }
  //   }
  // }
}



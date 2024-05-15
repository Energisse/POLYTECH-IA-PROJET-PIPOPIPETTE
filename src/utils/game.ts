import nigamax from "./nigamax";
import negamax from "./negamax";

export enum GameMode {
  "1v1",
  "1vIA",
  "IAv1",
  "IAvIA",
}

export default class Game extends EventTarget {
  private gameMode: GameMode;
  readonly board: Board;
  private stoped: boolean = false;

  constructor(size: number, gameMode: GameMode) {
    super();
    this.gameMode = gameMode;
    this.board = new Board(size);
    console.log("gameMode",gameMode)
    if(this.gameMode === GameMode.IAvIA){
      this.iaLoop();
    }
    if(this.gameMode === GameMode.IAv1){
      this.iaPlay();
    }
  }

  private async iaLoop(){
      while(this.board.isFinished() === false && this.stoped === false){
        await this.iaPlay();
      }
  }

  public stop(){
    this.stoped = true;
  }

  public playHuman(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ): void {
    switch (this.gameMode) {
      case GameMode["1v1"]:
        this.board.play(orientation, x, y);
        break;
      case GameMode["1vIA"]:
        if (this.board.getTour() === 2) return;
        this.board.play(orientation, x, y);
        if (this.board.getTour() === 2 && !this.board.isFinished()) this.iaPlay();
        break;
      case GameMode["IAv1"]:
        if (this.board.getTour() === 1) return;
        this.board.play(orientation, x, y);
        if (this.board.getTour() === 1 && !this.board.isFinished()) this.iaPlay();
        break;
    }
  }

  public iaPlay() {
    return new Promise<void>((resolve) => {
      const tour = this.board.getTour();
      // const { x, y, orientation } = minimax(this, 3, true,this.board.getTour() - 1);
      // const { x, y, orientation } = negamax(this, 3, true,this.board.getTour() - 1);
  
      const start = window.performance.now();
      const { x, y, orientation } = nigamax(this.board, 3, true,this.board.getTour() - 1);
      const end = window.performance.now();
      setTimeout(() => {
        this.board.play(orientation, x, y);
        if (this.board.getTour() === tour && !this.board.isFinished()) this.iaPlay();
        resolve()
      }, 500 - (end - start));
    
    });
  }
}


export class Board extends EventTarget {
  private cells: number[][] = [];
  private verticals: number[][] = [];
  private horizontals: number[][] = [];

  private score: number[] = [0, 0];

  private tour: number = 1;

  constructor(size: number) {
    super();
    this.cells = new Array(size).fill(0).map(() => new Array(size).fill(0));
    this.verticals = new Array(size)
      .fill(0)
      .map(() => new Array(size + 1).fill(0));
    this.horizontals = new Array(size + 1)
      .fill(0)
      .map(() => new Array(size).fill(0));
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

  public getScore(): number[] {
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

    this.dispatchEvent(
      new CustomEvent("boardChange", {
        detail: {
          verticals: this.verticals,
          horizontals: this.horizontals,
          cells: this.cells,
        },
      })
    );

    if (!cells.length) {
      this.tour = this.tour === 1 ? 2 : 1;
    } else {
      this.score[this.tour - 1] += cells.length;

      cells.forEach((cell) => {
        this.cells[cell[1]][cell[0]] = this.tour;
      });

      this.dispatchEvent(new CustomEvent("score", { detail: this.score }));
    }

    if (this.isFinished()) {
      if (this.score[0] > this.score[1])
        this.dispatchEvent(new CustomEvent("win"));
      else if (this.score[0] < this.score[1])
        this.dispatchEvent(new CustomEvent("loose"));
    }
  }

  public isFinished() {
    return this.cells.every((row) => row.every((cell) => cell !== 0));
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

  public evaluation(idPlayer:number) {
    return this.score[idPlayer] - this.score[(idPlayer+1)%2];
  }

  private copy() {
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
}



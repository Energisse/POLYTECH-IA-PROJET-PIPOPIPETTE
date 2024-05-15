export class Game extends EventTarget {
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
  public playHuman(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ): void {
    if (this.tour === 2) return;
    this.play(orientation, x, y);
    if (this.tour === 2 && !this.isFinished()) this.iaPlay();
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

  public iaPlay() {
    // const { x, y, orientation } = minimax(this, 3, true);
    // const { x, y, orientation } = negamax(this, 3, true);

    const start = window.performance.now();
    const { x, y, orientation } = nigamax(this, 2, true);
    const end = window.performance.now();
    setTimeout(() => {
      this.play(orientation, x, y);
      if (this.tour === 2 && !this.isFinished()) this.iaPlay();
    }, 500 - (end - start));
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

  public evaluation() {
    return this.score[1] - this.score[0];
  }

  private copy() {
    const game = new Game(this.cells.length);
    game.cells = this.cells.map((row) => [...row]);
    game.verticals = this.verticals.map((row) => [...row]);
    game.horizontals = this.horizontals.map((row) => [...row]);
    game.score = [...this.score];
    game.tour = this.tour;
    return game;
  }

  private *getNodesVertical(): Generator<
    {
      x: number;
      y: number;
      game: Game;
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
      const game = this.copy();
      const lastTour = game.tour;
      game.play("vertical", x, y);
      if (game.tour === lastTour && !game.isFinished()) {
        for (const node of game.getNodes()) {
          yield { ...node, x, y, orientation: "vertical" };
        }
      } else yield { x, y, game, orientation: "vertical" };
    }
  }

  private *getNodesHorizontal(): Generator<
    {
      x: number;
      y: number;
      game: Game;
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
      const game = this.copy();
      const lastTour = game.tour;
      game.play("horizontal", x, y);
      if (game.tour === lastTour && !game.isFinished()) {
        for (const node of game.getNodes()) {
          yield { ...node, x, y, orientation: "horizontal" };
        }
      } else yield { x, y, game, orientation: "horizontal" };
    }
  }

  public *getNodes(): Generator<
    {
      x: number;
      y: number;
      game: Game;
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

function negamax(
  game: Game,
  depth: number,
  maximizingPlayer: boolean
): {
  x: number;
  y: number;
  value: number;
  orientation: "vertical" | "horizontal";
} {
  if (depth === 0 || game.isFinished())
    return {
      x: 0,
      y: 0,
      orientation: "vertical",
      value: game.evaluation() * (maximizingPlayer ? 1 : -1),
    };
  let value = -Infinity;
  let x = -1,
    y = -1;
  let orientation: "vertical" | "horizontal" = "vertical";
  for (const {
    game: node,
    x: _x,
    y: _y,
    orientation: _orientation,
  } of game.getNodes()) {
    const { value: result } = negamax(node, depth - 1, !maximizingPlayer);
    if (-result > value) {
      value = -result;
      x = _x;
      y = _y;
      orientation = _orientation;
    }
  }
  return { x, y, value, orientation };
}

function nigamax(
  game: Game,
  depth: number,
  maximizingPlayer: boolean,
  alpha: number = -Infinity,
  beta: number = Infinity
): {
  x: number;
  y: number;
  value: number;
  orientation: "vertical" | "horizontal";
} {
  if (depth === 0 || game.isFinished()) {
    return {
      x: 0,
      y: 0,
      orientation: "vertical",
      value: game.evaluation() * (maximizingPlayer ? 1 : -1),
    };
  }
  let value = -Infinity;
  let x = -1,
    y = -1;
  let orientation: "vertical" | "horizontal" = "vertical";
  for (const {
    game: node,
    x: _x,
    y: _y,
    orientation: _orientation,
  } of game.getNodes()) {
    const { value: result } = nigamax(
      node,
      depth - 1,
      !maximizingPlayer,
      -beta,
      -alpha
    );
    if (-result > value) {
      value = -result;
      x = _x;
      y = _y;
      orientation = _orientation;
    }
    if (value >= beta) {
      return {
        x,
        y,
        orientation,
        value,
      };
    }
    alpha = Math.max(alpha, value);
  }
  return { x, y, orientation, value };
}

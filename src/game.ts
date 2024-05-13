export class Game extends EventTarget {

    private cells: number[][] = [];
    private verticals: number[][] = [];
    private horizontals: number[][] = [];

    private score: number[] = [0, 0];

    private tour: number = 1;

    constructor(size: number) {
        super()
        this.cells = new Array(size).fill(0).map(() => new Array(size).fill(0));
        this.verticals = new Array(size).fill(0).map(() => new Array(size + 1).fill(0));
        this.horizontals = new Array(size + 1).fill(0).map(() => new Array(size).fill(0));
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
    public playHuman(orientation: "vertical" | "horizontal", x: number, y: number): void {
        this.play(orientation, x, y);
        this.iaPlay();
    }

    public play(orientation: "vertical" | "horizontal", x: number, y: number): void {
        if (orientation === "vertical") {
            if (this.verticals[y][x] !== 0) return;
            this.verticals[y][x] = this.tour;
        } else {
            if (this.horizontals[y][x] !== 0) return;
            this.horizontals[y][x] = this.tour;
        }

        const cells: Array<[x: number, y: number]> = []

        if (orientation === "horizontal") {
            let result = this.check(x, y);
            if (result) cells.push(result);
            result = this.check(x, y - 1);
            if (result) cells.push(result);
        }
        else {
            let result = this.check(x, y);
            if (result) cells.push(result);
            result = this.check(x - 1, y);
            if (result) cells.push(result);
        }

        this.dispatchEvent(new CustomEvent("boardChange", {
            detail: {
                verticals: this.verticals,
                horizontals: this.horizontals,
                cells: this.cells
            }
        }));

        if (!cells.length) {
            this.tour = this.tour === 1 ? 2 : 1;
        }
        else {
            this.score[this.tour - 1] += cells.length;

            cells.forEach((cell) => {
                this.cells[cell[1]][cell[0]] = this.tour;
            });

            this.dispatchEvent(new CustomEvent("score", { detail: this.score }));
        }
    }

    public iaPlay() {
        while (this.tour === 2 && !this.isFinished()) {
            const { x, y, orientation } = minimax(this, 3, true);
            this.play(orientation, x, y);
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

    public *getNodes(): Generator<{
        x: number;
        y: number;
        game: Game;
        orientation: "vertical" | "horizontal";
    }, void, void> {
        for (let y = 0; y < this.verticals.length; y++) {
            for (let x = 0; x < this.verticals[y].length; x++) {
                if (this.verticals[y][x] === 0) {
                    const game = this.copy();
                    const lastTour = game.tour;
                    game.play("vertical", x, y);
                    if (game.tour === lastTour && !game.isFinished()) {
                        for (const node of game.getNodes()) {
                            yield { ...node, x, y, orientation: "vertical" };
                        }
                    }
                    else yield { x, y, game, orientation: "vertical" };
                }
            }
        }

        for (let y = 0; y < this.horizontals.length; y++) {
            for (let x = 0; x < this.horizontals[y].length; x++) {
                if (this.horizontals[y][x] === 0) {
                    const game = this.copy();
                    const lastTour = game.tour;
                    game.play("horizontal", x, y);
                    if (game.tour === lastTour && !game.isFinished()) {
                        for (const node of game.getNodes()) {
                            yield { ...node, x, y, orientation: "horizontal" };
                        }
                    }
                    else yield { x, y, game, orientation: "horizontal" };
                }
            }
        }
    }
}

function minimax(game: Game, depth: number, maximizingPlayer: boolean): { x: number, y: number, value: number, orientation: "vertical" | "horizontal" } {
    if (depth === 0 || game.isFinished())
        return {
            x: 0,
            y: 0,
            orientation: "vertical",
            value: game.evaluation()
        }
    let value: number;
    let x = -1, y = -1;
    let orientation: "vertical" | "horizontal" = "vertical";
    if (maximizingPlayer) {
        value = -Infinity;
        for (const { game: node, x: _x, y: _y, orientation: _orientation } of game.getNodes()) {
            const { value: result } = minimax(node, depth - 1, false);
            if (result > value) {
                value = result;
                x = _x;
                y = _y;
                orientation = _orientation;
            }
        }
    }
    else {
        value = +Infinity;
        for (const { game: node, x: _x, y: _y, orientation: _orientation } of game.getNodes()) {
            const { value: result } = minimax(node, depth - 1, true);
            if (result < value) {
                value = result;
                x = _x;
                y = _y;
                orientation = _orientation;
            }
        }
    }
    return { x, y, value, orientation };
} 
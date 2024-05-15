import { Board } from "./game";

export default function negamax(
    board: Board,
    depth: number,
    maximizingPlayer: boolean,
    idPlayer: number
  ): {
    x: number;
    y: number;
    value: number;
    orientation: "vertical" | "horizontal";
  } {
    if (depth === 0 || board.isFinished())
      return {
        x: 0,
        y: 0,
        orientation: "vertical",
        value: board.evaluation(idPlayer) * (maximizingPlayer ? 1 : -1),
      };
    let value = -Infinity;
    let x = -1,
      y = -1;
    let orientation: "vertical" | "horizontal" = "vertical";
    for (const {
      board: node,
      x: _x,
      y: _y,
      orientation: _orientation,
    } of board.getNodes()) {
      const { value: result } = negamax(node, depth - 1, !maximizingPlayer,idPlayer);
      if (-result > value) {
        value = -result;
        x = _x;
        y = _y;
        orientation = _orientation;
      }
    }
    return { x, y, value, orientation };
  }
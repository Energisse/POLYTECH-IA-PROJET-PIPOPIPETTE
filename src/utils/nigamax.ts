import { Board } from "./game";

export default function nigamax(board: Board, depth: number, maximizingPlayer: boolean, idPlayer: number, alpha: number = -Infinity, beta: number = Infinity): {
  x: number;
  y: number;
  value: number;
  orientation: "vertical" | "horizontal";
  nodes: number;
} {
  let x = -1,
    y = -1,
    orientation: "vertical" | "horizontal" = "vertical",
    nodes = 0;
  function _nigamax(board: Board, depth: number, maximizingPlayer: boolean, alpha: number = -Infinity, beta: number = Infinity): number {
    if (depth === 0 || board.isFinished()) {
      return board.evaluation(idPlayer) * (maximizingPlayer ? 1 : -1)
    }
    let value = -Infinity;
    for (const { board: node, x: _x, y: _y, orientation: _orientation, } of board.getNodes()) {
      nodes++;
      const result = _nigamax(node, depth - 1, !maximizingPlayer, -beta, -alpha);
      if (-result > value) {
        value = -result;
        x = _x;
        y = _y;
        orientation = _orientation;
      }
      if (value >= beta) {
        return value
      }
      alpha = Math.max(alpha, value);
    }
    return value;
  }

  const value = _nigamax(board, depth, maximizingPlayer, alpha, beta)
  return {
    value,
    x,
    y,
    orientation,
    nodes
  };
}

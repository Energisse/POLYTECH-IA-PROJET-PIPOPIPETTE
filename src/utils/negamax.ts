import { Board, PlayerValue } from "./board";

export default function negamax(board: Board, _depth: number, maximizingPlayer: boolean, idPlayer: PlayerValue): {
  x: number;
  y: number;
  value: number;
  orientation: "vertical" | "horizontal";
  nodes: number;
} {
  let x = 0, y = 0, orientation: "vertical" | "horizontal" = "vertical";
  let nodes = 0;
  function _negamax(board: Board, depth: number, maximizingPlayer: boolean): number {
    if (depth === 0 || board.isFinished())
      return board.evaluation(idPlayer) * (maximizingPlayer ? 1 : -1)
    let value = -Infinity;
    for (const { board: node, x: _x, y: _y, orientation: _orientation } of board.getNodes()) {
      nodes++;
      const result = _negamax(node, depth - 1, !maximizingPlayer);
      if (-result > value) {
        if (depth === _depth) {
          x = _x;
          y = _y;
          orientation = _orientation;
        }
        value = -result;
      }
    }
    return value;
  }
  const value = _negamax(board, _depth, maximizingPlayer)

  return {
    x,
    y,
    orientation,
    value,
    nodes
  };
}
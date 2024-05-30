import { Board } from "./game";
import { Coup } from "./player";

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
  nodes: number;
} {
  const bestMoveByDepth:Map<number, Coup> = new Map();
   let nodes = 0;
  function _negamax(board: Board, depth: number, maximizingPlayer: boolean,): number {
    if (depth === 0 || board.isFinished())
      return board.evaluation(idPlayer) * (maximizingPlayer ? 1 : -1)
    let value = -Infinity;
    for (const { board: node, x: _x, y: _y, orientation: _orientation, } of board.getNodes()) {
      nodes++;
      const result = _negamax(node, depth - 1, !maximizingPlayer);
      if (-result > value) {
        bestMoveByDepth.set(depth, {x: _x, y: _y, orientation: _orientation});
        value = -result;
      }
    }
    return value;
  }
  const value = _negamax(board, depth, maximizingPlayer)

  return {
    ...bestMoveByDepth.get(depth)!,
    value,
    nodes
  };
}
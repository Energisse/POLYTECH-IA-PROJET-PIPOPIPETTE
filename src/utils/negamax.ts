import { Board, Coup, PlayerValue } from "./board";

export default function negamax(board: Board, _depth: number, idPlayer: PlayerValue, depthLimit?: number): Coup & {
  nodes: number;
  value: number;
} {
  let coup: Coup = { x: 0, y: 0, orientation: "horizontal" };
  let nodes = 0;

  //key is horizontals stringified + verticals stringified + score stringified + nextPlayer stringified
  //value is the evaluation
  const history = new Map<string, number>();

  function generateKey(board: Board): string {
    return `${board.horizontals.map(h => h.map(e => e !== -1 ? 1 : 0).join("")).join("")}${board.verticals.map(h => h.map(e => e !== -1 ? 1 : 0).join("")).join("")}${board.score.join("")}${board.tour}`;
  }

  function _negamax(board: Board, depth: number, maximizingPlayer: boolean): number {
    if (depth === 0 || board.isFinished())
      return board.evaluation(idPlayer) * (maximizingPlayer ? 1 : -1)

    let value = -Infinity;

    for (const { board: node, ...coupPlayed } of board.getNodes(depthLimit)) {
      nodes++;
      const key = generateKey(node);

      if (history.has(key)) {
        value = Math.max(value, history.get(generateKey(node))!);
        continue;
      }

      const result = _negamax(node, depth - 1, !maximizingPlayer);

      history.set(key, -result);

      if (-result > value) {
        if (depth === _depth) coup = coupPlayed
        value = -result;
      }
    }
    return value;
  }

  const value = _negamax(board, _depth, true)

  return {
    ...coup,
    value,
    nodes
  };
}
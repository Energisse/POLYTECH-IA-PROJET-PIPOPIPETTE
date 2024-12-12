import { ReactNode, createContext, useMemo, useRef, useState } from "react";
import { Coup, PlayValue } from "./utils/board";
import { Player } from "./utils/players/Player";

export const playerList = [
  "human",
  "minimax",
  "alphabeta",
  "mcts",
  "random",
  "fastest",
] as const;

export type PlayerType = (typeof playerList)[number];

export type PlayerConfig = {
  depth: number;
  iteration: number;
  simulation: number;
  c: number;
  type: PlayerType;
};

type MyContextData = {
  verticals: ReadonlyArray<ReadonlyArray<PlayValue>>;
  horizontals: ReadonlyArray<ReadonlyArray<PlayValue>>;
  cells: ReadonlyArray<ReadonlyArray<PlayValue>>;
  score: readonly [number, number];
  winner: number;
  tour: number;
  tree: any;
  size: number;
  play: (coup: Coup) => void;
  createGame: (players: [PlayerConfig, PlayerConfig], size: number) => void;
};

// Créer le contexte
const MyContext = createContext<MyContextData>({
  cells: [],
  createGame: () => {},
  play: (coup: Coup) => {},
  horizontals: [],
  score: [0, 0],
  tour: 0,
  tree: { name: "root", children: [] },
  verticals: [],
  winner: 0,
  size: 0,
});

type Data = {
  name: string;
  children: Data[];
};

Worker.prototype.emit = function (...data) {
  this.postMessage({ type: data[0], data: data[1] });
};

const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [verticals, setVerticals] = useState<
    ReadonlyArray<ReadonlyArray<PlayValue>>
  >([]);
  const [horizontals, setHorizontals] = useState<
    ReadonlyArray<ReadonlyArray<PlayValue>>
  >([]);
  const [cells, setCells] = useState<ReadonlyArray<ReadonlyArray<PlayValue>>>(
    []
  );
  const [score, setScore] = useState<readonly [number, number]>([0, 0]);
  const [winner, setWinner] = useState<PlayValue>(-1);
  const [tour, setTour] = useState<0 | 1>(0);
  const [tree, setTree] = useState<Data>({ name: "root", children: [] });
  const [size, setSize] = useState<number>(0);

  const game = useRef<Worker | null>(null);

  const context = useMemo(() => {
    return {
      createGame: (players: [PlayerConfig, PlayerConfig], size: number) => {
        if (game.current) game.current.terminate();
        setSize(size);

        setWinner(-1);

        game.current = new Worker(new URL("./worker.ts", import.meta.url));
        game.current.addEventListener("message", ({ data: { data, type } }) => {
          game.current!.dispatchEvent(new CustomEvent(type, { detail: data }));
        });
        game.current.addEventListener("change", (e) => {
          const { verticals, horizontals, cells, score, tour } = e.detail;
          setVerticals(verticals);
          setHorizontals(horizontals);
          setCells(cells);
          setScore(score);
          setTour(tour);
        });
        game.current.addEventListener("end", (e) => {
          setWinner(e.detail.winner);
        });

        game.current.emit("start", {
          player1: players[0],
          player2: players[1],
          size,
        });
      },
    };
  }, []);

  const value = useMemo(() => {
    return {
      verticals,
      horizontals,
      cells,
      score,
      winner,
      tour,
      tree,
      size,
      play: (coup: Coup) => {
        game.current?.emit("play", coup);
      },
      ...context,
    };
  }, [verticals, horizontals, cells, score, winner, tour, tree, size, context]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

export { MyContext, MyContextProvider };

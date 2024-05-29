import { ReactNode, createContext, useMemo, useState } from "react";

type MyContextData = {
  verticals: Array<Array<number>>;
  horizontals: Array<Array<number>>;
  cells: Array<Array<number>>;
  score: [number, number];
  winner: number;
  tour: number;
  tree: any;
  size: number;
  play: (x: number, y: number, orientation: "vertical" | "horizontal") => void;
  createGame: (
    players: [
      {
        type: "human" | "minimax" | "alphabeta" | "mcts" | "fastest" | "random";
        depth: number;
        iteration: number;
        simulation: number;
        c: number;
      },
      {
        type: "human" | "minimax" | "alphabeta" | "mcts" | "fastest" | "random";
        depth: number;
        iteration: number;
        simulation: number;
        c: number;
      }
    ],
    size: number
  ) => void;
};

// Créer le contexte
const MyContext = createContext<MyContextData>({
  cells: [],
  createGame: () => {},
  play: (x: number, y: number, orientation: "vertical" | "horizontal") => {},
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

let game: Worker | null = null;

Worker.prototype.emit = function (...data) {
  this.postMessage({ type: data[0], data: data[1] });
};

const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [verticals, setVerticals] = useState<Array<Array<-1 | 0 | 1>>>([]);
  const [horizontals, setHorizontals] = useState<Array<Array<-1 | 0 | 1>>>([]);
  const [cells, setCells] = useState<Array<Array<-1 | 0 | 1>>>([]);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<-1 | 0 | 1>(-1);
  const [tour, setTour] = useState<0 | 1>(0);
  const [tree, setTree] = useState<Data>({ name: "root", children: [] });
  const [size, setSize] = useState<number>(0);

  const context = useMemo(() => {
    return {
      createGame: (
        players: [
          {
            type:
              | "human"
              | "minimax"
              | "alphabeta"
              | "mcts"
              | "fastest"
              | "random";
            depth: number;
            iteration: number;
            simulation: number;
            c: number;
          },
          {
            type:
              | "human"
              | "minimax"
              | "alphabeta"
              | "mcts"
              | "fastest"
              | "random";
            depth: number;
            iteration: number;
            simulation: number;
            c: number;
          }
        ],
        size: number
      ) => {
        if (game) game.terminate();
        setSize(size);

        setWinner(-1);

        game = new Worker(new URL("./worker.ts", import.meta.url));
        game.addEventListener("message", ({ data: { data, type } }) => {
          game!.dispatchEvent(new CustomEvent(type, { detail: data }));
        });
        game.addEventListener("change", (e) => {
          const { verticals, horizontals, cells, score, tour } = e.detail;
          setVerticals([...verticals]);
          setHorizontals([...horizontals]);
          setCells([...cells]);
          setScore([...score]);
          setTour(tour);
        });
        game.addEventListener("end", (e) => {
          setWinner(e.detail.winner);
        });
        game.addEventListener("tree", (e) => {
          setTree(e.detail.tree);
        });
        game.emit("start", {
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
      play: (x: number, y: number, orientation: "vertical" | "horizontal") =>
        game?.emit("play", { x, y, orientation }),
      ...context,
    };
  }, [verticals, horizontals, cells, score, winner, tour, tree, size, context]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

export { MyContext, MyContextProvider };

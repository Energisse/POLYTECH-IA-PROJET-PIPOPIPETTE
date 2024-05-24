import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import "./App.css";
import Cell from "./Cell";
import config from "./config.json";
import Horizontal from "./horizontal";
import Vertical from "./vertical";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio, taille } = config;

Worker.prototype.emit = function (...data) {
  this.postMessage({ type: data[0], data: data[1] });
};

let game: Worker | null = null;

function Game({
  size,
  players,
}: {
  size: number;
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
  ];
}) {
  const [verticals, setVerticals] = useState<Array<Array<number>>>([]);
  const [horizontals, setHorizontals] = useState<Array<Array<number>>>([]);
  const [cells, setCells] = useState<Array<Array<number>>>([]);
  const [score, setScore] = useState([0, 0]);
  const [winner, setWinner] = useState<number>(0);
  const [tour, setTour] = useState(0);

  const parts = useMemo(() => {
    return (
      taille /
      (size * cellSizeRatio +
        (size + 1) * spaceSizeRatio +
        2 * size * borderSizeRatio)
    );
  }, [size]);

  useEffect(() => {
    if (game) game.terminate();
    setWinner(0);
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

    game.emit("start", {
      player1: players[0],
      player2: players[1],
      size,
    });

    return () => {
      game?.terminate();
      game = null;
    };
  }, [size, players]);

  function handleCLick(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ) {
    game?.emit("play", { x, y, orientation });
  }

  const { width, height } = useWindowSize();

  const effect = useMemo(() => {
    if (winner === 1) {
      return (
        <Confetti
          numberOfPieces={1000}
          width={width}
          height={height}
          colors={["red"]}
        />
      );
    } else if (winner === 2) {
      return (
        <Confetti
          numberOfPieces={1000}
          width={width}
          height={height}
          colors={["blue"]}
        />
      );
    }
    return null;
  }, [height, width, winner]);

  return (
    <div className="App">
      {score.map((value, index) => {
        return (
          <div
            key={index}
            style={{
              background:
                tour === index + 1 ? (index ? "blue" : "red") : "transparent",
            }}
          >
            {index + 1}: {value}
          </div>
        );
      })}

      <svg width="50%" height="50%" viewBox={`0,0,${taille},${taille}`}>
        {verticals.map((row, y) =>
          row.map((cell, x) => (
            <Vertical
              x={x}
              y={y}
              parts={parts}
              cell={cell}
              handleCLick={handleCLick}
            />
          ))
        )}
        {horizontals.map((row, y) =>
          row.map((cell, x) => (
            <Horizontal
              x={x}
              y={y}
              parts={parts}
              cell={cell}
              handleCLick={handleCLick}
            />
          ))
        )}
        {cells.map((row, y) => {
          return row.map((cell, x) => (
            <Cell x={x} y={y} parts={parts} cell={cell} />
          ));
        })}
      </svg>
      {effect}
    </div>
  );
}

export default Game;

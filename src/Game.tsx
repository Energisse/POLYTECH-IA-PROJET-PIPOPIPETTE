import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import "./App.css";
import config from "./config.json";
import Horizontal from "./horizontal";
import GameConstructor, { GameMode } from "./utils/game";
import Vertical from "./vertical";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio, taille } = config;

let game: GameConstructor;

function Game({ size, mode }: { size: number; mode: GameMode }) {
  const [verticals, setVerticals] = useState<Array<Array<number>>>([]);
  const [horizontals, setHorizontals] = useState<Array<Array<number>>>([]);
  const [cells, setCells] = useState<Array<Array<number>>>([]);
  const [score, setScore] = useState([0, 0]);
  const [won, setWon] = useState<null | boolean>(null);
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
    game = new GameConstructor(size, mode);
    setVerticals([...game.board.getVerticals()]);
    setHorizontals([...game.board.getHorizontals()]);
    setCells([...game.board.getCells()]);
    setScore([...game.board.getScore()]);
    setTour(game.board.getTour());
    setWon(null);

    game.board.addEventListener("boardChange", (e) => {
      const { verticals, horizontals, cells } = (
        e as CustomEvent<{
          verticals: number[][];
          horizontals: number[][];
          cells: number[][];
        }>
      ).detail;
      setVerticals([...verticals]);
      setHorizontals([...horizontals]);
      setCells([...cells]);
      setScore([...score]);
      setTour(tour);
    });

    game.board.addEventListener("loose", (e) => {
      setWon(false);
    });
    game.board.addEventListener("win", (e) => {
      setWon(true);
    });

    return () => {
      game.stop();
    };
  }, [size]);

  function handleCLick(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ) {
    game.playHuman(orientation, x, y);
  }

  const { width, height } = useWindowSize();

  const effect = useMemo(() => {
    if (won) {
      return (
        <Confetti
          numberOfPieces={500}
          width={width}
          height={height}
          colors={["red"]}
        />
      );
    } else if (won === false) {
      return (
        <Confetti
          numberOfPieces={500}
          width={width}
          height={height}
          colors={["blue"]}
        />
      );
    }
    return null;
  }, [won]);

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

      <svg width={taille} height={taille} viewBox={`0,0,${taille},${taille}`}>
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
          return row.map((cell, x) => {
            return (
              <rect
                x={
                  (borderSizeRatio + spaceSizeRatio) * parts +
                  x *
                    (borderSizeRatio + 2 * spaceSizeRatio + cellSizeRatio) *
                    parts
                }
                y={
                  (borderSizeRatio + spaceSizeRatio) * parts +
                  y *
                    (borderSizeRatio + 2 * spaceSizeRatio + cellSizeRatio) *
                    parts
                }
                width={parts * cellSizeRatio}
                height={parts * cellSizeRatio}
                fill={cell === 0 ? "transparent" : cell === 1 ? "red" : "blue"}
                style={{
                  transition: "fill .5s",
                }}
              />
            );
          });
        })}
      </svg>
      {effect}
    </div>
  );
}

export default Game;

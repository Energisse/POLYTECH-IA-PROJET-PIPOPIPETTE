import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Game } from "./game";
import { Slider } from "@mui/material";

const taille = 1000;

const size = 5;

const cellSizeRatio = 24;
const spaceSizeRatio = 1;
const borderSizeRatio = 4;

const totalRatio = cellSizeRatio + 2 * spaceSizeRatio + borderSizeRatio;

let game = new Game(size);

function App() {
  const [size, setSize] = useState<number>(3);

  const [verticals, setVerticals] = useState<Array<Array<number>>>(
    game.getVerticals()
  );
  const [horizontals, setHorizontals] = useState<Array<Array<number>>>(
    game.getHorizontals()
  );
  const [cells, setCells] = useState<Array<Array<number>>>(game.getCells());
  const [score, setScore] = useState(game.getScore());

  const [tour, setTour] = useState(game.getTour());

  const parts = useMemo(() => {
    return (
      taille /
      (size * cellSizeRatio +
        (size + 1) * spaceSizeRatio +
        2 * size * borderSizeRatio)
    );
  }, [size]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setSize(newValue as number);
  };

  useEffect(() => {
    game = new Game(size);
    setVerticals([...game.getVerticals()]);
    setHorizontals([...game.getHorizontals()]);
    setCells([...game.getCells()]);
    setScore([...game.getScore()]);
    setTour(game.getTour());

    game.addEventListener("boardChange", (e) => {
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
  }, [size]);

  function handleCLick(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ) {
    game.playHuman(orientation, x, y);
  }

  return (
    <div className="App">
      <Slider
        aria-label="Volume"
        value={size}
        onChange={handleChange}
        max={10}
        min={1}
      />
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
        {verticals.map((row, y) => {
          return row.map((cell, x) => {
            return (
              <polyline
                points={`
                  ${totalRatio * x * parts} ,${
                  (borderSizeRatio + spaceSizeRatio + totalRatio * y) * parts
                } 

                ${(totalRatio * x + 0.5 * borderSizeRatio) * parts} ,${
                  (borderSizeRatio +
                    spaceSizeRatio +
                    totalRatio * y -
                    0.5 * borderSizeRatio) *
                  parts
                } 
                ${(totalRatio * x + borderSizeRatio) * parts},${
                  (borderSizeRatio + spaceSizeRatio + totalRatio * y) * parts
                }

                ${(totalRatio * x + borderSizeRatio) * parts},${
                  (y * totalRatio +
                    cellSizeRatio +
                    borderSizeRatio +
                    spaceSizeRatio) *
                  parts
                } 

                ${(totalRatio * x + 0.5 * borderSizeRatio) * parts},${
                  (y * totalRatio +
                    cellSizeRatio +
                    1.5 * borderSizeRatio +
                    spaceSizeRatio) *
                  parts
                } 

                ${totalRatio * x * parts},${
                  (y * totalRatio +
                    cellSizeRatio +
                    borderSizeRatio +
                    spaceSizeRatio) *
                  parts
                } 
                `}
                fill={cell === 0 ? "gray" : cell === 1 ? "red" : "blue"}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => handleCLick("vertical", x, y)}
              />
            );
          });
        })}
        {horizontals.map((row, y) => {
          return row.map((cell, x) => {
            return (
              <polyline
                points={`
                  ${
                    (borderSizeRatio + spaceSizeRatio + totalRatio * x) * parts
                  } ,${totalRatio * y * parts} 

                  ${
                    (0.5 * borderSizeRatio + spaceSizeRatio + totalRatio * x) *
                    parts
                  } ,${(totalRatio * y + 0.5 * borderSizeRatio) * parts} 

                  ${
                    (borderSizeRatio + spaceSizeRatio + totalRatio * x) * parts
                  } ,${(totalRatio * y + borderSizeRatio) * parts} 

                  ${
                    (borderSizeRatio +
                      spaceSizeRatio +
                      cellSizeRatio +
                      totalRatio * x) *
                    parts
                  },${(totalRatio * y + borderSizeRatio) * parts} 

                  ${
                    (1.5 * borderSizeRatio +
                      spaceSizeRatio +
                      cellSizeRatio +
                      totalRatio * x) *
                    parts
                  },${(totalRatio * y + 0.5 * borderSizeRatio) * parts}

                  ${
                    (borderSizeRatio +
                      spaceSizeRatio +
                      cellSizeRatio +
                      totalRatio * x) *
                    parts
                  },${totalRatio * y * parts} 
                `}
                fill={cell === 0 ? "gray" : cell === 1 ? "red" : "blue"}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => handleCLick("horizontal", x, y)}
              />
            );
          });
        })}
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
              />
            );
          });
        })}
      </svg>
    </div>
  );
}

export default App;

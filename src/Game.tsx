import { Grid } from "@mui/material";
import { useContext, useMemo } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import Cell from "./Cell";
import config from "./config.json";
import { MyContext } from "./context";
import Horizontal from "./horizontal";
import Vertical from "./vertical";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio, taille } = config;

Worker.prototype.emit = function (...data) {
  this.postMessage({ type: data[0], data: data[1] });
};

function Game() {
  const { cells, horizontals, score, tour, verticals, winner, size, play } =
    useContext(MyContext);

  const parts = useMemo(() => {
    return (
      taille /
      (size * cellSizeRatio +
        (size + 1) * spaceSizeRatio +
        2 * size * borderSizeRatio)
    );
  }, [size]);

  function handleCLick(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ) {
    play(x, y, orientation);
  }

  const { width, height } = useWindowSize();

  const effect = useMemo(() => {
    if (winner === 0) {
      return (
        <Confetti
          numberOfPieces={1000}
          width={width}
          height={height}
          colors={["red"]}
        />
      );
    } else if (winner === 1) {
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
    <Grid>
      {score.map((value, index) => {
        return (
          <div
            key={index}
            style={{
              background:
                tour === index ? (index ? "blue" : "red") : "transparent",
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
    </Grid>
  );
}

export default Game;

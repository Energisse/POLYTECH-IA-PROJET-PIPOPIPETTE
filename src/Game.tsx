import { Box } from "@mui/material";
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
  const { cells, horizontals, verticals, tour, winner, size, play } =
    useContext(MyContext);

  const parts = useMemo(() => {
    return (
      taille /
      (size * cellSizeRatio +
        size * 2 * spaceSizeRatio +
        (size + 1) * borderSizeRatio)
    );
  }, [size]);

  function handleCLick(
    orientation: "vertical" | "horizontal",
    x: number,
    y: number
  ) {
    play({ x, y, orientation });
  }

  const { width, height } = useWindowSize();

  const effect = useMemo(() => {
    if (winner === -1) return null;
    return (
      <Confetti
        style={{
          position: "fixed",
        }}
        numberOfPieces={500}
        width={width}
        height={height}
        colors={winner === 0 ? ["red"] : ["blue"]}
      />
    );
  }, [height, width, winner]);

  return (
    <>
      {tour !== -1 && (
        <Box
          sx={{
            width: "min(100%, 100vw)",
            height: "min(100%, 100vh)",
          }}
        >
          <svg width="100%" height="100%" viewBox={`0,0,${taille},${taille}`}>
            {verticals.map((row, y) =>
              row.map((cell, x) => (
                <Vertical
                  x={x}
                  y={y}
                  parts={parts}
                  cell={cell}
                  handleCLick={handleCLick}
                  key={`${x}-${y}`}
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
                  key={`${x}-${y}`}
                />
              ))
            )}
            {cells.map((row, y) => {
              return row.map((cell, x) => (
                <Cell x={x} y={y} parts={parts} cell={cell} key={`${x}-${y}`} />
              ));
            })}
          </svg>
        </Box>
      )}
      {effect}
    </>
  );
}

export default Game;

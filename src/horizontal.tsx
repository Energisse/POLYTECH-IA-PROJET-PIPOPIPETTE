import config from "./config.json";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio, totalRatio } = config;

export default function Horizontal({
  x,
  y,
  parts,
  cell,
  handleCLick,
}: {
  x: number;
  y: number;
  parts: number;
  cell: number;
  handleCLick: Function;
}) {
  return (
    <polyline
      points={`
        ${(borderSizeRatio + spaceSizeRatio + totalRatio * x) * parts} ,${
        totalRatio * y * parts
      } 
        
        ${(0.5 * borderSizeRatio + spaceSizeRatio + totalRatio * x) * parts} ,${
        (totalRatio * y + 0.5 * borderSizeRatio) * parts
      } 
        
        ${(borderSizeRatio + spaceSizeRatio + totalRatio * x) * parts} ,${
        (totalRatio * y + borderSizeRatio) * parts
      } 

        ${
          (borderSizeRatio + spaceSizeRatio + cellSizeRatio + totalRatio * x) *
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
      fillOpacity={cell === 0 ? 0.5 : 1}
      style={{
        cursor: "pointer",
        transition: "fill .5s",
      }}
      onClick={() => handleCLick("horizontal", x, y)}
    />
  );
}

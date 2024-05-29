import config from "./config.json";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio, totalRatio } = config;

export default function Vertical({
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
        (y * totalRatio + cellSizeRatio + borderSizeRatio + spaceSizeRatio) *
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
        (y * totalRatio + cellSizeRatio + borderSizeRatio + spaceSizeRatio) *
        parts
      } 
                  `}
      fill={cell === -1 ? "gray" : cell === 0 ? "red" : "blue"}
      fillOpacity={cell === -1 ? 0.25 : 1}
      style={{
        cursor: "pointer",
        transition: "fill .5s",
      }}
      onClick={() => handleCLick("vertical", x, y)}
    />
  );
}

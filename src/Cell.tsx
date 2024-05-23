import config from "./config.json";

const { cellSizeRatio, spaceSizeRatio, borderSizeRatio } = config;

export default function Cell({
  x,
  y,
  parts,
  cell,
}: {
  x: number;
  y: number;
  parts: number;
  cell: number;
}) {
  return (
    <rect
      x={
        (borderSizeRatio + spaceSizeRatio) * parts +
        x * (borderSizeRatio + 2 * spaceSizeRatio + cellSizeRatio) * parts
      }
      y={
        (borderSizeRatio + spaceSizeRatio) * parts +
        y * (borderSizeRatio + 2 * spaceSizeRatio + cellSizeRatio) * parts
      }
      width={parts * cellSizeRatio}
      height={parts * cellSizeRatio}
      fill={cell === 0 ? "transparent" : cell === 1 ? "red" : "blue"}
      style={{
        transition: "fill .5s",
      }}
    />
  );
}

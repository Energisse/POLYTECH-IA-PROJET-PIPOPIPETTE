import {
  Grid,
  ButtonGroup,
  Button,
  TextField,
  ButtonProps,
} from "@mui/material";
import { PlayerConfig, playerList } from "./context";

export default function PlayerMenu({
  c,
  depth,
  iteration,
  simulation,
  type,
  setPlayerConfig,
  color,
  minTimeToPlay,
  depthLimit,
}: PlayerConfig & {
  setPlayerConfig: (config: Partial<PlayerConfig>) => void;
} & Pick<ButtonProps, "color">) {
  return (
    <Grid container flexDirection={"column"} gap={2}>
      <ButtonGroup>
        {playerList.map((player, index) => (
          <Button
            variant={type === player ? "contained" : "outlined"}
            color={color}
            onClick={() => setPlayerConfig({ type: player })}
            key={index}
          >
            {player}
          </Button>
        ))}
      </ButtonGroup>
      {type !== "human" && (
        <TextField
          label="min time (ms)"
          value={minTimeToPlay}
          type="number"
          onChange={(e) => setPlayerConfig({ minTimeToPlay: +e.target.value })}
          fullWidth
        />
      )}
      {(type === "minimax" || type === "alphabeta" || type === "fastest") && (
        <>
          <TextField
            label="depth"
            value={depth}
            type="number"
            onChange={(e) => setPlayerConfig({ depth: +e.target.value })}
            fullWidth
          />
          <TextField
            label="depth limit"
            value={depthLimit}
            type="number"
            onChange={(e) => setPlayerConfig({ depthLimit: +e.target.value })}
            fullWidth
          />
        </>
      )}
      {(type === "mcts" || type === "fastest") && (
        <Grid container>
          <Grid item xs={6}>
            <TextField
              label="iterations"
              value={iteration}
              type="number"
              onChange={(e) => setPlayerConfig({ iteration: +e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="simulation"
              value={simulation}
              type="number"
              onChange={(e) => setPlayerConfig({ simulation: +e.target.value })}
              fullWidth
            />
          </Grid>
        </Grid>
      )}
      {(type === "mcts" || type === "fastest") && (
        <TextField
          label="c"
          value={c}
          type="number"
          onChange={(e) => setPlayerConfig({ c: +e.target.value })}
          fullWidth
        />
      )}
    </Grid>
  );
}

import {
  Grid,
  ButtonGroup,
  Button,
  TextField,
  ButtonProps,
  Select,
  MenuItem,
} from "@mui/material";
import { PlayerConfig, playerList } from "./context";
import { models } from "./models";

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
  mctsIteration,
  model,
  size,
}: PlayerConfig & {
  setPlayerConfig: (config: Partial<PlayerConfig>) => void;
  size: number;
} & Pick<ButtonProps, "color">) {
  return (
    <Grid container flexDirection={"column"} gap={2}>
      <Grid item overflow="scroll" xs={12}>
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
      </Grid>
      {type !== "human" && (
        <TextField
          label="min time (ms)"
          value={minTimeToPlay}
          type="number"
          onChange={(e) =>
            setPlayerConfig({ minTimeToPlay: +e.target.value || 1 })
          }
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
            onChange={(e) =>
              setPlayerConfig({
                depthLimit: e.target.value ? +e.target.value : undefined,
              })
            }
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

      {type === "alphaZero" && (
        <>
          <TextField
            label="iteration"
            value={mctsIteration}
            type="number"
            onChange={(e) =>
              setPlayerConfig({ mctsIteration: +e.target.value })
            }
            fullWidth
          />
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Age"
            value={model}
            onChange={(e) => setPlayerConfig({ model: e.target.value })}
          >
            {Array.from(models.get(size)?.entries() || []).map(
              ([key, value]) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              )
            )}
          </Select>
        </>
      )}
    </Grid>
  );
}

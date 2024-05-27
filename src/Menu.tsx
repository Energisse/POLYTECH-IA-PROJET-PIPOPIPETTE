import { Button, ButtonGroup, Grid, Slider, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { MyContext } from "./context";

const playerList = [
  "human",
  "minimax",
  "alphabeta",
  "mcts",
  "random",
  "fastest",
] as const;

export type playerType = (typeof playerList)[number];

function Menu() {
  const { createGame } = useContext(MyContext);

  const [size, setSize] = useState<number>(3);

  const [player1, setPlayer1] = useState<playerType>("human");

  const [player2, setPlayer2] = useState<playerType>("human");

  const [configJoeur1, setConfigJoueur1] = useState<{
    depth: number;
    iteration: number;
    simulation: number;
    c: number;
  }>({
    depth: 3,
    iteration: 100,
    simulation: 100,
    c: Math.sqrt(2),
  });

  const [configJoeur2, setConfigJoueur2] = useState<{
    depth: number;
    iteration: number;
    simulation: number;
    c: number;
  }>({
    depth: 3,
    iteration: 100,
    simulation: 100,
    c: Math.sqrt(2),
  });

  const handleChange = (event: Event, newValue: number | number[]) => {
    setSize(newValue as number);
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Slider
          value={size}
          onChange={handleChange}
          min={2}
          max={10}
          step={1}
          valueLabelDisplay="auto"
          marks
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item>
            <ButtonGroup orientation="vertical">
              {playerList.map((player) => (
                <Button
                  variant={player1 === player ? "contained" : "outlined"}
                  color="error"
                  onClick={() => setPlayer1(player as playerType)}
                >
                  {player}
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
          <Grid item flex={1}>
            <Grid container rowGap={2}>
              <Grid item xs={6}>
                <TextField
                  label="depth"
                  value={configJoeur1.depth}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur1((prev) => ({
                      ...prev,
                      depth: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="iterations"
                  value={configJoeur1.iteration}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur1((prev) => ({
                      ...prev,
                      iteration: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="simulation"
                  value={configJoeur1.simulation}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur1((prev) => ({
                      ...prev,
                      simulation: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="c"
                  value={configJoeur1.c}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur1((prev) => ({
                      ...prev,
                      c: +e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item>
            <ButtonGroup orientation="vertical">
              {playerList.map((player) => (
                <Button
                  variant={player2 === player ? "contained" : "outlined"}
                  onClick={() => setPlayer2(player as playerType)}
                >
                  {player}
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
          <Grid item flex={1}>
            <Grid container rowGap={2}>
              <Grid item xs={6}>
                <TextField
                  label="depth"
                  value={configJoeur2.depth}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur2((prev) => ({
                      ...prev,
                      depth: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="iterations"
                  value={configJoeur2.iteration}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur2((prev) => ({
                      ...prev,
                      iteration: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="simulation"
                  value={configJoeur2.simulation}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur2((prev) => ({
                      ...prev,
                      simulation: +e.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="c"
                  value={configJoeur2.c}
                  type="number"
                  onChange={(e) =>
                    setConfigJoueur2((prev) => ({
                      ...prev,
                      c: +e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button
          onClick={() => {
            createGame(
              [
                {
                  c: configJoeur1.c,
                  depth: configJoeur1.depth,
                  iteration: configJoeur1.iteration,
                  simulation: configJoeur1.simulation,
                  type: player1,
                },
                {
                  c: configJoeur2.c,
                  depth: configJoeur2.depth,
                  iteration: configJoeur2.iteration,
                  simulation: configJoeur2.simulation,
                  type: player2,
                },
              ],
              size
            );
          }}
        >
          start
        </Button>
      </Grid>
    </Grid>
  );
}

export default Menu;

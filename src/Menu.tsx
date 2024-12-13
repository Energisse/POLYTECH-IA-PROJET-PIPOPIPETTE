import { Box, Button, Grid, Paper, Slider, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { MyContext } from "./context";
import { PlayerConfig } from "./context";
import PlayerMenu from "./PlayerMenu";

function Menu() {
  const { createGame, score, tour } = useContext(MyContext);

  const [size, setSize] = useState<number>(3);

  const [configJoeur1, setConfigJoueur1] = useState<PlayerConfig>({
    depth: 3,
    iteration: 100,
    simulation: 100,
    c: Math.sqrt(2),
    type: "human",
    minTimeToPlay: 500,
  });

  const [configJoeur2, setConfigJoueur2] = useState<PlayerConfig>({
    depth: 3,
    iteration: 100,
    simulation: 100,
    c: Math.sqrt(2),
    type: "human",
    minTimeToPlay: 500,
  });

  const handleChange = (event: Event, newValue: number | number[]) => {
    setSize(newValue as number);
  };

  return (
    <Grid container gap={2} flexDirection={"column"}>
      <Grid item xs={12}>
        <Paper elevation={1}>
          <Box p={2}>
            <Typography>Size : {size}</Typography>

            <Slider
              value={size}
              onChange={handleChange}
              min={2}
              max={15}
              step={1}
              valueLabelDisplay="auto"
              marks
            />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          elevation={1}
          sx={
            tour === 0
              ? {
                  boxShadow: " 0px 0px 20px 2px #FF0000",
                }
              : {}
          }
        >
          <Grid container direction={"column"} gap={2} p={2}>
            <Grid container justifyContent={"space-between"}>
              <Typography>Player 1</Typography>
              <Typography> {score[0]}</Typography>
            </Grid>
            <PlayerMenu
              {...configJoeur1}
              setPlayerConfig={(config) => {
                setConfigJoueur1({ ...configJoeur1, ...config });
              }}
              color="error"
            />
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          elevation={1}
          sx={
            tour === 1
              ? {
                  boxShadow: " 0px 0px 20px 2px #0000FF",
                }
              : {}
          }
        >
          <Grid container direction={"column"} gap={2} p={2}>
            <Grid container justifyContent={"space-between"}>
              <Typography>Player 2</Typography>
              <Typography> {score[1]}</Typography>
            </Grid>
            <PlayerMenu
              {...configJoeur2}
              setPlayerConfig={(config) => {
                setConfigJoueur2({ ...configJoeur2, ...config });
              }}
            />
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Button
          onClick={() => {
            createGame([configJoeur1, configJoeur2], size);
          }}
        >
          start
        </Button>
      </Grid>
    </Grid>
  );
}

export default Menu;

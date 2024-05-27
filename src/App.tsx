import React from "react";
import { Grid } from "@mui/material";
import Game from "./Game";
import Menu from "./Menu";
import Treee from "./Tree";

const playerList = [
  "human",
  "minimax",
  "alphabeta",
  "mcts",
  "random",
  "fastest",
] as const;

export type playerType = (typeof playerList)[number];

function App() {
  return (
    <div className="App">
      <Grid container height={"100%"}>
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={8}>
              <Game />
            </Grid>
            <Grid item xs={4}>
              <Menu />
            </Grid>
          </Grid>
        </Grid>
        <Grid flex={1} xs={12}>
          <Treee />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

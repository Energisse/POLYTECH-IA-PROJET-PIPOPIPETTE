import React from "react";
import { Grid } from "@mui/material";
import Game from "./Game";
import Menu from "./Menu";

function App() {
  return (
    <div className="App">
      <Grid container height={"100%"} p={5}>
        <Grid item flex={1}>
          <Game />
        </Grid>
        <Grid item>
          <Menu />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

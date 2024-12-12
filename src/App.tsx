import React from "react";
import { Grid } from "@mui/material";
import Game from "./Game";
import Menu from "./Menu";

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
      </Grid>
    </div>
  );
}

export default App;

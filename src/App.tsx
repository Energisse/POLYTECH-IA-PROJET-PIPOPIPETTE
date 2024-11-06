import React from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import Game from "./Game";
import Menu from "./Menu";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div className="App">
      <Grid
        container
        p={5}
        direction={isMobile ? "column" : "row"}
        sx={{
          overflowX: "hidden",
        }}
        height={isMobile ? "unset" : "100vh"}
      >
        <Grid
          item
          flex={1}
          width="100%"
          height="100%"
          position={"relative"}
          p={2}
        >
          <Game />
        </Grid>
        <Grid item width={isMobile ? "100%" : "unset"}>
          <Menu />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

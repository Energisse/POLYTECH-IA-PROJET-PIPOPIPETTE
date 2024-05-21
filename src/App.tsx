import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
} from "@mui/material";
import { useState } from "react";
import "./App.css";
import Game from "./Game";
import { GameMode } from "./utils/game";

function App() {
  const [size, setSize] = useState<number>(3);

  const [mode, setMode] = useState<GameMode | null>(null);

  const [ia, setIa] = useState<"minimax" | "alphabeta" | "mcts">("minimax");

  const handleChange = (event: Event, newValue: number | number[]) => {
    setSize(newValue as number);
  };

  return (
    <div className="App">
      {mode === null ? (
        <>
          <Slider
            value={size}
            onChange={handleChange}
            min={3}
            max={10}
            step={1}
            valueLabelDisplay="auto"
            marks
          />
          <Button variant="contained" onClick={() => setMode(GameMode["1v1"])}>
            Joueur contre joueur
          </Button>
          <Button variant="contained" onClick={() => setMode(GameMode["1vIA"])}>
            Joueur contre IA
          </Button>
          <Button variant="contained" onClick={() => setMode(GameMode["IAv1"])}>
            IA contre Joueur
          </Button>
          <Button
            variant="contained"
            onClick={() => setMode(GameMode["IAvIA"])}
          >
            IA contre IA
          </Button>
          <FormControl >
            <InputLabel id="demo-simple-select-label">IA</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={ia}
              label="Ia"
              onChange={(e) =>
                setIa(e.target.value as "minimax" | "alphabeta" | "mcts")
              }
            >
              <MenuItem value={"minimax"}>minimax</MenuItem>
              <MenuItem value={"alphabeta"}>alphabeta</MenuItem>
              <MenuItem value={"mcts"}>mcts</MenuItem>
            </Select>
          </FormControl>
        </>
      ) : (
        <>
          <Button onClick={() => setMode(null)}>Retour</Button>
          <Game size={size} mode={mode} ia={ia} />
        </>
      )}
    </div>
  );
}

export default App;

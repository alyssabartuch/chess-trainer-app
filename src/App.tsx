import "./App.css";
import { useEffect, useState } from "react";
import Tactic from "./types/Tactic";
import TacticBoard from "./components/TacticBoard";
import axios from "axios";
import { getSideToPlayFromFen } from "./utils";
import React from "react";

async function fetchTactic() {
  let tacticData;

  try {
    const response = await axios.get("https://chess-proxy.herokuapp.com/");
    tacticData = await response.data;
    console.log("Tactic Information", tacticData);
  } catch (error) {
    console.error(error);
  }

  return {
    id: tacticData.id,
    fen: tacticData.fenBefore,
    blunderMove: tacticData.blunderMove,
    solution: tacticData.forcedLine,
  };
}

function App() {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [hint, setHint] = useState<
    "sideToPlay" | "incorrect" | "correct" | "solved"
  >("sideToPlay");

  const loadTactic = async () => {
    try {
      const newTactic = await fetchTactic();
      setTactics((it) => it.concat(newTactic));
      setHint("sideToPlay");
    } catch (error) {
      console.log("Error loading tactic", { error });
    }
  };

  useEffect(() => {
    loadTactic();
  }, []);

  if (tactics.length === 0) {
    return <div className="overlay-loading">Loading...</div>;
  }

  const tactic = tactics[0];

  return (
    <div className="flex-center app-container">
      <h1>Chess Tactics Trainer</h1>
      <div className="hint-container">
        {hint === "sideToPlay" && (
          <div className="tactic-hint">
            {getSideToPlayFromFen(tactic.fen) === "b" ? "White" : "Black"} to
            Move
          </div>
        )}
        {hint === "correct" && (
          <div className="tactic-hint tactic-hint-success">Correct!</div>
        )}

        {hint === "incorrect" && (
          <div className="tactic-hint tactic-hint-error">Incorrect!</div>
        )}

        {hint === "solved" && (
          <div className="tactic-hint tactic-hint-solved">Solved!</div>
        )}
      </div>

      <TacticBoard
        key={tactic.id}
        tactic={tactic}
        onCorrect={() => {
          setHint("correct");
          setTimeout(() => setHint("sideToPlay"), 3000);
        }}
        onIncorrect={() => {
          setHint("incorrect");
          setTimeout(() => setHint("sideToPlay"), 3000);
        }}
        onSolve={() => {
          setHint("solved");
          setTactics((it) => it.slice(1));
          loadTactic();
        }}
      />
    </div>
  );
}

export default App;

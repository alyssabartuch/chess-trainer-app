import React, { useState, useEffect } from "react";
import "../components/TacticBoard.css";
import { ShortMove } from "chess.js";
import Chessboard from "chessboardjsx";
import Tactic from "../types/Tactic";
import { getSideToPlayFromFen, makeMove, validateMove } from "../utils";

interface Props {
  tactic: Tactic;
  onIncorrect: () => void;
  onCorrect: () => void;
  onSolve: () => void;
}

const TacticBoard: React.FC<Props> = ({
  tactic,
  onIncorrect,
  onCorrect,
  onSolve,
}) => {
  const [fen, setFen] = useState(tactic.fen);
  const [solution, setSolution] = useState(tactic.solution);
  const [hint, setHint] = useState(tactic.solution);
  const [isHintVisible, setIsHintVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const next = makeMove(tactic.fen, tactic.blunderMove);
      if (next) {
        setFen(next.fen);
      }
    }, 100);
  }, [tactic]);

  const handleMove = (move: ShortMove) => {
    const next = validateMove(fen, move, solution);

    if (next) {
      setFen(next.fen);
      setSolution(next.solution);

      if (next.solution.length > 0) {
        onCorrect();

        const autoNext = validateMove(
          next.fen,
          next.solution[0],
          next.solution
        );

        if (autoNext) {
          setHint(autoNext.solution);
          setIsHintVisible(false);
          setFen(autoNext.fen);
          setSolution(autoNext.solution);
        }
      } else {
        onSolve();
      }
    } else {
      onIncorrect();
    }
  };

  const toggleHintVisibility = () => {
    setIsHintVisible(!isHintVisible);
  };

  return (
    <div>
      <Chessboard
        transitionDuration={200}
        position={fen}
        width={600}
        orientation={
          getSideToPlayFromFen(tactic.fen) === "b" ? "white" : "black"
        }
        onDrop={(move) =>
          handleMove({
            from: move.sourceSquare,
            to: move.targetSquare,
            promotion: "q",
          })
        }
      />
      <div className="hint-container">
        <div className="hint-btn" onClick={() => toggleHintVisibility()}>
          Need a Hint?
        </div>
        {isHintVisible && (
          <div className="hint-content">
            <h3>{hint[0]}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticBoard;

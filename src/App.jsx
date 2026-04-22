import { useState, useReducer, useRef, useEffect } from "react";
import "@/App.css";

import {
  GameScene,
  getInitialGameState,
  updateState
} from "@/gameLogic/gameLogic";
import GameConsole from "./components/GameConsole";
import GameControls from "./components/GameControls";
import HelpOverlay from "./components/HelpOverlay";
import StatusBars from "./components/StatusBars";

const RPGInterface = () => {
  const [helpHovered, setHelpHovered] = useState(false);
  const [helpClicked, setHelpClicked] = useState(false);

  const messagesBottom = useRef(null);

  const [gameState, dispatchAction] = useReducer(updateState, {
    ...getInitialGameState(),
    gameScene: GameScene.MENU_SCENE,
    messages: []
  });
  const [prevGameState, setPrevGameState] = useState(null);

  useEffect(() => {
    const messagesLengthSame = prevGameState && prevGameState.messages.length === gameState.messages.length;
    const messagesHaveChanged = !messagesLengthSame || !prevGameState.messages.every((message, index) => {
      return message === gameState.messages[index];
    });
    if (messagesHaveChanged) {
      messagesBottom.current.scrollIntoView({ behavior: "smooth" });
    }
    // TODO: change to usePrevious
    setPrevGameState(gameState);
  }, [gameState]);

  console.log(gameState.gameScene);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* the 12 has to be 2x the 6 in p-6 */}
      <div className="min-h-[calc(100vh_-_12_*_var(--spacing))] max-h-screen flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-center font-bold text-gray-100 mb-8">React Tactics</h1>

        <HelpOverlay
          helpHovered={helpHovered}
          helpClicked={helpClicked}
          setHelpHovered={setHelpHovered}
          setHelpClicked={setHelpClicked}
        />

        <GameConsole messages={gameState.messages} messagesBottomRef={messagesBottom} />

        {(gameState.gameScene === GameScene.BATTLE_BASE || gameState.gameScene === GameScene.BATTLE_SELECT_ATTACK || gameState.gameScene === GameScene.BATTLE_SELECT_ENEMY) && (
          <StatusBars
            gameScene={gameState.gameScene}
            player={gameState.player}
            enemies={gameState.enemies}
            dispatchAction={dispatchAction}
          />
        )}
        <GameControls gameScene={gameState.gameScene} player={gameState.player} dispatchAction={dispatchAction} />
      </div>
      {/* <style jsx>{` */}
      {/* <style>
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      </style> */}
    </div>
  );
};

export default RPGInterface;

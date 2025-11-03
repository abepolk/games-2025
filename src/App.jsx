import { useState, useRef, useEffect } from 'react'
import './App.css'

import {
  GameScene,
  MenuSceneAction,
  BattleSceneAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  initGame,
  updateState
} from './gameLogic.js'

const HealthBar = ({ attackable, current, max, label, color, index, handleAction }) => {
    useEffect(() => {
      console.log("HealthBar mounted");
      return () => console.log("HealthBar unmounted");
    });
    return (
  <div className="flex">
    {attackable && (
      <div className="bg-gray-600
        rounded-lg
        px-4
        mr-4
        flex
        flex-col
        justify-center"
        onClick={() => { handleAction(BattleSceneAction.ATTACK_STEP_2, {
          attackedEnemyIndex: index
        }); }}
      >
        Select
      </div>
    )}
    <div className="grow">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{current}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(current / max) * 100}%` }}
        />
      </div>
    </div>
  </div>
);
};


const RPGInterface = () => {
  const [messages, setMessages] = useState([]);

  const [helpHovered, setHelpHovered] = useState(false);
  const [helpClicked, setHelpClicked] = useState(false);

  const messagesBottom = useRef(null);

  const [gameState, setGameState] = useState({
    gameScene: GameScene.MENU_SCENE,
    messages: []
  });

  useEffect(() => {
    setGameState((prevState) => {
      const localState = structuredClone(prevState);
      initGame(localState);
      return localState;
    })
  }, []);


  useEffect(() => setMessages(gameState.messages), [gameState]);

  useEffect(() => {
    messagesBottom.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAction = (action, options) => {
    setGameState((prevState) => {
    const state = structuredClone(prevState);
      try {
        return updateState({action, state, options});
      } catch (error) {
        console.error(error);
        state.messages.push(error);
        return state;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* the 12 has to be 2x the 6 in p-6 */}
      <div className="min-h-[calc(100vh_-_12_*_var(--spacing))] max-h-screen flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-center font-bold text-gray-100 mb-8">Adventure Quest</h1>

        <div className="items-center
                    fixed
                    top-6 right-6
                    flex h-[1.2lh]
                    w-[1.2lh]
                    shrink-0
                    justify-center
                    rounded-full
                    font-[Arial]
                    text-2xl
                    text-gray-100
                    bg-[#2e406b]
                    hover:bg-[#2e4680]"
          onMouseEnter={() => setHelpHovered(true)}
          onMouseLeave={() => setHelpHovered(false)}
          onClick={() => setHelpClicked(clicked => !clicked)}
        >
          ?
        </div>

        <div className={`fixed
          top-1/2
          left-1/2
          w-3/4
          lg:w-2/3
          -translate-x-1/2
          -translate-y-1/2
          bg-[#2e406b]
          leading-relaxed
          p-8
          rounded-lg
          text-md
          lg:text-lg
          max-w-2xl
          ${helpHovered ? "lg:block lg:opacity-100" : "lg:hidden lg:opacity-0"}
          ${helpClicked ? "" : "hidden opacity-0"}
          transition
          transition-discrete
          starting:opacity-0
          duration-1000`}>
          <div className="mb-4">
            <p>
              Win as many battles as you can before being defeated!
            </p>
          </div>
          <div>
            <p>
              Click "Battle" to start each battle.
            </p>
            <p>
              Click "Restart" after any battle to reset.
            </p>
            <p>
              In battle mode, click "Attack" to damage the opponent
              and click "Defend" to heal.
            </p>
            <p>
              You automatically heal a small amount between battles.
            </p>
            <p>
              Each subsequent opponent is harder than the previous.
            </p>
          </div>
        </div>

        {/* Main Game Area */}
        {/* Console/Messages Area */}
        {/* overflow-hidden is there because overflow-y-scroll, without
        overflow-hidden and a way of limiting the height of the parent
        div of the overflow-scrolling div, won't do anything. Instead,
        in this case, if the console messages try to overflow, the
        console will just get bigger to contain them, pushing the lower
        buttons out of the viewport, which is not what we want. The
        messy math for min-h is there because we want the console to be
        at least as high as the header plus one line of text, and I've
        added the top and bottom padding (2 * padding) and text size of the header along with a
        potential first message. Although it doesn't seem to do anything
        right now. */}
        <div className="bg-gray-800 flex flex-col grow overflow-hidden min-h-[2_*_2_*_var(--spacing)_+_var(--text-sm)_+_2_*_4_var(--spacing)_+_var(--text-sm))] rounded-lg border border-gray-700 mb-8">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
          </div>
          <div className="p-4 overflow-y-scroll space-y-3">
            {messages && messages.map((message, index) => (
              <div
                key={index}
                className="text-gray-300 leading-relaxed"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-blue-400 text-sm mr-2">▶</span>
                {message}
              </div>
            ))}
            <div ref={messagesBottom}></div>
          </div>
        </div>

        {/* Health Bars */}
        {
          gameState.gameScene === GameScene.BATTLE_SCENE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 space-x">
              <div className="bg-gray-800 rounded-lg p-4">
                <HealthBar
                  current={gameState.player.shield}
                  max={PLAYER_SHIELD_MAX}
                  label="Player Health"
                  color="bg-green-500"
                  handleAction={handleAction}
                />
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                {gameState.enemies.map((enemy, index) => (
                  <HealthBar
                    key={index}
                    index={index}
                    attackable={gameState.attackStep2}
                    current={enemy.shield}
                    max={ENEMY_SHIELD_MAX}
                    label={`Enemy ${enemy.enemyNum} Health`}
                    color="bg-red-800"
                    handleAction={handleAction}
                  />
                ))}
              </div>
            </div>
          )
        }

        {/* Command Buttons */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">{!(gameState.gameScene === GameScene.MENU_SCENE) ? 'Combat Actions' : 'Game Options'}</h3>
            <div className="sm:grid sm:grid-cols-2 sm:gap-4 ">
              {gameState.gameScene === GameScene.BATTLE_SCENE ? (
                <>
                  <button className="block w-full sm:w-auto mb-4 sm:mb-0 bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" onClick={() => { handleAction(BattleSceneAction.ATTACK_STEP_1); }}>
                    Attack
                  </button>
                  <button className="block w-full sm:w-auto mb-4 sm:mb-0 bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" onClick={() => { handleAction(BattleSceneAction.SHIELD); }}>
                    Defend
                  </button>
                </>
              ) : (
                <>
                  <button className="block w-full sm:w-auto mb-4 sm:mb-0 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" onClick={() => { handleAction(MenuSceneAction.BATTLE); }}>
                    Battle
                  </button>
                  <button className="block w-full sm:w-auto mb-4 sm:mb-0 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" onClick={() => { handleAction(MenuSceneAction.RESTART); }}>
                    Restart
                  </button>
                </>
              )}
              {/* <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Use Item
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Special
                </button> */}
            </div >
          </div >

          {/* <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">General Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Inventory
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Stats
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Run Away
                </button>
              </div>
            </div> */}
        </div >
      </div >

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
    </div >
  );
};

export default RPGInterface;
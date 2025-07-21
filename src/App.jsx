import { useState, useRef, useEffect } from 'react'
import './App.css'



const RPGInterface = () => {
  const [messages, setMessages] = useState([
    "This is where all the messages appear.",
    "These messages are super engaging and interesting, I promise."
  ]);

  const messagesBottom = useRef(null);

  const playerShieldMax = 100;
  const playerBaseShieldRecharge = 2;

  const enemyShieldMax = 20;

  const GameScene = Object.freeze({
    MENU_SCENE: "MENU_SCENE",
    BATTLE_SCENE: "BATTLE_SCENE",
  });

  const MenuSceneAction = Object.freeze({
    BATTLE: "BATTLE",
    SAVE: "SAVE",
    RESTART: "RESTART"
  });

  const BattleSceneAction = Object.freeze({
    ATTACK: "ATTACK",
    SHIELD: "SHIELD",
    CONCEDE: "CONCEDE"
  });


  const [gameState, setGameState] = useState(
    {
      player: {
        shield: 10,
        defeated: false,
        weapon: {
          baseDamage: 3,
          bonusDamageMin: 0,
          bonusDamageMax: 2
        }
      },
      enemy: null,
      enemiesDefeated: 0,
      gameScene: GameScene.MENU_SCENE,
    }
  );

  const weaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(Math.random() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const createEnemy = (level) => {
    return {
      level,
      weapon: {
        baseDamage: level,
        bonusDamageMin: 1 + Math.floor(level / 10),
        bonusDamageMax: 2 + Math.floor(level / 5),
      },
      shield: 10,
      defeated: false
    }
  };

  const applyEnemyDamage = (localState, amount) => {
    if (amount >= localState.enemy.shield) {
      localState.enemy.defeated = true;
      localState.enemy.shield = 0;
    } else {
      localState.enemy.shield = localState.enemy.shield - amount;
      console.assert(localState.enemy.shield > 0);
    }
  };

  const applyPlayerDamage = (localState, amount) => {
    if (amount >= localState.player.shield) {
      localState.player.defeated = true
      localState.player.shield = 0;
    } else {
      const newShieldAmount = localState.player.shield - amount;
      localState.player.shield = newShieldAmount;
      console.assert(localState.player.shield > 0);
    }
  };

  const rechargePlayerShield = (localState, amount) => {
    localState.player.shield = Math.min(playerShieldMax, localState.player.shield + amount);
  };

  useEffect(() => {
    if (messagesBottom.current) {
      messagesBottom.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const log = (message) => {
    setMessages(messages => [...messages, message]);
  };

  const printStatus = (localState) => {
    let result = `Player Shield: ${localState.player.shield}/${playerShieldMax}\n`;
    if (localState.enemy === null) {
      result += "Enemy Shield: N/A\n";
    } else {
      result += `Enemy Shield: ${localState.enemy.shield}/${enemyShieldMax}\n`;
    }
    log(result);
  };

  const enemyAttack = (localState) => {
    const enemyDamage = weaponAttackDamage(localState.enemy.weapon);
    applyPlayerDamage(localState, enemyDamage);
    log(`Enemy attacks for ${enemyDamage} damage!`);
    printStatus(localState);
    if (localState.player.defeated) {
      log(`Player defeated after winning ${localState.enemiesDefeated} battles! Game Over.`);
      log("Click Restart to start a new game.");
      localState.gameScene = GameScene.MENU_SCENE;
    } else {
      rechargePlayerShield(localState, playerBaseShieldRecharge);
      log(`Player shield recharges by ${playerBaseShieldRecharge} to ${localState.player.shield}/${playerShieldMax}`);
      printStatus(localState);
    }
  };

  const handleAction = (action) => {
    setGameState((prevState) => {
      const localState = structuredClone(prevState);
      if (localState.gameScene === GameScene.MENU_SCENE) {
        if (action === MenuSceneAction.SAVE) {
          console.log("Saving not implemented yet.");
        } else if (action === MenuSceneAction.RESTART) {
          localState.player.shield = 10;
          localState.player.defeated = false;
          localState.enemy = null;
          localState.enemiesDefeated = 0;
          localState.gameScene = GameScene.MENU_SCENE;
          log("Started a new game.");
          printStatus(localState);
        } else if (action === MenuSceneAction.BATTLE) {
          if (localState.player.defeated) {
            log("Player was defeated. Click Restart to start a new game.");
          } else {
            localState.enemy = createEnemy(localState.enemy === null ? 1 : localState.enemy.level + 1);
            localState.gameScene = GameScene.BATTLE_SCENE;
            printStatus(localState);
          }
        } else {
          // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
          console.assert(false);
          log(`Unknown command ${action}`);
        }
      } else if (localState.gameScene === GameScene.BATTLE_SCENE) {
        if (action === BattleSceneAction.ATTACK) {
          const damage = weaponAttackDamage(localState.player.weapon);
          applyEnemyDamage(localState, damage);
          log(`Player attacks for ${damage} damage!`);
          if (localState.enemy.defeated) {
            printStatus(localState);
            log("Enemy defeated!");
            localState.enemiesDefeated = localState.enemiesDefeated + 1;
            const rechargeBonus = 5 + Math.floor(localState.enemy.level / 5);
            rechargePlayerShield(localState, rechargeBonus);
            log(
              `Shield recharged by ${rechargeBonus} to ${localState.player.shield}/${playerShieldMax}`
            );
            localState.gameScene = GameScene.MENU_SCENE;
          } else {
            enemyAttack(localState);
          }
        } else if (action === BattleSceneAction.SHIELD) {
          const recharge = playerBaseShieldRecharge * 3;
          rechargePlayerShield(localState, recharge);
          log(`Focusing the shield recharges by ${recharge} to ${localState.player.shield}/${playerShieldMax}`);
          enemyAttack(localState);
        } else if (action === BattleSceneAction.CONCEDE) {
          log(`Conceding. Player defeated after winning ${localState.enemiesDefeated} battles! Game Over.`);
          log("Click Restart to start a new game.");
          localState.player.defeated = true;
          localState.gameScene = GameScene.MENU_SCENE;
        }
      } else {
        console.assert(false);
        log(`Unknown scene ${localState.gameScene}`);
      }
      return localState;
    });
  };

  const HealthBar = ({ current, max, label, color }) => (
    <div className="bg-gray-800 rounded-lg p-4">
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
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl text-center font-bold text-gray-100 mb-8">Adventure Quest</h1>

        {/* Main Game Area */}
        {/* Console/Messages Area */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
          </div>
          <div className="p-4 h-96 overflow-y-scroll space-y-3">
            {messages.map((message, index) => (
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
              <HealthBar
                current={gameState.player.shield}
                max={playerShieldMax}
                label="Player Health"
                color="bg-green-500"
              />
              <HealthBar
                current={gameState.enemy === null ? 0 : gameState.enemy.shield}
                max={enemyShieldMax}
                label="Enemy Health"
                color="bg-red-800"
              />
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
                  <button className="block w-full sm:w-auto mb-4 sm:mb-0 bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200" onClick={() => { handleAction(BattleSceneAction.ATTACK); }}>
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
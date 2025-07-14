import { useState } from 'react'
import './App.css'



const RPGInterface = () => {
  // Sample messages for the console
  const messages = [
    "You enter a dark cavern. The air is thick with moisture.",
    "A goblin emerges from the shadows, snarling menacingly.",
    "The goblin attacks with a rusty dagger!",
    "You dodge the attack and counter with your sword.",
    "The goblin takes 15 damage and staggers backward."
  ];

  const playerShieldMax = 100;
  const playerBaseShieldRecharge = 2;

  const [menu, setMenu] = useState(true);

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

  const [playerShield, setPlayerShield] = useState(10);
  const [playerDefeated, setPlayerDefeated] = useState(false);
  const [playerWeapon, setPlayerWeapon] = useState({
    baseDamage: 3,
    bonusDamageMin: 0,
    bonusDamageMax: 2
  });

  const [enemyWeapon, setEnemyWeapon] = useState(null);
  const [enemyShield, setEnemyShield] = useState(null);
  const [enemyDefeated, setEnemyDefeated] = useState(null);

  const [enemyLevel, setEnemyLevel] = useState(0);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [gameScene, setGameScene] = useState(GameScene.MENU_SCENE);

  const weaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(Math.random() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const clearEnemy = () => {
    setEnemyWeapon(null);
    setEnemyShield(null);
    setEnemyDefeated(null);
    setEnemyLevel(0);
  };

  const populateEnemy = (level) => {
    setEnemyLevel(level);
    setEnemyWeapon({
      baseDamage: level,
      bonusDamageMin: 1 + Math.floor(level / 10),
      bonusDamageMax: 2 + Math.floor(level / 5),
    });
    setEnemyShield(10);
    setEnemyDefeated(false);
  };

  const applyEnemyDamage = (amount) => {
    if (amount > enemyShield) {
      setEnemyDefeated(true);
      setEnemyShield(0);
    } else {
      setEnemyShield(enemyShield - amount);
      console.assert(enemyShield >= 0);
    }
  };

  const applyPlayerDamage = (amount) => {
    if (amount > playerShield) {
      setPlayerDefeated(true);
      setPlayerShield(0);
    } else {
      console.log(`Amount: ${amount}`);
      let newShieldAmount = playerShield - amount;
      console.log(`New shield amount: ${newShieldAmount}`);
      setPlayerShield(newShieldAmount);
      console.assert(playerShield >= 0);
      console.log(`New player shield: ${playerShield}`);
    }
  };

  const rechargePlayerShield = (amount) => {
    setPlayerShield(Math.min(playerShieldMax, playerShield + amount));
  };

  // TODO: replace this with a function that updates the text log in the UI
  const log = console.log;

  const printStatus = () => {
    let result = `Player Shield: ${playerShield}/${playerShieldMax}\n`;
    if (enemyShield === null) {
      result += "Enemy Shield: N/A\n";
    } else {
      result += `Enemy Shield: ${enemyShield}/${enemyShieldMax}\n`;
    }
    log(result);
  };

  const enemyAttack = () => {
    let enemyDamage = weaponAttackDamage(enemyWeapon);
    console.log(`Enemy Damage: ${enemyDamage}`);
    applyPlayerDamage(enemyDamage);
    log(`Enemy attacks for ${enemyDamage} damage!`);
    printStatus();
    console.log("Printed Status...");
    console.log(playerShield);
    if (playerDefeated) {
      log(`Player defeated after winning ${this.enemiesDefeated} battles! Game Over.`);
      log("Click Restart to start a new game.");
      setGameScene(GameScene.MENU_SCENE);
    } else {
      rechargePlayerShield(playerBaseShieldRecharge);
      log(`Player shield recharges by ${playerBaseShieldRecharge} to ${playerShield}/${playerShieldMax}`);
      printStatus();
    }
  };

  const handleAction = (action) => {
    console.log(action);
    if (gameScene === GameScene.MENU_SCENE) {
      if (action === MenuSceneAction.SAVE) {
        console.log("Saving not implemented yet.");
      } else if (action === MenuSceneAction.RESTART) {
        setPlayerShield(10);
        setPlayerDefeated(false);
        clearEnemy();
        setEnemiesDefeated(0);
        setGameScene(GameScene.MENU_SCENE);
        log("Started a new game.");
        printStatus();
      } else if (action === MenuSceneAction.BATTLE) {
        if (playerDefeated) {
          log("Player was defeated. Click Restart to start a new game.");
        } else {
          populateEnemy(enemyLevel + 1);
          setGameScene(GameScene.BATTLE_SCENE);
          printStatus();
        }
      } else {
        // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
        console.assert(false);
        log(`Unknown command ${action}`);
      }
    } else if (gameScene === GameScene.BATTLE_SCENE) {
      if (action === BattleSceneAction.ATTACK) {
        let damage = weaponAttackDamage(playerWeapon);
        applyEnemyDamage(damage);
        log(`Player attacks for ${damage} damage!`);
        if (enemyDefeated) {
          printStatus();
          log("Enemy defeated!");
          setEnemiesDefeated(enemiesDefeated + 1);
          let rechargeBonus = 5 + Math.floor(enemyLevel / 5);
          rechargePlayerShield(rechargeBonus);
          log(
            `Shield recharged by ${rechargeBonus} to ${playerShield}/${playerShieldMax}`
          );
          setGameScene(GameScene.MENU_SCENE);
        } else {
          enemyAttack();
        }
      } else if (action === BattleSceneAction.SHIELD) {
        let recharge = this.player.focusedShieldRecharge();
        this.player.rechargeShield(recharge);
        log(`Focusing the shield recharges by ${recharge} to ${playerShield}/${playerShieldMax}`);
        enemyAttack();
      } else if (action === BattleSceneAction.CONCEDE) {
        log(`Conceding. Player defeated after winning ${enemiesDefeated} battles! Game Over.`);
        log("Click Restart to start a new game.");
        setPlayerDefeated(true);
        setGameScene(GameScene.MENU_SCENE);
      }
    } else {
      console.assert(false);
      log(`Unknown scene ${gameScene}`);
    }
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
        <div className="bg-gray-800 rounded-lg border border-gray-700 h-96 overflow-hidden mb-8">
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
            <h2 className="text-sm font-medium text-gray-300">Game Console</h2>
          </div>
          <div className="p-4 h-full overflow-y-auto">
            <div className="space-y-3">
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
            </div>
          </div>
        </div>

        {/* Health Bars */}
        {!menu && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 space-x">
            <HealthBar
              current={playerHealth}
              max={playerMaxHealth}
              label="Player Health"
              color="bg-green-500"
            />
            <HealthBar
              current={enemyHealth}
              max={enemyMaxHealth}
              label="Enemy Health"
              color="bg-red-800"
            />
          </div>
        )}

        {/* Command Buttons */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">{!menu ? 'Combat Actions' : 'Game Options'}</h3>
            <div className="sm:grid sm:grid-cols-2 sm:gap-4 ">
              {!menu ? (
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
            </div>
          </div>

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
        </div>
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
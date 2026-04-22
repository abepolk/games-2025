import {
  GameScene,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX
} from "@/gameLogic/gameLogic";
import HealthBar from "./HealthBar";

const StatusBars = ({ gameScene, enemies, player, dispatchAction }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 space-x">
    <div className="bg-gray-800 rounded-lg p-4">
      <HealthBar
        current={player.shield}
        max={PLAYER_SHIELD_MAX}
        label="Player Health"
        color="bg-green-500"
        dispatchAction={dispatchAction}
      />
    </div>
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {enemies.map((enemy, index) => (
        <HealthBar
          key={enemy.enemyNum}
          index={index}
          attackable={gameScene === GameScene.BATTLE_SELECT_ENEMY}
          current={enemy.shield}
          max={ENEMY_SHIELD_MAX}
          label={`Enemy ${enemy.enemyNum} Health`}
          color="bg-red-800"
          dispatchAction={dispatchAction}
          weaponKind={enemy.weapon.kind}
        />
      ))}
    </div>
  </div>
);

export default StatusBars;
import {
  GameAction,
  EnemyWeaponKind
} from "@/gameLogic/gameLogic";

import daggerIcon from "@/assets/dagger.svg";
import stickIcon from "@/assets/stick.svg";
import spearIcon from "@/assets/spear.svg";

const HealthBar = ({ attackable, current, max, label, color, index, weaponKind, dispatchAction }) => (
  <div className="flex">
    {attackable && (
      <button
        className="
          bg-gray-600
          hover:bg-gray-700
          rounded-lg
          px-4
          mr-4
          flex
          flex-col
          justify-center
        "
        onClick={() => {
          dispatchAction({ type: GameAction.SELECT_ENEMY,
            attackedEnemyIndex: index
          });
        }}
      >
        Select
      </button>
    )}
    <div className="grow">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">
          {current}
          /
          {max}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(current / max) * 100}%` }}
        />
      </div>
    </div>
    {/* Placeholder for dagger, stick and spear icons */}
    {weaponKind === EnemyWeaponKind.DAGGER && (
      <img src={daggerIcon} className="h-12 w-12" alt="dagger" />
    )}
    {weaponKind === EnemyWeaponKind.STICK && (
      <img src={stickIcon} className="h-12 w-12" alt="stick" />
    )}
    {weaponKind === EnemyWeaponKind.SPEAR && (
      <img src={spearIcon} className="h-12 w-12" alt="spear" />
    )}
  </div>
);

export default HealthBar;

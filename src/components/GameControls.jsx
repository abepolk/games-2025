import {
  GameScene,
  GameAction,
  AttackKind
} from "../gameLogic/gameLogic";

import ActionButton from "./ActionButton";

const GameControls = ({ gameScene, player, dispatchAction }) => {
  let buttonOptions;
  if (gameScene === GameScene.BATTLE_BASE) {
    // Attack and Defend buttons
    buttonOptions = (
      <>
        <ActionButton
          key="attack-button"
          text="Attack"
          baseColor="bg-red-800"
          hoverClass="hover:bg-red-900"
          disabledBgClass="disabled:bg-red-gray"
          disabledClass="disabled:text-gray-400"
          enabled={gameScene === GameScene.BATTLE_BASE}
          actionCallback={() => {
            dispatchAction({ type: GameAction.ATTACK });
          }}
        />
        <ActionButton
          key="defend-button"
          text="Defend"
          baseColor="bg-indigo-800"
          hoverClass="hover:bg-indigo-900"
          disabledClass="disabled:bg-white"
          enabled={true}
          actionCallback={() => {
            dispatchAction({ type: GameAction.SHIELD });
          }}
        />
      </>
    );
  } else if (gameScene === GameScene.BATTLE_SELECT_ATTACK || gameScene == GameScene.BATTLE_SELECT_ENEMY) {
    // Attack options and Canceled
    // Attack options are disabled if BATTLE_SELECT_ENEMY
    buttonOptions = (
      <>
        <div className="sm:grid sm:grid-cols-2 sm:gap-4 ">
          <ActionButton
            key="sword-slash-button"
            text="Sword Slash"
            baseColor="bg-red-800"
            hoverClass="hover:bg-red-900"
            disabledBgClass="disabled:bg-red-gray"
            disabledClass="disabled:text-gray-400"
            enabled={gameScene === GameScene.BATTLE_SELECT_ATTACK}
            actionCallback={() => {
              dispatchAction({ type: GameAction.SELECT_ATTACK_KIND, attackKind: AttackKind.SWORD_SLASH });
            }}
          />
          <ActionButton
            key="power-slash-button"
            text={player.powerSlashCooldownRemaining <= 0 ? "Power Slash" : `Recharging (${player.powerSlashCooldownRemaining} left)`}
            baseColor="bg-red-800"
            hoverClass="hover:bg-red-900"
            disabledBgClass="disabled:bg-red-gray"
            disabledClass="disabled:text-gray-400"
            enabled={gameScene === GameScene.BATTLE_SELECT_ATTACK && player.powerSlashCooldownRemaining <= 0}
            actionCallback={() => {
              dispatchAction({ type: GameAction.SELECT_ATTACK_KIND, attackKind: AttackKind.POWER_SLASH });
            }}
          />
        </div>
        <ActionButton
          key="cancel-button"
          text="Cancel Attack"
          baseColor="bg-zinc-600"
          hoverClass="hover:bg-zinc-700"
          disabledClass="disabled:bg-white"
          enabled={true}
          actionCallback={() => {
            dispatchAction({ type: GameAction.CANCEL_ATTACK });
          }}
        />
      </>
    );
  } else {
    // Battle and Restart buttons
    buttonOptions = (
      <>
        {!(player && player.defeated)
          && (
            <ActionButton
              key="battle-button"
              text="Battle"
              baseColor="bg-orange-600"
              hoverClass="hover:bg-orange-700"
              disabledBgClass="disabled:bg-orange-gray"
              disabledClass="disabled:text-gray-400"
              enabled={true}
              actionCallback={() => {
                dispatchAction({ type: GameAction.BATTLE });
              }}
            />
          )}
        <ActionButton
          key="restart-button"
          text="Restart"
          baseColor="bg-gray-600"
          hoverClass="hover:bg-gray-700"
          disabledClass="disabled:bg-white"
          spanWholeWidth={player && player.defeated}
          enabled={true}
          actionCallback={() => {
            dispatchAction({ type: GameAction.RESTART });
          }}
        />
      </>
    );
  }
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">{!(gameScene === GameScene.MENU_SCENE) ? "Combat Actions" : "Game Options"}</h3>
        <div className="sm:grid sm:grid-cols-2 sm:gap-4 ">
          {buttonOptions}
        </div>
      </div>
    </div>
  );
};

export default GameControls;

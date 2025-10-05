const PLAYER_SHIELD_MAX = 100;
const PLAYER_BASE_SHIELD_RECHARGE = 2;

const ENEMY_SHIELD_MAX = 20;

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

const initGame = (state) => {
  state.player = {
    shield: 10,
    defeated: false,
    weapon: {
      baseDamage: 3,
      bonusDamageMin: 0,
      bonusDamageMax: 2
    }
  };
  state.enemy = null;
  state.enemiesDefeated = 0;
};

const updateState = ({action, state, appendMessage}) => {

  const rechargePlayerShield = (localState, amount) => {
    localState.player.shield = Math.min(PLAYER_SHIELD_MAX, localState.player.shield + amount);
  };

  const printStatus = (localState) => {
    const result = [`Player Shield: ${localState.player.shield}/${PLAYER_SHIELD_MAX}`];
    if (localState.enemy === null) {
      result.push("Enemy Shield: N/A");
    } else {
      result.push(`Enemy Shield: ${localState.enemy.shield}/${ENEMY_SHIELD_MAX}`);
    }
    appendMessage(result.join('\n'));
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

  const enemyAttack = (localState) => {
    const enemyDamage = weaponAttackDamage(localState.enemy.weapon);
    applyPlayerDamage(localState, enemyDamage);
    appendMessage(`Enemy attacks for ${enemyDamage} damage!`);
    printStatus(localState);
    if (localState.player.defeated) {
      appendMessage(`Player defeated after winning ${localState.enemiesDefeated} battles! Game Over.`);
      appendMessage("Click Restart to start a new game.");
      localState.gameScene = GameScene.MENU_SCENE;
    } else {
      rechargePlayerShield(localState, PLAYER_BASE_SHIELD_RECHARGE);
      appendMessage(`Player shield recharges by ${PLAYER_BASE_SHIELD_RECHARGE} to ${localState.player.shield}/${PLAYER_SHIELD_MAX}`);
      printStatus(localState);
    }
  };

  const weaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(Math.random() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
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

  if (state.gameScene === GameScene.MENU_SCENE) {
    if (action === MenuSceneAction.SAVE) {
      throw "Saving not implemented yet.";
    } else if (action === MenuSceneAction.RESTART) {
      state.gameScene = GameScene.MENU_SCENE;
      initGame(state);
      appendMessage("Started a new game.");
      printStatus(state);
    } else if (action === MenuSceneAction.BATTLE) {
      if (state.player.defeated) {
        appendMessage("Player was defeated. Click Restart to start a new game.");
      } else {
        state.enemy = createEnemy(state.enemy === null ? 1 : state.enemy.level + 1);
        state.gameScene = GameScene.BATTLE_SCENE;
        printStatus(state);
      }
    } else {
      // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
      throw `Unknown command ${action}`;
    }
  } else if (state.gameScene === GameScene.BATTLE_SCENE) {
    if (action === BattleSceneAction.ATTACK) {
      const damage = weaponAttackDamage(state.player.weapon);
      applyEnemyDamage(state, damage);
      appendMessage(`Player attacks for ${damage} damage!`);
      if (state.enemy.defeated) {
        printStatus(state);
        appendMessage("Enemy defeated!");
        state.enemiesDefeated = state.enemiesDefeated + 1;
        const rechargeBonus = 5 + Math.floor(state.enemy.level / 5);
        rechargePlayerShield(state, rechargeBonus);
        appendMessage(
          `Shield recharged by ${rechargeBonus} to ${state.player.shield}/${PLAYER_SHIELD_MAX}`
        );
        state.gameScene = GameScene.MENU_SCENE;
      } else {
        enemyAttack(state);
      }
    } else if (action === BattleSceneAction.SHIELD) {
      const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
      rechargePlayerShield(state, recharge);
      appendMessage(`Focusing the shield recharges by ${recharge} to ${state.player.shield}/${PLAYER_SHIELD_MAX}`);
      enemyAttack(state);
    } else if (action === BattleSceneAction.CONCEDE) {
      appendMessage(`Conceding. Player defeated after winning ${state.enemiesDefeated} battles! Game Over.`);
      appendMessage("Click Restart to start a new game.");
      state.player.defeated = true;
      state.gameScene = GameScene.MENU_SCENE;
    }
  } else {
    throw `Unknown scene ${state.gameScene}`;
  }
  return state;
}

export {
  GameScene,
  MenuSceneAction,
  BattleSceneAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  initGame,
  updateState
};
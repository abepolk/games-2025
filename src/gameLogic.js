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
  ATTACK_STEP_1: "ATTACK_STEP_1",
  ATTACK_STEP_2: "ATTACK_STEP_2",
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
  // state.enemy = null;
  // Currently unused
  state.enemies = []
  state.enemiesDefeated = 0;
  state.battlesWon = 0;
  state.attackStep2 = false;

};

const updateState = ({action, state, appendMessage, options}) => {

  const rechargePlayerShield = (player, amount) => {
    player.shield = Math.min(PLAYER_SHIELD_MAX, player.shield + amount);
  };

  const debugPrintStatus = () => {
    const result = [`Player Shield: ${state.player.shield}/${PLAYER_SHIELD_MAX}`];
    if (state.enemies.length === 0) {
      console.log("No enemies present");
      return;
    }
    state.enemies.forEach((enemy, index) => {
      if (enemy === null) {
        console.error(`Enemy ${index} is null`);
        result.push(`Enemy ${index} is null`);
      } else if (enemy.defeated) {
        result.push(`Enemy ${index} has been defeated`);
      } else {
        result.push(`Enemy ${index} Shield: ${enemy.shield}/${ENEMY_SHIELD_MAX}`);
      }
    });
    console.log(result.join('\n'));
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

  const applyEnemyDamage = (enemy, amount) => {
    if (amount >= enemy.shield) {
      enemy.defeated = true;
      enemy.shield = 0;
    } else {
      enemy.shield = enemy.shield - amount;
      console.assert(enemy.shield > 0);
    }
  };

  const enemyAttack = (localState) => {
    for (const enemy of localState.enemies) {
      const enemyDamage = weaponAttackDamage(enemy.weapon);
      applyPlayerDamage(localState.player, enemyDamage);
      appendMessage(`Enemy attacks for ${enemyDamage} damage!`);
      debugPrintStatus();
      if (localState.player.defeated) {
        appendMessage(`Player defeated after winning ${localState.enemiesDefeated} battles! Game Over.`);
        appendMessage("Click Restart to start a new game.");
        localState.gameScene = GameScene.MENU_SCENE;
        return;
      }
    };
    rechargePlayerShield(localState.player, PLAYER_BASE_SHIELD_RECHARGE);
    appendMessage(`Player shield recharges by ${PLAYER_BASE_SHIELD_RECHARGE} to ${localState.player.shield}/${PLAYER_SHIELD_MAX}`);
    debugPrintStatus();
  };

  const weaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(Math.random() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const applyPlayerDamage = (player, amount) => {
    if (amount >= player.shield) {
      player.defeated = true
      player.shield = 0;
    } else {
      const newShieldAmount = player.shield - amount;
      player.shield = newShieldAmount;
      console.assert(player.shield > 0);
    }
  };

  if (state.gameScene === GameScene.MENU_SCENE) {
    if (action === MenuSceneAction.SAVE) {
      throw "Saving not implemented yet.";
    } else if (action === MenuSceneAction.RESTART) {
      state.gameScene = GameScene.MENU_SCENE;
      initGame(state);
      appendMessage("Started a new game.");
      debugPrintStatus();
    } else if (action === MenuSceneAction.BATTLE) {
      if (state.player.defeated) {
        appendMessage("Player was defeated. Click Restart to start a new game.");
      } else {
        state.enemies = [
          undefined,
          undefined,
          undefined
        ].map((_, index) => {
          if (state.enemies.length === 0) {
            return createEnemy(1);
          } else {
            return createEnemy(state.enemies[0].level + 1);
          }
        });
        state.gameScene = GameScene.BATTLE_SCENE;
        debugPrintStatus();
      }
    } else {
      // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
      throw `Unknown command ${action}`;
    }
  } else if (state.gameScene === GameScene.BATTLE_SCENE) {
    if (action === BattleSceneAction.ATTACK_STEP_1) {
      state.attackStep2 = true;
    } else if (action === BattleSceneAction.ATTACK_STEP_2) {
      state.attackStep2 = false;
      const damage = weaponAttackDamage(state.player.weapon);
      console.assert(options.attackedEnemyIndex !== undefined);
      const enemy = state.enemies[options.attackedEnemyIndex];
      applyEnemyDamage(enemy, damage);
      appendMessage(`Player attacks for ${damage} damage!`);
      if (enemy.defeated) {
        debugPrintStatus();
        appendMessage("Enemy defeated!");
        state.enemiesDefeated = state.enemiesDefeated + 1;
        const rechargeBonus = 5 + Math.floor(enemy.level / 5);
        rechargePlayerShield(state.player, rechargeBonus);
        appendMessage(
          `Shield recharged by ${rechargeBonus} to ${state.player.shield}/${PLAYER_SHIELD_MAX}`
        );
        state.gameScene = GameScene.MENU_SCENE;
      } else {
        enemyAttack(state);
      }
    } else if (action === BattleSceneAction.SHIELD) {
      const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
      rechargePlayerShield(state.player, recharge);
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
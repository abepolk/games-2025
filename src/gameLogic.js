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
  // A counter for enemies that lets us refer to them
  state.enemyNum = 0;
  state.player = {
    shield: 25,
    defeated: false,
    weapon: {
      baseDamage: 3,
      bonusDamageMin: 0,
      bonusDamageMax: 2
    }
  };
  state.enemies = []
  state.enemiesDefeated = 0;
  state.battlesWon = 0;
  state.attackStep2 = false;
};

const updateState = ({ action, state, options }) => {

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
    state.enemyNum++;
    return {
      enemyNum: state.enemyNum,
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

  // how do we make enemies get stronger

  // Discussed levels of explaining what's happening
  // * leaned toward saying that the enemies got stronger when their allies are defeated but not saying exactly what the mechanics are
  // * Flavor has a few options: creatures that consume fallen allies, gets angry and thus stronger when ally defeated, or picks up weapons
  // 	* picks up weapons was our favorite

  // Decided we wanted to have enemies that were all identical at first
  // but then change when their allies are defeated

  // stabs with dagger
  // hits with stick
  // assembles dagger and stick into a spear and stabs with spear

  // but first let's do
  //  when an enemy is defeated, we pick a remaining enemy and add
  //  the defeated enemy's weapon strength to its weapon strength,
  //  plus a bonus.
  // We have a message that says the name of the enemy and that it combined
  //  its fallen ally's weapon with its own to become stronger

  // Later we can have more complex logic where enemies start with
  //  kind A or B (e.g. dagger and stick) and when an enemy is defeated,
  //  we find an enemy with the opposite kind of weapon and combine them
  //  into a more powerful weapon, e.g. a spear


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
      localState.messages.push(`Enemy ${enemy.enemyNum} attacks for ${enemyDamage} damage!`);
      debugPrintStatus();
      if (localState.player.defeated) {
        localState.messages.push(`Player defeated after winning ${localState.enemiesDefeated} battles! Game Over.`);
        localState.messages.push("Click Restart to start a new game.");
        localState.gameScene = GameScene.MENU_SCENE;
        return;
      }
    };
    rechargePlayerShield(localState.player, PLAYER_BASE_SHIELD_RECHARGE);
    localState.messages.push(`Player shield recharges by ${PLAYER_BASE_SHIELD_RECHARGE} to ${localState.player.shield}/${PLAYER_SHIELD_MAX}`);
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
      state.messages.push("Started a new game.");
      debugPrintStatus();
    } else if (action === MenuSceneAction.BATTLE) {
      if (state.player.defeated) {
        state.messages.push("Player was defeated. Click Restart to start a new game.");
      } else {
        state.enemies = [
          undefined,
          undefined,
          undefined
        ].map(_ => createEnemy(state.battlesWon));
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
      const attackedEnemyIndex = options.attackedEnemyIndex
      console.assert(attackedEnemyIndex !== undefined);
      const enemy = state.enemies[attackedEnemyIndex];
      applyEnemyDamage(enemy, damage);
      state.messages.push(`Player attacks for ${damage} damage!`);
      if (enemy.defeated) {
        debugPrintStatus();
        state.messages.push(`Enemy ${enemy.enemyNum} defeated!`);
        state.enemiesDefeated = state.enemiesDefeated + 1;
        state.enemies.splice(attackedEnemyIndex, 1);
        if (state.enemies.length > 0) {
          const weaponForTransfer = enemy.weapon;
          const weaponRecipient = state.enemies[Math.floor(Math.random() * state.enemies.length)];
          weaponRecipient.weapon.baseDamage = weaponRecipient.weapon.baseDamage + weaponForTransfer.baseDamage;
          state.messages.push(`Enemy ${weaponRecipient.enemyNum} picked up enemy ${enemy.enemyNum}'s weapon and used it to superpower their other weapon!`);
        }
      }
      if (state.enemies.length === 0) {
        const rechargeBonus = 5 + Math.floor(enemy.level / 5);
        rechargePlayerShield(state.player, rechargeBonus);
        state.messages.push(
          `Shield recharged by ${rechargeBonus} to ${state.player.shield}/${PLAYER_SHIELD_MAX}`
        );
        state.battlesWon++;
        state.gameScene = GameScene.MENU_SCENE;
      } else {
        enemyAttack(state);
      }
    } else if (action === BattleSceneAction.SHIELD) {
      const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
      rechargePlayerShield(state.player, recharge);
      state.messages.push(`Focusing the shield recharges by ${recharge} to ${state.player.shield}/${PLAYER_SHIELD_MAX}`);
      enemyAttack(state);
    } else if (action === BattleSceneAction.CONCEDE) {
      state.messages.push(`Conceding. Player defeated after winning ${state.enemiesDefeated} battles! Game Over.`);
      state.messages.push("Click Restart to start a new game.");
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
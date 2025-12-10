import { selectRandomElement } from "./utils";

const PLAYER_SHIELD_MAX = 500;
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

const WeaponKind = Object.freeze({
  DAGGER: "DAGGER",
  STICK: "STICK",
  SPEAR: "SPEAR"
});

const weapons = [
  {
    kind: WeaponKind.DAGGER,
    strength: 2,
    name: "dagger",
    namePlural: "daggers"
  },
  {
    kind: WeaponKind.STICK,
    strength: 2,
    name: "stick",
    namePlural: "sticks"
  },
  {
    kind: WeaponKind.SPEAR,
    strength: 7,
    name: "spear",
    namePlural: "spears"
  }
];

const initGame = (state) => {
  // A counter for enemies that lets us refer to them
  state.enemyNum = 0;
  state.player = {
    shield: PLAYER_SHIELD_MAX,
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

const step = ({ action, oldState, options, randoms }) => {

  const state = structuredClone(oldState);
  const remainingRandoms = [...randoms];

  var completed = true;

  const getRandom = () => {
    if (remainingRandoms.length === 0) {
      completed = false;
      // 0 is arbitrary - we just need a number so that we can exit `step` without throwing an error now that we know we didn't have enough random numbers
      return 0;
    } else {
      return remainingRandoms.shift();
    }
  };

  const rechargePlayerShield = (player, amount) => {
    player.shield = Math.min(PLAYER_SHIELD_MAX, player.shield + amount);
  };

  const debugPrintStatus = () => {
    return;
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

  const createWeapon = (level, kind) => {
    // Need to make spear damage value not get multiplied by zero
    // TODO level needs to be conceptually separated from battles won
    const baseDamage = (level + 1) * weapons.find(weapon => weapon.kind === kind).strength;
    const bonusDamageMin = 1 + Math.floor(level / 10);
    const bonusDamageMax = 2 + Math.floor(level / 5);
    const name = weapons.find(weapon => weapon.kind === kind).name;
    const namePlural = weapons.find(weapon => weapon.kind === kind).namePlural;
    return {
      kind,
      baseDamage,
      bonusDamageMin,
      bonusDamageMax,
      name,
      namePlural
    };
  };

  const createEnemy = (level, kind) => {
    state.enemyNum++;
    return {
      enemyNum: state.enemyNum,
      level,
      weapon: createWeapon(level, kind),
      shield: ENEMY_SHIELD_MAX,
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
      localState.messages.push(`Enemy ${enemy.enemyNum} attacks with its ${enemy.weapon.name} for ${enemyDamage} damage!`);
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
    return weapon.baseDamage + Math.floor(getRandom() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const applyPlayerDamage = (player, amount) => {
    if (amount >= player.shield) {
      player.defeated = true;
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
        const initialWeapons = [WeaponKind.DAGGER, WeaponKind.STICK];
        state.enemies = [
          undefined,
          undefined,
          undefined
        ].map(_ => {
          const weapon = selectRandomElement(initialWeapons, getRandom);
          return createEnemy(state.battlesWon, weapon);
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
    } else {
      state.attackStep2 = false;
    }
    if (action === BattleSceneAction.ATTACK_STEP_2) {
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
          var compatibleWeapon;
          if (enemy.weapon.kind === WeaponKind.DAGGER) {
            compatibleWeapon = WeaponKind.STICK;
          } else if (enemy.weapon.kind === WeaponKind.STICK) {
            compatibleWeapon = WeaponKind.DAGGER;
          } else if (enemy.weapon.kind === WeaponKind.SPEAR) {
            compatibleWeapon = null;
          } else {
            throw "Weapon kind not found when looking for a compatible weapon";
          }
          const enemiesCanTransfer = state.enemies.filter(enemy => {
            return enemy.weapon.kind === compatibleWeapon;
          });
          if (enemiesCanTransfer.length > 0) {
            const weaponRecipient = selectRandomElement(enemiesCanTransfer, getRandom);
            const oldWeapon = weaponRecipient.weapon;
            weaponRecipient.weapon = createWeapon(weaponRecipient.level, WeaponKind.SPEAR);
            state.messages.push(`Enemy ${weaponRecipient.enemyNum} picked up Enemy ${enemy.enemyNum}'s ${enemy.weapon.name} and used it with its ${oldWeapon.name} to build a powerful spear!`);
          }
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
  return { completed, state };
}

export {
  GameScene,
  MenuSceneAction,
  BattleSceneAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  initGame,
  step
};
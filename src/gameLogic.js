import { selectRandomElement } from "./utils";

const PLAYER_SHIELD_MAX = 50;
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
  CONCEDE: "CONCEDE",
  CANCEL_ATTACK: "CANCEL_ATTACK",
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

// TODO: don't love that this is called "initialGameState" but is only part of the 
// initialization of `gameState`. I'm not sure what to call this and we should revisit where
// things are initialized if we go the reducer route.
const initialGameState = () => {
  return {
    // A counter for enemies that lets us refer to them
    enemyNum: 0,
    player: {
      shield: PLAYER_SHIELD_MAX,
      defeated: false,
      weapon: {
        baseDamage: 3,
        bonusDamageMin: 0,
        bonusDamageMax: 2
      }
    },
    enemies: [],
    enemiesDefeated: 0,
    battlesWon: 0,
    attackStep2: false
  };
}

// If we decided to go with this approach, I would recommend naming the state
// as follows, but did it this way to make the diff as clean as possible by
// not changing `state` to `clonedState` in a bunch of places.
//
// updateState = (state, action) {
//   let clonedState = structuredClone(state);
//   ..
// }

const updateState = (reactState, action) => {

  let state = structuredClone(reactState);

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

  const createEnemy = (localState, level, kind) => {
    localState.enemyNum++;
    return {
      enemyNum: localState.enemyNum,
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
    localState.messages.push(`Player heals by ${PLAYER_BASE_SHIELD_RECHARGE}.`);
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

  try {
    if (state.gameScene === GameScene.MENU_SCENE) {
      if (action.type === MenuSceneAction.SAVE) {
        throw "Saving not implemented yet.";
      } else if (action.type === MenuSceneAction.RESTART) {
        state = {
          ...initialGameState(),
          gameScene: state.gameScene,
          messages: state.messages
        }

        state.gameScene = GameScene.MENU_SCENE;
        state.messages.push("Started a new game.");
        debugPrintStatus();
      } else if (action.type === MenuSceneAction.BATTLE) {
        if (state.player.defeated) {
          state.messages.push("Player was defeated. Click Restart to start a new game.");
        } else {
          const initialWeapons = [WeaponKind.DAGGER, WeaponKind.STICK];
          state.enemies = [
            undefined,
            undefined,
            undefined
          ].map(_ => {
            const weapon = selectRandomElement(initialWeapons);
            return createEnemy(state, state.battlesWon, weapon);
          });
          state.gameScene = GameScene.BATTLE_SCENE;
          debugPrintStatus();
        }
      } else {
        // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
      }
    } else if (state.gameScene === GameScene.BATTLE_SCENE) {
      if (action.type === BattleSceneAction.ATTACK_STEP_1) {
        state.attackStep2 = true;
      } else {
        // Set attackStep2 to false whenever we're not in ATTACK_STEP_1,
        // including if we get the CANCEL_ATTACK action, which is currently a no-op
        state.attackStep2 = false;
      }
      if (action.type === BattleSceneAction.ATTACK_STEP_2) {
        const damage = weaponAttackDamage(state.player.weapon);
        const attackedEnemyIndex = action.attackedEnemyIndex
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
              const weaponRecipient = selectRandomElement(enemiesCanTransfer);
              const oldWeapon = weaponRecipient.weapon;
              weaponRecipient.weapon = createWeapon(weaponRecipient.level, WeaponKind.SPEAR);
              state.messages.push(`Enemy ${weaponRecipient.enemyNum} picked up enemy ${enemy.enemyNum}'s ${enemy.weapon.name} and used it with its ${oldWeapon.name} to build a powerful spear!`);
            }
          }
        }
        if (state.enemies.length === 0) {
          const rechargeBonus = 5 + Math.floor(enemy.level / 5);
          rechargePlayerShield(state.player, rechargeBonus);
          state.messages.push(
            `Player healed by ${rechargeBonus}.`
          );
          state.battlesWon++;
          state.gameScene = GameScene.MENU_SCENE;
        } else {
          enemyAttack(state);
        }
      } else if (action.type === BattleSceneAction.SHIELD) {
        const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
        rechargePlayerShield(state.player, recharge);
        state.messages.push(`Focusing energy restored ${recharge} health.`);
        enemyAttack(state);
      } else if (action.type === BattleSceneAction.CONCEDE) {
        state.messages.push(`Conceding. Player defeated after winning ${state.enemiesDefeated} battles! Game Over.`);
        state.messages.push("Click Restart to start a new game.");
        state.player.defeated = true;
        state.gameScene = GameScene.MENU_SCENE;
      }
    } else {
      throw `Unknown scene ${state.gameScene}`;
    }
  } catch (error) {
    console.error(error);
    originalState = structuredClone(state);
    originalState.messages.push(`Error ${error}`);
    return originalState;
  }
  return state;
}

export {
  GameScene,
  MenuSceneAction,
  BattleSceneAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  WeaponKind,
  initialGameState,
  updateState
};
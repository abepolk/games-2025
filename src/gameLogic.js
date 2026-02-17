import { selectRandomElement } from "./utils";

const PLAYER_SHIELD_MAX = 150;
const PLAYER_BASE_SHIELD_RECHARGE = 2;

const ENEMY_SHIELD_MAX = 20;

const GameScene = Object.freeze({
  MENU_SCENE: "MENU_SCENE",
  BATTLE_BASE: "BATTLE_BASE",
  BATTLE_SELECT_ATTACK: "BATTLE_SELECT_ATTACK",
  BATTLE_SELECT_ENEMY: "BATTLE_SELECT_ENEMY"
});

const GameAction = Object.freeze({
  BATTLE: "BATTLE",
  RESTART: "RESTART",
  ATTACK: "ATTACK",
  SELECT_ATTACK_KIND: "SELECT_ATTACK_KIND",
  SELECT_ENEMY: "SELECT_ENEMY",
  SHIELD: "SHIELD",
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
};

const checkScene = (attemptedAction, currentScene, allowedScenes) => {
  if (!allowedScenes.includes(currentScene)) {
    throw `Action ${attemptedAction} not allowed from Scene ${currentScene}`;
  }
}

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

  const attack = (localState, localOptions) => {
    const damage = weaponAttackDamage(localState.player.weapon);
    const attackedEnemyIndex = localOptions.attackedEnemyIndex
    console.assert(attackedEnemyIndex !== undefined);
    const enemy = localState.enemies[attackedEnemyIndex];
    applyEnemyDamage(enemy, damage);
    localState.messages.push(`Player attacks for ${damage} damage!`);
    if (enemy.defeated) {
      debugPrintStatus();
      localState.messages.push(`Enemy ${enemy.enemyNum} defeated!`);
      localState.enemiesDefeated = localState.enemiesDefeated + 1;
      localState.enemies.splice(attackedEnemyIndex, 1);
      if (localState.enemies.length > 0) {
        let compatibleWeapon;
        if (enemy.weapon.kind === WeaponKind.DAGGER) {
          compatibleWeapon = WeaponKind.STICK;
        } else if (enemy.weapon.kind === WeaponKind.STICK) {
          compatibleWeapon = WeaponKind.DAGGER;
        } else if (enemy.weapon.kind === WeaponKind.SPEAR) {
          compatibleWeapon = null;
        } else {
          throw "Weapon kind not found when looking for a compatible weapon";
        }
        const enemiesCanTransfer = localState.enemies.filter(enemy => {
          return enemy.weapon.kind === compatibleWeapon;
        });
        if (enemiesCanTransfer.length > 0) {
          const weaponRecipient = selectRandomElement(enemiesCanTransfer);
          const oldWeapon = weaponRecipient.weapon;
          weaponRecipient.weapon = createWeapon(weaponRecipient.level, WeaponKind.SPEAR);
          localState.messages.push(`Enemy ${weaponRecipient.enemyNum} picked up enemy ${enemy.enemyNum}'s ${enemy.weapon.name} and used it with its ${oldWeapon.name} to build a powerful spear!`);
        }
      }
    }
    if (localState.enemies.length === 0) {
      const rechargeBonus = 5 + Math.floor(enemy.level / 5);
      rechargePlayerShield(localState.player, rechargeBonus);
      localState.messages.push(
        `Player healed by ${rechargeBonus}.`
      );
      localState.battlesWon++;
      localState.gameScene = GameScene.MENU_SCENE;
    } else {
      enemyAttack(localState);
      if (!localState.player.defeated) {
        localState.gameScene = GameScene.BATTLE_BASE;
      }
    }
  }

  console.log(state.gameScene);
  console.log(action);
  switch (action) {
    case GameAction.RESTART:
      checkScene(action, state.gameScene, [GameScene.MENU_SCENE]);

      state.gameScene = GameScene.MENU_SCENE;
      initGame(state);
      state.messages.push("Started a new game.");
      debugPrintStatus();

      break;
    case GameAction.BATTLE:
      checkScene(action, state.gameScene, [GameScene.MENU_SCENE]);

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
          return createEnemy(state.battlesWon, weapon);
        });
        state.gameScene = GameScene.BATTLE_BASE;
        debugPrintStatus();
      }

      break;
    case GameAction.ATTACK:
      checkScene(action, state.gameScene, [GameScene.BATTLE_BASE]);

      state.gameScene = GameScene.BATTLE_SELECT_ATTACK;

      break;
    case GameAction.SHIELD:
      checkScene(action, state.gameScene, [GameScene.BATTLE_BASE])

      const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
      rechargePlayerShield(state.player, recharge);
      state.messages.push(`Focusing energy restored ${recharge} health.`);
      enemyAttack(state);

      break;
    case GameAction.CANCEL_ATTACK:
      checkScene(action, state.gameScene, [GameScene.BATTLE_SELECT_ENEMY])

      state.gameScene = GameScene.BATTLE_BASE;

      break;
    case GameAction.SELECT_ENEMY:
      checkScene(action, state.gameScene, [GameScene.BATTLE_SELECT_ENEMY])

      // TODO: will need to pass in which attack we're doing, which we
      // discussed determining via an option when sending
      // the BATTLE_SELECT_ATTACK action
      attack(state, options);

      break;
    default:
      throw `Unknown Action ${action}`;

  }

  return state;
}

export {
  GameScene,
  GameAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  WeaponKind,
  initGame,
  updateState
};
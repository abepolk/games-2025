import { selectRandomElement } from "@/utils/utils";

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
  CANCEL_ATTACK: "CANCEL_ATTACK"
});

const EnemyWeaponKind = Object.freeze({
  DAGGER: "DAGGER",
  STICK: "STICK",
  SPEAR: "SPEAR"
});

const PlayerWeaponKind = Object.freeze({
  SWORD: "SWORD"
});

const AttackKind = Object.freeze({
  SWORD_SLASH: "SWORD_SLASH",
  POWER_SLASH: "POWER_SLASH"
});

const playerWeapons = [
  {
    kind: PlayerWeaponKind.SWORD,
    attackKinds: [
      {
        attackKind: AttackKind.SWORD_SLASH,
        baseDamage: 3,
        bonusDamageMin: 0,
        bonusDamageMax: 2,
        name: "Sword slash"
      },
      {
        attackKind: AttackKind.POWER_SLASH,
        baseDamage: 9,
        bonusDamageMin: 0,
        bonusDamageMax: 2,
        cooldownNeeded: 3,
        name: "Power slash"
      }
    ],
    name: "sword",
    namePlural: "swords"
  }
];

const enemyWeapons = [
  {
    kind: EnemyWeaponKind.DAGGER,
    strength: 2,
    name: "dagger",
    namePlural: "daggers"
  },
  {
    kind: EnemyWeaponKind.STICK,
    strength: 2,
    name: "stick",
    namePlural: "sticks"
  },
  {
    kind: EnemyWeaponKind.SPEAR,
    strength: 7,
    name: "spear",
    namePlural: "spears"
  }
];

const getInitialGameState = () => {
  return {
  // A counter for enemies that lets us refer to them
    enemyNum: 0,
    player: {
      shield: PLAYER_SHIELD_MAX,
      defeated: false,
      weaponKind: PlayerWeaponKind.SWORD,
      powerSlashCooldownRemaining: 0
    },
    enemies: [],
    enemiesDefeated: 0,
    battlesWon: 0,
    attackKind: null
  };
};

const checkScene = (attemptedAction, currentScene, allowedScenes) => {
  if (!allowedScenes.includes(currentScene)) {
    throw `Action ${attemptedAction} not allowed from Scene ${currentScene}`;
  }
};

const checkValidControlFlow = (localState) => {
  if (!Object.values(AttackKind).includes(localState.attackKind)
    && localState.attackKind !== null) {
    throw `Invalid attackKind: ${localState.attackKind}`;
  }
  if (!Object.values(GameScene).includes(localState.gameScene)) {
    throw `Invalid gameScene: ${localState.gameScene}`;
  }
  // We already check implicitly for the GameAction with switch case default
};

// Check that attackKind is not null when it's being used, otherwise null
const checkValidAttackKind = (attackKind, currentScene) => {
  if (currentScene === GameScene.BATTLE_SELECT_ENEMY && attackKind === null) {
    throw `attackKind is null in ${currentScene}.`;
  }
  if (currentScene !== GameScene.BATTLE_SELECT_ENEMY && attackKind !== null) {
    throw `attackKind is not null in ${currentScene}. attackKind is ${attackKind}.`;
  }
};

const updateState = (reactState, action) => {
  // TODO: This can be const once we sort out re-initializing the state, which I'm
  // currently doing by creating a new object.
  console.log(reactState);
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
    console.log(result.join("\n"));
  };

  const createWeapon = (level, kind) => {
    // Need to make spear damage value not get multiplied by zero
    // TODO level needs to be conceptually separated from battles won
    const baseDamage = (level + 1) * enemyWeapons.find(weapon => weapon.kind === kind).strength;
    const bonusDamageMin = 1 + Math.floor(level / 10);
    const bonusDamageMax = 2 + Math.floor(level / 5);
    const name = enemyWeapons.find(weapon => weapon.kind === kind).name;
    const namePlural = enemyWeapons.find(weapon => weapon.kind === kind).namePlural;
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
    };
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
      const enemyDamage = enemyWeaponAttackDamage(enemy.weapon);
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
  };

  const enemyWeaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(Math.random() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const playerAttackKindDamage = (attackKindStats) => {
    return attackKindStats.baseDamage + Math.floor(Math.random() * attackKindStats.bonusDamageMax) + attackKindStats.bonusDamageMin;
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

  const attack = (localState, localAction) => {
    const playerWeapon = playerWeapons.find((weapon) => {
      return weapon.kind === localState.player.weaponKind;
    });
    if (playerWeapon === undefined) {
      throw "weaponKind not found for the player weapon";
    }
    const playerAttackKindStats = playerWeapon.attackKinds.find(
      (attack) => {
        return attack.attackKind === localState.attackKind;
      });
    if (playerAttackKindStats === undefined) {
      throw "attackKind not found for the player weapon";
    }
    if (localState.attackKind === AttackKind.POWER_SLASH) {
      if (localState.player.powerSlashCooldownRemaining <= 0) {
        localState.player.powerSlashCooldownRemaining = playerAttackKindStats.cooldownNeeded;
      } else {
        throw "attempted to do power attack while cooldown was above 0";
      }
    }
    const damage = playerAttackKindDamage(playerAttackKindStats);
    const attackedEnemyIndex = localAction.attackedEnemyIndex;
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
        // TODO: Store just the EnemyWeaponKind in the enemy object
        // and reference a static list of enemy weapons, to parallel
        // how we handle player weapons
        let compatibleWeapon;
        if (enemy.weapon.kind === EnemyWeaponKind.DAGGER) {
          compatibleWeapon = EnemyWeaponKind.STICK;
        } else if (enemy.weapon.kind === EnemyWeaponKind.STICK) {
          compatibleWeapon = EnemyWeaponKind.DAGGER;
        } else if (enemy.weapon.kind === EnemyWeaponKind.SPEAR) {
          compatibleWeapon = null;
        } else {
          throw "Weapon kind not found when looking for a compatible weapon";
        }
        const enemiesCanTransfer = localState.enemies.filter((enemy) => {
          return enemy.weapon.kind === compatibleWeapon;
        });
        if (enemiesCanTransfer.length > 0) {
          const weaponRecipient = selectRandomElement(enemiesCanTransfer);
          const oldWeapon = weaponRecipient.weapon;
          weaponRecipient.weapon = createWeapon(weaponRecipient.level, EnemyWeaponKind.SPEAR);
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
  };

  const prepareNextTurn = (localState) => {
    if (localState.player.powerSlashCooldownRemaining > 0) {
      localState.player.powerSlashCooldownRemaining--;
    }
    rechargePlayerShield(localState.player, PLAYER_BASE_SHIELD_RECHARGE);
    localState.messages.push(`Player heals by ${PLAYER_BASE_SHIELD_RECHARGE}.`);
    debugPrintStatus();
  };

  console.log(state.gameScene);
  console.log(action);

  try {
    checkValidControlFlow(state);
    checkValidAttackKind(state.attackKind, state.gameScene);

    switch (action.type) {
      case GameAction.RESTART: {
        checkScene(action, state.gameScene, [GameScene.MENU_SCENE]);

        // TODO: Better system for resetting state.
        state = {
          ...getInitialGameState(state),
          gameScene: GameScene.MENU_SCENE,
          messages: state.messages
        };
        state.messages.push("Started a new game.");

        debugPrintStatus();

        break;
      }
      case GameAction.BATTLE: {
        checkScene(action, state.gameScene, [GameScene.MENU_SCENE]);

        if (state.player.defeated) {
          state.messages.push("Player was defeated. Click Restart to start a new game.");
        } else {
          const initialWeapons = [EnemyWeaponKind.DAGGER, EnemyWeaponKind.STICK];
          state.enemies = [
            undefined,
            undefined,
            undefined
          ].map((_) => {
            const weapon = selectRandomElement(initialWeapons);
            return createEnemy(state.battlesWon, weapon);
          });
          state.gameScene = GameScene.BATTLE_BASE;
          debugPrintStatus();
        }

        break;
      }
      case GameAction.ATTACK: {
        checkScene(action, state.gameScene, [GameScene.BATTLE_BASE]);

        state.gameScene = GameScene.BATTLE_SELECT_ATTACK;

        break;
      }
      case GameAction.SHIELD: {
        checkScene(action, state.gameScene, [GameScene.BATTLE_BASE]);

        const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
        rechargePlayerShield(state.player, recharge);
        state.messages.push(`Focusing energy restored ${recharge} health.`);
        enemyAttack(state);
        if (!state.player.defeated) {
          prepareNextTurn(state);
        }

        break;
      }
      case GameAction.CANCEL_ATTACK: {
        checkScene(action, state.gameScene, [GameScene.BATTLE_SELECT_ATTACK, GameScene.BATTLE_SELECT_ENEMY]);

        state.attackKind = null;
        state.gameScene = GameScene.BATTLE_BASE;

        break;
      }
      case GameAction.SELECT_ATTACK_KIND: {
        checkScene(action, state.gameScene, [GameScene.BATTLE_SELECT_ATTACK]);

        state.gameScene = GameScene.BATTLE_SELECT_ENEMY;
        state.attackKind = action.attackKind;

        break;
      }
      case GameAction.SELECT_ENEMY: {
        checkScene(action, state.gameScene, [GameScene.BATTLE_SELECT_ENEMY]);

        attack(state, action);
        state.attackKind = null;

        if (!state.player.defeated) {
          prepareNextTurn(state);
        }

        break;
      }
      default: {
        throw `Unknown Action ${action}`;
      }
    }
  } catch (error) {
    console.error(error);
    const originalState = structuredClone(state);
    originalState.messages.push(`Error ${error}`);
    return originalState;
  }

  return state;
};

export {
  GameScene,
  GameAction,
  PLAYER_SHIELD_MAX,
  ENEMY_SHIELD_MAX,
  EnemyWeaponKind,
  AttackKind,
  getInitialGameState,
  updateState
};

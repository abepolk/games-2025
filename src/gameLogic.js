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
      return 0;
    } else {
      return remainingRandoms.shift();
    }
  };
  
  const nonReactSetValueInState = (value, setter) => {
    if (completed) {
      value = setter(value);
    }
  };

  const assert = (condition) => {
    if (completed) {
      console.assert(condition);
    }
  };

  const rechargePlayerShield = (player, amount) => {
    nonReactSetValueInState(player, p => {
      p.shield = Math.min(PLAYER_SHIELD_MAX, p.shield + amount);
      return p;
    });
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
    nonReactSetValueInState(state, s => {
      s.enemyNum++;
      return s;
    });
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
      nonReactSetValueInState(enemy, e => {
        e.defeated = true;
        return e;
      });
      nonReactSetValueInState(enemy, e => {
        e.shield = 0;
        return e;
      });
    } else {
      nonReactSetValueInState(enemy, e => {
        e.shield = e.shield - amount;
        return e;
      });
      assert(enemy.shield > 0);
    }
  };

  const enemyAttack = (localState) => {
    for (const enemy of localState.enemies) {
      const enemyDamage = weaponAttackDamage(enemy.weapon);
      applyPlayerDamage(localState.player, enemyDamage);
      nonReactSetValueInState(localState, l => {
        l.messages.push(`Enemy ${enemy.enemyNum} attacks with its ${enemy.weapon.name} for ${enemyDamage} damage!`);
        return l;
      });
      debugPrintStatus();
      if (localState.player.defeated) {
        nonReactSetValueInState(localState, l => {
          l.messages.push(`Player defeated after winning ${l.enemiesDefeated} battles! Game Over.`);
          return l;
        });
        nonReactSetValueInState(localState, l => {
          l.messages.push("Click Restart to start a new game.");
          return l;
        });
        nonReactSetValueInState(localState, l => {
          l.gameScene = GameScene.MENU_SCENE;
          return l;
        });
        return;
      }
    };
    rechargePlayerShield(localState.player, PLAYER_BASE_SHIELD_RECHARGE);
    nonReactSetValueInState(localState, l => {
      l.messages.push(`Player shield recharges by ${PLAYER_BASE_SHIELD_RECHARGE} to ${l.player.shield}/${PLAYER_SHIELD_MAX}`);
      return l;
    });
    debugPrintStatus();
  };

  const weaponAttackDamage = (weapon) => {
    return weapon.baseDamage + Math.floor(getRandom() * weapon.bonusDamageMax) + weapon.bonusDamageMin;
  };

  const applyPlayerDamage = (player, amount) => {
    if (amount >= player.shield) {
      nonReactSetValueInState(player, p => {
        p.defeated = true;
        return p;
      });
      nonReactSetValueInState(player, p => {
        p.shield = 0;
        return p;
      });
    } else {
      const newShieldAmount = player.shield - amount;
      nonReactSetValueInState(player, p => {
        p.shield = newShieldAmount;
        return p;
      });
      assert(player.shield > 0);
    }
  };

  if (state.gameScene === GameScene.MENU_SCENE) {
    if (action === MenuSceneAction.SAVE) {
      throw "Saving not implemented yet.";
    } else if (action === MenuSceneAction.RESTART) {
      nonReactSetValueInState(state, s => {
        s.gameScene = GameScene.MENU_SCENE;
        return s;
      });
      nonReactSetValueInState(state, s => {
        initGame(s);
        return s;
      })
      nonReactSetValueInState(state, s => {
        s.messages.push("Started a new game");
        return s;
      });
      debugPrintStatus();
    } else if (action === MenuSceneAction.BATTLE) {
      if (state.player.defeated) {
        nonReactSetValueInState(state, s => {
          s.messages.push("Player was defeated. Click Restart to start a new game.");
          return s;
        })
      } else {
        const initialWeapons = [WeaponKind.DAGGER, WeaponKind.STICK];
        const enemies = [
          undefined,
          undefined,
          undefined
        ].map(_ => {
          const weapon = selectRandomElement(initialWeapons, getRandom);
          return createEnemy(state.battlesWon, weapon);
        });
        nonReactSetValueInState(state, s => {
          s.enemies = enemies;
          return s;
        });
        nonReactSetValueInState(state, s => {
          s.gameScene = GameScene.BATTLE_SCENE;
          return s;
        });
        debugPrintStatus();
      }
    } else {
      // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
      throw `Unknown command ${action}`;
    }
  } else if (state.gameScene === GameScene.BATTLE_SCENE) {
    if (action === BattleSceneAction.ATTACK_STEP_1) {
      nonReactSetValueInState(state, s => {
        s.attackStep2 = true;
        return s;
      })
    } else {
      nonReactSetValueInState(state, s => {
        s.attackStep2 = false;
        return s;
      });
    }
    if (action === BattleSceneAction.ATTACK_STEP_2) {
      const damage = weaponAttackDamage(state.player.weapon);
      const attackedEnemyIndex = options.attackedEnemyIndex
      assert(attackedEnemyIndex !== undefined);
      const enemy = state.enemies[attackedEnemyIndex];
      applyEnemyDamage(enemy, damage);
      nonReactSetValueInState(state, s => {
        s.messages.push(`Player attacks for ${damage} damage!`);
        return s;
      });
      if (enemy.defeated) {
        debugPrintStatus();
        nonReactSetValueInState(state, s => {
          s.messages.push(`Enemy ${enemy.enemyNum} defeated!`);
          return s;
        });
        nonReactSetValueInState(state, s => {
          s.enemiesDefeated = state.enemiesDefeated + 1;
          return s;
        });
        nonReactSetValueInState(state, s => {
          s.enemies.splice(attackedEnemyIndex, 1);
          return s;
        });
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
            nonReactSetValueInState(weaponRecipient, w => {
              w.weapon = createWeapon(w.level, WeaponKind.SPEAR);
              return w;
            });
            nonReactSetValueInState(state, s => {
              s.messages.push(`Enemy ${weaponRecipient.enemyNum} picked up Enemy ${enemy.enemyNum}'s ${enemy.weapon.name} and used it with its ${oldWeapon.name} to build a powerful spear!`);
              return s;
            });
          }
        }
      }
      if (state.enemies.length === 0) {
        const rechargeBonus = 5 + Math.floor(enemy.level / 5);
        rechargePlayerShield(state.player, rechargeBonus);
        nonReactSetValueInState(state, s => {
          s.messages.push(
            `Shield recharged by ${rechargeBonus} to ${s.player.shield}/${PLAYER_SHIELD_MAX}`
          );
          return s;
        });
        nonReactSetValueInState(state, s => {
          s.battlesWon++;
          return s;
        });
        nonReactSetValueInState(state, s => {
          s.gameScene = GameScene.MENU_SCENE;
          return s;
        });
      } else {
        enemyAttack(state);
      }
    } else if (action === BattleSceneAction.SHIELD) {
      const recharge = PLAYER_BASE_SHIELD_RECHARGE * 3;
      rechargePlayerShield(state.player, recharge);
      nonReactSetValueInState(state, s => {
        s.messages.push(`Focusing the shield recharges by ${recharge} to ${s.player.shield}/${PLAYER_SHIELD_MAX}`);
        return s;
      });
      enemyAttack(state);
    } else if (action === BattleSceneAction.CONCEDE) {
      nonReactSetValueInState(state, s => {
        s.messages.push(`Conceding. Player defeated after winning ${s.enemiesDefeated} battles! Game Over.`);
        return s;
      });
      nonReactSetValueInState(state, s => {
        s.messages.push("Click Restart to start a new game.");
        return s;
      });
      nonReactSetValueInState(state, s => {
        s.player.defeated = true;
        return s;
      });
      nonReactSetValueInState(state, s => {
        s.gameScene = GameScene.MENU_SCENE;
         return s;
      });
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
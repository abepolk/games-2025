/*
* Player tracks the player character's state and describes some behavior.
*/
class Player {
    constructor(weapon) {
        this.level = 1;
        this.shieldMax = 100;
        this.shield = 10;
        this.weapon = weapon;
        this.defeated = false;
        this.baseShieldRecharge = 2;
    }

    attackDamage() {
        return this.weapon.attackDamage();
    }

    focusedShieldRecharge() {
        return this.baseShieldRecharge * 3;
    }

    rechargeShield(amount) {
        this.shield = Math.min(this.shieldMax, this.shield + amount);
    }

    // TODO: Need another hit after shield reaches zero to defeat?
    applyDamage(amount) {
        if (amount > this.shield) {
            this.defeated = true;
            this.shield = 0;
        } else {
            this.shield -= amount;
            console.assert(this.shield >= 0);
        }
    }
}

/*
* Weapon is used by both Player and Enemy and defines attack behavior.
*/
class Weapon {
    constructor({ baseDamage, bonusDamageMin, bonusDamageMax }) {
        this.baseDamage = baseDamage;
        this.bonusDamageMin = bonusDamageMin;
        this.bonusDamageMax = bonusDamageMax;
    }

    attackDamage() {
        return this.baseDamage + Math.floor(Math.random() * this.bonusDamageMax) + this.bonusDamageMin;
    }
}

/*
* Enemy is similar to Player and tracks an opponent's state and some behavior.
*/
class Enemy {
    constructor(level, weapon) {
        this.shieldMax = 20;
        this.shield = 10;
        this.weapon = weapon;
        this.level = level;
        this.defeated = false;
    }

    attackDamage() {
        return this.weapon.attackDamage();
    }

    applyDamage(amount) {
        if (amount > this.shield) {
            this.defeated = true;
            this.shield = 0
        } else {
            this.shield = this.shield - amount;
            console.assert(this.shield >= 0);
        }
    }
}

/*
* Enum to track modal behavior.
* MENU_SCENE is between battles, BATTLE_SCENE is during a battle
* Different actions are available depending on the scene.
*
* TODO: QUIT is unused
*/
const GameScene = Object.freeze({
    MENU_SCENE: "MENU_SCENE",
    BATTLE_SCENE: "BATTLE_SCENE",
    QUIT: "QUIT"
});

/*
* Taking the BATTLE action when in MENU_SCENE mode switches to the BATTLE_SCENE
*
* TODO: QUIT is unused
*/
const MenuSceneAction = Object.freeze({
    BATTLE: "BATTLE",
    SAVE: "SAVE",
    QUIT: "QUIT"
});

/*
* When an enemy is defeated, we automatically switch back to MENU_SCENE
*
* TODO: When the player is defeated, nothing happens
* TODO: QUIT is unused
*/
const BattleSceneAction = Object.freeze({
    ATTACK: "ATTACK",
    SHIELD: "SHIELD",
    QUIT: "QUIT"
});


/*
* This is the controller of the game and the class that clients/UI interacts with.
* The intended use is to create one instance and call getState() to get the initial game state.
* Then when the user takes actions, call handleAction(),
* which will update the state and return the new state.
*/
class GameLogic {
    /*
    * logCallback should take a single parameter (a string) and will get called when
    * GameLogic has a message, usually info about what's happening in the game.
    * Generally these are intended as messages to the player. There are a few places where
    * this gets called with error type messages.
    * TODO: perhaps we want to separate out error messages so they can be displayed differently.
    */
    constructor(logCallback) {
        this.player = this.#loadPlayer();
        this.enemy = null;
        this.enemiesDefeated = 0;
        this.enemyLevel = 0;
        this.gameScene = GameScene.MENU_SCENE;
        this.message = "Welcome to the game. Battle (b), Save (s), or Quit (q):";
        this.logCallback = logCallback;
    }

    #log(text) {
        try {
            if (!text.endsWith("\n")) {
                text += "\n";
            }
            this.logCallback(text);
        } catch (e) {
            console.log(`Got bad input to #log: ${text}, type: ${typeof text}`);
        }
    }


    #serializePlayer() {
        return {
            shield: this.player.shield,
            shieldMax: this.player.shieldMax
        };
    }

    #serializeEnemy() {
        return {
            "shield": this.enemy.shield,
            "shieldMax": this.enemy.shieldMax,
            "level": this.enemy.level,
        };
    }

    #serializeGameScene() {
        return this.gameScene;
    }

    #serializeState() {
        return {
            "player": this.#serializePlayer(),
            "enemy": this.#serializeEnemy(),
            "gameScene": this.#serializeGameScene()
        }
    }

    #serializeError(errorMessage) {
        return { "error": errorMessage };
    }

    #serializeBadAction(action, actionKind) {
        return this.#serializeError(action + " is not a valid name for a " + actionKind);
    }

    /*
    * Returns the state of the game. Should be called after instantiating a GameLogic
    * instance to get the initial state. Since handleAction also returns the game state,
    * this probably doesn't need to get called later. See handleAction for info about the
    * contents of the game state.
    */
    getState() {
        return this.#serializeState();
    }

    #enemyAttack(player, enemy) {
        let enemyDamage = enemy.attackDamage();
        player.applyDamage(enemyDamage);
        this.#log(`Enemy attacks for ${enemyDamage} damage!`);
    }

    #loadPlayer() {
        return new Player(new Weapon({
            baseDamage: 3,
            bonusDamageMin: 0,
            bonusDamageMax: 2
        }));
    }

    #getEnemyWeapon(enemyLevel) {
        return new Weapon({
            baseDamage: enemyLevel,
            bonusDamageMin: 1 + Math.floor(enemyLevel / 10),
            bonusDamageMax: 2 + Math.floor(enemyLevel / 5),
        }
        );
    }

    #loadEnemy(enemyLevel) {
        return new Enemy(enemyLevel, this.#getEnemyWeapon(enemyLevel));
    }

    #printStatus(player, enemy) {
        let result = `Player Shield: ${player.shield}/${player.shieldMax}\n`;
        result += `Enemy Shield: ${enemy.shield}/${enemy.shieldMax}\n`;
        return result;
    }

    /*
    * clientGameScene: one of the GameScene enum options. This is passed in to confirm that
    *   the caller's game scene matches the GameLogic game scene. This helped me catch a couple
    *   bugs but isn't really useful if everything's working right, so we could consider removing it.
    * action: the action to take. Options depend on the GameScene and are either an option from
    *   MenuSceneAction or BattleSceneAction.
    *
    * Updates the game based on the supplied action, calls the logCallback to report game info
    * to the user, and returns the new game state that resulted from the action.
    *
    * Usually the returned game state will look like
    *
    * {
    *   gameScene: "BATTLE_SCENE",
    *   enemy: { shield: 10, shieldMax: 20, level: 1 },
    *   player: { shield: 10, shieldMax: 100 }
    * }
    *
    * but if there's an error it will instead be
    * { error: "error message" }
    */
    handleAction(clientGameScene, action) {
        // console.log(`handleAction() called with game scene ${clientGameScene}, action ${action}`);
        // console.log(`this.gameScene ${this.gameScene}`);
        if (clientGameScene !== this.gameScene) {
            return { "error": `Client game scene was ${clientGameScene} but server game scene was ${this.gameScene}` };
        }
        if (this.gameScene === GameScene.BATTLE_SCENE) {
            if (false === action in BattleSceneAction) {
                return this.#serializeBadAction(action, "BattleSceneAction");
            }
        }
        if (this.gameScene === GameScene.MENU_SCENE) {
            if (false === action in MenuSceneAction) {
                return this.#serializeBadAction(action, "MenuSceneAction");
            }
        }

        // TODO: would it be better to have a separate function for each scene to handle that scene's actions?
        if (this.gameScene === GameScene.MENU_SCENE) {
            if (action === MenuSceneAction.SAVE) {
                this.#log("Saving not implemented yet.");
            } else if (action === MenuSceneAction.QUIT) {
                this.gameScene = GameScene.QUIT;
                // TODO: handle quitting
            } else if (action === MenuSceneAction.BATTLE) {
                this.enemyLevel += 1;
                this.enemy = this.#loadEnemy(this.enemyLevel);
                this.gameScene = GameScene.BATTLE_SCENE;
                this.#log(this.#printStatus(this.player, this.enemy));
            } else {
                // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
                console.assert(false);
                this.#log(`Unknown command ${action}`);
                return this.#serializeBadAction(action, "MenuSceneAction");
            }
        } else if (this.gameScene === GameScene.BATTLE_SCENE) {
            if (action === BattleSceneAction.ATTACK) {
                let damage = this.player.attackDamage();
                this.enemy.applyDamage(damage);
                this.#log(`Player attacks for ${damage} damage!`);
                if (this.enemy.defeated) {
                    this.#log(this.#printStatus(this.player, this.enemy));
                    this.#log("Enemy defeated!");
                    this.enemiesDefeated++;
                    let rechargeBonus = 5 + Math.floor(this.enemy.level / 5);
                    this.player.rechargeShield(rechargeBonus);
                    this.#log(
                        `Shield recharged by ${rechargeBonus} to ${this.player.shield}/${this.player.shieldMax}`
                    );
                    this.gameScene = GameScene.MENU_SCENE;
                } else {
                    // TODO: This section repeated ==ENEMY ATTACK==
                    this.#enemyAttack(this.player, this.enemy);
                    this.#log(this.#printStatus(this.player, this.enemy));
                    if (this.player.defeated) {
                        this.#log(
                            `Player defeated after winning ${this.enemiesDefeated} battles! Game Over.`
                        );
                        // TODO: Handle player defeated
                    }
                    this.player.rechargeShield(this.player.baseShieldRecharge);
                    this.#log(`Player shield recharges by ${this.player.baseShieldRecharge} to ${this.player.shield} / ${this.player.shieldMax}`);
                    this.#log(this.#printStatus(this.player, this.enemy));
                }
            } else if (action === BattleSceneAction.SHIELD) {
                let recharge = this.player.focusedShieldRecharge();
                this.player.rechargeShield(recharge);
                this.#log(`Focusing the shield recharges by ${recharge} to ${this.player.shield}/${this.player.shieldMax}`);
                // TODO: This section repeated ==ENEMY ATTACK==
                this.#enemyAttack(this.player, this.enemy);
                this.#log(this.#printStatus(this.player, this.enemy));
                if (this.player.defeated) {
                    this.#log(`Player defeated after winning ${this.enemiesDefeated} battles! Game Over.`);
                    // TODO: Handle player defeated
                }
                this.player.rechargeShield(this.player.baseShieldRecharge);
                this.#log(`Player shield recharges by ${this.player.baseShieldRecharge} to ${this.player.shield}/${this.player.shieldMax}`);
                this.#log(this.#printStatus(this.player, this.enemy));
            } else if (action === BattleSceneAction.QUIT) {
                this.gameScene = GameScene.QUIT;
            }
        } else {
            console.assert(false);
            this.#log(`Unknown scene ${this.gameScene}`);
            return this.#serializeError(`${this.gameScene} is not a valid name for a GameScene`);
        }
        return this.#serializeState();
    }
}


function debug() {
    gameLogic = new GameLogic((message) => {
        console.log(message);
    });

    while (true) {
        input = prompt();
        if (input === "q") {
            break;
        } else {
            if (input === "b") {
                console.log(gameLogic.handleAction("MENU_SCENE", "BATTLE"));
            } else if (input === "a") {
                console.log(gameLogic.handleAction("BATTLE_SCENE", "ATTACK"));
            } else if (input === "s") {
                console.log(gameLogic.handleAction("BATTLE_SCENE", "SHIELD"));
            }
        }
    }
};

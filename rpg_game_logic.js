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

class Weapon {
    constructor(baseDamage, bonusDamageMin, bonusDamageMax) {
        this.baseDamage = baseDamage;
        this.bonusDamageMin = bonusDamageMin;
        this.bonusDamageMax = bonusDamageMax;
    }

    attackDamage() {
        return this.baseDamage + Math.floor(Math.random() * bonusDamageMax) + this.bonusDamageMin;
    }
}


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

const GameScene = Object.freeze({
    MENU_SCENE: "MENU_SCENE",
    BATTLE_SCENE: "BATTLE_SCENE",
    QUIT: "QUIT"
});

const MenuSceneAction = Object.freeze({
    BATTLE: "BATTLE",
    SAVE: "SAVE",
    QUIT: "QUIT"
});

const BattleSceneAction = Object.freeze({
    ATTACK: "ATTACK",
    SHIELD: "SHIELD",
    QUIT: "QUIT"
});

function loadPlayer() {
    return new Player(new Weapon(baseDamage = 3, bonusDamageMin = 0, bonusDamageMax = 2));
}

function getEnemyWeapon(enemyLevel) {
    return new Weapon(
        baseDamage = enemyLevel,
        bonusDamageMin = 1 + Math.floor(enemyLevel / 10),
        bonusDamageMax = 2 + Math.floor(enemyLevel / 5),
    );
}

function loadEnemy(enemyLevel) {
    return new Enemy(enemyLevel, getEnemyWeapon(enemyLevel));
}

function printStatus(player, enemy) {
    let result = "Player Shield: " + player.shield + "/" + player.shieldMax + "\n";
    result += "Enemy Shield: " + enemy.shield + "/" + enemy.shieldMax + "\n";
    return result;
}

class GameLogic {
    constructor(logCallback) {
        this.player = loadPlayer();
        this.enemy = null;
        this.enemiesDefeated = 0;
        this.enemyLevel = 0;
        this.gameScene = GameScene.MENU_SCENE;
        this.message = "Welcome to the game. Battle (b), Save (s), or Quit (q):";
        this.logCallback = logCallback;
    }

    _log(text) {
        try {
            if (!text.endsWith("\n")) {
                text += "\n";
            }
            this.logCallback(text);
        } catch (e) {
            console.log(`Got bad input to _log: ${text}, type: ${typeof text}`);
        }
    }


    _serializePlayer() {
        return {
            shield: this.player.shield,
            shieldMax: this.player.shieldMax
        };
    }

    _serializeEnemy() {
        return {
            "shield": this.enemy.shield,
            "shieldMax": this.enemy.shieldMax,
            "level": this.enemy.level,
        };
    }

    _serializeGameScene() {
        return this.game_scene;
    }

    _serializeState() {
        return {
            "player": this._serializePlayer(),
            "enemy": this._serializeEnemy(),
            "game_scene": this._serializeGameScene()
        }
    }

    _serializeError(errorMessage) {
        return { "error": errorMessage };
    }

    _serializeBadAction(action, actionKind) {
        return this._serializeError(action + " is not a valid name for a " + actionKind);
    }

    getState() {
        return this._serializeState();
    }

    enemyAttack(player, enemy) {
        let enemyDamage = enemy.attackDamage();
        player.applyDamage(enemyDamage);
        this._log("Enemy attacks for " + enemyDamage + " damage!");
    }

    handleAction(clientGameScene, action) {
        // console.log("handleAction() called with game scene " + clientGameScene + ", action " + action);
        // console.log("this.game_scene " + this.gameScene);
        if (clientGameScene !== this.gameScene) {
            return { "error": "Client game scene was " + clientGameScene + " but server game scene was " + this.gameScene };
        }
        if (this.gameScene === GameScene.BATTLE_SCENE) {
            if (false === action in BattleSceneAction) {
                return _serializeBadAction(action, "BattleSceneAction");
            }
        }
        if (this.gameScene === GameScene.MENU_SCENE) {
            if (false === action in MenuSceneAction) {
                return _serializeBadAction(action, "MenuSceneAction");
            }
        }

        // TODO: would it be better to have a separate function for each scene to handle that scene's actions?
        if (this.gameScene === GameScene.MENU_SCENE) {
            if (action === MenuSceneAction.SAVE) {
                this._log("Saving not implemented yet.");
            } else if (action === MenuSceneAction.QUIT) {
                this.gameScene = GameScene.QUIT;
                // TODO: handle quitting
            } else if (action === MenuSceneAction.BATTLE) {
                this.enemyLevel += 1;
                this.enemy = loadEnemy(this.enemyLevel);
                this.gameScene = GameScene.BATTLE_SCENE;
                this._log(printStatus(this.player, this.enemy));
            } else {
                // We shouldn't reach this case because we checked for valid actions at the start of handleAction.
                console.assert(false);
                this._log("Unknown command " + action);
                return this._serializeBadAction(action, "MenuSceneAction");
            }
        } else if (this.gameScene === GameScene.BATTLE_SCENE) {
            if (action === BattleSceneAction.ATTACK) {
                let damage = this.player.attackDamage();
                this.enemy.applyDamage(damage);
                this._log("Player attacks for " + damage + " damage!");
                if (this.enemy.defeated) {
                    this._log(printStatus(this.player, this.enemy));
                    this._log("Enemy defeated!");
                    this.enemiesDefeated++;
                    let rechargeBonus = 5 + Math.floor(this.enemy.level / 5);
                    this.player.rechargeShield(rechargeBonus);
                    this._log(
                        "Shield recharged by " + rechargeBonus + " to " + this.player.shield + "/" + this.player.shieldMax
                    );
                    this.gameScene = GameScene.MENU_SCENE;
                } else {
                    // TODO: This section repeated ==ENEMY ATTACK==
                    this.enemyAttack(this.player, this.enemy);
                    this._log(printStatus(this.player, this.enemy));
                    if (this.player.defeated) {
                        this._log(
                            "Player defeated after winning " + this.enemeisDefeated + " battles! Game Over."
                        );
                        // TODO: Handle player defeated
                    }
                    this.player.rechargeShield(this.player.baseShieldRecharge);
                    this._log("Player shield recharges by " + this.player.baseShieldRecharge + " to " + this.player.shield + "/" + this.player.shieldMax);
                    this._log(printStatus(this.player, this.enemy));
                }
            } else if (action === BattleSceneAction.SHIELD) {
                let recharge = this.player.focusedShieldRecharge();
                this.player.rechargeShield(recharge);
                this._log("Focusing the shield recharges by " + recharge + " to " + this.player.shield + "/" + this.player.shieldMax);
                // TODO: This section repeated ==ENEMY ATTACK==
                this.enemyAttack(this.player, this.enemy);
                this._log(printStatus(this.player, this.enemy));
                if (this.player.defeated) {
                    this._log(
                        "Player defeated after winning " + this.enemiesDefeated + " battles! Game Over."
                    );
                    // TODO: Handle player defeated
                }
                this.player.rechargeShield(this.player.baseShieldRecharge);
                this._log("Player shield recharges by " + this.player.baseShieldRecharge + " to " + this.player.shield + "/" + this.player.shieldMax);
                this._log(printStatus(this.player, this.enemy));
            } else if (action === BattleSceneAction.QUIT) {
                this.gameScene = GameScene.QUIT;
            }
        } else {
            console.assert(false);
            this._log("Unknown scene " + this.gameScene);
            return _serializeError(this.gameScene + " is not a valid name for a GameScene");
        }
        return this._serializeState();
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

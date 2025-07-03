class Player {
    constructor(weapon) {
        this.level = 1;
        this.shield_max = 100;
        this.shield = 10;
        this.weapon = weapon;
        this.defeated = false;
        this.base_shield_recharge = 2;
    }

    attack_damage() {
        return this.weapon.attack_damage();
    }

    focused_shield_recharge() {
        return this.base_shield_recharge * 3;
    }

    recharge_shield(amount) {
        this.shield = Math.min(this.shield_max, this.shield + amount);
    }

    // TODO: Need another hit after shield reaches zero to defeat?
    apply_damage(amount) {
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
    constructor(base_damage, bonus_damage_main, bonus_damage_max) {
        this.base_damage = base_damage;
        this.bonus_damage_min = bonus_damage_main;
        this.bonus_damage_max = bonus_damage_max;
    }

    attack_damage() {
        return this.base_damage + Math.floor(Math.random() * bonus_damage_max) + this.bonus_damage_min;
    }
}


function debug() {
    p = new Player(new Weapon(base_damage = 3, bonus_damage_min = 0, bonus_damage_max = 2));
    console.log("level:", p.level, "shield:", p.shield);
    console.log("attack damage:", p.attack_damage());
};

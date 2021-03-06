import { ceil, random } from "lodash";
import type { Monster } from "../domain/monster";
import { IEvent } from "../events/Event";

export class Adventurer {
    public maxHp = 150;
    public hp = 150;
    public level = 1;
    public experience = 0;

    public get isDead() {
        return this.hp <= 0;
    }

    private hasActedThisTurn = false;

    constructor(public username: string, private log: IEvent[]) {}

    public takeDamage(damage: number) {
        this.hp = this.hp - damage;
        this.log.push({
            type: "damage received",
            damage,
            target: this.username,
            hpLeft: this.hp,
            isMonster: false,
        });

        if (this.isDead) {
            this.log.push({ type: "adventurer killed", name: this.username });
        }
    }

    public addExperience(exp: number, forceUpdateLevel = false) {
        this.experience += exp;
        // 1 -> 2  200xp
        // 2 -> 3  600xp
        // 3 -> 4  1100xp
        // 4 -> 5  1600xp
        const level = 1 + Math.floor(Math.pow(this.experience / 200, 2 / 3));
        const leveledUp = level > this.level;
        if (forceUpdateLevel) {
            this.level = level;
        } else if (leveledUp) {
            this.level = level;
            this.log.push({
                type: "leveled up",
                level,
                target: this.username,
            });
        }
    }

    public heal(receiver: string) {
        // TODO extract this.canAct
        if (this.isDead) {
            return;
        }
        if (this.hasActedThisTurn) {
            return;
        }

        const amount = random(15) + this.level;
        this.log.push({
            type: "heal cast",
            receiver,
            actor: this.username,
            amount,
        });
        this.hasActedThisTurn = true;
        return amount;
    }

    healParty(partySize: number) {
        if (this.isDead) {
            return;
        }
        if (this.hasActedThisTurn) {
            return;
        }

        const amount = ceil(random(12) / partySize);
        this.log.push({
            type: "heal party cast",
            actor: this.username,
            amount,
        });
        // TODO decorator to exhaust hasActedThisTurn
        this.hasActedThisTurn = true;
        return amount;
    }

    public receivesHeal(healedHp: number) {
        if (this.isDead) {
            return;
        }

        this.log.push({
            type: "received heal",
            target: this.username,
            amount: healedHp,
            currentHp: this.hp,
        });
        this.hp += healedHp;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    public unblockAttack(): void {
        this.hasActedThisTurn = false;
    }

    public attack(monster: Monster) {
        if (this.isDead) {
            return;
        }
        if (this.hasActedThisTurn) {
            return;
        }

        const damage = random(19) + this.level;
        this.log.push({
            type: "attack",
            isMonster: false,
            attacker: this.username,
            target: monster.name,
        });
        this.hasActedThisTurn = true;
        monster.takeDamage(damage);
    }

    public castFire(monster: Monster) {
        if (this.isDead) {
            return;
        }
        if (this.hasActedThisTurn) {
            return;
        }

        const damage = random(19) + this.level;
        this.log.push({
            type: "fire cast",
            actor: this.username,
            target: monster.name,
        });
        this.hasActedThisTurn = true;
        monster.takeDamage(damage);
    }

    public castIce(monster: Monster) {
        if (this.isDead) {
            return;
        }
        if (this.hasActedThisTurn) {
            return;
        }

        const damage = random(19) + this.level;
        this.log.push({
            type: "ice cast",
            actor: this.username,
            target: monster.name,
        });
        this.hasActedThisTurn = true;
        monster.takeDamage(damage);
    }
}

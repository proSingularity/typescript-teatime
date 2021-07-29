import { GUI } from "dat.gui";
import { startCase } from "lodash";
import { Curves, GameObjects, Math as PMath, Scene } from "phaser";
import {
    monsterMapping,
    monsterSprites,
} from "../../assets/images/monsters/monsters";
import { DamageText } from "./DamageText";
import { MonsterHealthbar } from "./MonsterHealthbar";

const cfg = { tint: 0xff66ff };
export class Monster extends GameObjects.Image {
    private path?: { t: number; vec: PMath.Vector2 };
    private curve?: Curves.CubicBezier;
    private healthbar!: MonsterHealthbar;

    constructor(scene: Scene, { hp, name }: { hp: number; name: string }) {
        super(scene, 1100, 620, getSpriteKey(name));
        scene.add.existing(this);
        this.name = name;

        // TODO fixed display size only working for sqare images
        this.setNormalizedSize();

        this.healthbar = new MonsterHealthbar(scene, hp);
        const label = this.scene.add
            .text(scene.scale.width / 2, 84, startCase(name), {
                fontSize: "bold 60px",
                align: "center",
                color: "rgb(255,255,255,0.7)",
            })
            .setOrigin(0.5);
        // this.setAlpha(0.8);

        const gui = new GUI();
        gui.addColor(cfg, "tint");

        // gui.add(this, "debugTakeDamage");
        // gui.add(this, "debugAttack");
    }

    /** normalizes sprite to fit the greater of height and width to 300px */
    private setNormalizedSize() {
        const normalizedSize = 300;
        const spriteCfg = monsterSprites.find(
            (s) => s.key === this.texture.key
        );
        if (!spriteCfg) {
            throw new Error(
                `Monster Sprite config not found for ${JSON.stringify(
                    { textureKey: this.texture.key, name: this.name },
                    null,
                    2
                )}`
            );
        }

        const max = Math.max(spriteCfg.width, spriteCfg.height);
        const factor = normalizedSize / max;
        this.setScale(factor);
    }

    private addAttackCurve({ x: x2, y: y2 }: { x: number; y: number }) {
        const x = this.x;
        const y = this.y;
        const startPoint = new Phaser.Math.Vector2(x, y);
        const controlPoint1 = new Phaser.Math.Vector2(x, y - 100);
        const controlPoint2 = new Phaser.Math.Vector2(
            x2,
            0.8 * y2 + 0.2 * this.y
        );
        const endPoint = new Phaser.Math.Vector2(x2, y2);

        return {
            path: { t: 0, vec: new Phaser.Math.Vector2() },
            curve: new Phaser.Curves.CubicBezier(
                startPoint,
                controlPoint1,
                controlPoint2,
                endPoint
            ),
        };
    }

    public attack(target: { x: number; y: number }, jumpDuration: number) {
        const { path, curve } = this.addAttackCurve(target);
        this.path = path;
        this.curve = curve;

        this.scene.tweens.add({
            targets: this.path,
            t: 0.8,
            ease: "Sine.easeInOut",
            duration: jumpDuration,
            yoyo: true,
        });
    }

    public update() {
        // if is attacking
        if (this.curve && this.path) {
            const newPos = this.curve.getPoint(this.path.t, this.path.vec);
            this.x = newPos.x;
            this.y = newPos.y;
        }
        this.setTint(cfg.tint);
    }

    public takeDamage(amount: number) {
        this.healthbar.takeDamage(amount);

        new DamageText(this.scene, this, amount);

        const red = 0xff0000;
        this.setTint(red);
        this.scene.time.delayedCall(300, () => this.clearTint());
    }

    public die() {
        this.setVisible(false);
    }

    public debugAttack() {
        this.attack({ x: 200, y: this.scene.scale.height / 2 + 50 }, 1000);
    }

    public debugTakeDamage() {
        this.takeDamage(20);
    }
}

const getSpriteKey = (_name: string) => {
    const mapping = monsterMapping.find(({ name }) => name === _name);
    return mapping && mapping.key ? mapping.key : "greengoo";
};

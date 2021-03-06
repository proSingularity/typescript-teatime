import { GameObjects, Scene } from "phaser";
import { setTextShadow } from "./styles/setTextShadow";

const Cfg = {
    styles: {
        fontSize: `20px`,
        color: "rgb(255,255,255,0.9)",
    },
    yOffset: 114,
};
const anywhere = -9999;

export class AdventurerName extends GameObjects.Text {
    constructor(
        scene: Scene,
        name: string,
        public readonly followed: { x: number; y: number }
    ) {
        super(scene, anywhere, anywhere, name, Cfg.styles);
        scene.add.existing(this);

        this.setOrigin(0.5);
        this.setDepth(followed.y);
        setTextShadow(this);
    }

    public update() {
        this.x = this.followed.x;
        this.y = this.followed.y - Cfg.yOffset;
    }
}

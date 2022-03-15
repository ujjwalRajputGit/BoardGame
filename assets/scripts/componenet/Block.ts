import { _decorator, Component, Node, Input, EventTouch, Vec3, v3, Vec2, v2, Sprite, randomRange, color, Label, Color, find } from 'cc';
import { blockEventEmitter, GAME_EVENT } from '../global/Constants';
import { IMatrixItem } from '../interface/IMatrixItem';
import { MatrixPos } from '../utils/Matrix';
const { ccclass, property } = _decorator;


@ccclass('Block')
export class Block extends Component implements IMatrixItem {

    private posInMatrix: MatrixPos
    private _isEmptyBlock: boolean;
    public get isEmptyBlock(): boolean {
        return this._isEmptyBlock;
    }
    private set isEmptyBlock(value: boolean) {
        this._isEmptyBlock = value;
    }

    private matrixPosLabel: Label;
    private nameLabel: Label;

    onLoad() {
        this.matrixPosLabel = this.getComponentInChildren(Label);
        this.nameLabel = find('name', this.node).getComponent(Label);
    }

    init(matrixPos: MatrixPos, isEmptyBlock: boolean = false) {
        this.isEmptyBlock = isEmptyBlock;
        this.setPosInMatrix(matrixPos);
        if (!isEmptyBlock) {
            this.getComponent(Sprite).color = color(
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                255
            )
            this.node.on(Input.EventType.TOUCH_MOVE, this.touchMove.bind(this));
        } else {
            this.getComponent(Sprite).color = Color.WHITE
        }

        this.nameLabel.string = this.makeid(3);
        this.node.name = this.nameLabel.string;
    }

    touchMove(e: EventTouch) {
        blockEventEmitter.emit(GAME_EVENT.onMove, { eventTouch: e, blockPos: this.getPosInMatrix() });
    }

    getPosInMatrix() {
        return this.posInMatrix
    }

    setPosInMatrix(matrixPos: MatrixPos) {
        this.posInMatrix = matrixPos;
        this.matrixPosLabel.string = this.posInMatrix.row + "," + this.posInMatrix.column;
    }

    setPosition(pos: Vec3) {
        this.node.setPosition(pos);
    }

    getNodePos() {
        return this.node.getPosition();
    }

    onDisable() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.touchMove.bind(this));
    }


    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
}
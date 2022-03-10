import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('Block')
export class Block extends Component {

    private posInMatrix: { row, column }

    init(matrixPos: { row: number, column: number }) {
        this.posInMatrix = matrixPos;
    }

    getPosInMatrix() {
        return this.posInMatrix
    }
}
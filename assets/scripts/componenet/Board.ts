import { _decorator, Component, Node, instantiate, Prefab, v2, Size, v3, UITransform } from 'cc';
import { BLOCK_SPACE } from '../global/Constants';
import { Matrix } from '../utils/Matrix';
import { Block } from './Block';
const { ccclass, property } = _decorator;


@ccclass('Board')
export class Board extends Component {

    @property(Prefab)
    private blockPrefab: Prefab;

    private blocks: Matrix<Block>;
    private matrixSize: { row: number, column: number };

    onLoad() {
        (window as any).board = this;
        this.initilizeBoard(3, 3);
    }

    initilizeBoard(row: number, column: number) {
        this.matrixSize = { row: row, column: column }
        this.blocks = new Matrix(row, column);
        for (let index = 0; index < row * column; index++) {
            let blockNode: Node = instantiate(this.blockPrefab);
            let posInMtrix = this.indexToMatrixPos(index);
            blockNode.setPosition(this.getBlockPos(posInMtrix.row,
                posInMtrix.column,
                blockNode.getComponent(UITransform).contentSize));
            this.node.addChild(blockNode);

            let block = blockNode.addComponent(Block)
            this.blocks.setByIndex(index, block);
            block.init(posInMtrix);
        }
    }

    private getBlockPos(row: number, column: number, blockSize: Size) {
        return v3(column * (blockSize.width + BLOCK_SPACE), row * (blockSize.height + BLOCK_SPACE), 0);
    }

    private indexToMatrixPos(index: number) {
        const row = Math.floor(index / this.matrixSize.column);
        const column = index - (row * this.matrixSize.column);
        return { row: row, column: column };
    }

}
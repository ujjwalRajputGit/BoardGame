import { _decorator, Component, Node, instantiate, Prefab, v2, Size, v3, UITransform, EventTouch, Vec3, Vec2 } from 'cc';
import { blockEventEmitter, BlockState, BLOCK_MATCH_DISTANCE, BLOCK_SPACE, GAME_EVENT } from '../global/Constants';
import { boardBoundries, BoardBoundries } from '../utils/Extras';
import { Matrix, matrixPos, MatrixPos, matrixSize, MatrixSize } from '../utils/Matrix';
import { Block } from './Block';
const { ccclass, property } = _decorator;


@ccclass('Board')
export class Board extends Component {

    @property(Prefab)
    private blockPrefab: Prefab;

    private blocks: Matrix<Block>;
    private matrixSize: MatrixSize;
    private boundries: BoardBoundries;
    private blockSize: Readonly<Size>;
    private touchStartBlockPos: MatrixPos;
    private emptyBlock: Readonly<Block>;

    onLoad() {
        (window as any).board = this;
        this.initilizeBoard(matrixSize(3, 3));
    }

    onEnable() {
        blockEventEmitter.on(GAME_EVENT.onMove, this.onBlockMove, this);
    }

    initilizeBoard(mSize: MatrixSize) {
        this.matrixSize = mSize;
        this.blocks = new Matrix(mSize);
        for (let index = 0; index < mSize.row * mSize.column; index++) {
            let blockNode: Node = instantiate(this.blockPrefab);
            let posInMtrix = this.indexToMatrixPos(index);
            this.blockSize = blockNode.getComponent(UITransform).contentSize;
            blockNode.setPosition(this.blockMatrixPosToNodePos(posInMtrix));
            this.node.addChild(blockNode);

            let block = blockNode.addComponent(Block)
            this.blocks.setByIndex(index, block);
            if (index != 8) {
                block.init(posInMtrix);
            }
            else {
                block.init(posInMtrix, true);
                this.emptyBlock = block;
            }
        }
        this.boundries = this.calculateBoundries();
    }

    private blockMatrixPosToNodePos(mPos: MatrixPos) {
        const pos = { ...mPos }
        return v3(pos.column * (this.blockSize.width + BLOCK_SPACE), -(pos.row * (this.blockSize.height + BLOCK_SPACE)), 0);
    }

    private blockNodePosToMatrixPos(nPos: Vec3) {
        const pos = { ...nPos };
        let column = Math.round(pos.x / this.blockSize.width);
        let row = -Math.round(pos.y / this.blockSize.height);
        return matrixPos(row, column);
    }

    private indexToMatrixPos(index: number) {
        const row = Math.floor(index / this.matrixSize.column);
        const column = index - (row * this.matrixSize.column);
        return { row: row, column: column };
    }

    private calculateBoundries(): BoardBoundries {
        const startBlockPos = this.blocks.get(matrixPos(0, 0)).getNodePos();
        const endBlockPos = this.blocks.get(matrixPos(this.matrixSize.row - 1,
            this.matrixSize.column - 1)).getNodePos();
        const xMin = startBlockPos.x;
        const xMax = endBlockPos.x;
        const yMin = startBlockPos.y;
        const yMax = endBlockPos.y;
        return boardBoundries(xMin, xMax, yMin, yMax);
    }

    private onBlockMove(e: { eventTouch: EventTouch, blockPos: MatrixPos }) {
        const delta = e.eventTouch.getDelta();
        console.log("delta: ", delta);

        this.touchStartBlockPos = e.blockPos;
        if (delta.y && delta.y >= 0)
            this.blockMoveDown(e.blockPos, e.eventTouch, "event");
        if (delta.y && delta.y < 0)
            this.blockMoveDown(e.blockPos, e.eventTouch, "event");
        // if (delta.x && delta.x >= 0)
        //     this.blockMoveRight(e.blockPos, e.eventTouch);
        // if (delta.x && delta.x < 0)
        //     this.blockMoveLeft(e.blockPos, e.eventTouch);
    }

    private blockMoveUp(blockPos: MatrixPos, eventTouch: EventTouch) {
        console.log("block move up");
    }

    private blockMoveDown(blockPos: MatrixPos, eventTouch: EventTouch, whoCalled: string): BlockState {
        // console.log("block move down");
        const block: Block = this.blocks.get(blockPos);
        if (block)
            console.log(block.node.name, " blockPos: ", blockPos, "who called: ", whoCalled);
        else
            console.log(block, " blockPos: ", blockPos, "who called: ", whoCalled);
        if (block && block.isEmptyBlock)
            return BlockState.YouCanMove;
        if (!block)
            return BlockState.YouCanNotMove;

        const delta: Vec2 = eventTouch.getDelta();
        let nextBlockPos: MatrixPos;
        if (delta.y < 0)
            nextBlockPos = matrixPos(blockPos.row + 1, blockPos.column);
        else
            nextBlockPos = matrixPos(blockPos.row - 1, blockPos.column);

        const nextBlock: Block = this.blocks.get(nextBlockPos);


        const canMove = this.blockMoveDown(nextBlockPos, eventTouch, block.node.name);
        console.log(block.node.name, " canmove: ", canMove);

        if (canMove === BlockState.YouCanMove) {
            if (this.moveBlock(block, nextBlock, delta))
                return BlockState.ISwaped;
            // console.log(block.node.name, " block.getNodePos().y: ", block.getNodePos().y);

            if (block.getNodePos().y <= this.boundries.yMax || block.getNodePos().y >= this.boundries.yMin) {
                console.log(block.node.name, " return: false");
                return BlockState.YouCanNotMove;
            }
            return BlockState.YouCanMove;
        }

        if (!this.isBlockOnCorrectPos(block, nextBlock)) {
            this.moveBlock(block, nextBlock, delta);
            return;
        }

        if (canMove === BlockState.ISwaped) {
            console.log(block.node.name, "iswaped:");

            const nBlock = this.blocks.get(nextBlockPos);
            if (nBlock.isEmptyBlock) {
                console.log("block.getPosInMatrix(): ", block.getPosInMatrix());

                nBlock.setPosition(this.blockMatrixPosToNodePos(block.getPosInMatrix()))
            }
            console.log(block.getPosInMatrix(), "  ", nBlock.getPosInMatrix());
            this.matchAndSwap(block);
            return BlockState.ISwaped;
        }
        return BlockState.YouCanNotMove;
    }

    private moveBlock(block: Block, nextBlock: Block, delta: Vec2) {
        const blockNodeCurrentPos: Vec3 = block.getNodePos();
        let newPos: Vec3 = v3(blockNodeCurrentPos.x,
            (blockNodeCurrentPos.y + delta.y),
            blockNodeCurrentPos.z);

        if (!block.isEmptyBlock) {
            newPos = newPos.clampf(v3(this.boundries.xMin, this.boundries.yMin, 0),
                v3(this.boundries.xMax, this.boundries.yMax, 0));
        }
        block.setPosition(newPos);
        console.log("ggg:", newPos)

        return this.matchAndSwap(block);

    }

    private isBlockOnCorrectPos(currentBlock: Block, nextBlock: Block) {
        const currentBlockNodePos: Vec3 = currentBlock.getNodePos();
        if (!nextBlock) {
            if ((currentBlockNodePos.x == this.boundries.xMin ||
                currentBlockNodePos.x == this.boundries.xMax) &&
                (currentBlockNodePos.x == this.boundries.yMin ||
                    currentBlockNodePos.x == this.boundries.yMax))
                return true;
            else
                return false;
        }
        const nextBlockNodePos: Vec3 = nextBlock.getNodePos();
        if (Math.abs(currentBlockNodePos.x - nextBlockNodePos.x) == BLOCK_SPACE ||
            Math.abs(currentBlockNodePos.y - nextBlockNodePos.y) == BLOCK_SPACE)
            return true;
        return false;
    }

    matchAndSwap(block: Block) {
        if (!block) return;
        const blockNodePos: Vec3 = block.getNodePos();
        const idealMatrixPosOfBlock: MatrixPos =
            this.blockNodePosToMatrixPos(blockNodePos);
        const idealNodePosOfBlock: Vec3 = this.blockMatrixPosToNodePos(
            idealMatrixPosOfBlock
        );

        if (
            blockNodePos.y < idealNodePosOfBlock.y + BLOCK_MATCH_DISTANCE &&
            blockNodePos.y > idealNodePosOfBlock.y - BLOCK_MATCH_DISTANCE &&
            blockNodePos.x > idealNodePosOfBlock.x - BLOCK_MATCH_DISTANCE &&
            blockNodePos.x < idealNodePosOfBlock.x + BLOCK_MATCH_DISTANCE
        ) {
            const block2: Block = this.blocks.get(idealMatrixPosOfBlock);
            if (block2.isEmptyBlock)
                block2.setPosition(
                    this.blockMatrixPosToNodePos(block.getPosInMatrix())
                );
            this.blocks.swap(block.getPosInMatrix(), idealMatrixPosOfBlock);
            return true;
        }
        return false;
    }


    tt(blockPos: MatrixPos, eventTouch: EventTouch) {
        const block: Block = this.blocks.get(blockPos);
        console.log("block pos: ", blockPos);
        console.log("block: ", block);

        if (!block)
            return false;

        const delta: Vec2 = eventTouch.getDelta();
        let nextBlockPos: MatrixPos;
        if (delta.y < 0)
            nextBlockPos = matrixPos(blockPos.row + 1, blockPos.column);
        else
            nextBlockPos = matrixPos(blockPos.row - 1, blockPos.column);

        if (this.tt(nextBlockPos, eventTouch) || (block.isEmptyBlock && !this.blocks.get(nextBlockPos))) {
            const blockNodeCurrentPos: Vec3 = block.getNodePos();
            let newPos: Vec3 = v3(blockNodeCurrentPos.x,
                (blockNodeCurrentPos.y + delta.y),
                blockNodeCurrentPos.z);
            if (block.isEmptyBlock) {
                if (block.getPosInMatrix().row >= this.matrixSize.row) {
                    newPos = this.blockMatrixPosToNodePos(matrixPos(this.touchStartBlockPos.row - 1, this.touchStartBlockPos.column)).subtract3f(0, this.blockSize.height / 2, 0);
                    console.log("this.touchStartBlockPos: ", this.touchStartBlockPos);
                }
            }
            else {
                newPos = newPos.clampf(v3(this.boundries.xMin, this.boundries.yMin, 0),
                    v3(this.boundries.xMax, this.boundries.yMax, 0));
            }

            block.setPosition(newPos);

            if (block.getNodePos().y == this.blockMatrixPosToNodePos(block.getPosInMatrix()).y)
                return false;
            return true;
        }
    }

    private blockMoveRight(blockPos: MatrixPos, eventTouch: EventTouch) {
        console.log("block move right");
    }

    private blockMoveLeft(blockPos: MatrixPos, eventTouch: EventTouch) {
        console.log("block move left");
    }

    onDisable() {
        blockEventEmitter.removeListener(GAME_EVENT.onMove, this.onBlockMove, this);
    }
}
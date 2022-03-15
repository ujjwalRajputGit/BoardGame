import { Block } from "../componenet/Block";
import { IMatrixItem } from "../interface/IMatrixItem";

export class MatrixPos {
    row: number;
    column: number;
    constructor(row?: number, column?: number) {
        this.row = row;
        this.column = column;
    };
}

export function matrixPos(row?: number, column?: number): MatrixPos {
    return { row, column };
}

export class MatrixSize {
    row: number;
    column: number;
    constructor(row?: number, column?: number) {
        this.row = row;
        this.column = column;
    };
}

export function matrixSize(row?: number, column?: number): MatrixSize {
    return { row, column };
}

export class Matrix<T extends IMatrixItem> {
    private matrix;
    private row: number;
    private column: number;

    constructor(mSize: MatrixSize) {
        this.row = mSize.row;
        this.column = mSize.column;
        this.matrix = new Array<T>(mSize.row * mSize.column);
        console.log(this.matrix)
    }

    get(mPos: MatrixPos): T {
        return this.matrix[(mPos.row * this.column) + mPos.column];
    }

    set(mPos: MatrixPos, value: T) {
        this.matrix[(mPos.row * this.column) + mPos.column] = value;
        value.setPosInMatrix(mPos);
    }

    swap(block1Pos: MatrixPos, block2Pos: MatrixPos,) {
        let tmpBlock = this.get(block1Pos);
        this.set(block1Pos, this.get(block2Pos));
        this.set(block2Pos, tmpBlock);
    }

    setByIndex(index: number, value: T) {
        this.matrix[index] = value;
    }

    getByIndex(index: number): T {
        return this.matrix[index];
    }


}

export class Matrix<T> {
    private matrix;
    private row: number;
    private column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
        this.matrix = new Array<T>(row * column);
        console.log(this.matrix)
    }

    get(row: number, column: number) {
        return this.matrix[(row * this.column) + column];
    }

    set(row: number, column: number, value: T) {
        this.matrix[(row * this.column) + column] = value;
    }

    setByIndex(index: number, value: T) {
        this.matrix[index] = value;
    }

    getByIndex(index: number) {
        return this.matrix[index];
    }


}
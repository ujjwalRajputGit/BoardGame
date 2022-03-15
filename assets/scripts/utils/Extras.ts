export class BoardBoundries {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    constructor(xMin: number, xMax: number, yMin: number, yMax: number) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
    };
}

export function boardBoundries(xMin: number, xMax: number, yMin: number, yMax: number): BoardBoundries {
    return { xMin, xMax, yMin, yMax };
}
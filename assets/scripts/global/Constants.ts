import { EventEmitter } from "../utils/EventEmitter";

export const BLOCK_SPACE = 5;
export const BLOCK_MATCH_DISTANCE = 20

export const blockEventEmitter = new EventEmitter();

export const GAME_EVENT = {
    onMove: 'onMove',
}

export enum BlockState {
    YouCanMove = 2,
    YouCanNotMove = 3,
    ISwaped = 4,
}

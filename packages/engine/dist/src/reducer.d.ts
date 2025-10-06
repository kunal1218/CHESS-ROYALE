import type { Action } from "@pkg/common";
import type { GameState } from "./state";
export declare function reduce(prev: GameState, a: Action): GameState;

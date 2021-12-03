import { Node } from '../models/node';
export declare function createDiv(node: Node): HTMLDivElement;
export declare function createInput(node: Node): HTMLInputElement;
export declare function loadJS(url: string, callback?: () => void, render?: boolean): void;

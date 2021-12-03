import { Options } from './options';
import { Pen } from './models/pen';
import { Node } from './models/node';
import { Line } from './models/line';
import { Rect } from './models/rect';
import { Point } from './models/point';
import { Layer } from './layer';
import { Topology } from './core';
export declare class ActiveLayer extends Layer {
    options: Options;
    rotateCPs: Point[];
    sizeCPs: Point[];
    rect: Rect;
    activeRect: Rect;
    pens: Pen[];
    rotate: number;
    lastOffsetX: number;
    lastOffsetY: number;
    initialSizeCPs: Point[];
    nodeRects: Rect[];
    childrenRects: {
        [key: string]: Rect;
    };
    childrenRotate: {
        [key: string]: number;
    };
    dockWatchers: Point[];
    topology: Topology;
    rotating: boolean;
    constructor(options: Options, TID: string);
    calcControlPoints(): void;
    locked(): boolean;
    getPoints(): Point[];
    clear(): void;
    saveNodeRects(): void;
    private saveChildrenRects;
    resize(type: number, pt1: {
        x: number;
        y: number;
    }, pt2: {
        x: number;
        y: number;
        ctrlKey?: boolean;
        altKey?: boolean;
        shiftKey?: boolean;
    }): void;
    move(x: number, y: number): void;
    getLinesOfNode(node: Node): Line[];
    updateLines(pens?: Pen[]): void;
    offsetRotate(angle: number): void;
    rotateChildren(node: Pen): void;
    updateRotate(): void;
    add(pen: Pen): void;
    setPens(pens: Pen[]): void;
    has(pen: Pen): boolean;
    hasInAll(pen: Pen, pens?: Pen[]): boolean;
    render(ctx: CanvasRenderingContext2D): void;
    calcActiveRect(): void;
    getDockWatchers(): void;
}

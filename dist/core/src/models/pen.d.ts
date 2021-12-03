import { Rect } from './rect';
import { EventType, EventAction } from './event';
import { Lock } from './status';
export declare enum PenType {
    Node = 0,
    Line = 1
}
export interface Action {
    do?: string;
    url?: string;
    _blank?: string;
    tag?: string;
    fn?: string | Function;
    params?: any;
}
export interface Event {
    type: EventType;
    action: EventAction;
    value: string | Function;
    params: string;
    name?: string;
}
export interface Where {
    key?: string;
    comparison?: string;
    value?: any;
    fn?: string | Function;
    actions?: Action[];
}
export declare const images: {
    [key: string]: {
        img: HTMLImageElement;
    };
};
export declare abstract class Pen {
    TID: string;
    id: string;
    type: PenType;
    name: string;
    tags: string[];
    rect: Rect;
    lineWidth: number;
    rotate: number;
    offsetRotate: number;
    globalAlpha: number;
    dash: number;
    lineDash: number[];
    lineDashOffset: number;
    strokeStyle: string;
    fillStyle: string;
    lineCap: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    fontStyle: string;
    fontWeight: string;
    textAlign: string;
    textBaseline: string;
    textBackground: string;
    text: string;
    textMaxLine: number;
    whiteSpace: string;
    autoRect: boolean;
    textRect: Rect;
    fullTextRect: Rect;
    textOffsetX: number;
    textOffsetY: number;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    animateFn: string | Function;
    animateType: string;
    animateStart: number;
    animateCycle: number;
    animateCycleIndex: number;
    nextAnimate: string;
    animatePlay: boolean;
    animatePos: number;
    animateReverse: boolean;
    locked: Lock;
    stand: boolean;
    hideInput: boolean;
    hideRotateCP: boolean;
    hideSizeCP: boolean;
    hideAnchor: boolean;
    markdown: string;
    tipId: string;
    title: string;
    events: Event[];
    wheres: Where[];
    parentId: string;
    rectInParent: {
        x: number | string;
        y: number | string;
        width: number | string;
        height: number | string;
        marginTop?: number | string;
        marginRight?: number | string;
        marginBottom?: number | string;
        marginLeft?: number | string;
        rotate: number;
        rect?: Rect;
    };
    strokeType: number;
    lineGradientFromColor: string;
    lineGradientToColor: string;
    lineGradientAngle: number;
    paddingTopNum: number;
    paddingBottomNum: number;
    paddingLeftNum: number;
    paddingRightNum: number;
    visible: boolean;
    fillImage: string;
    strokeImage: string;
    fillImg: HTMLImageElement;
    strokeImg: HTMLImageElement;
    lastFillImage: string;
    lastStrokeImage: string;
    children: Pen[];
    data: any;
    value: number;
    num: number;
    num1: number;
    num2: number;
    num3: number;
    fromData(defaultData: any, json: any): void;
    render(ctx: CanvasRenderingContext2D): void;
    loadFillImg(): void;
    loadStrokeImg(): void;
    click(): void;
    mouseUp(): void;
    dblclick(): void;
    moveIn(): void;
    moveOut(): void;
    doWheres(): void;
    doAction(action: any): void;
    show(): this;
    hide(): this;
    isVisible(): boolean;
    getTID(): string;
    setTID(id: string): this;
    startAnimate(): void;
    play(pause?: boolean): void;
    private link;
    private doStartAnimate;
    private doPauseAnimate;
    private doStopAnimate;
    private doFn;
    private doWindowFn;
    private doEmit;
    generateStoreKey(key: any): string;
    abstract getTextRect(): Rect;
    abstract calcRectInParent(parent: Pen): void;
    abstract calcRectByParent(parent: Pen): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract translate(x: number, y: number, noAnimate?: boolean): void;
    abstract scale(scale: number, center?: {
        x: number;
        y: number;
    }): void;
    abstract hit(point: {
        x: number;
        y: number;
    }, padding?: number): any;
    abstract clone(): Pen;
    abstract initAnimate(): void;
    abstract animate(now: number): void;
    abstract pauseAnimate(): void;
    abstract stopAnimate(): void;
    abstract strokeLinearGradient(ctx: CanvasRenderingContext2D): void;
}

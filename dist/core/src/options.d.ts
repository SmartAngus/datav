export declare enum KeyType {
    Any = -1,
    CtrlOrAlt = 0,
    Ctrl = 1,
    Shift = 2,
    Alt = 3,
    Right = 4
}
export declare enum KeydownType {
    None = -1,
    Document = 0,
    Canvas = 1
}
export declare type Padding = number | string | number[];
export interface Options {
    cacheLen?: number;
    extDpiRatio?: number;
    width?: string | number;
    height?: string | number;
    color?: string;
    activeColor?: string;
    hoverColor?: string;
    anchorRadius?: number;
    anchorFillStyle?: string;
    dockStrokeStyle?: string;
    dockFillStyle?: string;
    dragColor?: string;
    animateColor?: string;
    fontColor?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    textAlign?: string;
    textBaseline?: string;
    rotateCursor?: string;
    hoverCursor?: string;
    hideInput?: boolean;
    hideRotateCP?: boolean;
    hideSizeCP?: boolean;
    hideAnchor?: boolean;
    disableSizeX?: boolean;
    disableSizeY?: boolean;
    anchorSize?: number;
    alwaysAnchor?: boolean;
    autoAnchor?: boolean;
    disableEmptyLine?: boolean;
    disableRepeatLine?: boolean;
    disableScale?: boolean;
    disableTranslate?: boolean;
    disableMoveOutParent?: boolean;
    disableDockLine?: boolean;
    playIcon?: string;
    pauseIcon?: string;
    fullScreenIcon?: string;
    loopIcon?: string;
    translateKey?: KeyType;
    scaleKey?: KeyType;
    minScale?: number;
    maxScale?: number;
    keydown?: KeydownType;
    viewPadding?: Padding;
    bkColor?: string;
    grid?: boolean;
    gridColor?: string;
    gridSize?: number;
    rule?: boolean;
    ruleColor?: string;
    refresh?: number;
    on?: (event: string, data: any) => void;
    scroll?: boolean;
}
export declare const fontKeys: string[];
export declare const DefalutOptions: Options;

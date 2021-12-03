import { Options } from './options';
import { Node } from './models/node';
import { Layer } from './layer';
export declare class DivLayer extends Layer {
    parentElem: HTMLElement;
    options: Options;
    canvas: HTMLDivElement;
    player: HTMLDivElement;
    curNode: Node;
    playBtn: HTMLElement;
    currentTime: HTMLElement;
    progressCurrent: HTMLElement;
    progress: HTMLElement;
    loop: HTMLElement;
    media: HTMLMediaElement;
    audios: {
        [key: string]: {
            player: HTMLElement;
            current: HTMLElement;
            media: HTMLMediaElement;
        };
    };
    iframes: {
        [key: string]: HTMLIFrameElement;
    };
    elements: {
        [key: string]: HTMLElement;
    };
    gifs: {
        [key: string]: HTMLImageElement;
    };
    private subcribeDiv;
    private subcribePlay;
    private subcribeNode;
    constructor(parentElem: HTMLElement, options: Options, TID: string);
    addDiv: (node: Node) => void;
    createPlayer: () => void;
    getMediaCurrent: () => void;
    addMedia: (node: Node, type: string) => HTMLDivElement;
    play(idOrTag: any, pause?: boolean): void;
    playOne(item: Node, pause?: boolean): void;
    addIframe(node: Node): HTMLIFrameElement;
    addGif(node: Node): HTMLImageElement;
    setElemPosition: (node: Node, elem: HTMLElement) => void;
    removeDiv: (item: Node) => void;
    clear(shallow?: boolean): void;
    formatSeconds(seconds: number): string;
    resize(size?: {
        width: number;
        height: number;
    }): void;
    render(): void;
    destroy(): void;
}

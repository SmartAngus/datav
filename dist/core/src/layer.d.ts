import { Observer } from 'le5le-store';
import { TopologyData } from './models/data';
export declare class Layer {
    protected TID: string;
    protected data: TopologyData;
    subcribe: Observer;
    constructor(TID: string);
    protected generateStoreKey(key: any): string;
    destroy(): void;
}

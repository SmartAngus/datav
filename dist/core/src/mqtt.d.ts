export declare class MQTT {
    url: string;
    options: any;
    topics: string;
    cb?: (topic: string, message: any) => void;
    client: any;
    fns: any;
    constructor(url: string, options: any, topics: string, cb?: (topic: string, message: any) => void);
    init(): void;
    publish(topic: string, message: string): void;
    close(): void;
}

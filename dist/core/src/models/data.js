import { Node } from './node';
import { Line } from './line';
import { Lock } from './status';
import { s8 } from '../utils';
import { Store } from 'le5le-store';
import { Rect } from './rect';
export function createData(json, tid) {
    var data = {
        pens: [],
        lineName: 'curve',
        fromArrow: '',
        toArrow: 'triangleSolid',
        scale: 1,
        locked: Lock.None,
        x: 0,
        y: 0,
    };
    if (typeof json === 'string') {
        json = JSON.parse(json);
    }
    data = Object.assign(data, json);
    data.pens = [];
    if (json) {
        // for old data.
        if (json.nodes) {
            for (var _i = 0, _a = json.nodes; _i < _a.length; _i++) {
                var item = _a[_i];
                item.TID = tid;
                data.pens.push(new Node(item));
            }
            for (var _b = 0, _c = json.lines; _b < _c.length; _b++) {
                var item = _c[_b];
                item.TID = tid;
                data.pens.push(new Line(item));
            }
        }
        // end.
        json.pens && json.pens.forEach(function (item) {
            tid && (item.TID = tid);
            if (!item.type) {
                data.pens.push(new Node(item));
            }
            else {
                data.pens.push(new Line(item));
            }
        });
        if (json.bkImageRect) {
            data.bkImageRect = new Rect(json.bkImageRect.x, json.bkImageRect.y, json.bkImageRect.width, json.bkImageRect.height);
        }
    }
    if (data.mqttOptions) {
        var opts = '';
        if (typeof data.mqttOptions === 'object') {
            opts = JSON.stringify(data.mqttOptions);
        }
        else {
            opts = data.mqttOptions + '';
        }
        data.mqttOptions = JSON.parse(opts);
    }
    else {
        data.mqttOptions = { clientId: s8() };
    }
    tid && Store.set(tid + '-topology-data', data);
    return data;
}
//# sourceMappingURL=data.js.map
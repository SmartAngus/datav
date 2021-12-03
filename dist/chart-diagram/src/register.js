import { registerNode, loadJS, Rect } from '@topology/core';
import { echarts, echartsObjs } from './echarts';
export function register(_echarts) {
    echartsObjs.echarts = _echarts;
    if (!echartsObjs.echarts && !echarts) {
        loadJS('https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts.min.js', undefined, true);
    }
    registerNode('echarts', echarts, undefined, function (node) {
        node.iconRect = new Rect(node.rect.x, node.rect.y, node.rect.width, node.rect.height);
        node.fullIconRect = node.rect;
    }, undefined);
}
//# sourceMappingURL=register.js.map
import { s8, createDiv, rectangle } from '@topology/core';
export var echartsObjs = {};
export function echarts(ctx, node) {
    // 绘制一个底图，类似于占位符。
    rectangle(ctx, node);
    // tslint:disable-next-line:no-shadowed-variable
    var echarts = echartsObjs.echarts;
    if (!echarts && window) {
        echarts = window['echarts'];
    }
    if (!node.data || !echarts) {
        return;
    }
    if (typeof node.data === 'string') {
        node.data = JSON.parse(node.data);
    }
    if (!node.data.echarts) {
        return;
    }
    if (node.elementId === undefined || node.elementId === null) {
        node.elementId = s8();
    }
    if (!node.elementLoaded) {
        echartsObjs[node.id] = {
            div: createDiv(node),
        };
        node.elementLoaded = true;
        document.body.appendChild(echartsObjs[node.id].div);
        // 添加当前节点到div层
        node.addToDiv();
        echartsObjs[node.id].chart = echarts.init(echartsObjs[node.id].div, node.data.echarts.theme);
        node.elementRendered = false;
        // 等待父div先渲染完成，避免初始图表控件太大
        setTimeout(function () {
            echartsObjs[node.id].chart.resize();
        });
    }
    if (!node.elementRendered) {
        // 初始化时，等待父div先渲染完成，避免初始图表控件太大。
        setTimeout(function () {
            echartsObjs[node.id].chart.setOption(node.data.echarts.option, true);
            echartsObjs[node.id].chart.resize();
            node.elementRendered = true;
            setTimeout(function () {
                var img = new Image();
                img.src = echartsObjs[node.id].chart.getDataURL({
                    pixelRatio: 2
                });
                node.img = img;
            }, 100);
        });
    }
}
//# sourceMappingURL=index.js.map
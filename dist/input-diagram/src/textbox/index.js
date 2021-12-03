import { s8, createInput } from '@topology/core';
// 用来存储 input dom 元素
export var inputObjs = {};
export function textbox(ctx, node) {
    // 节点样式改变时，修改对应值
    if (inputObjs[node.id] && inputObjs[node.id].input)
        changeStyle(inputObjs[node.id].input, node);
    // 活动层时，该值尚无，用该值来避免重复的创建
    if (!node.data) {
        return;
    }
    if (node.elementId === undefined || node.elementId === null) {
        node.elementId = s8();
    }
    if (!node.elementLoaded) {
        // 对应 id 配置一个 input 框
        inputObjs[node.id] = {
            input: createInput(node),
        };
        node.elementLoaded = true;
        if (!document.getElementById(node.elementId))
            document.body.appendChild(inputObjs[node.id].input);
        // 添加当前节点到div层
        node.addToDiv();
        node.elementRendered = false;
    }
    if (!node.elementRendered) {
        // 初始化时，等待父div先渲染完成，避免初始图表控件太大。
        setTimeout(function () {
            inputObjs[node.id].input.value = node.text || '';
            inputObjs[node.id].input.oninput = function (e) {
                node.text = e.target.value;
            };
            node.elementRendered = true;
        });
    }
}
function changeStyle(input, node) {
    if (input) {
        input.style.backgroundColor = node.fillStyle;
        input.style.fontSize = node.fontSize + 'px';
        input.style.color = node.fontColor;
        input.style.fontFamily = node.fontFamily;
    }
}
//# sourceMappingURL=index.js.map
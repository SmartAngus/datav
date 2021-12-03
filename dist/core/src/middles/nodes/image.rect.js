import { Rect } from '../../models/rect';
export function imageIconRect(node) {
    var textWidth = 0;
    var textHeight = 0;
    if (node.text) {
        if (node.paddingRightNum) {
            textWidth = node.paddingRightNum;
        }
        else {
            textHeight = node.paddingBottomNum || node.lineHeight * node.fontSize * (node.textMaxLine || 1);
        }
    }
    node.iconRect = new Rect(node.rect.x, node.rect.y, node.rect.width - textWidth, node.rect.height - textHeight);
    node.fullIconRect = node.rect;
}
export function imageTextRect(node) {
    if (node.paddingRightNum) {
        var width = node.paddingRightNum - 5;
        node.textRect = new Rect(node.rect.x + node.rect.width - width, node.rect.y, width, node.rect.height - node.textOffsetY * 2);
    }
    else {
        var height = node.paddingBottomNum || node.lineHeight * node.fontSize * (node.textMaxLine || 1);
        node.textRect = new Rect(node.rect.x, node.rect.y + node.rect.height - height, node.rect.width - node.textOffsetX * 2, height);
    }
    node.fullTextRect = node.rect;
}
//# sourceMappingURL=image.rect.js.map
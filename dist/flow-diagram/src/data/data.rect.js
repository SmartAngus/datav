import { Rect } from '@topology/core';
export function flowDataIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowDataTextRect(node) {
    node.textRect = new Rect(node.rect.x + node.rect.width / 7, node.rect.y, (node.rect.width * 5) / 7, node.rect.height);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=data.rect.js.map
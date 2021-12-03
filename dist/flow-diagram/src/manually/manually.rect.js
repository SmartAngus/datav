import { Rect } from '@topology/core';
export function flowManuallyIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowManuallyTextRect(node) {
    node.textRect = new Rect(node.rect.x, node.rect.y + node.rect.height / 4, node.rect.width, (node.rect.height * 3) / 4);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=manually.rect.js.map
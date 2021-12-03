import { Rect } from '@topology/core';
export function flowDisplayIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowDisplayTextRect(node) {
    node.textRect = new Rect(node.rect.x + node.rect.width / 8, node.rect.y, (node.rect.width * 3) / 4, node.rect.height);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=display.rect.js.map
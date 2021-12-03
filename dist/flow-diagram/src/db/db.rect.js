import { Rect } from '@topology/core';
export function flowDbIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowDbTextRect(node) {
    node.textRect = new Rect(node.rect.x, node.rect.y + node.rect.height / 8, node.rect.width, (node.rect.height * 5) / 8);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=db.rect.js.map
import { Rect } from '@topology/core';
export function flowDocumentIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowDocumentTextRect(node) {
    node.textRect = new Rect(node.rect.x, node.rect.y, node.rect.width, (node.rect.height * 5) / 7);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=document.rect.js.map
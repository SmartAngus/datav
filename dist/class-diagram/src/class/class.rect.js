import { Rect } from '@topology/core';
export function simpleClassIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function simpleClassTextRect(node) {
    var topHeight = 0.2 * node.rect.height;
    node.textRect = new Rect(node.rect.x, node.rect.y, node.rect.width, topHeight);
    node.fullTextRect = node.textRect;
}
export function interfaceClassIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function interfaceClassTextRect(node) {
    var topHeight = 0.2 * node.rect.height;
    node.textRect = new Rect(node.rect.x, node.rect.y, node.rect.width, topHeight);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=class.rect.js.map
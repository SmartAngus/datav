import { Rect } from '@topology/core';
export function flowExternStorageIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowExternStorageTextRect(node) {
    node.textRect = new Rect(node.rect.x + node.rect.width / 6, node.rect.y, (node.rect.width * 3) / 4, node.rect.height);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=externStorage.rect.js.map
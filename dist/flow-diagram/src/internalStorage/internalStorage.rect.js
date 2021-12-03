import { Rect } from '@topology/core';
export function flowInternalStorageIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function flowInternalStorageTextRect(node) {
    var offset = node.rect.width / 7;
    node.textRect = new Rect(node.rect.x + offset, node.rect.y + offset, node.rect.width - offset, node.rect.height - offset);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=internalStorage.rect.js.map
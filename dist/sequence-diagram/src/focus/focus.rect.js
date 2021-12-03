import { Rect } from '@topology/core';
export function sequenceFocusIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function sequenceFocusTextRect(node) {
    node.textRect = undefined;
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=focus.rect.js.map
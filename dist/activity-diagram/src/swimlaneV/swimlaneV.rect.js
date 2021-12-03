import { Rect } from '@topology/core';
export function swimlaneVIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function swimlaneVTextRect(node) {
    node.textRect = new Rect(node.rect.x, node.rect.y, node.rect.width, (8 / 100) * node.rect.height);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=swimlaneV.rect.js.map
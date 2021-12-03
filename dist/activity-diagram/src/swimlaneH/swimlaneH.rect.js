import { Rect } from '@topology/core';
export function swimlaneHIconRect(node) {
    node.iconRect = new Rect(0, 0, 0, 0);
}
export function swimlaneHTextRect(node) {
    node.textRect = new Rect(node.rect.x + (2 / 100) * node.rect.width, node.rect.y, (4 / 100) * node.rect.width, node.rect.height);
    node.fullTextRect = node.textRect;
}
//# sourceMappingURL=swimlaneH.rect.js.map
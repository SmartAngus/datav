import { Point, Direction } from '@topology/core';
export function flowCommentAnchors(node) {
    node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left));
}
//# sourceMappingURL=comment.anchor.js.map
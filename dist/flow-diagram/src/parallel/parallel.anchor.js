import { Point, Direction } from '@topology/core';
export function flowParallelAnchors(node) {
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up));
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height, Direction.Bottom));
}
//# sourceMappingURL=parallel.anchor.js.map
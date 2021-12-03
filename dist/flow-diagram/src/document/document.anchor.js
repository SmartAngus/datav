import { Point, Direction } from '@topology/core';
export function flowDocumentAnchors(node) {
    node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left));
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up));
    node.anchors.push(new Point(node.rect.x + node.rect.width, node.rect.y + node.rect.height / 2, Direction.Right));
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y + (node.rect.height * 6) / 7, Direction.Bottom));
}
//# sourceMappingURL=document.anchor.js.map
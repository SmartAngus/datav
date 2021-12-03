import { Point } from '../../models/point';
import { Direction } from '../../models/direction';
export function lineAnchors(node) {
    var y = node.rect.y + node.rect.height / 2;
    node.anchors.push(new Point(node.rect.x, y, Direction.Left));
    node.anchors.push(new Point(node.rect.x + node.rect.width, y, Direction.Right));
    var scale = topology.data.scale || 1; // 取全局的 scale 属性
    for (var i = node.rect.x + 5 * scale; i < node.rect.ex; i += 5 * scale) {
        var pt = new Point(i, y, Direction.Bottom);
        pt.hidden = true;
        node.anchors.push(pt);
    }
}
//# sourceMappingURL=line.anchor.js.map
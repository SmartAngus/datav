export function graffiti(ctx, node) {
    if (!node.points || !node.points[0]) {
        return;
    }
    ctx.beginPath();
    ctx.moveTo(node.points[0].x, node.points[0].y);
    node.points.forEach(function (pt) {
        ctx.lineTo(pt.x, pt.y);
    });
    node['closePath'] && !node['doing'] && ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=graffiti.js.map
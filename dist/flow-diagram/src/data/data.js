export function flowData(ctx, node) {
    ctx.beginPath();
    var offsetX = node.rect.width / 7;
    ctx.moveTo(node.rect.x + offsetX, node.rect.y);
    ctx.lineTo(node.rect.ex, node.rect.y);
    ctx.lineTo(node.rect.x + node.rect.width - offsetX, node.rect.ey);
    ctx.lineTo(node.rect.x, node.rect.ey);
    ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=data.js.map
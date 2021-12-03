export function flowManually(ctx, node) {
    ctx.beginPath();
    var offsetY = node.rect.height / 4;
    ctx.moveTo(node.rect.x, node.rect.y + offsetY);
    ctx.lineTo(node.rect.ex, node.rect.y);
    ctx.lineTo(node.rect.ex, node.rect.ey);
    ctx.lineTo(node.rect.x, node.rect.ey);
    ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=manually.js.map
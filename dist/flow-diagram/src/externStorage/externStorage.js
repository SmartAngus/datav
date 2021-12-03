export function flowExternStorage(ctx, node) {
    ctx.beginPath();
    var offsetX = node.rect.width / 10;
    ctx.moveTo(node.rect.x + offsetX * 2, node.rect.y);
    ctx.bezierCurveTo(node.rect.x - (offsetX * 2) / 3, node.rect.y, node.rect.x - (offsetX * 2) / 3, node.rect.ey, node.rect.x + offsetX * 2, node.rect.ey);
    ctx.lineTo(node.rect.ex, node.rect.ey);
    ctx.bezierCurveTo(node.rect.ex - offsetX, node.rect.ey, node.rect.ex - offsetX, node.rect.y, node.rect.ex, node.rect.y);
    ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=externStorage.js.map
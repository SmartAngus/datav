export function flowDocument(ctx, node) {
    ctx.beginPath();
    var x = node.rect.x + node.rect.width / 2;
    var y = node.rect.y + (node.rect.height * 6) / 7;
    var offsetY = node.rect.height / 6;
    ctx.moveTo(node.rect.x, node.rect.y);
    ctx.lineTo(node.rect.ex, node.rect.y);
    ctx.lineTo(node.rect.ex, y);
    ctx.bezierCurveTo(node.rect.ex - 20, y - offsetY, x + node.rect.width / 5, y - offsetY, x, y);
    ctx.bezierCurveTo(x - node.rect.width / 5, y + offsetY, node.rect.x, y + offsetY, node.rect.x, y);
    ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=document.js.map
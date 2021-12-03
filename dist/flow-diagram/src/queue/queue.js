export function flowQueue(ctx, node) {
    ctx.beginPath();
    ctx.ellipse(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height / 2, node.rect.width / 2, node.rect.height / 2, 0, 0, Math.PI * 2);
    ctx.moveTo(node.rect.x + node.rect.width / 2, node.rect.ey);
    ctx.lineTo(node.rect.ex, node.rect.ey);
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=queue.js.map
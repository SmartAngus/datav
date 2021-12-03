export function flowParallel(ctx, node) {
    ctx.beginPath();
    ctx.moveTo(node.rect.x, node.rect.y);
    ctx.lineTo(node.rect.ex, node.rect.y);
    ctx.moveTo(node.rect.x, node.rect.ey);
    ctx.lineTo(node.rect.ex, node.rect.ey);
    ctx.stroke();
}
//# sourceMappingURL=parallel.js.map
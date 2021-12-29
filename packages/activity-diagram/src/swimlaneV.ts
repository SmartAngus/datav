import { Pen } from '../../core/src/pen';
export function swimlaneV(pen: Pen): Path2D {
  const path = new Path2D();

  if (!pen.calculative.borderRadius) {
    pen.calculative.borderRadius = 0;
  }
  const worldRect = pen.calculative.worldRect;

  let wr = pen.calculative.borderRadius;
  let hr = pen.calculative.borderRadius;
  if (pen.calculative.borderRadius < 1) {
    wr = worldRect.width * pen.calculative.borderRadius;
    hr = worldRect.height * pen.calculative.borderRadius;
  }
  let r = wr < hr ? wr : hr;
  if (worldRect.width < 2 * r) {
    r = worldRect.width / 2;
  }
  if (worldRect.height < 2 * r) {
    r = worldRect.height / 2;
  }

  path.moveTo(worldRect.x + r, worldRect.y);
  path.arcTo(
    worldRect.x + worldRect.width,
    worldRect.y,
    worldRect.x + worldRect.width,
    worldRect.y + worldRect.height,
    r
  );
  path.arcTo(
    worldRect.x + worldRect.width,
    worldRect.y + worldRect.height,
    worldRect.x,
    worldRect.y + worldRect.height,
    r
  );
  path.arcTo(
    worldRect.x,
    worldRect.y + worldRect.height,
    worldRect.x,
    worldRect.y,
    r
  );
  path.arcTo(
    worldRect.x,
    worldRect.y,
    worldRect.x + worldRect.width,
    worldRect.y,
    r
  );
  path.closePath();

  //   40 肯定是不合理的，TODO: 该处用高度的部分值
  path.moveTo(worldRect.x, worldRect.y + 0.1 * worldRect.height);
  path.lineTo(worldRect.ex, worldRect.y + 0.1 * worldRect.height);

  return path;
}

import mean from './modularize/mean';
import range from './modularize/range';
import CubeCoord from './CubeCoord';

/**
 *
 * @param xMin {number}
 * @param yMin {number}
 * @param xMax {number}
 * @param yMax {number}
 * @param grow {boolean}
 * @param matrix {Hexes}
 */
export default (xMin, yMin, xMax, yMax, grow, matrix) => {
  function contains({ x, y }) {
    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  }

  const center = matrix.nearestHex(mean([xMin, xMax]), mean([yMin, yMax]));

  const radius = Math.max(xMax - xMin, yMax - yMin) * 2 / matrix.scale;

  // console.log('floodRect center = ', center, center.toXY(matrix));

  const hexes = new Map();
  range(center.x - radius, center.x + radius)
    .forEach((x) => range(center.y - radius, center.y + radius).forEach((y) => {
      const c = new CubeCoord(x, y);
      const point = c.toXY(matrix);
      // console.log('testing hex', c, 'point', point);
      if (contains(point)) {
      //   console.log('---- pass', c.toString());
        hexes.set(c.toString(), c);
      }
    }));

  if (grow) {
    Array.from(hexes.values()).forEach((h) => h.neighbors.forEach((h2) => hexes.set(h2.toString(), h2)));
  }
  return Array.from(hexes.values());
};

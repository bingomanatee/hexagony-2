import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import _ from 'lodash';
/**
 *
 * @param xMin {number}
 * @param yMin {number}
 * @param xMax {number}
 * @param yMax {number}
 * @param matrix {Hexes}
 */
export default (xMin, yMin, xMax, yMax, matrix) => {
  function contains({ x, y }) {
    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  }

  const space = [
    matrix.nearestHex(xMin, yMin),
    matrix.nearestHex(xMin, yMax),
    matrix.nearestHex(xMax, yMin),
    matrix.nearestHex(xMax, yMax),
  ];

  const cubeXmin = _(space).map('x').min();
  const cubeXmax = _(space).map('x').max();
  const cubeYmin = _(space).map('y').min();
  const cubeYmax = _(space).map('y').max();

  const hexes = new Map();
  _.range(cubeXmin, cubeXmax + 1).forEach((x) => _.range(cubeYmin, cubeYmax + 1).forEach((y) => {
    const c = new CubeCoord(x, y);
    if (contains(c.toXY(matrix))) {
      hexes.set(c.id, c);
    }
  }));

  hexes.forEach((h) => h.neighbors.forEach((h2) => hexes.push(h2)));
};

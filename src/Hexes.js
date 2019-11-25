import _N from '@wonderlandlabs/n';
import is from 'is';
import lGet from './modularize/get';
import isEqual from './modularize/isEqual';
import { Vector2 } from './Vector2';

import CubeCoord from './CubeCoord';
import {
  isPoint2Like, hex2string, box2array, array2box,
} from '../utils';

const cos30 = _N(30).rad().cos().value;

export default class Hexes {
  constructor(props) {
    this.scale = lGet(props, 'scale', 1);
    this.pointy = lGet(props, 'pointy', false);
  }

  toString() {
    return hex2string(this);
  }

  corners(coord) {
    const center = coord.toXY(this); // Vector2;

    const vectors = CubeCoord.neighbors.map((neighbor) => neighbor.toXY({
      scale: this.scale * (1 / (2 * cos30)),
      pointy: !this.pointy,
    }));
    return vectors.map((c) => c.add(center)); // [Vector2]{6}
  }

  get inverse() {
    return new Hexes({ scale: this.scale, pointy: !this.pointy });
  }

  nearestHex(x, y) {
    let point;
    if (isPoint2Like(x)) {
      point = new Vector2(x.x, x.y);
    } else {
      point = new Vector2(x, y);
    }

    const magnitude = _N(point.length()).max(1).div(this.scale).round()
      .max(1).value;
    // console.log('magnitude: ', magnitude, 'length:', point.length());

    const trialPoints = [
      new CubeCoord(0, 0, 0),
      new CubeCoord(magnitude, 0, 0),
      new CubeCoord(-magnitude, 0, 0),
      new CubeCoord(0, magnitude, 0),
      new CubeCoord(0, -magnitude, 0),
    ];

    const startPoint = this.closestToPoint(point, trialPoints);

    /*
    console.log('candidates: ', trialPoints.map(cubeString));
    console.log('candidates-toXY: ', trialPoints.map((p) => point2string(p.toXY(this))));
    console.log('nearest start to ', point2string(point), 'is ', cubeString(startPoint));
*/

    let nearest = startPoint;
    let nextNearest = startPoint;
    do {
      nearest = nextNearest;

      const candidates = nearest.neighbors;
      // eslint-disable-next-line no-loop-func
      nextNearest = this.closestToPoint(point, [...candidates, nearest]);
    } while (!nearest.equals(nextNearest));

    return nearest;
  }

  closestToPoint(pt2, coord1, coord2) {
    if (Array.isArray(coord1)) {
      return coord1.reduce((nearest, coord) => {
        if (nearest === null) {
          return coord;
        }
        return this.closestToPoint(pt2, nearest, coord);
      }, null);
    }
    if (pt2.distanceToSquared(coord1.toXY(this)) < pt2.distanceToSquared(coord2.toXY(this))) {
      return coord1;
    }
    return coord2;
  }

  /**
   * finds all coords which pass  a test.
   *
   * Because the test can potentially pass an infinite set of coordinates,
   * a set of limits are put on the process:
   * 1. the seed hexes are polled within the box defined by args, a 2d box.
   * 2. if extend is false those are the return values.
   * 3. if extend is a number, the candidates are grown until their population
   *    exceeds that number -- or no more contiguous candidates can be found.
   * 4. this function will automatically return after 3 seconds of polling.
   *
   * That last failsafe is not to be relied on -- it can result in a MASSIVE QUANTITY OF HEXES.
   *
   * @param test {function} accepts (Vector2, CubeCoord, Hexes) as parameters
   * @param extend {Boolean |number}
   * @param args {[number]} a box definition: minX, minY, maxX, maxY to start polling in
   * @returns {any[]|Map<any, any>}
   */
  floodQuery(test, extend = true, ...args) {
    const startTime = Date.now();
    if (!is.fn(test)) throw new Error('floodQuery requires function');
    let box;
    if (args.length >= 4) {
      box = array2box(...args);
    } else box = array2box(-10, -10, 10, 10);
    const candidates = this.floodRect(...box2array(box), true);

    const hexes = new Map();

    candidates.forEach((c) => {
      const pt = c.toXY(this);
      if (test(pt, c, this)) {
        hexes.set(c.name, c);
      }
    });

    if (!hexes.size) return [];

    if (!extend) return Array.from(hexes.values());

    // expand candidates by neighbor-checking test
    // until no contiguous candidates found
    // OR count exceeds extend
    // OR (god help you) time runs out.

    const grow = () => {
      const start = Array.from(hexes.values());
      start.forEach((coord) => {
        coord.neighbors.forEach((c) => {
          if (test(c.toXY(this), c, this)) {
            hexes.set(c.toString(), c);
          }
        });
      });
    };

    let keys = Array.from(hexes.keys());
    let newKeys = [...keys];
    do {
      if ((Date.now() - startTime) > 3000) break;
      keys = newKeys;

      grow(false);

      newKeys = Array.from(hexes.keys());
      if (is.number(extend) && (extend > 1) && newKeys.length > extend) {
        break;
      }
    } while (!isEqual(newKeys, keys));

    return Array.from(hexes.values());
  }

  floodRect(...args) {
    const rect = array2box(...args);
    const extend = args[4];

    const center = rect.getCenter(new Vector2());

    const hexes = new Map();

    const centerCube = this.nearestHex(center);

    hexes.set(centerCube.toString(), centerCube);

    let keys = Array.from(hexes.keys());
    let newKeys = [...keys];

    const grow = (flood) => {
      const start = Array.from(hexes.values());
      start.forEach((coord) => {
        coord.neighbors.forEach((nCoord) => {
          if (flood || rect.containsPoint(nCoord.toXY(this))) {
            hexes.set(nCoord.toString(), nCoord);
          }
        });
      });
    };

    do {
      keys = newKeys;

      grow(false);

      newKeys = Array.from(hexes.keys());
    } while (!isEqual(newKeys, keys));
    // grow twice more to cover border;

    if (extend) grow(true);

    return Array.from(hexes.values());
  }
}

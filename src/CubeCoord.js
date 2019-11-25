/* eslint-disable no-unused-vars */
import _N from '@wonderlandlabs/n';

import is from 'is';
import uniqBy from './modularize/uniqBy';
import differenceBy from './modularize/differenceBy';

import { Vector2 } from './Vector2';
import { Vector3 } from './Vector3';
import { cubeString, isPoint3Like } from '../utils';

const a0 = _N(0).rad();
const a30 = _N(30).rad();
const a60 = _N(60).rad();
const a90 = _N(90).rad();
const a120 = _N(120).rad();
const a150 = _N(150).rad();
const a180 = _N(180).rad();
const a210 = _N(210).rad();
const a240 = _N(240).rad();
const a270 = _N(270).rad();
const a300 = _N(300).rad();

// these are 2d coordinates for the unit vectors
// in various directions and coordinate sets
const xVectorPointy = new Vector2(a30.cos().value, a30.sin().value);
const yVectorPointy = new Vector2(a150.cos().value, a150.sin().value);
const zVectorPointy = new Vector2(a270.cos().value, a270.sin().value);

const xVectorFlat = new Vector2(a0.cos().value, a0.sin().value);
const yVectorFlat = new Vector2(a120.cos().value, a120.sin().value);
const zVectorFlat = new Vector2(a240.cos().value, a240.sin().value);

export default class Coord extends Vector3 {
  constructor(...args) {
    super(...args);
    this.round();
    this.computeZ();
    this.immutable = true;
  }

  computeZ() {
    this._z = _N(this.x).plus(this.y).times(-1).value;
  }

  add(c2) {
    const clone = this.clone();
    clone.immutable = false;
    clone.x += c2.x;
    clone.y += c2.y;
    clone.computeZ();
    clone.immutable = true;
    return clone;
  }

  get x() {
    return this._x;
  }

  set x(x) {
    if (this.immutable) {
      console.log('attempt to change an immutable CubeCoord');
    } else {
      this._x = x;
    }
  }

  get y() {
    return this._y;
  }

  set y(y) {
    if (this.immutable) {
      console.log('attempt to change an immutable CubeCoord');
    } else {
      this._y = y;
    }
  }

  get z() {
    return this._z;
  }

  set z(z) {
    if (this.immutable) {
      console.log('attempt to change an immutable CubeCoord');
    } else {
      this._z = z;
    }
  }

  get xyCache() {
    if (!this._xyCache) {
      this._xyCache = new Map();
    }
    return this._xyCache;
  }

  toXY(hexes) {
    const { pointy, scale } = hexes;

    let xVector = xVectorFlat;
    let yVector = yVectorFlat;
    let zVector = zVectorFlat;
    if (pointy) {
      xVector = xVectorPointy;
      yVector = yVectorPointy;
      zVector = zVectorPointy;
    }
    xVector = xVector.clone().multiplyScalar(this.x);
    yVector = yVector.clone().multiplyScalar(this.y);
    zVector = zVector.clone().multiplyScalar(this.z);
    const result = new Vector2(0, 0)
      .add(xVector)
      .add(yVector)
      .add(zVector)
      .multiplyScalar(scale / 2);

    return result;
  }

  offset(x, y, z) {
    return this.clone().add(new Coord(x, y, z));
  }

  clone() {
    return new Coord(this.x, this.y, this.z);
  }

  getCorners(hexes) {
    return hexes.corners(this);
  }

  toString() {
    return cubeString(this);
  }

  /**
   * determines if the values of the other object
   * are in sync with this one - not necessarily that it is truly a CubeCoord.
   * @param otherCC {Object|CubeCord}
   * @returns {boolean}
   */
  isEqualTo(otherCC) {
    return isPoint3Like(otherCC)
    && otherCC.x === this.x
    && otherCC.y === this.y
    && otherCC.z === this.z;
  }

  get neighbors() {
    if (!this._neighbors) {
      this._neighbors = Coord.neighbors.map((n) => this.add(n));
    }
    return this._neighbors;
  }

  diff(coords) {
    if (Array.isArray(coords)) {
      return coords.filter((p) => isPoint3Like(p) && !this.isEqualTo(p));
    }
    console.log('bad set passed to diff');
    return [];
  }
}

Coord.util = {
  isCoordLike(n) {
    if (!n && isPoint3Like(n)) return false;
    if (!(is.int(n.x) && is.int(n.y))) return false;
    return -(n.x + n.y) === n.z;
  },
  goodCoords(coords) {
    if (Array.isArray(coords)) {
      return coords.filter(Coord.util.isCoordLike);
    }
    console.log('bad set passed to goodCoords', coords);
    return [];
  },
  uniq(coords) {
    return uniqBy(Coord.util.goodCoords(coords), cubeString);
  },

  toMap(coords) {
    return Coord.util.goodCoords(coords).reduce((m, p) => { m.set(cubeString(p), p); return m; }, new Map());
  },

  union(coordsA, coordsB) {
    return Coord.util.uniq(Coord.util.goodCoords(coordsA).concat(Coord.util.goodCoords(coordsB)));
  },
  diff(coordsA, coordsB) {
    return differenceBy(Coord.util.goodCoords(coordsA), Coord.util.goodCoords(coordsB), cubeString());
  },
};

/**
 *  a list of the 2d vectors that relate to the
 *  position of cubes on a platonic 2d plane.
 */
Coord.vectors = new Map();
Coord.vectors.set('xFlat', xVectorFlat);
Coord.vectors.set('yFlat', yVectorFlat);
Coord.vectors.set('zFlat', zVectorFlat);
Coord.vectors.set('xPointy', xVectorPointy);
Coord.vectors.set('yPointy', yVectorPointy);
Coord.vectors.set('zPointy', zVectorPointy);

Coord.neighbors = [
  new Coord(1, -1, 0),
  new Coord(1, 0, -1),
  new Coord(0, 1, -1),
  new Coord(-1, 1, 0),
  new Coord(-1, 0, 1),
  new Coord(0, -1, 1),
];


const is = require('is');
const { Vector2 } = require('./src/Vector2');
const { Box2 } = require('./src/Box2');

const fix = (n, depth = 3) => {
  if (!is.number(n)) return 0;
  return Number(n).toFixed(depth);
};
const hex2string = (h) => `hexes|${fix(h.scale, 5)}-${h.pointy ? 'P' : 'F'}|`;
const isPointLike = (a) => a && is.object(a) && is.number(a.x) && is.number(a.y);
const isPoint3Like = (a) => a && is.object(a) && is.number(a.x) && is.number(a.y) && is.number(a.z);
const cubeString = (c) => {
  if (!isPoint3Like(c)) {
    console.log('bad cubeString candidate:', c);
    throw new Error('bad cubeString candidate');
    return '--- non cube-- ';
  }
  return `cube|${c.x},${c.y},${c.z}|`;
};
const point2string = (c) => `xy|${fix(c.x, 3)},${fix(c.y, 3)}|`;

const box2array = (box2) => {
  const { min, max } = box2;
  return [min.x, min.y, max.x, max.y];
};

const array2box = (x, y, x2, y2) => {
  if (Array.isArray(x)) return array2box(...x);
  return new Box2(new Vector2(x, y), new Vector2(x2, y2));
};

module.exports = {
  hex2string,
  isPoint3Like,
  isPointLike,
  isPoint2Like: isPointLike,
  cubeString,
  fix,
  point2string,
  box2array,
  array2box,
};

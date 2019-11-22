/* eslint-disable camelcase */
import { Vector2, Vector3 } from 'three';
import ava from '../addVectorAsserts';

const tap = require('tap');
const p = require('./../package.json');

const { CubeCoord, Hexes } = require('./../lib/index');
const { cubeString, point2string } = require('./../utils');

ava(tap);

tap.test(p.name, (suite) => {
  suite.test('CubeCoord', (testCC) => {
    testCC.test('constructor', (testCCcon) => {
      const a = new CubeCoord(10, 8, 2);
      testCCcon.same(a.x, 10);
      testCCcon.same(a.y, 8);
      testCCcon.same(a.z, -18); // z set to complement x, y

      testCCcon.end();
    });
    /*
    get vectors for reference
    testCC.test((testV) => {
      CubeCoord.vectors.forEach((c, name) => {
        console.log('vector ', name, point2string(c));
      });

      testV.end();
    });
*/

    testCC.test('toXY', (txy) => {
      const center = new CubeCoord(0, 0, 0);
      txy.vector2close(
        center.toXY({ pointy: true, scale: 2 }),
        new Vector2(0, 0),
        100,
        'pointy center is (0,0)',
      );

      const up21 = new CubeCoord(2, 1, 0);
      txy.vector2close(up21.toXY({ pointy: true, scale: 1 }),
        new Vector2(0.4330, 2.25), 100,
        'pointy 2,1 2d vector');

      txy.vector2close(up21.toXY({ pointy: true, scale: 2 }),
        new Vector2(0.866, 4.5), 100,
        'pointy 2,1 2d vector');
      // ensure that the result varies by scale -- AND that caching is not changine outcomes
      txy.vector2close(up21.toXY({ pointy: true, scale: 1 }),
        new Vector2(0.4330, 2.25), 100,
        'pointy 2,1 2d vector');
      // validating that caching is not changing outcome;

      txy.vector2close(
        up21.toXY({ pointy: false, scale: 1 }),
        new Vector2(1.5000, 1.7321),
        100,
        'flat 2,1 2d vector',
      );

      txy.end();
    });

    testCC.test('neighbors', (n) => {
      const center = new CubeCoord(0, 0);

      // console.log('neighbors:', center.neighbors.map(cubeString));

      n.vector3close(center.neighbors[0], new CubeCoord(1, -1), 100, 'neighbor 1 test');
      n.vector3close(center.neighbors[1], new CubeCoord(1, 0), 100, 'neighbor 2 test');
      n.vector3close(center.neighbors[1], new CubeCoord(0, 1), 100, 'neighbor 3 test');
      n.vector3close(center.neighbors[3], new CubeCoord(-1, 1), 100, 'neighbor 4 test');
      n.vector3close(center.neighbors[4], new CubeCoord(-1, 0), 100, 'neighbor 5 test');
      n.vector3close(center.neighbors[5], new CubeCoord(0, -1), 100, 'neighbor 6 test');

      const d = new CubeCoord(3, -5);

      n.vector3close(d.neighbors[0], new CubeCoord(4, -6), 100, 'neighbor 1 test');
      n.vector3close(d.neighbors[1], new CubeCoord(4, -5), 100, 'neighbor 2 test');
      n.vector3close(d.neighbors[1], new CubeCoord(3, -4), 100, 'neighbor 3 test');
      n.vector3close(d.neighbors[3], new CubeCoord(2, -4), 100, 'neighbor 4 test');
      n.vector3close(d.neighbors[4], new CubeCoord(2, -5), 100, 'neighbor 5 test');
      n.vector3close(d.neighbors[5], new CubeCoord(3, -6), 100, 'neighbor 6 test');

      // console.log('neighbors:', d.neighbors.map(cubeString));

      n.end();
    });

    testCC.test('nearest', (near) => {
      const origin = new CubeCoord(2, 3);

      const cluster = [origin, ...origin.neighbors];

      const matrix = new Hexes(1, true);

      //  console.log('cluster toString', cluster.map(cubeString).join('\n'));
      // console.log('cluster points', cluster.map((c) => point2string(c.toXY(matrix))).join('\n'));

      const point = new Vector2(0.750, 3.9);
      const nearest = matrix.closestToPoint(point, cluster);
      // console.log('point:', point2string(point), 'nearest point: ', nearest.toString());

      near.vector3close(nearest, new CubeCoord(1, 4, -5), 10, 'right closest point found');

      near.end();
    });

    testCC.end();
  });

  suite.end();
});

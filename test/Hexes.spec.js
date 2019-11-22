/* eslint-disable camelcase */
import { Vector2, Vector3 } from 'three';
import ava from '../addVectorAsserts';
// import pure from 'pureimage';
const { createCanvas, loadImage, registerFont } = require('canvas');

registerFont(`${__dirname}/Helvetica.ttf`, { family: 'Helvetica' });

const fs = require('fs');
const tap = require('tap');
const _ = require('lodash');
const _N = require('@wonderlandlabs/n');
const p = require('./../package.json');

const { CubeCoord, Hexes } = require('./../lib/index');

const {
  cubeString, point2string, isPoint2Like, box2array,
} = require('./../utils');

ava(tap);

const draw = async (cornerSets, config = {}, outputFilename) => {
  const max_x = _.get(config, 'max_x', 5);
  const max_y = _.get(config, 'max_y', 5);
  const min_x = _.get(config, 'min_x', -5);
  const min_y = _.get(config, 'min_x', -5);
  const pointMap = _.get(config, 'points');
  const visual_scale = _.get(config, 'visual_scale', 50);
  const padding = _.get(config, 'padding', 5);

  const p2 = _N(padding).times(2);
  const width = _N(max_x).sub(min_x).times(visual_scale).plus(p2).value;
  const height = _N(max_y).sub(min_y).times(visual_scale).plus(p2).value;
  const can = createCanvas(width, height);
  const ctx = can.getContext('2d');
  ctx.font = '14pt Helvetica';

  const screenCoord = (x, y) => {
    if (isPoint2Like(x)) {
      return screenCoord(x.x, x.y);
    }
    return new Vector2(
      _N(x).sub(min_x).times(visual_scale).plus(padding).value,
      _N(y).sub(min_x).times(visual_scale).plus(padding).value,
    );
  };

  ctx.beginPath();
  ctx.fillStyle = '#FFFFFF';
  ctx.moveTo(-1, -1);
  ctx.lineTo(width + 1, -1);
  ctx.lineTo(width + 1, height + 1);
  ctx.lineTo(-1, height - 1);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#75adda';
  ctx.lineWidth = 1;
  _.range(min_x, max_x + 1).forEach((x) => {
    const start = screenCoord(x, min_y);
    const end = screenCoord(x, max_y);
    ctx.moveTo(...start.toArray());
    ctx.lineTo(...end.toArray());
  });

  _.range(min_y, max_y + 1).forEach((y) => {
    const start = screenCoord(min_x, y);
    const end = screenCoord(max_x, y);
    ctx.moveTo(...start.toArray());
    ctx.lineTo(...end.toArray());
  });
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(...screenCoord(min_x, 0).toArray());
  ctx.lineTo(...screenCoord(max_x, 0).toArray());
  ctx.moveTo(...screenCoord(0, min_y).toArray());
  ctx.lineTo(...screenCoord(0, max_y).toArray());
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  cornerSets.forEach((corners) => {
    corners.forEach((point, i) => {
      if (i) {
        ctx.lineTo(...screenCoord(point.x, point.y).toArray());
      } else {
        ctx.moveTo(...screenCoord(point.x, point.y).toArray());
      }
    });
    ctx.lineTo(...screenCoord(corners[0].x, corners[0].y).toArray());
  });
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#0000FF';
  cornerSets.forEach((corners) => {
    if (corners.cube) {
      const label = cubeString(corners.cube);
      const center = screenCoord(corners.cubeCenter);
      ctx.fillText(label, center.x, center.y);
    }
  });


  const PR = 15;
  if (pointMap) {
    ctx.beginPath();
    pointMap.forEach(({ point, label }) => {
      ctx.strokeStyle = '#993300';
      ctx.lineWidth = 1;
      const screenPt = screenCoord(point);
      const { x, y } = screenPt;
      //  console.log('drawing point ', point, 'label:', label, 'at', x, y);
      ctx.moveTo(x - PR, y);
      ctx.lineTo(x + PR, y);
      ctx.moveTo(x, y - PR);
      ctx.lineTo(x, y + PR);

      ctx.fillStyle = '#009900';
      ctx.fillText(label, x + 5, y + 5);
    });
    ctx.closePath();
    ctx.stroke();
  }

  return can.createPNGStream().pipe(fs.createWriteStream(`${outputFilename}.png`));
};

tap.test(p.name, (suite) => {
  suite.test('Hexes', (testCC) => {
    testCC.test('constructor', (testHcon) => {
      const a = new Hexes({ pointy: true, scale: 2 });
      testHcon.same(a.pointy, true);
      testHcon.same(a.scale, 2); // z set to complement x, y

      testHcon.end();
    });

    testCC.test('corners', async (testHCorners) => {
      testHCorners.test('origin - pointy', async (testHCOP) => {
        const a = new Hexes({ pointy: true, scale: 1 });

        const corners = a.corners(new CubeCoord(0, 0, 0));
        /*     const expected = [
          { x: 1.732, y: 0 },
          { x: 0.866, y: 0.5 },
          { x: -0.866, y: 0.5 },
          { x: -1.732, y: 0 },
          { x: -0.866, y: -0.5 },
          { x: 0.866, y: -0.5 },
        ];

        corners.forEach((corner, i) => {
          const e = expected[i];
          testHCOP.vector2close(e, expected[i], 100);
        }); */

        await draw([corners], {}, 'pointyCornerAtOrigin');
        testHCOP.end();
      });
      testHCorners.test('series - pointy', async (testHCOP) => {
        const a = new Hexes({ pointy: true, scale: 1 });
        const series = [];
        _.range(0, 4).forEach((x) => {
          const center = new CubeCoord(x, 0, 0);
          series.push(a.corners(center));
        });
        await draw(series, {}, 'pointyCornerSeries');
        testHCOP.end();
      });

      testHCorners.test('series - flat', async (testHCOP) => {
        const a = new Hexes({ pointy: false, scale: 1 });
        const series = [];
        _.range(0, 4).forEach((x) => {
          const center = new CubeCoord(x, 0, 0);
          series.push(a.corners(center));
        });
        await draw(series, {}, 'flatCornerSeries');
        testHCOP.end();
      });

      testHCorners.test('origin - flat', async (testHCOP) => {
        const a = new Hexes({ pointy: false, scale: 1 });

        const corners = a.corners(new CubeCoord(0, 0, 0));
        // console.log('flat corners:', JSON.stringify(corners));
        const expected = [
          { x: 5.0000, y: 2.59807 },
          { x: 4.7500, y: 3.03108 },
          { x: 4.2500, y: 3.03108 },
          { x: 4.0000, y: 2.59807 },
          { x: 4.2500, y: 2.16506 },
          { x: 4.7500, y: 2.16506 },
        ];
        corners.forEach((corner, i) => {
          const e = expected[i];
          testHCOP.vector2close(e, expected[i], 100);
        });

        // const first = corners[0];
        // const maxDist = corners.reduce((dist, candidate) => Math.max(dist, candidate.distanceTo(first)), 0);
        // console.log('diameter: ', maxDist);
        await draw([corners], {}, 'flatCornerAtOrigin');
        testHCOP.end();
      });

      testHCorners.end();
    });

    testCC.test('nearestHex: image drawing', (nh) => {
      const matrix = new Hexes({ scale: 1, pointy: true });
      let cs = [];
      for (let x = -6; x < 7; ++x) {
        for (let y = -6; y < 7; ++y) {
          cs.push(new CubeCoord(x, y));
        }
      }

      cs = CubeCoord.util.uniq(cs);

      const cornerSets = cs.map((c) => {
        const list = matrix.corners(c);
        list.cube = c;
        list.cubeCenter = c.toXY(matrix);
        return list;
      });

      const pointMap = [];

      for (let x = -5; x < 5; x += 0.5) {
        for (let y = -5; y < 5; y += 0.5) {
          const point = new Vector2(x, y);
          const nearest = matrix.nearestHex(point);
          const label = cubeString(nearest);
          pointMap.push({ point, label });
        }
      }

      draw(cornerSets, { visual_scale: 300, points: pointMap }, 'nearestHexHexes');

      const matrix2 = new Hexes({ scale: 0.25, pointy: true });
      let cs2 = [];
      for (let x = -6; x < 7; ++x) {
        for (let y = -6; y < 7; ++y) {
          cs2.push(new CubeCoord(x, y));
        }
      }

      cs2 = CubeCoord.util.uniq(cs2);

      const cornerSets2 = cs2.map((c) => {
        const list = matrix2.corners(c);
        list.cube = c;
        list.cubeCenter = c.toXY(matrix2);
        return list;
      });

      const pointMap2 = [];

      for (let x = -5; x < 5; x += 0.5) {
        for (let y = -5; y < 5; y += 0.5) {
          const point = new Vector2(x, y);
          const nearest = matrix2.nearestHex(point);
          const label = cubeString(nearest);
          pointMap2.push({ point, label });
        }
      }

      draw(cornerSets2, { visual_scale: 600, points: pointMap2 }, 'nearestHexHexes-finer');

      nh.end();
    });

    testCC.test('nearestHex', (nh) => {
      const matrix = new Hexes({ scale: 1, pointy: true });

      const target = new Vector2(5, 5);

      const nearTarget = matrix.nearestHex(target);

      //  console.log('closest cube:', nearTarget.toString());

      nh.vector3close(nearTarget, new CubeCoord(9, -2), 10, 'found point in one frame');

      const matrix2 = new Hexes({ scale: 1, pointy: false });

      nh.vector3close(matrix2.nearestHex(target), new CubeCoord(7, 2), 10, 'found point in one frame');

      nh.end();
    });

    testCC.test('floodRect', (fr) => {
      const matrix = new Hexes({ scale: 0.5, pointy: false });
      const coords = matrix.floodRect(3, 3, 5, 8, true);

      const corners = coords.map((c) => matrix.corners(c));

      draw(corners, {
        min_x: -1, max_x: 10, min_y: -1, max_y: 10,
      }, 'floodedRect');

      const closeToRect = fr.end();
    });

    testCC.test('floodQuery', (fq) => {
      const matrix = new Hexes({ scale: 0.5, pointy: false });

      const point = new Vector2(3, 3);

      const coords = matrix.floodQuery(
        (pt) => point.distanceTo(pt) < 6,
        true, 0, 0, 10, 10,
      );

      const corners = coords.map((c) => matrix.corners(c));

      draw(corners, {
        min_x: -10, max_x: 20, min_y: -10, max_y: 20,
      }, 'floodedQuery');

      const matrix2 = new Hexes({ scale: 0.25, pointy: true });

      const coords2 = matrix2.floodQuery(
        (pt) => point.distanceTo(pt) < 6,
        true, 0, 0, 10, 10,
      );

      const corners2 = coords2.map((c) => matrix2.corners(c));

      draw(corners2, {
        min_x: -10, max_x: 20, min_y: -10, max_y: 20,
      }, 'floodedQuery2');

      coords.forEach((c) => fq.ok(point.distanceTo(c.toXY(matrix)) < 6.5, 'all points are within circleish'));
      fq.end();
    });

    testCC.end();
  });

  suite.end();
});

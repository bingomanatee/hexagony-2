const _N = require('@wonderlandlabs/n');
const is = require('is');
const _ = require('lodash');
const realDiff = require('./src/realDiff');

const feedback = (...args) => {
  // console.log(...args);
};

const ps = ({ x, y }) => `(x:${x.toFixed(4)},y:${y.toFixed(4)})`;
const p3s = ({ x, y, z }) => `(x:${x.toFixed(4)},y:${y.toFixed(4)},z:${z.toFixed(4)})`;

module.exports = (t) => {


  t.Test.prototype.addAssert('realClose', 3,
    function (realA, realB, resolution = 1000, message = '') {
      if (!message) {
        message = `${realA} ==± ${realB}`;
      }
      this.ok(realDiff(realA, realB, resolution), message);
    });

  t.Test.prototype.addAssert('realFar', 3,
    function (realA, realB, resolution = 1000, message = '') {
      if (!message) {
        message = `${realA} ==± ${realB}`;
      }
      this.ok(realDiff(realA, realB, resolution, true), message);
    });

  t.Test.prototype.addAssert('vector2close', 3,
    function (pt1, pt2, resolution = 1000, message = '') {
      feedback('vector2close(): ', pt1, pt2, resolution);

      const identityAsserts = [
        is.object(pt1),
        is.object(pt2),
        ('x' in pt1),
        ('y' in pt1),
        ('x' in pt2),
        ('y' in pt2),
      ];

      feedback('vector2close', 'identityAsserts', identityAsserts);

      if (!_.every(identityAsserts)) {
        feedback('bad arguments');
        this.fail('arguments are not points');
      }
      const asserts = [
        realDiff(pt1.x, pt2.x, resolution),
        realDiff(pt1.y, pt2.y, resolution),
      ];
      feedback('vector2: asserts', asserts);
      this.ok(_.some(asserts), `${message}: ${ps(pt1)}!==${ps(pt2)}`);
    });

  t.Test.prototype.addAssert('vector2far', 3,
    function (pt1, pt2, resolution = 1000, message = '') {
      feedback('vector2far: ', resolution);

      const identityAsserts = [
        is.object(pt1),
        is.object(pt2),
        ('x' in pt1),
        ('y' in pt1),
        ('x' in pt2),
        ('y' in pt2),
      ];

      feedback('vector3far', pt1, pt2, 'identityAsserts', identityAsserts);

      if (!_.every(identityAsserts)) {
        feedback('bad arguments');
        this.fail('arguments are not points');
      }
      const asserts = [
        realDiff(pt1.x, pt2.x, resolution, true),
        realDiff(pt1.y, pt2.y, resolution, true),
      ];
      feedback('vector3far: asserts', asserts);
      this.ok(_.some(asserts), `${message}: ${ps(pt1)}===${ps(pt2)}`);
    });

  t.Test.prototype.addAssert('vector3close', 3,
    function (pt1, pt2, resolution = 1000, message = '') {
      feedback('vector3close(): ', pt1, pt2, resolution);

      const identityAsserts = [
        is.object(pt1),
        is.object(pt2),
        ('x' in pt1),
        ('y' in pt1),
        ('z' in pt1),
        ('x' in pt2),
        ('y' in pt2),
        ('z' in pt2),
      ];

      if (!_.every(identityAsserts)) {
        feedback('bad arguments');
        this.fail('arguments are not points');
      }
      const asserts = [
        realDiff(pt1.x, pt2.x, resolution),
        realDiff(pt1.y, pt2.y, resolution),
        realDiff(pt1.z, pt2.z, resolution)];
      feedback('vector3: asserts', asserts);
      this.ok(_.some(asserts), `${message}: ${p3s(pt1)}!==${p3s(pt2)}`);
    });

  t.Test.prototype.addAssert('vector3far', 3,
    function (pt1, pt2, resolution = 1000, message = '') {
      feedback('vector3far(): ', pt1, pt2, resolution);
      const identityAsserts = [
        is.object(pt1),
        is.object(pt2),
        ('x' in pt1),
        ('y' in pt1),
        ('z' in pt1),
        ('x' in pt2),
        ('y' in pt2),
        ('z' in pt2),
      ];

      feedback('vector3close', 'identityAsserts', identityAsserts);

      if (!_.every(identityAsserts)) {
        feedback('bad arguments');
        this.fail('arguments are not points');
      }
      const asserts = [
        realDiff(pt1.x, pt2.x, resolution, true),
        realDiff(pt1.y, pt2.y, resolution, true),
        realDiff(pt1.z, pt2.z, resolution, true),
      ];
      feedback('vector3: asserts', asserts);
      this.ok(_.some(asserts), `${message}: ${p3s(pt1)}===${p3s(pt2)}`);
    });
};

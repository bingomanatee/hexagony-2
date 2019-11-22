/* eslint-disable camelcase */
const tap = require('tap');
const { Vector2, Vector3 } = require('three');
const p = require('./../package.json');
const addAsserts = require('../addVectorAsserts');

addAsserts(tap);

tap.test(p.name, (suite) => {
  suite.test('realClose asserts', (close) => {
    close.realClose(1, 1, 10, 'same number close to itself');
    close.realClose(-1, -1, 10, 'same negative number close to itself');

    close.realClose(1, 1.0001, 10, 'similar numbers are close');
    close.realFar(1, 1.0001, 100000, 'similar numbers are far with higher precision');

    close.realClose(-1, -1.0001, 10, 'similar negative numbers are close');
    close.realFar(-1, -1.0001, 100000, 'similar negative numbers are far with higher precision');

    close.end();
  });

  suite.test('Vector2 asserts', (testV2) => {
    const p1 = new Vector2(1, 2);
    const p2 = new Vector2(1, 2);
    const p2close = new Vector2(1, 2.001);
    const p2bad = new Vector2(1, 3);

    testV2.vector2close(p1, p2, 10, 'same vectors are close');
    testV2.vector2close(p1, p2close, 10, 'close vectors are close');
    testV2.vector2far(p1, p2close, 10000, 'close vectors are not close enough');
    try {
      testV2.vector2far(p1, p2bad, 10, 'different vectors are different');
    } catch (err) {
      console.log('error for bad point', err);
    }

    testV2.end();
  });

  suite.test('Vector3 asserts', (testV2) => {
    const p1 = new Vector3(1, 0, 2);
    const p3 = new Vector3(1, 0, 2);
    const p3close = new Vector3(1, 0, 2.001);
    const p3bad = new Vector3(1, 0, 3);

    testV2.vector3close(p1, p3, 10, 'same vectors are close');
    testV2.vector3close(p1, p3close, 10, 'close vectors are close');
    testV2.vector3far(p1, p3close, 10000, 'close vectors are not close enough');
    try {
      testV2.vector3far(p1, p3bad, 10, 'different vectors are different');
    } catch (err) {
      console.log('error for bad point', err);
    }

    testV2.end();
  });

  suite.end();
});

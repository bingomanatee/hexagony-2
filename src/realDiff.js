const is = require('is');
const _N = require('@wonderlandlabs/n');

module.exports = (a, b, scale = 1000, negate) => {
  if (!(is.number(a) && is.number(b) && is.number(scale))) {
    return false;
  }
  const diff = _N(a).sub(b).abs().times(scale).value;
  return negate ? diff > 1 : diff < 1;
};

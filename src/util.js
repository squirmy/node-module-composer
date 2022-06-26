const flattenDeep = require('lodash/flattenDeep');
const get = require('lodash/get');
const has = require('lodash/has');
const isFunction = require('lodash/isFunction');
const isPlainObject = require('lodash/isPlainObject');
const mapValues = require('lodash/mapValues');
const merge = require('lodash/merge');
const pick = require('lodash/pick');
const set = require('lodash/set');
const upperFirst = require('lodash/upperFirst');

const defineGetters = (obj, propTargets) => Object.defineProperties(obj, Object.fromEntries(
    Object.entries(propTargets).map(([key, val]) => [key, { get() { return { ...val }; } }])
));

const isPlainFunction = val => isFunction(val) && !(val.prototype && val.prototype.constructor === val);
const override = (obj, overrides = {}) => merge(obj, pick(overrides, Object.keys(obj)));
const pickValues = (obj, keys) => Object.values(pick(obj, keys));


module.exports = {
    defineGetters,
    flattenDeep,
    get,
    has,
    isPlainFunction,
    isPlainObject,
    mapValues,
    merge,
    pickValues,
    set,
    upperFirst,
    override
};

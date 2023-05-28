/* eslint-disable no-prototype-builtins */
const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const has = require('lodash/has');
const invoke = require('lodash/invoke');
const isFunction = require('lodash/isFunction');
const isPlainObject = require('lodash/isPlainObject');
const mapValues = require('lodash/mapValues');
const merge = require('lodash/merge');
const pick = require('lodash/pick');
const pickBy = require('lodash/pickBy');
const set = require('lodash/set');
const unset = require('lodash/unset');
const flow = require('lodash/flow');

const isPlainFunction = val => isFunction(val) && !val.hasOwnProperty('prototype');
const isPromise = val => val && typeof val.then == 'function';

const matchPaths = (obj, cb, depth, currentDepth = 0, currentPath = []) => {
    // if (currentDepth === depth) return [];
    return Object.entries(obj).flatMap(([key, val]) => {
        const path = [...currentPath, key];
        const res1 = !isPlainObject(val) && cb(key) ? [path] : [];
        const res2 = isPlainObject(val) ? matchPaths(val, cb, depth, currentDepth + 1, path) : [];
        return [...res1, ...res2];
    });
};

const replacePaths = (obj, fromArray, toArray) => {
    const target = cloneDeep(obj);
    fromArray.forEach((from, i) => {
        const orig = get(obj, from);
        unset(target, from);
        set(target, toArray[i], orig);
    });
    const pickKeys = toArray.map(arr => arr.join('.'));
    return pick(target, ...pickKeys);
};

const removePaths = (obj, paths) => {
    const target = cloneDeep(obj);
    paths.forEach(path => unset(target, path));
    return target;
};

const deepFreeze = obj => {
    const propNames = Reflect.ownKeys(obj);
    for (const name of propNames) {
        const value = obj[name];
        if ((value && typeof value === 'object') || typeof value === 'function') deepFreeze(value);
    }
    return Object.freeze(obj);
};

module.exports = {
    cloneDeep,
    deepFreeze,
    flow,
    get,
    has,
    invoke,
    isPlainFunction,
    isPlainObject,
    isPromise,
    mapValues,
    matchPaths,
    merge,
    pick,
    pickBy,
    removePaths,
    replacePaths,
    set
};

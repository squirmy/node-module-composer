const util = require('./util');

module.exports = session => (path, deps, args, opts) => {

    const options = util.merge({}, session.options, opts);
    const { depth, customiser, overrides } = options;

    const recurse = (target, parentPath, deps, currentDepth = 0) => {
        if (currentDepth === depth) return target;
        if (!util.isPlainObject(target)) return target;
        const self = {};
        const depsMod = util.set({ self, ...deps }, parentPath, self);
        const evaluate = (val, key) => util.isPlainFunction(val) ? val(depsMod, args) : recurse(val, [parentPath, key].join('.'), depsMod, currentDepth + 1);
        return Object.assign(self, util.mapValues(target, evaluate));
    };

    if (!path) throw new Error('key is required');
    if (!util.has(session.target, path)) throw new Error(`${path} not found`);

    const targetModule = util.get(session.target, path);

    if (!util.isPlainObject(targetModule)) throw new Error(`${path} must be a plain object`);
    if (session.state.composedDependencies[path]) throw new Error(`${path} is already composed`);

    const maybePromise = util.flow([
        ...session.precustomisers.map(func => target => func(path, target, options)),
        target => recurse(target, path, deps),
        target => util.has(target, customiser) ? util.invoke(target, customiser, args) : target
    ])(targetModule);


    const next = target => {
        if (!util.isPlainObject(target)) throw new Error(`${path}.${customiser} must return a plain object`);

        return util.flow([
            target => util.merge(target, util.get(overrides, path)),
            ...session.postcustomisers.map(func => target => func(path, target, options)),
            target => session.registerModule(path, target, deps)
        ])(target);
    };

    return util.isPromise(maybePromise) ? maybePromise.then(next) : next(maybePromise);

};

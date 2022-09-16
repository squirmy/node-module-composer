const util = require('./util');

module.exports = props => {

    const { target, options } = props;

    const recurse = (target, parentKey, deps) => {
        if (!util.isPlainObject(target)) return target;
        const product = {};
        deps = util.set({ ...deps }, parentKey, product);
        const evaluate = (val, key) => util.isPlainFunction(val) ? val(deps) : recurse(val, key, deps);
        return Object.assign(product, util.mapValues(target, evaluate));
    };

    return (key, deps, opts = {}) => {
        if (!key) throw new Error('key is required');
        if (!util.has(target, key)) throw new Error(`${key} not found`);
        if (props.composedDependencies[key]) throw new Error(`${key} already composed`);
        deps = { ...options.defaults, ...deps };
        const recursed = recurse(util.get(target, key), key, deps);
        const customised = opts.customiser?.(recursed) ?? util.invoke(recursed, options.customiser, recursed);
        if (customised && !util.isPlainObject(customised)) throw new Error(`${key} customiser must return plain object`);
        const overridden = util.merge(customised ?? recursed, util.get(options.overrides, key));
        const omitted = util.deepOmitKeys(overridden, key => key.match(options.omitPattern));
        const module = omitted;
        util.set(props.modules, key, module);
        props.dependencies[key] = props.composedDependencies[key] = Object.keys(deps);
        return props.modules;
    };

};

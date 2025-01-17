const _ = require('./util');
const Session = require('./session');
const Configure = require('./configure');

const composer = (target, options = {}) => {

    const createComposer = (config = {}) => {
        const session = Session(target, options, config);
        const make = (path, deps, opts) => session.compose(path, deps, opts);
        const deep = (path, deps, opts) => make(path, deps, { ...opts, depth: Infinity });
        const flat = (path, deps, opts) => make(path, deps, { ...opts, depth: Infinity, flat: true });
        const asis = (path, opts) => make(path, null, opts);
        const variations = { make, deep, flat, asis };
        const compose = Object.assign(make, session.external, { session: session.external }, variations);
        return { compose, configure, ...session.configAliases };
    };

    const configure = Configure(createComposer, options.defaultConfig, options.config);
    return configure();

};

const configure = Configure();
module.exports = Object.assign(composer, { composer, configure });

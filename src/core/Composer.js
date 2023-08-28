const Configure = require('./configure');
const Session = require('./session');

module.exports = (target, clientOptions = {}) => {

    const createComposer = (config = {}) => {
        const session = Session(target, config, clientOptions);

        const make = (path, deps, opts) => {
            return session.compose(path, deps, opts);
        };

        const deep = (path, deps, opts) => {
            return make(path, deps, { ...opts, depth: Infinity });
        };

        const asis = (path, opts) => {
            return make(path, null, opts);
        };

        const end = () => {
            if (session.state.ended) throw new Error('Composition has already ended');
            session.state.ended = true;
            return session.external;
        };

        const compose = Object.assign(make, session.external, { make, deep, asis, end });
        return { compose, configure, ...session.configAliases };
    };

    const configure = Configure(createComposer);
    return configure(clientOptions.config);

};

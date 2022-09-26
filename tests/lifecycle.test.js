const composer = require('../');

module.exports = ({ test }) => {

    test('attempt to re-compose', t => {
        const target = { mod: {} };
        const { compose } = composer(target);
        compose('mod');
        t.throws(() => compose('mod'), /^mod is already composed$/);
    });

    test('attempt to compose after ending', t => {
        const target = { mod: {} };
        const { compose } = composer(target);
        compose('mod');
        compose.end();
        t.throws(() => compose('mod2'), /^Composition has ended$/);
    });

    test('attempt to end after ending', t => {
        const target = { mod: {} };
        const { compose } = composer(target);
        compose.end();
        t.throws(() => compose.end(), /^Composition has already ended$/);
    });

};
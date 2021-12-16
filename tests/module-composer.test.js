const { test } = require('zora');

const composer = require('../');

test('argument is optional', t => {
    let fooIsFunction = false;

    const src = {
        foo: {
            fun: ({ foo }) => () => {
                fooIsFunction = typeof foo.fun === 'function';
            }
        }
    };

    const foo = composer(src)('foo', undefined);
    foo.fun();
    t.ok(fooIsFunction);
});

test('peer function is invoked with arg', t => {
    let fun2Called = false;

    const src = {
        foo: {
            fun1: ({ foo }) => () => {
                foo.fun2();
            },
            fun2: () => () => {
                fun2Called = true;
            }
        }
    };

    const foo = composer(src)('foo');
    foo.fun1();
    t.ok(fun2Called);
});

test('nested function is invoked', t => {
    let fun2Called = false;

    const src = {
        foo: {
            bar: {
                fun2: () => () => {
                    fun2Called = true
                }
            },
            fun1: ({ foo }) => () => {
                foo.bar.fun2();
            }
        }
    };

    const foo = composer(src)('foo');
    foo.fun1();
    t.ok(fun2Called);
});

test('get dependencies', t => {
    const src = { foo: {}, bar: {} };
    const compose = composer(src);
    const foo = compose('foo');
    compose('bar', { foo });
    const expected = { foo: [], bar: ['foo'] };
    t.equal(compose.getDependencies(), expected);
});

test('get modules', t => {
    const src = { foo: {}, bar: {} };
    const compose = composer(src);
    const foo = compose('foo');
    compose('bar', { foo });
    const expected = { foo: {}, bar: {} };
    t.equal(compose.getModules(), expected);
});

test('get module', t => {
    const src = { foo: {}, bar: {} };
    const compose = composer(src);
    const foo = compose('foo');
    compose('bar', { foo });
    const expected = {};
    t.equal(compose.getModule('foo'), expected);
});

test('add modules', t => {
    const src = {};
    const compose = composer(src);
    compose.addModules({ foo: {} });
    t.equal(compose.getDependencies(), { foo: [] });
});

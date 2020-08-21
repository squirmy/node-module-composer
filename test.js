const test = require('tape');
const compose = require('./compose');

test('argument is optional', t => {
    const src = {
        foo: {
            fun: ({ foo }) => () => {
                t.true(typeof foo.fun === 'function');
                t.end();
            }
        }
    };

    const foo = compose(src)('foo', undefined);
    foo.fun();
});

test('peer function is invoked with arg', t => {
    const src = {
        foo: {
            fun1: ({ foo }) => () => {
                foo.fun2();
            },
            fun2: () => () => {
                t.pass();
                t.end();
            }
        }
    };

    const foo = compose(src)('foo');
    foo.fun1();
});

test('nested function is invoked', t => {
    const src = {
        foo: {
            bar: {
                fun2: () => () => {
                    t.pass();
                    t.end();
                }
            },
            fun1: ({ foo }) => () => {
                foo.bar.fun2();
            }
        }
    };

    const foo = compose(src)('foo');
    foo.fun1();
});

test('function name matching __modulename is collapsed', t => {
    const src = {
        foo: {
            foo: ({ foo }) => () => {
                foo.bar();
            },
            bar: () => () => {
                t.pass();
                t.end();
            }
        }
    };

    const foo = compose(src)('foo');
    foo();
});

test('result is merged with override value', t => {
    const src = {
        foo: {
            bar: {
                fun2: () => () => {
                    t.fail();
                }
            },
            fun1: ({ foo }) => () => {
                foo.bar.fun2();
            }
        }
    };

    const override = {
        bar: {
            fun2: () => {
                t.pass();
                t.end();
            }
        }
    };

    const foo = compose(src)('foo', {}, override);
    foo.fun1();
});
module.exports = ({ target, dependencies }) => {

    const targetKeys = Object.keys(dependencies);

    const lines = Object.entries(dependencies).reverse().flatMap(([key, deps]) => {
        const members = Object.keys(target[key]);
        const lines = members.map(member => `${key}.${member} = modules.${key}.${member}({ ${[key, ...deps].join(', ')} });`);
        return [`const ${key} = { ...modules.${key} };`, ...lines];
    }).concat(
        `return { ${['...modules', ...targetKeys].join(', ')} };`,
    );

    const uniqDeps = Array.from(new Set(Object.values(dependencies).flat()));
    const args = uniqDeps.filter(dep => !target[dep]);

    return [
        `(modules, { ${args.join(', ')} }) => {`,
        `${lines.map(line => `    ${line}`).join('\n')}`,
        '};'
    ].join('\n');

};

const types = require("@babel/types");

const replaceExternalImports = () => ({
  visitor: {
    ImportDeclaration(path, state) {
      const { externals, container } = state.opts;
      const { specifiers, source: { value: source} } = path.node;

      if(externals.indexOf(source) >= 0) {
        const properties = specifiers.map(({ type, local}) => types.objectProperty(
          types.identifier(type === 'ImportDefaultSpecifier' ? 'default' : local.name),
          types.identifier(local.name)
        ))
        const definition = (specifiers.length === 1 && specifiers[0].type === 'ImportDefaultSpecifier') ? types.identifier(specifiers[0].local.name) : types.objectPattern(properties);

        const declarator = types.variableDeclarator(
          // types.objectPattern(properties),
          definition,
          types.callExpression(
            types.identifier('importExternal'),
            [
              types.stringLiteral(container),
              types.stringLiteral(source)
            ]
          ),
        );

        path.replaceWith(
          types.variableDeclaration('const', [declarator])
        );
      }
    },
  },
});

module.exports = replaceExternalImports;

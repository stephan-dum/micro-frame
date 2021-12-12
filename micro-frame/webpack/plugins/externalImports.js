
const PLUGIN_NAME = 'ExternalImportsPlugin';

class ExternalImportsPlugin {
  constructor() {

  }

  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.parser
        .for('javascript/auto')
        .tap(PLUGIN_NAME, (parser, options) => {
          parser.hooks.import.tap(PLUGIN_NAME, (statement, source) => {
            console.log('# expression', source, statement);
          });
          // parser.hooks.statement.tap('importDeclaration').tap(PLUGIN_NAME, (expression) => {
          //     /* ... */
          //     console.log('# expression', expression);
          //     return expression;
          //   });
        });
    });
  }
}

module.exports = ExternalImportsPlugin;

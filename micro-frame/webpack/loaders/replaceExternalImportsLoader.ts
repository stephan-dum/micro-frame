// // const requireFromString = require('require-from-string');
// // const path = require('path');
// // const nameFromPathname = (pathname) => pathname.replace(/\/\\/g, '_')
// // const nodeTypes = {
// //   router: (node, head) => {
// //     node.routes.forEach((route) => {
// //       if (route.component) {
// //         route.component = `() => import(/* webpackChunkName: ${route.chunkName} */ ${route.component})`
// //       }
// //     });
// //   },
// //   fragment: (node, head) => {
// //     return `{type:'fragment', children: [`+node.children.map((child) => {
// //       return walkTypes(child, head);
// //     }).join('},{')+']}';
// //   },
// //   react: (node, head) => {
// //     const importName = nameFromPathname(node.component);
// //     head.push(`import ${importName} from '${node.component}';`)
// //     return
// //   }
// // }
// //
// // function walkTypes(node, head) {
// //   return nodeTypes[node.type]?.(node, head);
// // }
// import types from "@babel/types";
// import { parse } from "@babel/parser";
// import generate from "@babel/generator";
// import { NeededExternals } from "../../env-cl/types";
//
//
// const replaceExternalImports = (source: string, neededExternals: NeededExternals) => {
//   const ast = parse(source, {
//     allowImportExportEverywhere: true,
//   });
//
//   const { program } = ast;
//   program.body.forEach((child, index) => {
//     const {type} = child;
//     switch (type) {
//       case 'ImportDeclaration':
//         child.
//         // specifiers.forEach(() => {})
//         // console.log('## child', child);
//         const { value } = child.source;
//         if (neededExternals[value]) {
//           // replace import with function call to importExternal('name', 'container');
//           console.log('## child', value);
//         }
//
//         break;
//     }
//   });
//
//   // program.body.unshift(
//   //   types.variableDeclaration('var', [types.variableDeclarator(types.identifier('___CSS_LOADER_EXPORT___'), types.arrayExpression())])
//   // );
//
//   return generate(ast).code;
// };
//
// async function MicroFrameLoader(content) {
//
//
//
//   // console.log(this.context, this._module, this.resourcePath, this.request);
//   // const callback = this.async();
//   // // const response = await import(path.relative(__dirname, this.resourcePath));
//   //
//   // const module = requireFromString(content);
//   // const head = [];
//   // const defaultExport = walkTypes(module, head);
//   // console.log(JSON.stringify(module));
//   // callback(null, [...head, `export default ${defaultExport}`].join('\n'));
//   const ast = parser.parse(content, {
//     allowImportExportEverywhere: true,
//   });
//   const { program } = ast;
//   program.body = program.body.filter(({ type, specifiers, declarations }) => {
//     switch (type) {
//       case 'ImportDeclaration':
//         return !specifiers.some((specifier) => specifierBlackList.indexOf(specifier.local.name) >= 0);
//       case 'VariableDeclaration':
//         return !declarations.some((declaration) => declaration.id.name === '___CSS_LOADER_EXPORT___');
//       default:
//         return true;
//     }
//   });
//
//   program.body.unshift(
//     types.variableDeclaration('var', [types.variableDeclarator(types.identifier('___CSS_LOADER_EXPORT___'), types.arrayExpression())])
//   );
//
//   return generate(ast).code;
// }
//
// module.exports = MicroFrameLoader;

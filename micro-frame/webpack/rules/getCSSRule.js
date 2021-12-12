const { loader: MiniCSSExtractLoader } = require('mini-css-extract-plugin');
// const { loader: ExtractCSSChunkLoader } = require('extract-css-chunks-webpack-plugin');
const path = require('path');
const { createHash } = require('crypto');


const getCSSRule = ({ scope = '' } = {}) => {
  return {
    test: /\.(c|s[ca])ss$/,
    // type: 'asset/resource',
    type: 'javascript/auto',
    use: [
      MiniCSSExtractLoader,
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: {
            localIdentHashDigestLength: 8,
            getLocalIdent: (compilation, localIdentName, localName, { context, hashFunction, hashDigest, hashSalt = '', hashDigestLength }) => {
              const scopedName = path.join(scope, path.relative(context, compilation.resourcePath));
              const hash = createHash(hashFunction);
              hash.update(hashSalt + scopedName);

              return hash.digest(hashDigest).slice(0, hashDigestLength)
            },
          },
        }
      },
      // {
      //   loader: require.resolve('postcss-loader'),
      //   options: {
      //     postcssOptions: {
      //       plugins: [],
      //     },
      //   },
      // }
    ],
  }
}

module.exports = getCSSRule;

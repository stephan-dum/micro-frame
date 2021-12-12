import webpack, { Configuration, Compiler, Stats } from "webpack";

type WebpackPromiseConfiguration = Configuration & {
  inputFileSystem?: Compiler["inputFileSystem"];
}

const webpackPromise = (configs: WebpackPromiseConfiguration | WebpackPromiseConfiguration[]): Promise<Stats[]> => {
  return Promise.all(
    (Array.isArray(configs) ? configs : [configs]).map(({ inputFileSystem, ...config}) => {
      const compiler = webpack(config);

      if (inputFileSystem) {
        compiler.inputFileSystem = inputFileSystem;
      }

      return new Promise<Stats>((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error) {
            return reject(error);
          }

          resolve(stats);
        });
      });
    })
  );
}

export default webpackPromise;

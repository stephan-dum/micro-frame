export interface Derefer<Value> extends Promise<Value> {
  resolve: (result?: Value) => void;
  reject: (error?: unknown) => void;
}

const createDerefer = <Value = any>(timeout?: number): Derefer<Value> => {
  let resolve;
  let reject;

  const promise = new Promise<Value>((dereferResolve, dereferReject) => {
    reject = dereferReject;

    if (timeout) {
      let timer = setTimeout(() => {
        dereferReject(new Error('Timeout derefer not called'));
      }, timeout)

      resolve = (arg: Value) => {
        clearTimeout(timer);
        dereferResolve(arg);
      }
    } else {
      resolve = dereferResolve;
    }
  });

  return Object.assign(promise, { resolve, reject });
};

export default createDerefer;

import { useContext } from "preact/compat";
import GLOBAL_CONTEXT from "./globalContext";

const useService = <Type = any>(name: string) => {
  const globalContext = useContext(GLOBAL_CONTEXT);

  if(!(name in globalContext)) {
    throw new ReferenceError(`service ${name} not registered on global context!`);
  }

  return globalContext[name] as Type;
};

export default useService;

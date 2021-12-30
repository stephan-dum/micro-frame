import { createContext } from "preact";

type GlobalContext = Record<string, any>;
const GLOBAL_CONTEXT = createContext<GlobalContext>({});

export default GLOBAL_CONTEXT;

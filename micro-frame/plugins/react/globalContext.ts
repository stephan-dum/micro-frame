import { createContext } from "react";

type GlobalContext = Record<string, any>;
const GLOBAL_CONTEXT = createContext<GlobalContext>({});

export default GLOBAL_CONTEXT;

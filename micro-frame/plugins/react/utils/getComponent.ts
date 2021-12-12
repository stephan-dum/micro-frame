import { ReactNodeComponent } from "../types";

const getComponent = (componentFactory: ReactNodeComponent) => {
  const ComponentWrapper = componentFactory();
  return ComponentWrapper.__esModule ? ComponentWrapper.default : ComponentWrapper;
}

export default getComponent;

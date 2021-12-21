import { ReactNodeComponent } from "../types";

const getComponent = (componentFactory: ReactNodeComponent) => {
  const ComponentWrapper = componentFactory();
  return '__esModule' in ComponentWrapper ? ComponentWrapper.default : ComponentWrapper;
}

export default getComponent;

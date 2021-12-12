import FetchPlugin from "@micro-frame/plugin-fetch";
import FragmentPlugin from "@micro-frame/plugin-fragment";
import RouterPlugin from "@micro-frame/plugin-router";
import ContainerPlugin from '@micro-frame/plugin-container';

// TODO: improve typing and remove any
const defaultPlugins: Record<string, any> = {
  fetch: FetchPlugin,
  fragment: FragmentPlugin,
  router: RouterPlugin,
  container: ContainerPlugin,
}

export default defaultPlugins;

import FetchPlugin from "@micro-frame/plugin-fetch";
import FragmentPlugin from "@micro-frame/plugin-fragment";
import RouterPlugin from "@micro-frame/plugin-router";
import ContainerPlugin from '@micro-frame/plugin-container';
import ChunkPlugin from '@micro-frame/plugin-chunk';

// TODO: improve typing and remove any
const defaultPlugins: Record<string, any> = {
  chunk: ChunkPlugin,
  container: ContainerPlugin,
  fetch: FetchPlugin,
  fragment: FragmentPlugin,
  router: RouterPlugin,
}

export default defaultPlugins;

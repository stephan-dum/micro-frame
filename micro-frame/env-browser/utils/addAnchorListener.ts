import { PnPNode } from "../types";

const addAnchorListener = (root: PnPNode) => {
  document.addEventListener('click', (event) => {
    if (!event.defaultPrevented) {
      const target = event.target as HTMLElement;
      const anchor = (target.tagName === 'a' ? target : target.closest('a')) as HTMLAnchorElement;

      if (anchor && anchor.target !== 'blank') {
        event.preventDefault();

        const state = {
          method: 'GET',
        };

        const {hash, search, pathname} = anchor;
        root.navigate({ pathname, hash, search }).then(() => {
          history.pushState(state, document.title, pathname + search + search);
        });
      }
    }
  });
};

export default addAnchorListener;

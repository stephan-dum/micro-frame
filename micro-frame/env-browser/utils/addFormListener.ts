import { PnPNode, SubmitEvent } from "../types";
import createFormData from "./createFormData";

const addFormListener = (root: PnPNode) => {
  document.addEventListener('submit', (event: SubmitEvent) => {
    const { submitter, target } = event;
    const action = submitter.getAttribute('form-action') || target.action || './';
    const method = submitter.getAttribute('formMethod') || target.method || 'GET';

    const state = {
      method,
      data: createFormData(target),
    };

    event.preventDefault();

    const { pathname, hash, search } = new URL(action);

    root.navigate({ pathname, hash, search }).then(() => {
      history.pushState(state, document.title, pathname + search + search);
    });
  })
};

export default addFormListener;

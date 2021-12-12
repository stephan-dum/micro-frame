import { get } from 'http';
import { NodeTypes } from '@micro-frame/node/types';
import { FetchNode } from "./types";

const fetch: NodeTypes<FetchNode> = (node, context) => {
  context.queueResponse(
    new Promise((resolve, reject) => {
      const request = get(node.url, (response) => {
        resolve(response);
      });

      request.on('error', reject);
    }),
  );
};

fetch.key = 'fetch';

export default fetch;

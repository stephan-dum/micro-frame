import { NodeTypes } from '@micro-frame/node/types';
import { createReadStream } from 'fs';
import { FileNode } from "@micro-frame/core/nodes";

const fileNode: NodeTypes<FileNode> = ({ path }, context) => {
  context.queueResponse(createReadStream(path, { autoClose: false }));
};

export default fileNode;

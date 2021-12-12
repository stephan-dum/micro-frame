export interface FileNode {
  type: 'file';
  path: string;
}

interface MicroNode extends FileNode {}

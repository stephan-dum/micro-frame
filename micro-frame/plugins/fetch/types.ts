export interface FetchNode {
  type: 'fetch';
  url: string;
  options?: RequestInit;
}

interface MicroNode extends FetchNode {}

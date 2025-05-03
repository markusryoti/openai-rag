export interface Document {
  id?: string;
  content: string;
  metadata?: {
    source: string;
    url?: string;
    // eslint-disable-next-line
    [key: string]: any;
  };
}

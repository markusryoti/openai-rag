export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    url?: string;
    [key: string]: any;
  };
}

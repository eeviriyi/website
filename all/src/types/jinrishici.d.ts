declare module "jinrishici" {
  export interface PoemOrigin {
    title: string;
    dynasty: string;
    author: string;
    content: string[];
    translate: string[];
  }

  export interface PoemData {
    id: string;
    content: string;
    popularity: number;
    origin: PoemOrigin;
    matchTags: string[];
    recommendedReason: string;
    cacheAt: string;
  }

  export interface PoemResult {
    status: string;
    data: PoemData;
    token: string;
    ipAddress: string;
  }

  export function load(callback: (result: PoemResult) => void): void;
}

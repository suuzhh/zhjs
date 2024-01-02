export type noop = (...args: any[]) => void;

export type PromiseFn<P extends any[], R> = (...args: P) => Promise<R>;
export interface BaseResult {
  reset: () => void;
}

export interface FetchResult<P extends any[], R> {
  cancel: noop;
  run: (...args: P) => Promise<R>;
}

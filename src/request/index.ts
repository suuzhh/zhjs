import { PromiseFn } from './types'

class Fetcher<R, P extends any[]>{
  constructor(
    fn: PromiseFn<P, R>,
    subscribe: any // TODO: useAsync 68 行
  ) {}
}

function request <P extends any[], R>(
  fn: PromiseFn<P, R>
) {

}

export default request
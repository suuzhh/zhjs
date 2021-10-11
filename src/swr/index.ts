import { defaultConfig } from './config'
import { serialize } from './helper'
import { Key } from './types'

/**
 * 使用方法
 * 通过key构造一个swr对象
 * TODO: 调用fetch方法获取数据
 */
class SWR<P extends any[], R>{
  private config

  constructor (_key: Key, config: typeof defaultConfig) {
    const [key, fnArgs, keyErr, keyValidating] = serialize(_key)
    this.config = config

    //TODO: const cached = cache.get(key)
  }
}

/**
 * Stale-While-Revalidate
 * 1. 设计一个全局缓存，需要存储对应的组件callback、开始时间、结束时间
 * 2. 设计一个状态存储，需要存储最新的data、error
 */



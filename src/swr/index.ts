import { defaultConfig } from './config'
import { Key } from './types'

class SWR {
  constructor (config: typeof defaultConfig) {

  }

  private static instance: SWR | null = null

  static useSWRHandler = (_key: Key) => {
    const swr = SWR.instance || new SWR({})
    const [key, fnArgs, keyErr, keyValidating] = serialize(_key)
  }
}
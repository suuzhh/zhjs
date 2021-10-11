const stateCache = new Map()
// 状态辅助标识存储
const GlobalState = {
  EVENT_REVALIDATORS: {},
  STATE_UPDATERS: {},
  MUTATION_TS: {},
  MUTATION_END_TS: {}
}
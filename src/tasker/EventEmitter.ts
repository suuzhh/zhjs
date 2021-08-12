import { Subject } from 'rxjs'

export class EventEmitter {
  private handleSuccess: Subject<EventData> = new Subject()
  constructor() {

  }

  // 事件监听： 数据成功返回
  onSuccess (cb: (value: EventData) => void) {
    this.handleSuccess.subscribe(cb)
  }

  dispatchSuccess (name: string, data: unknown) {
    this.handleSuccess.next({ name, data })
  }

  clear () {
    this.handleSuccess.unsubscribe()
  }
}

interface EventData {
  name: string
  data: unknown
}
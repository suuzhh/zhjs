import { Subject } from 'rxjs'

export class EventEmitter {
  private subject: Subject<EventData> = new Subject()

  // 事件监听： 数据成功返回
  onSuccess (cb: (value: EventData) => void) {
    this.subject.subscribe(cb)
  }

  onError (cb: (err: Error) => void) {
    this.subject.subscribe({ error: cb })
  }

  dispatchSuccess (name: string, data: unknown) {
    this.subject.next({ name, data })
  }

  dispatchError (err: Error) {
    this.subject.error(err)
  }

  clear () {
    this.subject.unsubscribe()
  }
}

export interface EventData {
  name: string
  data: unknown
}
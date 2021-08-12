import { Task } from "./Tasker"
import { EventEmitter } from "./EventEmitter"
import { Subscription, from } from 'rxjs'

interface Runable {
  // 执行任务 返回任务的唯一编码
  run (task: Task): string
  // 根据唯一编码停止任务
  cancel (taskName: string): void
  // 清空所有任务 执行中的也会被清除
  clear (): void
}

/**
 * 持久任务执行器
 * 为了降低复杂度，该类型任务不能传入参数，以保持数据的状态清晰
 * 如果需要根据唯一key执行相同任务，请使用’唯一任务执行器‘（计划中）
 */
export class CacheRunner implements Runable {
  // 唯一编码对应的subs对象
  private runningTasksHandler = new Map<string, Subscription>()
  private eventEmitter = new EventEmitter()

  constructor() {}

  get event () {
    return this.eventEmitter
  }

  // TODO: 设置间隔时间，如果没有达到间隔时长使用旧数据
  run(task: Task): string {
    if (!this.runningTasksHandler.has(task.name)) {
      const emitter = this.eventEmitter
      const clearHandler = this.clearHandler.bind(this)
      const promiseSource = from(task.action.run())
      this.runningTasksHandler.set(task.name, promiseSource.subscribe({
        next (res) {
          const data = task.model.dataTransfer ? task.model.dataTransfer(res) : res
          emitter.dispatchSuccess(task.name, data)
          clearHandler(task.name)
        },
        error (err) {
          emitter.dispatchError(err)
          clearHandler(task.name)
        }
      }))
    }
    return task.name
  }
  cancel(name: string): void {
    this.clearHandler(name)
  }

  private clearHandler (name: string) {
    const sub = this.runningTasksHandler.get(name)
    if (sub) {
      sub.unsubscribe()
      this.runningTasksHandler.delete(name)
    }
  }

  clear(): void {
    this.runningTasksHandler.forEach(sub => {
      sub.unsubscribe()
    })
    this.runningTasksHandler.clear()
  }
}

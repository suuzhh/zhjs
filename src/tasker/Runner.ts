import { Task, TaskState } from "./Tasker"
import { Subscription, from, Observable, map } from 'rxjs'

interface Runable {
  // 执行任务 返回任务的唯一编码
  run (task: Task): Observable<TaskState>
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
  private runningTaskObservers = new Map<string, Observable<TaskState>>()

  constructor() {}

  run(task: Task): Observable<TaskState> {
    let runningObs = this.runningTaskObservers.get(task.name)
    if (!runningObs) {
      runningObs = from(task.action.run())
        .pipe(
          map(res => {
            const data = task.model.dataTransfer ? task.model.dataTransfer(res) : res
            return {
              name: task.name,
              data,
              time: Date.now()
            }
          })
        )
    }
    return runningObs
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

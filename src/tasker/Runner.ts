import { Task, TaskState } from "./Tasker"
import { from, Subject, connectable, map, Observable, Subscription, of } from 'rxjs'
import { isFunc } from "../util/typeCheck"

interface Runable {
  // 执行任务 返回任务的唯一编码
  run (task: Task): Observable<TaskState> // TaskState
  // 根据唯一编码停止任务
  cancel (taskName: string): void
  // 清空所有任务 执行中的也会被清除
  clear (): void
}

/**
 * 基础配置
 * 所有runner的config基于此
 */
export interface RunnerConfig {
  interval: number
}

type RunningTaskObj = {
  observable: Observable<TaskState>,
  subscription: Subscription
}

/**
 * 持久任务执行器
 * 为了降低复杂度，该类型任务不能传入参数，以保持数据的状态清晰
 * 如果需要根据唯一key执行相同任务，请使用’唯一任务执行器‘（计划中）
 */
export class CacheRunner implements Runable {
  private runningTasks = new Map<string, RunningTaskObj>()
  // 存储任务状态
  private cachedState = new Map<string, TaskState>()

  private config: RunnerConfig = {
    // 间隔时间(ms) 默认10秒
    // 上次完成时间和本次执行时间未超过这个阈值，不会进行新的任务执行
    interval: 10 * 1000
  }

  constructor(config?: Partial<RunnerConfig>) {
    this.config = Object.assign(this.config, config || {})
  }

  private innerGetState (task: Task): TaskState {
    let state = this.cachedState.get(task.name)
    if (!state) {
      state = {
        name: task.name,
        data: isFunc(task.model.default) ? task.model.default() : task.model.default,
        lastUpdated: null
      }
      this.cachedState.set(task.name, state)
    }
    return state
  }

  cancel(taskName: string): void { 
    const obj = this.runningTasks.get(taskName)
    if (obj) {
      obj.subscription.unsubscribe()
      this.runningTasks.delete(taskName)
    }
  }

  private innerRun (task: Task, currentState: TaskState): void {
    const cachedState = this.cachedState
    const $promise = from(task.action.run())
      .pipe(
        map(res => {
          const data = task.model.dataTransfer ? task.model.dataTransfer(res) : res
          currentState.data = data
          currentState.lastUpdated = Date.now()
          return currentState
        })
      )
    const $runningTask = connectable($promise, {
      connector: () => new Subject<TaskState>()
    })
    const cancel = this.cancel.bind(this)

    const innerSub = $promise.subscribe({
      next (state) {
        cachedState.set(task.name, state)
      },
      error (err) {
        // TODO: 任务的错误暂时无法处理，先在控制台输出
        console.error(err)
      },
      complete () {
        cancel(task.name)
      }
    })
    $runningTask.connect()

    if (!this.runningTasks.has(task.name)) {
      const runningTaskObj = {
        observable: $runningTask,
        subscription: innerSub
      }
      this.runningTasks.set(task.name, runningTaskObj)
      
    }
  }

  run(task: Task): Observable<TaskState> {
    const state = this.innerGetState(task)
    const innerRun = this.innerRun.bind(this)

    if (!this.runningTasks.has(task.name)) {
      // lastUpdated为空 且任务未运行 则可以执行任务
      // lastUpdated + config.interval <= 当前时间 且任务未运行 则可以执行任务
      if (!state.lastUpdated || (state.lastUpdated + this.config.interval <= Date.now())) {
        innerRun(task, state)
      }
    }
    const obj = this.runningTasks.get(task.name)
    if (obj) {
      return obj.observable
    } else {
      // 如果任务已完成且还未到达下次可执行的时间点 直接返回一个observable对象返回当前最新state
      return of(state)
    }
  }

  /**
   * 获取对应任务的执行状态
   * @param name 
   */
  getState (name: string): TaskState | undefined {
    return this.cachedState.get(name)
  }

  clear(): void {
    this.runningTasks.forEach((obj) => {
      obj.subscription.unsubscribe()
    })
    this.runningTasks.clear()
    this.cachedState.clear()
  }
}

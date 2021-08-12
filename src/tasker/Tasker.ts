import { CacheRunner } from './Runner'
import { EventEmitter } from './EventEmitter'
import { isFunc } from '../util/typeCheck'

export class Tasker {
  private taskMap = new Map<string, Task>()
  private event: {
    onSuccess?: (e: TaskState) => void
  } = {}

  private eventEmitter = new EventEmitter()
  // 运行器
  private cacheRunner: CacheRunner

  // 数据状态
  private registedStateMap = new Map<string, TaskState>()

  private constructor (tasks: Task[]) {
    tasks.forEach(task => {
      this.taskMap.set(task.name, task);
    })
    this.cacheRunner = new CacheRunner(this.eventEmitter)

    this.eventEmitter.onSuccess(e => {
      console.log(e)
      const state = this.registedStateMap.get(e.name)
      if (state) {
        state.data = e.data
        state.time = Date.now()
        this.registedStateMap.set(e.name, state)
        this.event.onSuccess && this.event.onSuccess(state)
      }
    })
  }

  regist (names: string[]) {
    names.forEach(name => {
      if (!this.registedStateMap.has(name)) {
        const task = this.taskMap.get(name)
        if (!task) {
          throw new Error(`Task ${name} 未挂载！`)
        }
        const state = {
          name: name,
          data: isFunc(task.model.default) ? task.model.default() : task.model.default,
          time: null
        }
        this.registedStateMap.set(name, state)
      }
    })
    return this
  }


  /**
   * 根据传入的任务名称返回任务当前的状态
   * 未注册的状态不会被获取
   * @param {string[]} names 任务名称
   * @returns 
   */
  getTasksState (names: string[]): TaskState[] {
    return names.reduce<TaskState[]>((states, name) => {
      const state = this.registedStateMap.get(name)
      if (state) {
        states.push(state)
      }
      return states
    }, [])
  }

  takeAsCache (taskName: string) {
    const task = this.taskMap.get(taskName)
    if (!task) {
      throw new Error(`Task ${taskName} 未定义`)
    }
    let id: string
    return {
      run: () => {
        id = this.cacheRunner.run(task)
      },
      cancel: () => {
        id && this.cacheRunner.cancel(id)
      }
    }
  }

  taskAsOnce (taskName: string) {

  }

  takeAsUnique (taskName: string) {

  }

  /**
   * 清空所有任务（不清空任务配置列表）
   */
  clear () {
    this.cacheRunner.clear()
    this.eventEmitter.clear()
    this.registedStateMap.clear()
  }

  // 注册事件
  onSuccess (cb: (state: TaskState) => void) {
    this.event.onSuccess = cb
    return this
  }

  static fromTasks (tasks: Task[]) {
    return new Tasker(tasks)
  }
}

export interface Task {
  name: string,
  model: {
    default: () => unknown | unknown
  },
  action: {
    run: (...args: any[]) => Promise<unknown>
  },
  event?: {
    onSuccess?: (res: unknown) => void
    onError?: (e: Error) => void
  }
}

interface TaskState {
  // 任务名称
  name: string,
  // 源数据
  data: unknown
  // 获取数据的时间戳(初始化状态时事件为null)
  time: number | null
  // 
}


import { isFunc } from '../util/typeCheck'

export class Tasker {
  private taskMap = new Map<string, Task>()
  // 已注册的事件名
  private registeredTasks = new Set<string>()
  // 已注册的任务数据
  private registeredModel = new Map<string, TaskModel>()

  private constructor (tasks: Task[]) {
    tasks.forEach(task => {
      this.taskMap.set(task.name, task);
    })
  }

  /**
   * 注册任务 并返回任务的初始状态
   * @param {string[]} names 
   * @returns 
   */
  registTask (names: string[]) {
    const initData = names.reduce<{[key: string]: unknown}>((acc, name) => {
      const task = this.taskMap.get(name)
      this.registeredTasks.add(name)
      if (!task) {
        throw new Error(`Task.registTask:name为"${name}"的任务注册失败，任务不存在！`)
      }
      if (this.registeredTasks.has(name)) {
        console.warn(`Task.registTask:出现重复的name"${task.name}",旧任务将被覆盖`)
      }
      const state = {
        data: isFunc(task.model.default) ? task.model.default() : task.model.default,
        time: null
      }
      this.registeredModel.set(name, state)
      acc[name] = state.data
      return acc
    }, {})
    return initData
  }

  /**
   * 追加任务
   * @param {Task} task
   * @returns 
   */
  addTask (task: Task) {
    if (this.taskMap.has(task.name)) {
      console.warn(`Task.addTask:出现重复的name"${task.name}",旧任务将被覆盖`)
    }
    this.taskMap.set(task.name, task)
    return this
  }

  /**
   * 执行任务
   * @param {string} name 
   */
  runTask (name: string, option: Partial<OptionOfRun>) {
    if (!this.registeredTasks.has(name)) {
      throw new Error(`Task.runTask:未注册的任务${name},无法运行!`)
    }
    // TODO:
  }

  /**
   * 清空所有任务（不清空任务配置列表）
   */
  clear () {
    this.registeredModel.clear()
    this.registeredTasks.clear()
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
    run: Promise<unknown>
  },
  event: {
    onResponse?: (res: unknown) => void
  }
}

interface TaskModel {
  // 源数据
  data: unknown
  // 获取数据的时间戳(初始化状态时事件为null)
  time: number | null

}

interface OptionOfRun {
  // 间隔时间 单位毫秒 默认0
  // 当前任务的开始时间如果小于上次执行时间 + interval 则不会执行 直接取前一次的数据
  interval: number
}


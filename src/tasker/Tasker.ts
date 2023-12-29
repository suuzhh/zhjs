import { CacheRunner, RunnerConfig } from './Runner'
import { isFunc } from '../util/typeCheck'
import { Observer, Subject } from 'rxjs'

let obIndex = 0

/**
 * @public
 */
export type Obs = Partial<Observer<TaskState>> // | ((value: TaskState) => void)

/**
 * @public
 */
export class Tasker {
  private taskMap = new Map<string, Task>()

  private observerMap = new Map<number, Obs>()
  // 运行器
  private cacheRunner: CacheRunner

  // 数据状态
  private registedStateMap = new Map<string, TaskState>()

  private constructor(tasks: Task[], config?: Partial<RunnerConfig>) {
    tasks.forEach(task => {
      this.taskMap.set(task.name, task);
    })
    this.cacheRunner = new CacheRunner(config)
  }

  private dispatchSuccess(state: TaskState) {
    this.observerMap.forEach(ob => {
      ob.next && ob.next(state)
    })
    // 更新registedStateMap
    this.registedStateMap.set(state.name, state)
  }

  regist(names: string[]) {
    names.forEach(name => {
      if (!this.registedStateMap.has(name)) {
        const task = this.taskMap.get(name)
        if (!task) {
          throw new Error(`Task ${name} 未挂载！`)
        }
        const state = {
          name: name,
          data: isFunc(task.model.default) ? task.model.default() : task.model.default,
          lastUpdated: null
        }
        this.registedStateMap.set(name, state)
      }
    })
    return this
  }


  /**
   * 根据传入的任务名称返回任务当前的状态
   * 未注册的状态不会被获取
   * @param names - 任务名称
   * @returns
   */
  getTasksState(names: string[]): TaskState[] {
    return names.reduce<TaskState[]>((states, name) => {
      const state = this.registedStateMap.get(name)
      if (state) {
        states.push(state)
      }
      return states
    }, [])
  }

  takeAsCache(taskName: string) {
    const task = this.taskMap.get(taskName)
    if (!task) {
      throw new Error(`Task ${taskName} 未定义`)
    }

    const commonObserver = {
      next: (state: TaskState) => {
        this.dispatchSuccess(state)
      }
    }

    return (obs?: Obs) => {
      const subject = new Subject<TaskState>()
      subject.subscribe(commonObserver)
      // 如果有配置回调对象 进行挂载
      obs && subject.subscribe(obs)
      // TODO: 取消cancel功能
      this.cacheRunner
        .run(task)
        .subscribe(subject)
    }
  }

  /**
   *  TODO
   */
  taskAsOnce(taskName: string) {

  }
  /**
   *  TODO
   */
  takeAsUnique(taskName: string) {

  }

  /**
   * 清空所有任务（不清空任务配置列表）
   */
  clear() {
    this.cacheRunner.clear()
    this.registedStateMap.clear()
  }

  mountObserver(ob: Obs) {
    const map = this.observerMap
    const index = ++obIndex
    map.set(index, ob)

    return function unMountObserver() {
      map.delete(index)
    }
  }

  static fromTasks(tasks: Task[]) {
    return new Tasker(tasks)
  }
}


/**
 * @public
 */
export interface Task {
  name: string,
  model: {
    default: () => unknown | unknown,
    // 数据转换
    dataTransfer?: (res: unknown) => unknown,
  },
  action: {
    run: (...args: any[]) => Promise<unknown>
  }
}

/**
 * @public
 */
export interface TaskState {
  // 任务名称
  name: string,
  // 源数据
  data: unknown
  // 获取数据的时间戳(初始化状态时事件为null)
  lastUpdated: number | null
}


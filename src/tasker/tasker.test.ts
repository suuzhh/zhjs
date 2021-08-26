import { Task, Tasker, TaskState } from "./Tasker"

const mockTasks: Task[] = [
  {
    name: 'TEST_1',
    model: {
      default: () => []
    },
    action: {
      run: () => Promise.resolve([1, 2, 3])
    }
  },
  {
    name: 'TEST_2',
    model: {
      default: () => []
    },
    action: {
      run: () => Promise.reject(new Error('错误'))
    }
  }
]

describe('Tasker', () => {
  test('正确初始化', () => {
    const tasker = Tasker.fromTasks(mockTasks)
    expect(tasker).not.toBeUndefined()
  })
  test('`takeAsCache`正确执行任务', done => {
    const tasker = Tasker
      .fromTasks(mockTasks)
      .regist(['TEST_1'])
    
    tasker.mountObserver({
      next: state => {
        expect(state.name).toEqual('TEST_1')
        expect((state.data as number[]).length).toEqual(3)
        done()
      }
    })
    const run = tasker
      .takeAsCache('TEST_1')
    run()
    const states = tasker.getTasksState(['TEST_1'])
    expect(states.length).toEqual(1)
  })
  test('`takeAsCache`的返回函数可配置观察者', (done) => {
    const tasker = Tasker
      .fromTasks(mockTasks)
      .regist(['TEST_1'])
    const ob = {
      next (state: TaskState) {
        expect(Array.isArray(state.data)).toBeTruthy()
        expect((state.data as Array<number>).length).toEqual(3)
        done()
      }
    }
    tasker
      .takeAsCache('TEST_1')(ob)
  })
})
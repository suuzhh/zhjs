import { Task, Tasker } from "./Tasker"

const mockTasks: Task[] = [
  {
    name: 'TEST_1',
    model: {
      default: () => []
    },
    action: {
      run: () => Promise.resolve([1, 2, 3])
    },
    event: {
      onSuccess: () => {}
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
      // .onSuccess(state => {
      //   expect(state.name).toEqual('TEST_1')
      //   expect((state.data as number[]).length).toEqual(3)
      //   done()
      // })
    tasker
      .takeAsCache('TEST_1')
      .run()
    const states = tasker.getTasksState(['TEST_1'])
    expect(states.length).toEqual(1)
  })
})
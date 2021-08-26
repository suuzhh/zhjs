import { CacheRunner } from "./Runner"
import { TaskState } from "./Tasker"

const delayTask = {
  name: 'DELAY_2S',
  model: {
    default: () => [],
  },
  action: {
    run: () => {
      return new Promise((resolve, _) => {
        setTimeout(() => resolve([1,2,3]), 2000)
      })
    }
  }
}

const autoIncrementTask = {
  name: 'AUTO_INCREMENT',
  model: {
    default: () => null,
  },
  action: {
    index: 0,
    run () {
      return new Promise((resolve, _) => {
        setTimeout(() => {
          console.log('这个任务执行了' + (this.index + 1) + '次, 在 ' + Date.now() + ' 结束')
          resolve(++this.index)
        }, 1000)
      })
    }
  }
}

describe('Runner', () => {
  jest.useFakeTimers()
  test('`run`方法同名任务同时多次执行，如果前次任务并未结束，不会执行新任务，而是返回旧任务的handler，直至任务结束', () => {
    const time: number | null[] = []
    const ob = {
      next (s: TaskState) {
        time.push(s.lastUpdated as any)
        if (time.length === 2) {
          expect(time[0]).not.toBeNull()
          expect(time[0]).toEqual(time[1])
        }
      }
    }
    
    const runner = new CacheRunner()
    const subject1 = runner.run(delayTask)
    subject1.subscribe(ob)
    const subject2 = runner.run(delayTask)
    subject2.subscribe(ob)
  })
  test('`getState`方法正确获取最新的TaskState状态', () => {
    const ob = {
      next (s: TaskState) {
        expect(s.data).toEqual(runner.getState(delayTask.name)!.data)
        expect((s.data as Array<TaskState>).length).toEqual(3)
      }
    }
    const runner = new CacheRunner()
    const subject = runner.run(delayTask)
    subject.subscribe(ob)
    expect(runner.getState(delayTask.name)!.data).toEqual(delayTask.model.default())
    jest.runAllTimers()
  })
  test('`clear`方法正确工作', () => {

    const runner = new CacheRunner()
    runner.run(delayTask)
    runner.clear()
    expect(runner.getState(delayTask.name)).toBeUndefined()
    jest.advanceTimersByTime(2100)
    expect(runner.getState(delayTask.name)).toBeUndefined()
  })

  test('`config`配置项`interval`正确生效, 在间隔时间内不会重复执行，而是返回最新状态', (done) => {
    jest.useRealTimers()
    const ob2 = {
      next (s: TaskState) {
        expect(s.data).toEqual(1)
        done()
      }
    }
    const ob1 = {
      next (s: TaskState) {
        expect(s.data).toEqual(1)
      }
    }
    const runner = new CacheRunner()
    const subject1 = runner.run(autoIncrementTask)
    subject1.subscribe(ob1)
    setTimeout(() => {
      const subject = runner.run(autoIncrementTask)
      subject.subscribe(ob2)
    }, 2000)
  })
})

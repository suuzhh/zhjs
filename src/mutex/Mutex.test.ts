import { Mutex } from "./Mutex";

const delayFn = (ms: number = 1, result?: number) =>
  new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      if (typeof result !== "number") {
        reject(new Error("result is not number"));
      } else {
        resolve(result);
      }
    }, ms);
  });

let mutex: Mutex;

describe("Mutex", () => {
  beforeEach(() => {
    mutex = new Mutex();
  });

  /**
   * 使用wrap方法将异步函数包裹为锁方法，同一时间只会有一个锁方法在执行
   */
  test("wrap", async () => {
    const result: number[] = [];
    const mockFn = jest.fn(() => delayFn(20, 2).then((n) => result.push(n)));

    const fn1 = mutex.wrap(() => delayFn(10, 1).then((n) => result.push(n)));
    const fn2 = mutex.wrap(mockFn);

    fn2();
    await fn1();
    expect(mockFn).toBeCalledTimes(1);
    expect(result).toStrictEqual([2, 1]);
  });

  /** 异步函数在执行失败时释放锁 */
  test("lock should release when throw error", async () => {
    const result: number[] = [];
    const fn1 = mutex.wrap(() => delayFn(100, 1).then((n) => result.push(n)));
    const fn2 = mutex.wrap(() => delayFn(10, 2).then((n) => result.push(n)));
    const fn3 = mutex.wrap(() => delayFn(10));
    fn1();
    fn3().catch(() => {});
    // fn3抛出异常后释放锁，fn2可继续执行
    await fn2();

    expect(result).toStrictEqual([1, 2]);
  });

  test("lock status correct", () => {
    const fn1 = mutex.wrap(() => delayFn(500, 1));
    fn1().then(() => {
      expect(mutex.isLocked()).toBeFalsy();
    });
    expect(mutex.isLocked()).toBeTruthy();
  });
});

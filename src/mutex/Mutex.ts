/**
 * ## 思路
 * 多接口并发的获取、修改相同数据源，实际上是一种数据竞争的问题。在多线程语言模型中，常用"互斥锁"处理这种数据竞争和其它类似的并发问题。
 *
 * 当一个线程需要访问共享资源时，它会尝试获取互斥锁。如果该锁当前没有被任何线程持有，则这个线程将成功获取锁并进入临界区（即访问共享资源）。如果该锁已经被其他线程持有，则该线程将进入阻塞状态，直到该锁被释放为止。
 *
 * 当线程完成对共享资源的访问后，它必须释放互斥锁，以便其他线程可以获取该锁并访问共享资源。只有持有锁的线程可以释放它，因此这种机制可以确保在任何时刻只有一个线程能够访问共享资源。
在JavaScript中，由于其单线程的特性，可以使用Promise和async/await来实现互斥锁。

 * ## 如何使用
  ```js
 * const mutex = new Mutex();
    // 普通异步函数
 * const fetchFn = () => new Promise((resolve) => resolve({ ...data }));
    // 使用 `wrap` 方法包装原始异步函数，得到带`互斥锁`特性的异步函数
    // 被包装的函数在同一个Mutex下获得`互斥`效果，同一时间只会有一个异步函数进入`资源访问态`
 * const proxyFn = mutex.wrap(fetchFn);
 * ```
 */
export class Mutex {
  private lastWaiter?: Promise<unknown> = undefined;
  /**
   * 调用堆栈计数， 用于统计是否处于锁状态
   */
  private stack = 0;
  /**包装普通异步函数为锁函数 */
  wrap<P extends unknown[], T>(
    fn: (...args: P) => Promise<T>,
  ): (...args: P) => Promise<T> {
    return async (...args: P) => {
      this.stack++;
      this.lastWaiter = new Promise<T>(async (resolve, reject) => {
        // 执行前一个设置的waiter(目前最新的)
        try {
          await (this.lastWaiter ?? Promise.resolve());
          // 当前包裹器忽略前面的错误
        } catch {
          // 提示锁被中断 前置执行函数异常
          console.log("mutex prev function throw error");
        }

        try {
          resolve(await fn(...args));
        } catch (err) {
          reject(err);
        } finally {
          this.stack--;
        }
      });
      return (await this.lastWaiter) as ReturnType<typeof fn>;
    };
  }

  /** 是否锁定 */
  isLocked() {
    return this.stack > 0;
  }
}

export class TaskRunner {
  private afTaskQueue: Array<() => boolean> = [];

  private afTaskRunning = false;

  /**
   * 尽快执行
   * 在下个宏任务或微任务
   */
  runImmediate(fn: Function) {
    return new Promise((res) => {
      let flag = false;
      // 在各种情况（屏幕刷新率、CPU各种繁忙程度、注册顺序），setTimeout0的执行稳定性比较高，所以优先使用，且用来兜底
      let timeHd = setTimeout(function () {
        // 保证只触发一次
        if (flag) return;
        flag = true;
        // 如果动画帧已经注册，则取消注册，避免多重复触发（虽然也判断了但减少执行也是不错的）
        afHd.cancel();
        res(fn());
      }, 0);
      // 然后再到队列动画帧（屏幕刷新率高且首次调用时，先执行到的概率较高）
      let afHd = this.queueAFTask(() => {
        // 保证只触发一次
        if (flag) return true;
        flag = true;
        // 如果动画帧先触发，则取消定时器，避免多重复触发（虽然也判断了但减少执行也是不错的）
        clearTimeout(timeHd);
        Promise.resolve(fn()).then(res);
        // afTaskQueue 队列需要函数返回true以执行下一个任务
        return true;
      });
    });
  }
  /**
   * 运行当前动画帧任务
   * @type ()=>void
   */
  runAFTask() {
    let task;
    let runNext = false;
    do {
      task = this.afTaskQueue.shift();
      // 意外没有了
      if (!task) break;
      // 返回true表示同个动画帧内运行下一个
      runNext = task();
    } while (runNext && this.afTaskQueue.length);

    if (this.afTaskQueue.length) {
      requestAnimationFrame(this.runAFTask);
    } else {
      this.afTaskRunning = false;
    }
  }

  /**
   * 队列运行动画帧任务，特点：取消的任务会继续执行下一个队列任务直到有效的任务，而不会让当前动画帧空跑，导致下个动画帧更延后
   *
   * @param task
   * @returns { {cancel: ()=>void }}
   */
  private queueAFTask = (task: () => boolean) => {
    let isCancel = false;
    this.afTaskQueue.push(() => {
      // 当前任务取消，返回true，让控制器可以立即执行下个任务
      if (isCancel) return true;
      return task();
    });
    if (!this.afTaskRunning) {
      // 运行停止则启动，否则不需要额外处理等到队列到即可
      this.afTaskRunning = true;
      requestAnimationFrame(this.runAFTask);
    }
    return {
      cancel() {
        isCancel = true;
      },
    };
  };
}

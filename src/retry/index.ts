/**
 * 重试函数handler
 *
 * 返回promise 或 undefined, 如果捕获异常会继续重试
 * @param attempt - 当前重试的次数
 */
type RetryFunction = (attempt: number) => Promise<void> | void;

/**
 * 重试
 * @param {RetryFunction} retryFn
 */
export async function retry(retryFn: RetryFunction) {
  return new Promise<void>(async (resolve) => {
    let attempt = 1;
    let tryAgain = false;
    do {
      try {
        await retryFn(attempt++);
        tryAgain = false;
      } catch {
        tryAgain = true;
      }
    } while (tryAgain);

    resolve();
  });
}

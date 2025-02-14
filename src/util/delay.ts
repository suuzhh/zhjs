/**
 * 延迟函数
 * @param ms
 * @returns
 */
export async function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

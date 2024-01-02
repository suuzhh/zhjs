/**
 * 创建一个分组元素数组，其中第一个包含给定数组的第一个元素，第二个包含给定数组的第二个元素，依此类推
 *
 * @since 0.2.0
 * @param {Array<unknown>} arrays 需要进行压缩的多个数组
 * @returns {Array<unknown[]>} 返回重新组合元素的新数组
 * @example
 *
 * import { zip } from 'zhjs/array';
 *
 * zip(['a', 'b'], [1, 2], [true, false]);
 * // => [['a', 1, true], ['b', 2, false]];
 *
 */
export function zip(...arrays: unknown[][]): Array<unknown[]> {
  if (!arrays.length) {
    return [];
  }
  // 记录最长数组的长度
  let length = 0;

  // 过滤掉不是原生数组的对象
  const nativeArrays = arrays.filter((array) => {
    if (Array.isArray(array)) {
      length = Math.max(length, array.length);
      return true;
    }
  });
  // 循环填充每个数组项目到目标数组
  let index = -1;
  const result = new Array<unknown[]>(length);

  while (++index < length) {
    result[index] = nativeArrays.map((array) => array[index]);
  }

  return result;
}

/**
 * 遍历的结果
 */
interface SearchResult<K> {
  /** 是否存在循环引用， 如果存在 该对象保存重复引用的第一个节点 */
  circularReferenceError?: { target: K };
  result: Array<K>;
}

/**
 * 数据结构 - 有向图
 */
export class Graph<K extends string | number | symbol = string> {
  /** 存储图的所有边 */
  private edges: Map<K, Set<K>>;

  constructor() {
    this.edges = new Map();
  }

  /**
   * 添加边
   *
   * 将forward加入base的相邻顶点
   * 如果base不存在 会新建base的顶点
   * @param base - 起始顶点
   * @param v2 - 需要添加的顶点
   */
  addEdge(base: K, forward: K) {
    this.edges.has(base)
      ? this.edges.get(base)!.add(forward)
      : this.edges.set(base, new Set([forward]));
  }

  /** 获取给定顶点的指向顶点 */
  getVertexes(base: K) {
    return [...(this.edges.get(base) ?? [])];
  }

  /**
   * 添加顶点
   * @param v - 顶点
   */
  addVertex(v: K) {
    if (!this.edges.has(v)) {
      this.edges.set(v, new Set());
    }
  }

  hasVertex(v: K) {
    return this.edges.has(v);
  }

  /**
   * 广度优先遍历
   *
   * breadth first traverse
   * @param from 遍历起始顶点
   */
  bfs(from: K, visit?: (v: K) => void): SearchResult<K> {
    const data: SearchResult<K> = {
      result: [],
    };
    // 图内没有该顶点 返回空数组
    if (!this.hasVertex(from)) return data;

    const result = new Set<K>([from]);
    const queue = [from];

    while (queue.length) {
      const current = queue.shift()!;

      // 访问当前节点
      visit?.(current);

      // 相邻顶点
      const forwardVertices = this.edges.get(current);

      if (forwardVertices) {
        for (const v of forwardVertices) {
          // 循环引用
          if (!result.has(v)) {
            queue.push(v);
            result.add(v);
          } else {
            // 出现错误 需要把循环引用的定点记录
            data.circularReferenceError = { target: current };
          }
        }
      }
    }

    // 删除自身
    result.delete(from);
    data.result = [...result];

    return data;
  }

  /**
   * 深度优先遍历
   *
   * @TODO 改用迭代器实现
   **/
  dfs(from: K): SearchResult<K> {
    const data: SearchResult<K> = {
      result: [],
    };
    // 图内没有该顶点 返回空数组
    if (!this.hasVertex(from)) return data;

    const result = new Set<K>([from]);

    const visit = (current: K) => {
      const forwardsVertex = this.edges.get(current);
      if (forwardsVertex) {
        forwardsVertex.forEach((v) => {
          if (!result.has(v)) {
            result.add(v);
            visit(v);
          } else {
            data.circularReferenceError = { target: current };
          }
        });
      }
    };

    visit(from);

    // 删除自身
    result.delete(from);

    data.result = [...result];

    return data;
  }

  debug() {
    console.log(this.edges);
  }
}

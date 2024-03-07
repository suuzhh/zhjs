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

  /**
   * 添加顶点
   * @param v - 顶点
   */
  addVertex(v: K) {
    this.edges.set(v, new Set());
  }

  hasVertex(v: K) {
    return this.edges.has(v);
  }

  /**
   * 广度优先遍历
   *
   * breadth first traverse
   * @param from - 遍历起始顶点
   */
  bfs(from: K) {
    // 图内没有该顶点 返回空数组
    if (!this.hasVertex(from)) return [];

    const result = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const current = queue.shift()!;

      // 相邻顶点
      const forwardVertices = this.edges.get(current);

      if (forwardVertices) {
        forwardVertices.forEach((v) => {
          queue.push(v);
          result.add(v);
        });
      }
    }

    return [...result];
  }

  /**
   * 深度优先遍历
   **/
  dfs(from: K) {
    // 图内没有该顶点 返回空数组
    if (!this.hasVertex(from)) return [];

    const result = new Set([from]);

    const visit = (v: K) => {
      const forwardsVertex = this.edges.get(v);
      if (forwardsVertex) {
        forwardsVertex.forEach((v) => {
          result.add(v);
          visit(v);
        });
      }
    };

    visit(from);

    return [...result];
  }

  debug() {
    console.log(this.edges);
  }
}

import { Graph } from "./Graph";

describe("Graph", () => {
  test("addEdge", () => {
    const g = new Graph();
    g.addEdge("A", "B");
    g.debug();
  });

  test("addVertex", () => {
    const g = new Graph();
    g.addVertex("A");
    g.debug();
  });

  test("bfs", () => {
    const g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("b", "c");
    g.addEdge("a", "c");
    expect(g.bfs("a").result).toEqual(["b", "c"]);
    expect(g.bfs("b").result).toEqual(["c"]);
  });

  test("dfs", () => {
    const g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("b", "c");
    g.addEdge("a", "c");
    expect(g.dfs("a").result).toEqual(["b", "c"]);
  });

  test("bfs circular reference", () => {
    const g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("b", "c");
    g.addEdge("c", "a");
    expect(g.bfs("a").result).toEqual(["b", "c"]);
  });

  test("dfs circular reference", () => {
    const g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("b", "c");
    g.addEdge("c", "a");
    expect(g.dfs("a").result).toEqual(["b", "c"]);
  });
});

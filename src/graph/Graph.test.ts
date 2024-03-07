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
    expect(g.bfs("a")).toEqual(["a", "b", "c"]);
  });

  test("dfs", () => {
    const g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("b", "c");
    g.addEdge("a", "c");
    expect(g.dfs("a")).toEqual(["a", "b", "c"]);
  });
});

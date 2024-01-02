import { Tree } from "./Tree";
const mockArr = [
  { id: 10, pid: 9 },
  { id: 9, pid: 5 },
  { id: 8, pid: 5 },
  { id: 7, pid: 2 },
  { id: 6, pid: 1 },
  { id: 5, pid: 1 },
  { id: 4, pid: 1 },
  { id: 3, pid: 0 },
  { id: 2, pid: 0 },
  { id: 1, pid: 0 },
  { id: 0, pid: null },
];
let tree: Tree<{ id: number; pid: number | null }>;

describe("Tree", () => {
  beforeAll(() => {
    tree = new Tree(mockArr, { parentProperty: "pid" });
  });

  test("正确初始化", () => {
    expect(tree.getArray()).toEqual(mockArr);
  });
  test("正确生成根节点", () => {
    expect(tree.getRoot()).not.toBeUndefined();
    expect(tree.getRoot()?.isRootNode).toBeTruthy();
    expect(tree.getRoot()?.id).toEqual(0);
  });
  test("`find`方法正确返回给定的节点", () => {
    const node = tree.find(9);
    expect(node).not.toBeUndefined();
    expect(node!.id).toEqual(9);
  });
  test("`getLevel`方法正确返回对应层级的节点数组", () => {
    const nodes = tree.getLevel(1);
    expect(nodes.length).toEqual(3);
  });
  test("`flat`方法正确返回打平后的节点数组", () => {
    const node = tree.find(5);
    expect(node?.flat().length).toEqual(4);
  });
});

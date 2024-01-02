import { zip } from "./zip";

describe("zip", () => {
  it("should zip two arrays of equal length", () => {
    const result = zip(["a", "b", "c"], [1, 2, 3]);
    expect(result).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  it("should zip arrays with different lengths", () => {
    const result = zip(["a", "b"], [1, 2, 3, 4]);
    expect(result).toEqual([
      ["a", 1],
      ["b", 2],
      [undefined, 3],
      [undefined, 4],
    ]);
  });

  it("should zip empty arrays", () => {
    const result = zip([], []);
    expect(result).toEqual([]);
  });

  it("should zip arrays with different types", () => {
    const result = zip([1, 2, 3], ["a", "b", "c"]);
    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  it("should zip arrays with different types and different lengths", () => {
    const result = zip([1, 2], ["a", "b", "c"]);
    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
      [undefined, "c"],
    ]);
  });
});

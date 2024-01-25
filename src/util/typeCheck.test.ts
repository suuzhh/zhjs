import { isArray, isNumber, isObject } from "./typeCheck";

describe("typeCheck", () => {
  test("isObject", () => {
    expect(isObject({})).toBeTruthy();
    expect(isObject({ a: 1 })).toBeTruthy();
    expect(isObject([])).toBeFalsy();
  });

  test("isArray", () => {
    expect(isArray([])).toBeTruthy();
    expect(isArray({ length: 1 })).toBeFalsy();
    expect(isArray({})).toBeFalsy();
  });

  test("isNumber", () => {
    expect(isNumber([])).toBeFalsy();
    expect(isNumber(NaN)).toBeFalsy();
    expect(isNumber(1)).toBeTruthy();
    expect(isNumber(-1)).toBeTruthy();
  });
});

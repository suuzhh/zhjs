import { createStorage } from "./index";

describe("localStorage", () => {
  const store = createStorage("local");

  beforeEach(() => {
    // 清除本地存储
    localStorage.clear();
  });

  test("get", () => {
    localStorage.setItem("foo", "baz");
    expect(store.get("foo")).toBe("baz");
    localStorage.setItem("foo", JSON.stringify({ bar: "baz" }));
    expect(store.get("foo")).toStrictEqual({ bar: "baz" });
  });
  test("set", () => {
    const value = { id: 1 };
    store.set("key", value);
    expect(JSON.stringify(store.get("key"))).toBe(JSON.stringify(value));
  });

  // 使用set设置的原始类型数据， 使用原生storage的getItem方法需要能原样返回
  test("The primitive data set value and get value must be consistent", () => {
    store.set("primitive", "A");
    expect(store.get("primitive")).toBe("A");
    expect(localStorage.getItem("primitive")).toBe("A");

    store.set("number", 1);
    expect(store.get("number")).toBe(1);
    expect(localStorage.getItem("number")).toBe("1");

    store.set("empty", null);
    expect(store.get("empty", 123)).toBe(123);
    expect(localStorage.getItem("empty")).toBeNull();

    store.set("NaN", NaN);
    expect(store.get("NaN", 123)).toBe(123);
    expect(localStorage.getItem("NaN")).toBeNull();
  });

  test("get when item undefined", () => {
    store.unset();
    expect(store.get("ImOK", "OK")).toBe("OK");
  });

  test("unset", () => {
    store.unset();
    expect(store.get("key")).toBe(null);
  });

  test("storage access denied without error", () => {
    const origin = window.localStorage;

    // remove storage mock access denied
    Object.defineProperty(window, "localStorage", {
      value: null,
    });

    origin.setItem("a", "b");

    // 需要重新初始化一次store对象，因为本次mock localStorage的操作晚于测试开始前的createStore，导致store被缓存。
    // 为了模拟初始化获取storage失败的场景，需要重新调用一次createStorage，让其识别不到原始的localStorage, 以便还原权限获取失败的场景
    const temp = createStorage("local");

    expect(() => window.localStorage.getItem("a")).toThrowError();
    expect(temp.get("a")).toBe(null);

    // test finish, reset storage
    Object.defineProperty(window, "localStorage", {
      value: origin,
    });
  });
});

describe("sessionStorage", () => {
  const store = createStorage("session");

  beforeEach(() => {
    // 清除本地存储
    sessionStorage.clear();
  });

  test("get", () => {
    sessionStorage.setItem("foo", "baz");
    expect(store.get("foo")).toBe("baz");
    sessionStorage.setItem("foo", JSON.stringify({ bar: "baz" }));
    expect(store.get("foo")).toStrictEqual({ bar: "baz" });
  });
  test("set", () => {
    const value = { id: 1 };

    store.set("key", value);
    expect(JSON.stringify(store.get("key"))).toBe(JSON.stringify(value));
  });
  test("unset", () => {
    store.unset();
    expect(store.get("key")).toBe(null);
  });
});

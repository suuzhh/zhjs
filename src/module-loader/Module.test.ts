import { createModule } from "./Module";
import { hasScript, mockScriptError, mockScriptLoad } from "./testUtil";

describe("Module", () => {
  beforeEach(() => {
    // 每次测试 重置html环境
    document.head.innerHTML = "";
  });
  test("createModule", () => {
    const mod = createModule("foo", "/1");
    expect(mod.name).toBe("foo");
    expect(mod.url).toBe("/1");
    expect(mod.isDefine).toBeTruthy();
    expect(mod.deps.length).toBe(0);
  });

  test("onLoad", (done) => {
    const mod = createModule("foo", "https://www.google.com/");
    // 验证模块是否有加载
    expect(mod.url).toBe(
      (document.querySelector("script") as HTMLScriptElement).src,
    );
    const fn = jest.fn(() => {
      expect(fn).toHaveBeenCalledTimes(1);
    });
    mod.onLoad(fn);

    expect(mockScriptLoad(mod.url)).toBeTruthy();

    mod.url = "";
    expect(mockScriptLoad(mod.url)).toBeFalsy();

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  test("retry abort", (done) => {
    const mod = createModule("foo", "https://www.google.com/");
    const fn = jest.fn();
    mod.onLoad(fn);

    expect(mockScriptError(mod.url)).toBeTruthy();
    // 正在重试 脚本还在
    expect(hasScript(mod.url)).toBeTruthy();

    expect(hasRetryScript(mod.url)).toBeTruthy();

    // 重试脚本被移除
    mod.url = "";
    // 下个宏任务重试脚本将被移除
    try {
      setTimeout(() => {
        // url切换 终止重试
        expect(hasScript(mod.url)).toBeFalsy();
        expect(hasRetryScript(mod.url)).toBeFalsy();

        // 之前的脚本应该要被移除
        expect(hasScript("https://www.google.com/")).toBeFalsy();
        done();
      }, 0);
    } catch (err) {
      done(err);
    }
  });

  test("multiple module", () => {
    const fn = jest.fn();
    const mod1 = createModule("a", "https://www.google.com/");
    const mod2 = createModule("b", "https://www.bing.com/");
    mod1.onLoad(fn);
    mod2.onLoad(fn);

    mockScriptLoad("https://www.google.com/");
    mockScriptLoad("https://www.bing.com/");
    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});

function hasRetryScript(url: string) {
  const ls = Array.from(document.querySelectorAll("script"));
  return ls.some((s) => {
    const has = s.src === url && !!s.dataset.retry;
    if (has) {
      console.log("retry count ", s.dataset.retry);
    }
    return has;
  });
}

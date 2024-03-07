import { ModuleLoader } from "./ModuleLoader";
import { hasScript, mockScriptLoad } from "./testUtil";

describe("ModuleLoader", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });
  test("define", async () => {
    const modAPath = "https://a.com/";
    const loader = new ModuleLoader();
    loader.define("a", modAPath, []);

    expect(hasScript(modAPath)).toBeTruthy();
    // 触发模块a的完成事件
    mockScriptLoad(modAPath);
    await loader.require(["a"]);
    // 脚本在触发事件后被移除
    expect(hasScript(modAPath)).toBeFalsy();
  });

  test("require no deps", async () => {
    const loader = new ModuleLoader();
    expect(loader.require).not.toThrow();
  });

  test("define with deps", (done) => {
    const modAPath = "https://a.com/";
    const modBPath = "https://b.com/";
    const loader = new ModuleLoader();
    loader.define("a", modAPath, []);
    loader.define("b", modBPath, ["a"]);
    expect(hasScript(modAPath)).toBeTruthy();
    expect(hasScript(modBPath)).toBeTruthy();

    loader.require(["b"]).then(() => {
      expect(hasScript(modBPath)).toBeFalsy();
      expect(hasScript(modAPath)).toBeFalsy();
      done();
    });

    expect(mockScriptLoad(modBPath)).toBeTruthy();
    expect(mockScriptLoad(modAPath)).toBeTruthy();
  });

  test("circular reference", (done) => {
    const modAPath = "https://a.com/";
    const modBPath = "https://b.com/";
    const modCPath = "https://c.com/";
    const loader = new ModuleLoader();
    loader.define("a", modAPath, ["c"]);
    loader.define("b", modBPath, ["a"]);
    loader.define("c", modCPath, ["b"]);

    loader
      .require(["b"])
      .then(() => {
        expect(hasScript(modBPath)).toBeFalsy();
        expect(hasScript(modAPath)).toBeFalsy();
        expect(hasScript(modCPath)).toBeFalsy();

        return loader.require(["a"]);
      })
      .then(() => {
        done();
      });

    expect(mockScriptLoad(modBPath)).toBeTruthy();
    expect(mockScriptLoad(modAPath)).toBeTruthy();
    expect(mockScriptLoad(modCPath)).toBeTruthy();
  });

  test("delay define", (done) => {
    const modAPath = "https://a.com/";
    const modBPath = "https://b.com/";
    const loader = new ModuleLoader();

    loader.define("a", modAPath, ["b"]);

    loader.require(["a"]).then(() => {
      expect(hasScript(modBPath)).toBeFalsy();
      expect(hasScript(modAPath)).toBeFalsy();
      done();
    });

    expect(mockScriptLoad(modAPath)).toBeTruthy();

    // 延迟定义被依赖的模块b
    setTimeout(() => {
      loader.define("b", modBPath);
      expect(mockScriptLoad(modBPath)).toBeTruthy();
    }, 100);
  });
});

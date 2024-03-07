import { Dispatcher } from "./Dispatcher";
import { type Module, createModule } from "./Module";

abstract class Loader {
  /**
   * 定义模块并进行加载
   * @param name - 模块名称 用于做为依赖标识
   * @param url - 需要加载的资源
   * @param deps - 依赖
   */
  abstract define(name: string, url: string, deps: string[]): void;

  /**
   * 请求依赖，如果满足会执行回调
   * @param deps - 依赖的模块
   */
  abstract require(deps: string[]): Promise<void>;
}

/**
 * 浏览器资源加载器
 *
 * 在浏览器无法使用ESM功能的情况下简单处理模块的依赖关系
 */
export class ModuleLoader implements Loader {
  /**
   * 用于标记已注册的模块
   */
  private definedModMap: Map<string, Module>;

  /** 用于标记已被依赖 但是 未注册的模块 */
  private waitForBeDepsMods: Map<string, Module>;

  constructor() {
    this.definedModMap = new Map();
    this.waitForBeDepsMods = new Map();
  }

  define(name: string, url: string, deps: string[] = []): void {
    let mod = this.waitForBeDepsMods.get(name);
    // 如果模块在等待队列， 需要把它更新到完成队列
    if (mod) {
      mod.isDefine = true;
      // 更新url后会自动触发资源的加载
      mod.url = url;
      this.definedModMap.set(name, mod!);
      // 从等待队列移除
      this.waitForBeDepsMods.delete(name);
    }

    // TODO： 重复定义模块是否需要通知更新？
    if (!mod) {
      // 目前行为与requirejs不一样 并不是执行模块 而是触发脚本的加载， 详情看Module.url的实现
      mod = createModule(name, url, deps);

      this.definedModMap.set(name, mod!);
    }

    // 通知其它依赖它的模块，该模块加载完成了！
    // mod.onLoad(() => {
    //   this.depsLoadedDispatcher.notify(name);
    // });

    // 判断当前模块的依赖是否已注册， 未注册的模块要加入到 `waitForBeDepsMods`
    for (const dep of deps) {
      if (!this.definedModMap.has(dep) && !this.waitForBeDepsMods.has(dep)) {
        // 当前模块未注册 要加入到等待队列
        mod = createModule(dep, "", []);
        this.waitForBeDepsMods.set(dep, mod);
      }
    }
  }

  /**
   * 请求依赖，如果满足会执行回调
   * @param deps - 依赖的模块
   */
  require(deps: string[] = []): Promise<void> {
    const waitPromise: Promise<void>[] = [];
    //递归查找所有使用到的
    const depsSet = new Set<string>();
    const setDeps = (n: string) => {
      if (depsSet.has(n)) {
        // 循环依赖 停止
        return;
      }

      let m = this.definedModMap.get(n);
      if (m) {
        depsSet.add(n);
        m.deps.forEach(setDeps);
      }
      m = this.waitForBeDepsMods.get(n);
      if (m) {
        depsSet.add(n);
        m.deps.forEach(setDeps);
      }
    };
    for (const dep of deps) {
      setDeps(dep);
    }

    deps = [...depsSet];

    if (Array.isArray(deps) && deps.length > 0) {
      for (const dep of deps) {
        let mod = this.definedModMap.get(dep);
        if (mod) {
          // 判断模块是否加载完成
          if (mod.isLoaded) {
            // 已完成 不做处理了
          } else {
            // 等待加载完成
            waitPromise.push(new Promise((resolve) => mod!.onLoad(resolve)));
          }
        } else {
          // 在未定义的模块集合中查找
          mod = this.waitForBeDepsMods.get(dep);
          if (mod) {
            // 已存在 需要确认是否加载完成
            if (!mod?.isLoaded) {
              waitPromise.push(new Promise((resolve) => mod!.onLoad(resolve)));
            }
          } else {
            // 两个缓存都没有 说明该资源没有被注册或被依赖过 需要往等待队列加入一个新的模块
            const mod = createModule(dep, "", []);
            this.waitForBeDepsMods.set(dep, mod);
            waitPromise.push(new Promise((resolve) => mod.onLoad(resolve)));
          }
        }
      }

      if (waitPromise.length > 0) {
        return Promise.all(waitPromise).then();
      }
    }
    // 没有依赖 可直接执行
    return Promise.resolve();
  }
}

import { Graph } from "../graph";
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
   * 依赖的有向图
   *
   * 记录当前模块被多少模块所依赖
   *
   * 关联关系是 模块A => [依赖模块A的其它模块]
   */
  private dependenciesGraph: Graph;

  /**
   * 用于标记已注册的模块
   */
  private definedModMap: Map<string, Module>;

  /** 未注册的模块暂存 */
  // private shadowModMap: Map<string, Module>;

  constructor() {
    this.definedModMap = new Map();
    // this.shadowModMap = new Map();

    this.dependenciesGraph = new Graph();
  }

  /**
   * 更新依赖结构
   * @param deps
   */
  private updateGraph(name: string, deps: string[]) {
    deps.forEach((depName) => {
      this.dependenciesGraph.addEdge(depName, name);
    });
  }

  /**
   * 更新模块依赖状态
   * @param name
   */
  private updateDepsState(name: string) {
    const referenceParents = this.dependenciesGraph.getVertexes(name);
    // 通知引用方 当前模块已加载

    referenceParents.forEach((parentName) => {
      this.tryToLoad(parentName);
    });
  }

  /**
   * 检查依赖是否全部完成加载，如果完成则加载自身
   * @param name
   */
  private tryToLoad(name: string) {
    const mod = this.definedModMap.get(name);

    if (mod) {
      const deps = mod.deps;

      if (deps.length) {
        if (
          deps.every(
            (depName) => this.definedModMap.get(depName)?.isLoaded ?? false,
          )
        ) {
          mod.load();
        }
      } else {
        mod.load();
      }
    }
  }

  define(name: string, url: string, deps: string[] = []) {
    let mod = this.definedModMap.get(name);

    if (!mod) {
      mod = createModule(name, url, deps);
      this.definedModMap.set(name, mod);
    } else {
      console.warn(`${name}模块已存在`);
    }

    // 是否存在依赖
    if (deps.length) {
      // 有依赖需要等待依赖加载完成后再通知自身加载
      this.updateGraph(name, deps);
      // 有可能依赖都加载完成了 可直接加载
      this.tryToLoad(name);
    } else {
      // 没依赖直接可加载自身
      mod.load();
    }

    // 通知依赖该模块的其它模块
    mod.onLoaded(() => {
      this.updateDepsState(name);
    });
  }

  /**
   * 请求依赖，如果满足会执行回调
   * @param deps - 依赖的模块
   */
  require(deps: string[] = []): Promise<void> {

    return 
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

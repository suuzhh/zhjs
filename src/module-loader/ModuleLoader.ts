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
  private shadowModMap: Map<string, Module>;

  constructor() {
    this.definedModMap = new Map();
    this.shadowModMap = new Map();

    this.dependenciesGraph = new Graph();
  }

  private createModule(name: string, url: string, deps: string[] = []) {
    for (const depName of deps) {
      this.dependenciesGraph.addEdge(depName, name);

      if (!this.definedModMap.has(depName)) {
        // 添加未定义依赖
        this.shadowModMap.set(depName, this.createModule(depName, "", []));
      }
    }

    const mod = createModule(name, url, deps);

    // 通知依赖该模块的其它模块
    mod.onLoaded(() => {
      this.updateDepsState(name);
    });

    return mod;
  }

  /**
   * 将未定义模块转变为已注册模块
   * @param name
   */
  private updateShadowToDefined(
    name: string,
    url: string,
    deps: string[] = [],
  ) {
    const mod = this.shadowModMap.get(name);

    if (mod) {
      for (const depName of deps) {
        this.dependenciesGraph.addEdge(depName, name);

        // 如果依赖未注册过 且 未定义过 需要先注册一一下
        if (!this.definedModMap.has(depName)) {
          // 添加未定义依赖
          this.shadowModMap.set(depName, this.createModule(depName, "", []));
        }
      }

      mod.deps = deps;
      mod.url = url;

      mod.onLoaded(() => {
        this.updateDepsState(name);
      });

      this.definedModMap.set(name, mod);

      this.shadowModMap.delete(name);
      if (deps.length <= 0) {
        mod.load();
      }
    }
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

      let pass = true;
      if (deps.length) {
        for (const depName of deps) {
          pass = this.definedModMap.get(depName)?.isLoaded ?? false;
          if (!pass) {
            break;
          }
        }
      }

      if (pass) {
        mod.load();
      }
    }
  }

  define(name: string, url: string, deps: string[] = []) {
    let mod = this.definedModMap.get(name);

    if (!mod) {
      mod = this.shadowModMap.get(name);
      if (mod) {
        // 之前未定义的依赖 现在要让它变成已定义状态
        this.updateShadowToDefined(name, url, deps);
      } else {
        mod = this.createModule(name, url, deps);
      }

      this.definedModMap.set(name, mod);
    } else {
      console.warn(`${name}模块已存在`);
    }

    //加载完成 或 存在依赖 这里不需要手动触发加载 等待它的依赖通知它更新
    if (mod.isLoaded) return;

    if (mod.deps.length > 0) {
      // 检查是否存在循环依赖
      const r = this.dependenciesGraph.dfs(name).circularReferenceError;
      if (r) {
        console.warn(`deps ${r.target} is circular reference`);
      }
    } else {
      mod.load();
    }
  }

  /**
   * 请求依赖，如果满足会执行回调
   * @param deps - 依赖的模块
   */
  require(deps: string[] = []): Promise<void> {
    const waitPromise: Promise<void>[] = [];

    deps.forEach((depName) => {
      let mod = this.definedModMap.get(depName);
      if (mod) {
        if (!mod.isLoaded) {
          waitPromise.push(
            new Promise<void>((resolve) => {
              mod!.onLoaded(resolve);
            }),
          );
        }
      } else {
        // 未定义的依赖需要有个地方监听
        mod = this.shadowModMap.get(depName);
        if (!mod) {
          mod = this.createModule(depName, "", []);
          this.shadowModMap.set(depName, mod);
        }
        waitPromise.push(
          new Promise<void>((resolve) => {
            mod!.onLoaded(resolve);
          }),
        );
      }
    });

    if (waitPromise.length > 0) {
      return Promise.all(waitPromise).then();
    }

    // 没有依赖 可直接执行
    return Promise.resolve();
  }
}

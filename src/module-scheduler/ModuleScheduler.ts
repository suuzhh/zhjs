import { Dispatcher } from "./Dispatcher";
import { TaskRunner } from "./TaskerRunner";

/**
 * 浏览器资源调度器
 *
 * 在浏览器无法使用ESM功能的情况下简单处理模块的依赖关系
 */
class ModuleScheduler {
  /**
   * 用于标记模块是否被加载
   */
  private loadedModMap: Map<string, HTMLScriptElement>;

  private taskRunner: TaskRunner;
  private dispatcher: Dispatcher;

  constructor() {
    this.loadedModMap = new Map();
    this.taskRunner = new TaskRunner();
    this.dispatcher = new Dispatcher();
  }

  /**
   * 定义js模块
   * @param name - 模块名称
   * @param callback - 模块加载完成后执行的回调
   */
  define(name: string, callback: () => void): void;
  /**
   * 定义js模块
   * @param name - 模块名称
   * @param depsOrCallback - 依赖的模块
   * @param callback - 模块加载完成后执行的回调
   */
  define(
    name: string,
    depsOrCallback: () => void | string[],
    callback?: () => void,
  ) {
    const mod = this.loadedModMap.get(name);

    const deps: string[] = [];

    // 对齐参数
    if (Array.isArray(depsOrCallback)) {
      deps.push(...depsOrCallback);
    } else {
      callback = depsOrCallback;
    }

    if (typeof callback !== "function") {
      callback = () => {};
    }

    // TODO： 重复定义模块是否需要通知更新？
    if (!mod) {
      // callback目前行为与requirejs不一样 并不是执行模块 而是触发脚本的加载(在callback中执行)
      Promise.resolve(callback()).then(() => this.dispatchModuleDefine(name));
    }
  }

  /**
   * 请求依赖，如果满足会执行回调
   * @param deps - 依赖的模块
   */
  require(deps: string[] = []) {
    if (Array.isArray(deps) && deps.length > 0) {
      // 等待对应的依赖完成 并返回依赖的引用信息
      const depsAllLoaded = deps.every((dep) => this.loadedModMap.has(dep));
      if (depsAllLoaded) {
        return Promise.resolve(deps.map((dep) => this.loadedModMap.get(dep)));
      }

      // 等待未加载或未注册的模块
    }
    // 没有依赖 可直接执行
    return Promise.resolve();
  }

  private waitModule(deps: string[]) {
    return new Promise((resolve) => {
      // TODO: 等待所有模块加载完成再返回
    });
  }

  /**
   * 通知模块已注册
   * @param name - 注册的模块
   */
  private dispatchModuleDefine(name: string) {}
}

interface Module {
  name: string;
  parentMap: unknown;
  url: string;
  isDefine: boolean;
  id: string;
}

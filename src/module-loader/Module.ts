import { Dispatcher } from "./Dispatcher";

function createScriptNode(url: string, attrs?: Record<string, string>) {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  if (attrs) for (const attr in attrs) script.setAttribute(attr, attrs[attr]);
  return script;
}

/**
 * js 模块定义
 */
export interface Module {
  readonly name: string;
  deps: string[];
  url: string;
  readonly isLoaded: boolean;

  load: () => void;
  onLoaded: (cb: Function) => void;
}

export function createModule(name: string, url: string, deps: string[] = []) {
  return new InternalModule(name, deps, url);
}

class InternalModule implements Module {
  /**
   * 是否加载完成
   */
  private _isLoaded = false;

  private dispatcher: Dispatcher;

  constructor(
    public readonly name: string,
    public readonly deps: string[],
    public readonly url: string,
  ) {
    this.dispatcher = new Dispatcher(`__module_loaded__${name}`);
  }

  get isLoaded() {
    return this._isLoaded;
  }

  load() {
    const node = createScriptNode(this.url, { async: "true" });

    const _handleLoadEvent = () => {
      this._isLoaded = true;
      this.dispatcher.notify(this.name);
      node!.remove();
    };
    const _handleErrorEvent = () => {
      // TODO: 重试
      // 失败的情况需要暴露给外部处理
    };

    node.addEventListener("load", _handleLoadEvent, false);
    node.addEventListener("error", _handleErrorEvent, false);

    document.head.appendChild(node);
  }

  onLoaded(fn: Function) {
    this.dispatcher.listen(this.name, fn);
  }
}

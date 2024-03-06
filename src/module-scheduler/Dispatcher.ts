/**
 * 通知器
 *
 * 用于通知模块已注册
 *
 * 直接使用html原始做事件的分发
 */
export class Dispatcher {
  private context: HTMLElement;

  private EVENT_NAME = "__dispatcher__";

  constructor() {
    this.context = document.body;
  }

  listen(name: string, callback: Function) {
    this.context.addEventListener(this.EVENT_NAME, (e) => {
      if (e instanceof CustomEvent && e.detail && e.detail === name) {
        callback();
      }
    });
  }

  notify(name: string) {
    this.context.dispatchEvent(
      new CustomEvent(this.EVENT_NAME, { detail: name }),
    );
  }
}

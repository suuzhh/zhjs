/**
 * @public
 */
export interface FileSelectorOption {
  multiple: boolean;
  accept: string;
}

const DEFAULT_OPTION: FileSelectorOption = {
  multiple: false,
  accept: "",
};

/**
 * @public
 */
export class FileSelector {
  private input: HTMLInputElement;
  private innerOption: FileSelectorOption;
  private onSelect: Function | undefined = undefined;
  private onError: Function | undefined = undefined;
  // 屏幕是否锁定为文件选择弹窗
  private isLock = false;
  // 文件列表
  private fileList: File[] = [];

  constructor(option?: Partial<FileSelectorOption>) {
    this.innerOption = Object.assign({}, DEFAULT_OPTION, option);
    this.input = document.createElement("input");
    this.input.setAttribute("type", "file");

    this.input.addEventListener("change", this.selectEvent);
    this.input.addEventListener("error", this.errorEvent);
    this.input.addEventListener("click", this.handleStart);
  }

  // 文件选择弹窗关闭的回调
  private handleDialogClosed = () => {
    // FIXED: focus事件先于change事件完成， 需要增加定时器延时执行以保证其在change事件后触发
    setTimeout(() => {
      if (!this.isLock) return;
      this.isLock = false;
      if (this.input.files?.length === 0) {
        this.onError && this.onError(new Error("取消选择"));
      }
      // reset input
      this.input && (this.input.value = "");
      // this.fileList.length = 0
    }, 100);
  };

  private handleStart = () => {
    if (!this.isLock) {
      this.isLock = true;
      // 在进入的时候挂载结束事件 并只执行一次
      window.addEventListener("focus", this.handleDialogClosed, { once: true });
    }
  };

  private parseOption(opt: FileSelectorOption) {
    // if (opt.multiple) {
    //   this.input.setAttribute('multiple', 'multiple')
    // } else {
    //   this.input.removeAttribute('multiple')
    // }
    this.input.multiple = Boolean(opt.multiple);

    this.input.accept = opt.accept;
  }

  private selectEvent = () => {
    if (this.input && this.input.files && this.input.files.length > 0) {
      this.fileList = Array.from(this.input.files!);
      this.onSelect && this.onSelect(this.fileList);
    }
  };

  private errorEvent = (e: ErrorEvent) => {
    this.onError && this.onError(e);
  };

  /**
   * 手动释放内存
   */
  dispose() {
    this.input.removeEventListener("change", this.selectEvent);
    this.input.removeEventListener("error", this.errorEvent);
    this.input.removeEventListener("click", this.handleStart);
  }

  openFileDialog(option?: FileSelectorOption): Promise<File[]> {
    const opt = Object.assign({}, this.innerOption, option);
    this.parseOption(opt);

    return new Promise((resolve, reject) => {
      this.onSelect = resolve;
      this.onError = reject;
      this.input.click();
    });
  }
}

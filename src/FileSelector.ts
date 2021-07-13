interface RealFileSelectorOption {
  multiple: boolean;
  accept: string;
}

export type FileSelectorOption = Partial<RealFileSelectorOption>

const DEFAULT_OPTION: RealFileSelectorOption = {
  multiple: false,
  accept: ''
}

export class FileSelector {
  private input: HTMLInputElement;
  private onSelect: Function | undefined = undefined
  private onError: Function | undefined = undefined

  constructor (option?: FileSelectorOption) {
    const opt = Object.assign({}, DEFAULT_OPTION, option)
    this.input = document.createElement('input')
    this.input.setAttribute('type', 'file')

    this.input.addEventListener('change', this.selectEvent)
    this.input.addEventListener('error', this.errorEvent)

    this.parseOption(opt)
  }

  private parseOption (opt: RealFileSelectorOption) {
    this.input.multiple = Boolean(opt.multiple)
    this.input.accept = opt.accept
  }

  private selectEvent = () => {
    if (this.input && this.input.files && this.input.files.length > 0) {
      this.onSelect && this.onSelect(Array.from(this.input.files!))
    }
    // reset input
    this.input && (this.input.value = '')
  }

  private errorEvent = (e: ErrorEvent) => {
    this.onError && this.onError(e)
  }

  openFileDialog (option?: FileSelectorOption): Promise<File[]> {
    const opt = Object.assign({}, DEFAULT_OPTION, option)
    this.parseOption(opt)

    return new Promise((resolve, reject) => {
      this.onSelect = resolve
      this.onError = reject
      this.input.click()
    })
  }
}

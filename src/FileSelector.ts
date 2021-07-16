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
  private innerOption: RealFileSelectorOption;
  private onSelect: Function | undefined = undefined
  private onError: Function | undefined = undefined

  constructor (option?: FileSelectorOption) {
    this.innerOption = Object.assign({}, DEFAULT_OPTION, option)
    this.input = document.createElement('input')
    this.input.setAttribute('type', 'file')

    this.input.addEventListener('change', this.selectEvent)
    this.input.addEventListener('error', this.errorEvent)
  }

  private parseOption (opt: RealFileSelectorOption) {
    // if (opt.multiple) {
    //   this.input.setAttribute('multiple', 'multiple')
    // } else {
    //   this.input.removeAttribute('multiple')
    // }
    this.input.multiple = Boolean(opt.multiple)
    
    this.input.accept = opt.accept
    console.dir(this.input)
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
    const opt = Object.assign({}, this.innerOption, option)
    this.parseOption(opt)

    return new Promise((resolve, reject) => {
      this.onSelect = resolve
      this.onError = reject
      this.input.click()
    })
  }
}

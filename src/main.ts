interface RealFileSelectorOption {
  multiple: boolean;
  accept: string;
}

type FileSelectorOption = Partial<RealFileSelectorOption>

const DEFAULT_OPTION: RealFileSelectorOption = {
  multiple: false,
  accept: ''
}

export function useFileSelector (option?: FileSelectorOption) {
  const opt = Object.assign({}, DEFAULT_OPTION, option)
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  function parseOption (opt: RealFileSelectorOption) {
    input.multiple = Boolean(opt.multiple)
    input.accept = opt.accept
  }

  parseOption(opt)
  console.dir(input)

  return {
    openFileDialog (option?: FileSelectorOption) {
      const opt = Object.assign({}, DEFAULT_OPTION, option)
      parseOption(opt)

      return new Promise((resolve, reject) => {
        input.addEventListener('change', () => {
          if (input.files && input.files.length > 0) {
            resolve(Array.from(input.files!))
          } else {
            reject('关闭')
          }
        }, { once: true })
        input.files = null
        input.click()
        // FIXME: 关闭弹窗事件不能正确触发
      })
    }
  }
}
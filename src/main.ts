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
  let promise: Promise<null> | null = null
  input.addEventListener('change', e => {

  })

  return {
    openFileDialog (option?: FileSelectorOption) {
      const opt = Object.assign({}, DEFAULT_OPTION, option)
      parseOption(opt)
      input.click()
      return promise
    }
  }
}
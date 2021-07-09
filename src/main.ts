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

  let onSelect: Function | null = null
  let onError: Function | null = null

  function bindEvents () {
    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0) {
        onSelect && onSelect(Array.from(input.files!))
      }
      // reset input
      input.value = ''
    })
    input.addEventListener('error', e => {
      onError && onError(e)
    })
  }
  bindEvents()
  parseOption(opt)

  return {
    openFileDialog (option?: FileSelectorOption) {
      const opt = Object.assign({}, DEFAULT_OPTION, option)
      parseOption(opt)

      return new Promise((resolve, reject) => {
        onSelect = resolve
        onError = reject
        input.click()
      })
    }
  }
}
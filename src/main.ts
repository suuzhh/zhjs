import { FileSelectorOption, FileSelector } from './FileSelector'

export function useFileSelector (option?: FileSelectorOption) {
  return new FileSelector(option)
}
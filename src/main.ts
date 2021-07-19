import { FileSelectorOption, FileSelector } from './FileSelector'
import { Tree, TreeOption, TreeNode } from './Tree'

export function useFileSelector (option?: FileSelectorOption) {
  return new FileSelector(option)
}

export function arrayToTree<T extends object>(arr: T[], option?: TreeOption<T>): Tree<T> {
  return new Tree(arr, option)
}
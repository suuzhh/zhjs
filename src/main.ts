import { FileSelectorOption, FileSelector } from './file-selector/FileSelector'
import { Task, Tasker } from './tasker/Tasker'
import { Tree, TreeOption } from './tree/Tree'

export function useFileSelector (option?: FileSelectorOption) {
  return new FileSelector(option)
}

export function arrayToTree<T extends object>(arr: T[], option?: TreeOption<T>): Tree<T> {
  return new Tree(arr, option)
}

export function useTasker (tasks: Task[]) {
  return Tasker.fromTasks(tasks)
}
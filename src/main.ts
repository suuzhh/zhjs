import { type FileSelectorOption, FileSelector } from './file-selector/FileSelector';
import { type Task, type Obs, type TaskState, Tasker } from './tasker/Tasker';
import { Tree, type TreeOption, type TreeNode } from './tree/Tree';

export type { FileSelectorOption, FileSelector, TreeOption, TreeNode, Tree, Task, Obs, TaskState, Tasker };


/**
 * 获取文件选择器对象
 * @public
 */
export function useFileSelector(option?: Partial<FileSelectorOption>): FileSelector {
  return new FileSelector(option)
}

/**
 * 节点数组转树形数据结构
 * @public
 */
export function arrayToTree<T extends object>(arr: T[], option?: Partial<TreeOption<T>>): Tree<T> {
  return new Tree(arr, option)
}


/**
 * 任务调度器
 *
 * @deprecated 将在下个major版本弃用
 * @public
 */
export function useTasker(tasks: Task[]) {
  return Tasker.fromTasks(tasks)
}
import { isEmpty, isString } from './util/typeCheck'

interface RealTreeOption<T> {
  // 关联父节点`customID`值的字段名称 默认为`parentId`
  parentProperty: keyof T;
  // 节点唯一标识 默认为`id`
  customID: keyof T;
  // 根节点唯一标识 默认为0
  rootID: string | number
}

const DEFAULT_OPTION: RealTreeOption<any | { parentId: number, id: number }> = {
  parentProperty: 'parentId',
  customID: 'id',
  rootID: 0 
}

export type TreeOption<T> = Partial<RealTreeOption<T>>

export class Tree<T extends object> {
  private option: RealTreeOption<T>;
  private origin: T[]
  private originMap = new Map<any, T>()
  private originTree: TreeNode<T> | undefined;

  constructor (array: T[], option?: TreeOption<T>) {
    this.option = Object.assign({}, DEFAULT_OPTION, option)
    this.checkOption()
    this.origin = array
    this.initOriginMap()
    this.assemble()
  }

  private checkOption () {
    const { customID, parentProperty, rootID } = this.option
    if (isEmpty(customID) || isEmpty(parentProperty)) {
      throw new Error('`customID`或`parentProperty`未设置')
    }
    if (!isString(customID) || !isString(parentProperty)) {
      throw new Error('`customID`或`parentProperty`必须为String类型')
    }
    if (customID === parentProperty) {
      throw new Error('`customID`和`parentProperty`不能相同')
    }
    if (isEmpty(rootID)) {
      throw new Error('`rootID`不能为空')
    }
  }

  private initOriginMap () {
    this.originMap.clear()
    const { customID } = this.option
    for (const item of this.origin) {
      const id = item[customID]
      if (this.originMap.has(id)) {
        // WARN: 覆盖重复项，后添加的覆盖之前的
        console.warn(`数据出现重复,已存在'${customID}'为[${id}]的数据,旧值将被覆盖`)
      }
      this.originMap.set(id, item)
    }
  }

  /**
   * 组装 treeNode对象
   */
  private assemble () {
    const { customID, parentProperty, rootID } = this.option
    const rootNode = new TreeNode<T>(
      rootID,
      undefined,
      [],
      this.originMap.get(rootID)
    )

    const recursive = (pid: number | string, arr: T[] = []) => {
      const [match, unmatch] = this.splitArrayByPid(pid, arr)
      const children = []
      for (const it of match) {
        const node: TreeNode<T> = new TreeNode(
          it[customID] as any,
          it[parentProperty] as any,
          recursive(it[customID] as any, unmatch),
          it
        )
        children.push(node)
      }
      return children
    }
    rootNode.children = recursive(rootID, this.origin)

    this.originTree = rootNode
  }

  /**
   * 根据pid 将给定的数组切分为二个子数组
   * @param pid 
   * @param arr
   * @return {matched, unmatched}
   */
  private splitArrayByPid (pid: number | string, arr: T[] = []) {
    const { parentProperty } = this.option
    const [match, unmatch]: T[][] = [[], []]
    for (const it of arr) {
      it[parentProperty] as any === pid
        ? (match.push(it))
        : (unmatch.push(it))
    }
    return [match, unmatch]
  }

  getTree () {
    return this.originTree
  }
}

export class TreeNode<T> {
  constructor (
    readonly id: number | string,
    readonly pid?: number | string,
    public children: TreeNode<T>[] = [],
    public readonly data: T | null = null) {}

  /**
   * 是否叶子节点
   */
  get isLeafNode () {
    return this.children.length === 0
  }

  /**
   * 是否根节点
   */
  get isRootNode () {
    return isEmpty(this.pid)
  }

  get size (): number {
    return this.children.reduce((w, c) => {
      return w + c.size
    }, 1)
  }

  findNode (id: any): TreeNode<T> | null {
    if (isEmpty(id)) {
      return null
    }
    if (this.id === id) {
      return this
    }
    let findNode = null
    for (const child of this.children) {
      findNode = child.findNode(id)
      if (findNode) {
        break
      }
    }
    return findNode
  }
}

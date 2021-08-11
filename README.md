# 前端工具集

## 文件选择器

使用方法

```js
  const selector = zhjs.useFileSelector({
    multiple: true,
    // 参考 https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input/file#accept
    accept: '.jpg,.png'
  })
  selector.openFileDialog()
    .then(files => {
      // TODO: use files here
    })
```

## 数组转树
使用方法
```js
  const arr = [
    { id: 10, pid: 9 },
    { id: 9, pid: 5 },
    { id: 8, pid: 5 },
    { id: 7, pid: 2 },
    { id: 6, pid: 1 },
    { id: 5, pid: 1 },
    { id: 4, pid: 1 },
    { id: 3, pid: 0 },
    { id: 2, pid: 0 },
    { id: 1, pid: 0 },
    { id: 0, pid: null }
  ]
  // output: 树形结构
  const tree = zhjs.arrayToTree(arr, { parentProperty: 'pid' })
  // getRootNode
  console.log(tree.getRoot())
  // getLevelChildren
  console.log(tree.getLevel(1))
  // output 1 2 3
  console.log(tree.find(9))
  // output { id: 9, pid: 5 }
  console.log(tree.sort((a, b) => a.id - b.id))
  // sort by node.id, from low to height
  console.log(tree.getRoot().flat())
  // return flat tree nodes array
```

## TODO:
- `Tree`增加`update`方法 传入数组对整棵树进行动态更新
- 增加`Tasker`组件

## changelog
- 0.1.4
  修复文件选择器初始化时配置项不生效的问题
- 0.1.5
  调整`arratToTree`返回类型为`Tree`
  增加`Tree`类型的公开方法`getRoot`和`getLevel`
- 0.1.6
  修复 `Tree.getLevel`无法获取0层节点 的问题
  增加`Tree`类型的公开方法`find`用于获取给定`customID`的节点
- 0.1.7
  增加`Tree.sort`公开方法，对每个children进行排序，参考[Array.sort](https://cgi.cse.unsw.edu.au/~cs2041/doc/MDN_javascript_reference/Web/JavaScript/Reference/Global_Objects/Array/sort.html#:~:text=Array.prototype.sort%28%29%20-%20JavaScript%20%7C%20MDN%20The%20sort%28%29%20method,array%20in%20place%20and%20returns%20the%20sorted%20array.)
  增加`Tree.getArray`方法，获取树的源数组
- 0.1.8
  增加`TreeNode.flat`方法，返回打平后的`TreeNode`数组
  修复`Tree`根节点如果在给定的源数组中存在时，不能正确往`TreeNode.data`中插入数据的问
- 0.1.9
  增加`Tree`模块的单元测试
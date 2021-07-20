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
```

## TODO:
- 增加单元测试

## changelog
- 0.1.4
  修复文件选择器初始化时配置项不生效的问题
- 0.1.5
  调整`arratToTree`返回类型为`Tree`
  增加`Tree`类型的公开方法`getRoot`和`getLevel`
- 0.1.6
  修复 `Tree.getLevel`无法获取0层节点 的问题
  增加`Tree`类型的公开方法`find`用于获取给定`customID`的节点
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
  console.log(zhjs.arrayToTree(arr, { parentProperty: 'pid' }))
  // output: 树形结构
```

## TODO:
- 增加单元测试
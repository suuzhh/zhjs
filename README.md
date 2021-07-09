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

## TODO:
- 添加type文件
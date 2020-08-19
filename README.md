# convert-es5-plugin

[![NPM VERSION](https://img.shields.io/npm/v/convert-es5-plugin.svg?style=flat)](https://npmjs.com/convert-es5-plugin)
[![codecov](https://codecov.io/gh/long-woo/convert-es5-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/long-woo/convert-es5-plugin)

一个将 es6+ 语法转换成 es5 的 webpack 插件。

## 安装

```sh
$ yarn add convert-es5-plugin -D
```

### 使用
在 webpack.config.js 文件中，找到 `plugins` 配置项。

```js
// 导入
const ConvertES5Plugin = require('convert-es5-plugin');

module.exports = {
  ...
  plugins: [
    ...
    // 使用
    new ConvertES5Plugin()
  ]
  ...
};
```

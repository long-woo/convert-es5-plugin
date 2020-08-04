import fs from 'fs';
import { Compiler } from 'webpack';
import acorn from 'acorn';
import { transformSync } from '@babel/core';

interface IConvertES5Plugin {
  path: string;
}

class ConvertES5Plugin {
  constructor(private readonly options: IConvertES5Plugin) {}

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('ConvertES5Plugin', (compilation, callback) => {
      console.log('分析语法...');
      const filePath = this.options.path;
      let transformFile;

      // 读取文件内容，分析语法
      const code = fs.readFileSync(filePath, 'utf8');
      try {
        acorn.parse(code, { ecmaVersion: 5 });
      } catch (err) {
        console.log('存在 ES6+ 的语法，正在转换...');
        transformFile = filePath;
      }

      if (!transformFile) {
        console.log('分析完成，无需转换\n');
        return;
      }

      // 使用 babel 将语法转换成
      const output = transformSync(code, {
        presets: [
          [
            'es2015',
            {
              loose: true
            }
          ],
          [
            '@babel/preset-env',
            {
              targets: '> 1%, last 2 versions, not ie <= 8'
            }
          ]
        ],
        plugins: []
      });
      fs.writeFileSync('./dist/es5-test.js', output?.code as string);
      // fs.writeFileSync('.dist/es5-test.map', output.map);
      console.log('转换完成\n');
    });
  }
}

module.exports = ConvertES5Plugin;

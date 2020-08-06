import fs from 'fs';
import { Compiler } from 'webpack';
import acorn from 'acorn';

interface IConvertES5Plugin {
  path: string;
}

class ConvertES5Plugin {
  constructor(private readonly options: IConvertES5Plugin = {path: 'dist/vendors~main.js'}) {}

  /**
   * 编译完成
   * @param compiler 
   */
  private compilerDone(compiler: Compiler) {
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
      const output = require('@babel/core').transformSync(code, {
        filename: 'es5-test',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: '> 1%, last 2 versions, not ie <= 8'
            }
          ]
        ],
        compact: false,
        minified: true,
        sourceMaps: true
      });
      // const map = output?.map;
      // console.log(map.file)
      // fs.writeFileSync('./dist/es5-test.js', map?.sourcesContent[0]);
      // fs.writeFileSync('./dist/es5-test.js.map', JSON.stringify({
      //   version: map?.version,
      //   sources: map?.sources,
      //   names: map?.names,
      //   sourceRoot: map?.sourceRoot,
      //   mappings: map?.mappings,
      //   file: map?.file
      // }));
      fs.writeFileSync('./dist/es5-test.js', output?.code as string);
      console.log('转换完成\n');
    });
  }

  apply(compiler: Compiler) {
    // compiler.hooks.
  }
}

module.exports = ConvertES5Plugin;

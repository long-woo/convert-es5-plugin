import fs from 'fs';
import { Compiler } from 'webpack';
import recast from 'recast';

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
        recast.parse(code, {
          parser: {
            parse(code: string) {
              return require('recast/parsers/acorn').parse(code, {
                ecmaVersion: 5
              });
            }
          }
        });
      } catch (err) {
        console.log('存在 ES5+ 的语法，正在转换...');
        transformFile = code;
      }

      if (!transformFile) {
        console.log('分析完成，无需转换\n');
        return;
      }

      // 使用 babel 将语法转换成
      const ast = recast.parse(transformFile, {
        parser: {
          parse(transformFile: string) {
            return require('recast/parsers/babylon').parse(transformFile, {
              sourceType: 'script'
            });
          }
        }
      });
      const output = recast.print(ast).code;
      fs.writeFileSync('./dist/es5-test.js', output);
      console.log('转换完成\n');
    });
  }
}

module.exports = ConvertES5Plugin;

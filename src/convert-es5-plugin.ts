import fs from 'fs';
import acorn from 'acorn';
import { Compiler } from 'webpack';
import { ConcatSource } from 'webpack-sources'
import { version } from '../package.json';

class ConvertES5Plugin {
  private readonly pluginName = 'ConvertES5Plugin'

  apply(compiler: Compiler) {
    const { devtool } = compiler.options;

    compiler.hooks.compilation.tap(this.pluginName, compilation => {
      if(devtool === 'source-map' || devtool === 'cheap-source-map') {
        compilation.hooks.buildModule.tap(this.pluginName, mod => {
          mod.useSourceMap = true;
        });
      }

      // 重新生成 contenthash
      const { mainTemplate } = compilation;

      mainTemplate.hooks.hashForChunk.tap(this.pluginName, (hash, chunk) => {
        hash.update(this.pluginName);
        hash.update(JSON.stringify({
          convertES5: version
        }));
      });

      compilation.hooks.optimizeChunkAssets.tapAsync(this.pluginName, (chunks, callback) => {
        chunks.map(chunk => {
          chunk.files.map(file => {
            if (!/\.(m?)js/i.test(file)) return;

            let transformFile;
            const code = new ConcatSource(compilation.assets[file]).source();

            // 检测语法是否为 es5
            console.log(`🔍 [${file}] 分析语法...`);
            try {
              acorn.parse(code, { ecmaVersion: 5 });
            } catch (err) {
              console.log(`🚗 [${file}] 存在 ES6+ 的语法，正在转换...`);
              transformFile = code;
            }

            if(!transformFile) {
              console.log(`✅ [${file}] 无需转换`);
              return;
            }

            // 使用 babel 将语法转换成 es5
            const output = require('@babel/core').transformSync(code, {
              filename: file,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: '> 1%, last 2 versions, not ie <= 8'
                  }
                ]
              ],
              compact: false,
              minified: false,
              sourceMaps: false
            });

            compilation.assets[file] = new ConcatSource(output.code);
            console.log(`✅ [${file}] 转换成功`);
          });
        });
        callback();
      });
    });
  }
}

module.exports = ConvertES5Plugin;

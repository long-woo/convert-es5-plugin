import acorn from 'acorn';
import { Compiler, compilation as webpackCompilation } from 'webpack';
import { ConcatSource } from 'webpack-sources'
import { version } from '../package.json';

class ConvertES5Plugin {
  private readonly pluginName = 'ConvertES5Plugin'

  /**
   * 优化 js 资源。分析 js 语法，将 es6+ 不兼容低版本浏览器的语法，通过 babel 转换成 es5
   * @param chunks - 所有文件块
   * @param compilation - 编译
   */
  private optimizeJSChunkAssets(chunks: Array<webpackCompilation.Chunk>, compilation: webpackCompilation.Compilation) {
    chunks.map(chunk => {
      chunk.files.map(file => {
        if (!/\.(m?)js/i.test(file)) return;

        let transformFile;
        const code = new ConcatSource(compilation.assets[file]).source();
        // const ast = require('@babel/parser').parse(code, { sourceType: 'module' })

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
          presets: [
            [
              '@babel/preset-env',
              {
                corejs: 3,
                useBuiltIns: 'usage',
                targets: '> 1%, last 2 versions, not ie <= 8'
              }
            ]
          ],
          configFile: false
          // plugins: [['@babel/plugin-transform-runtime', {
          //   corejs: 3
          // }]]
          // compact: false,
          // minified: false
        });

        compilation.assets[file] = new ConcatSource(output?.code as string);
        console.log(`✅ [${file}] 转换成功\n`);
      });
    });
  }

  apply(compiler: Compiler) {
    // const { entry } = compiler.options;

    compiler.hooks.entryOption.tap(this.pluginName, (context, entry) => {
      compiler.options.entry = ['core-js/stable', 'regenerator-runtime/runtime', entry]
    });
    compiler.hooks.compilation.tap(this.pluginName, compilation => {
      // if(devtool === 'source-map' || devtool === 'cheap-source-map') {
      //   compilation.hooks.buildModule.tap(this.pluginName, mod => {
      //     mod.useSourceMap = true;
      //   });
      // }

      // 重新生成 contenthash
      const { mainTemplate } = compilation;
      mainTemplate.hooks.hashForChunk.tap(this.pluginName, (hash, chunk) => {
        hash.update(this.pluginName);
        hash.update(JSON.stringify({
          convertES5: version
        }));
      });

      // 处理输出资源
      compilation.hooks.optimizeChunkAssets.tapAsync(this.pluginName, (chunks, callback) => {
        this.optimizeJSChunkAssets(chunks, compilation);
        callback();
      });
    });
  }
}

module.exports = ConvertES5Plugin;

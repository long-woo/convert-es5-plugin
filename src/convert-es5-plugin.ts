import fs from 'fs';
import acorn from 'acorn';
import { Compiler, compilation as webpackCompilation, Stats } from 'webpack';
import { ConcatSource } from 'webpack-sources'

import { version } from '../package.json';
import { ConvertDependency } from './dependency';

class ConvertES5Plugin {
  private readonly pluginName = 'ConvertES5Plugin'

  /**
   * 分析语法为 ES5
   * @param code 代码
   */
  private isES5(code: string): boolean {
    try {
      acorn.parse(code, { ecmaVersion: 5 });
    } catch (err) {
      return false;
    }

    return true;
  }

  private transform(code: string): string {
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
      // compact: false,
      // minified: false
    });
    
    return output.code;
  }

  /**
   * 优化 js 资源。分析 js 语法，将 es6+ 不兼容低版本浏览器的语法，通过 babel 转换成 es5
   * @param chunks - 所有文件块
   * @param compilation - 编译
   */
  private optimizeJSChunkAssets(chunks: Array<webpackCompilation.Chunk>, compilation: webpackCompilation.Compilation) {
    chunks.map(chunk => {
      chunk.files.map(file => {
        if (!/\.(m?)js$/i.test(file)) return;

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
          // compact: false,
          // minified: false
        });

        compilation.assets[file] = new ConcatSource(output?.code as string);
        console.log(`✅ [${file}] 转换成功\n`);
      });
    });
  }

  apply(compiler: Compiler) {
    // 入口配置
    // compiler.hooks.entryOption.tap(this.pluginName, (context, entry) => {
    //   compiler.options.entry = ['core-js/stable', 'regenerator-runtime/runtime', entry]
    // });

    compiler.hooks.thisCompilation.tap(this.pluginName, compilation => {
      console.log('thisCompilation');
      // compilation.hooks.normalModuleLoader.tap(this.pluginName, (loaderContext, mod) => {
      //   // if(!/node_modules\/node-rsa/.test(loaderContext)) return
      //   console.log(mod);
      //   throw new Error('')
      // });
      // @ts-ignore
      // compilation.dependencyTemplates.set(ConvertDependency, new ConvertDependency.Template());
      compilation.hooks.buildModule.tap(this.pluginName, mod => {
        console.log('buildModule')
        // @ts-ignore
        const resource = mod.resource;
        console.log(mod);
        if (!/\/node_modules\//.test(resource) || !/\.(m?)js$/i.test(resource)) return;
        console.log(resource);
        console.log(mod);
        // const code = fs.readFileSync(resource, 'utf-8')
        // // const code = new ConcatSource(mod._source).source();
        // console.log(`🔍 [${resource}] 分析语法...`);
        
        // if (this.isES5(code)) return;
        // console.log(`🚗 [${resource}] 存在 ES6+ 的语法，正在转换...`);
        // const newCode = this.transform(code);
        // console.log(newCode);
        // mod._source = new ConcatSource(newCode).source();
        // // @ts-ignore
        // mod.addDependency(new ConvertDependency(mod));
      });

      // compilation.hooks.seal.tap(this.pluginName, (a) => {
      //   compilation.modules.map(mod => {
      //     // @ts-ignore
      //     const resource = mod.resource;
      //     if (!/\/node_modules\//.test(resource) || !/\.(m?)js$/i.test(resource)) return;

      //     const code = new ConcatSource(mod._source).source();
      //     console.log(`🔍 [${resource}] 分析语法...`);
          
      //     if (this.isES5(code)) return;
      //     console.log(`🚗 [${resource}] 存在 ES6+ 的语法，正在转换...`);
      //     const newCode = this.transform(code);

      //     mod._source = new ConcatSource(newCode).source();
      //     // @ts-ignore
      //     // mod.parser.parse(mod._source, {module: mod})
      //     // throw new Error('')
      //     // @ts-ignore
      //     mod.addDependency(new ConvertDependency(mod));
      //   })
      // })
    });

    compiler.hooks.compilation.tap(this.pluginName, (compilation, { normalModuleFactory }) => {
      // console.log('compilation');
      // 重新生成 contenthash
      // const { mainTemplate } = compilation;
      // mainTemplate.hooks.hashForChunk.tap(this.pluginName, (hash, chunk) => {
      //   hash.update(this.pluginName);
      //   hash.update(JSON.stringify({
      //     convertES5: version
      //   }));
      // });

      // 处理输出资源
      // compilation.hooks.optimizeChunkAssets.tapAsync(this.pluginName, (chunks, callback) => {
      //   console.log('optimizeChunkAssets')
      //   // this.optimizeJSChunkAssets(chunks, compilation);
      //   callback();
      // });

      // const hander = (parser: webpackCompilation.normalModuleFactory.Parser) => {
      //   console.log(parser)
      // }

      // normalModuleFactory.hooks.parser.for('javascript/auto').tap(this.pluginName, hander)
    });
  }
}

export { ConvertES5Plugin };

import webpack, { compilation as webpackCompilation } from 'webpack';
import { ReplaceSource } from 'webpack-sources';
// @ts-ignore
// const Dependency = require('webpack/lib/Dependency');

class ConvertDependencyTemplate {
  apply(dependency: ConvertDependency, source: ReplaceSource) {
    console.log(dependency.module._source)
    throw new Error('')
    // source.replace(0, 0, dependency._source)
  }
}

// @ts-ignore
export class ConvertDependency extends webpack.Dependency {
  static Template = ConvertDependencyTemplate;

  constructor(readonly module: webpackCompilation.Module) {
    super();
  }
}

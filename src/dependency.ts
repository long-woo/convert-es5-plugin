import webpack, { compilation as webpackCompilation } from 'webpack';
import { ReplaceSource, ConcatSource } from 'webpack-sources';

class ConvertDependencyTemplate {
  apply(dependency: ConvertDependency, source: ReplaceSource) {
    const newSource = new ConcatSource(dependency.module._source).source()
    // console.log(newSource);
    // throw new Error('123');
    // source.replace(0, 0, newSource)
  }
}

// @ts-ignore
export class ConvertDependency extends webpack.Dependency {
  static Template = ConvertDependencyTemplate;

  constructor(readonly module: webpackCompilation.Module) {
    super();
  }
}

import { compilation as webpackCompilation } from 'webpack'
import Dependency from 'webpack/lib/Dependency';

class ConvertDependency extends Dependency {
  constructor(private readonly module: webpackCompilation.Module) {
    super();
  }

  Template () {
    
  }
}

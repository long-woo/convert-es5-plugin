import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import progress from 'rollup-plugin-progress';

import pkg from './package.json';

/**
 * 文件的绝对路径
 * @param {*} p 目录名
 */
const pathResolve = p => path.resolve(__dirname, p);

/**
 * 文件头说明
 * @param {*} name 包名
 * @param {*} fileName 文件名
 * @param {*} version 版本号
 */
const generateBanner = (name, fileName, version) => {
  const currentYear = new Date().getFullYear();
  const year = currentYear === 2020 ? '2020' : `2020-${currentYear}`;

  return `/*! **************************************************
** ${name}(${fileName}) version ${version}
** (c) ${year} long.woo
** https://github.com/long-woo/convert-es5-plugin
*************************************************** */\n`;
};

const buildFormat = fileName => ({
  cjs: {
    outFile: `${fileName}.js`,
    format: 'cjs',
    mode: 'development'
  },
  'cjs-prod': {
    outFile: `${fileName}.min.js`,
    format: 'cjs',
    mode: 'production'
  },
  es: {
    outFile: `${fileName}.es.js`,
    format: 'es',
    mode: 'development'
  },
  'es-prod': {
    outFile: `${fileName}.es.min.js`,
    format: 'es',
    mode: 'production'
  }
});

/**
 * 获取配置
 * @param {*} param
 * outFile 输出文件名
 * format 编译文件类型
 * mode 编译环境
 */
const getConfig = ({ outFile, format, mode }) => {
  const isProduction = mode === 'production';

  const version = pkg.version;
  const external = Object.keys(pkg.dependencies || '');

  const globals = external.reduce((prev, current) => {
    prev[current] = current;

    return prev;
  }, {});

  return {
    input: pathResolve(`src/convert-es5-plugin.ts`),
    output: {
      file: pathResolve(`dist/${outFile}`),
      banner: generateBanner(pkg.name, outFile, version),
      globals,
      format,
      exports: format !== 'es' ? 'named' : 'auto'
    },
    plugins: [
      typescript({
        exclude: 'node_modules/**',
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true
      }),
      resolve(),
      json(),
      buble({
        exclude: 'node_modules/**'
      }),
      isProduction && terser(),
      progress()
    ],
    external
  };
};

const build = () => {
  const format = buildFormat(pkg.displayName);
  return Object.keys(format).map(key => getConfig(format[key]));
};

const buildConfig = build();

export default buildConfig;

/* eslint-disable import/no-dynamic-require */
import os from 'os';
import { execSync } from 'child_process';
import { copySync, removeSync } from 'fs-extra';
import { zip } from './zip';
import { join } from 'path';
import { argv } from 'yargs';
import { ensureRm, fsp } from '../src/base/common/utils/fs';

// 原生组件的列表和对应的文件名称。
// key 是包名， value 是编译产物名
export const nativeNodeNameDict = {
  'node-pty': 'pty',
  'nsfw': 'nsfw',
  'spdlog': 'spdlog',
  'keytar': 'keytar',
  'better-sqlite3': 'better_sqlite3',
};

const modules = Object.keys(nativeNodeNameDict);
const modulePath = process.env.NATIVE_MODULE_PATH || '..';
const nativeModules = modules.map((name: string) => join(__dirname, modulePath, 'node_modules', name));

let commands: string[] = [];

const target = (argv.target as string) || 'node';
const arch = argv.arch || os.arch();
const nodeGypBinPath = join(__dirname, '../node_modules/.bin/node-gyp');
let version: string;

if (target === 'electron') {
  version = argv.electronVersion || require('electron/package.json').version;

  console.log(`rebuilding native for electron version ${version}`);

  commands = [
    nodeGypBinPath,
    'rebuild',
    `--target=${version}`,
    `--arch=${arch}`,
    '--dist-url=https://electronjs.org/headers',
  ];
} else if (target === 'node') {
  console.log(`rebuilding native for node version ${process.version}`);

  version = process.version;

  commands = [nodeGypBinPath, 'rebuild'];
} else {
  version = '';
}

async function rebuildModule(modulePath: string, type: string, version: string) {
  const info = require(join(modulePath, './package.json'));
  console.log(`rebuilding ${info.name}`);
  const cache = getBuildCacheDir(modulePath, type, version, target);
  if ((await fsp.access(cache)) && !argv['force-rebuild']) {
    const buildPath = join(modulePath, 'build');
    console.log(`cache found for ${info.name}`);
    console.log('copy to', buildPath);
    await ensureRm(buildPath);
    copySync(cache, buildPath);
  } else {
    const command = commands.join(' ');
    console.log(command);
    execSync(command, {
      cwd: modulePath,
      // env: {
      //   ...process.env,
      //   HOME: target === 'electron' ? '~/.electron-gyp' : undefined,
      // }
    });
    removeSync(cache);
    copySync(join(modulePath, 'build'), cache);
  }

  console.log('[debug] from:', cache, join(modulePath, 'build'));

  return cache;
}

function getBuildCacheDir(modulePath: string, type: string, version: string, target: string) {
  const info = require(join(modulePath, './package.json'));
  return join(os.tmpdir(), 'ide_build_cache', target, `${info.name}-${info.version}`, `${type}-${version}`);
}

(async function main() {
  const buildTargetList = await Promise.all(nativeModules.map((path) => rebuildModule(path, target, version)));

  if (argv.package) {
    const packageVersion = 'v1';
    const fileList = buildTargetList.map((path, index) =>
      join(path, 'Release', `${nativeNodeNameDict[modules[index]]}.node`));

    const zipFilePath = join(
      __dirname,
      `../build/native/native-${target}-${version || 'unknown'}-${arch}-${packageVersion}.zip`,
    );
    await zip(zipFilePath, fileList);
    console.log(`打包完成: ${zipFilePath}`);
  }
}());

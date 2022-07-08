import { resolve, join } from 'path';
import { spawn } from 'child_process';
import { fsp } from '../src/base/common/utils/fs';

interface runOptions {
  ignoreOutput?: boolean
  level?: number
  cwd?: string
  yesAll?: boolean // 对所有选择都选择 Yes
}

interface zipOptions extends runOptions {
  excludes?: string[]
}

interface unzipOptions extends runOptions { }

const unzipOptionsDefault: unzipOptions = {
  yesAll: true,
};

function getRelativePath() {
  if (process.env.USE_SYSTEM_7ZA === 'true') {
    return '7za';
  }

  if (process.platform === 'darwin') {
    return join('mac', '7za');
  } if (process.platform === 'win32') {
    return join('win', process.arch, '7za.exe');
  }
  return join('linux', process.arch, '7za');

}

function getBinPath() {
  const bin = resolve((process as any).resourcesPath || '', 'node_modules/7zip-bin', getRelativePath());
  if (fsp.existsSync(bin)) {
    return bin;
  }
  return require('7zip-bin').path7za;
}

function run(args: string[], options?: runOptions) {
  const bin = getBinPath();
  const opts: runOptions = { ignoreOutput: true, level: 2, ...options };

  const spawnOpts: any = {};
  if (opts.cwd) {
    spawnOpts.cwd = opts.cwd;
  }
  if (opts.yesAll) {
    args.unshift('-y');
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, spawnOpts);
    let output = '';
    proc.on('error', (err) => {
      reject(err);
    });
    proc.on('exit', (code: number) => {
      if (code > 0) {
        reject(new Error(`Exited with code ${code}`));
      } else {
        resolve(output);
      }
    });
    proc.stderr.on('data', (chunk) => {
      console.error(chunk.toString());
    });
    proc.stdout.on('data', (chunk) => {
      console.log(chunk.toString());
      if (!opts.ignoreOutput) {
        output += chunk.toString();
      }
    });
  });
}

/**
 * 对一个文件夹压缩为zip文件
 * @param zipPath string
 * @param srcDirPath string
 * @param options zipOptions
 */
export async function zip(zipPath: string, srcDirPaths: string[], options: zipOptions = {}) {
  const cmd = ['a', '-tzip', zipPath];
  if (options.excludes) {
    options.excludes.forEach((pattern) => {
      cmd.push(`-xr!${pattern}`);
    });
  }
  return run(cmd.concat(srcDirPaths), options);
}

/**
 * 解压 zip 文件
 * @param zipPath string
 * @param outputDir string
 * @param options unzipOptions
 */
export async function unzip(zipPath: string, outputDir: string, options: unzipOptions = {}) {
  options = { ...unzipOptionsDefault, ...options };
  const cmd = ['x', `${resolve(zipPath)}`, `-o${resolve(outputDir)}`];
  return run(cmd, options);
}

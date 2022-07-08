import path from 'path';
import type { PathLike, OpenMode } from 'fs';
import fs, { promises as fsPromises, createWriteStream, createReadStream, constants } from 'fs';
import { promisify } from 'util';

export type { PathLike } from 'fs';

export const readdir = promisify(fs.readdir);

export const { readdirSync } = fs;

export const { existsSync } = fs;

export const rename = promisify(fs.rename);

export const { readFileSync } = fs;

export function rmSync(destPath: PathLike) {
  const stat = fs.lstatSync(destPath);
  if (stat.isDirectory()) {
    fs.rmdirSync(destPath, { recursive: true });
  } else {
    fs.unlinkSync(destPath);
  }
}

export async function rm(destPath: PathLike) {
  const stat = await fsPromises.lstat(destPath);
  if (stat.isDirectory()) {
    await fsPromises.rmdir(destPath, { recursive: true });
  } else {
    await fsPromises.unlink(destPath);
  }
}

interface ReadJsonOptions {
  encoding?: BufferEncoding | null;
  flag?: OpenMode;
  reviver?: (this: any, key: string, value: any) => any;
}

export async function readJson(destPath: string, options?: ReadJsonOptions) {
  const buffer = await fsPromises.readFile(destPath, {
    encoding: options?.encoding,
    flag: options?.flag,
  });
  return JSON.parse(buffer.toString(), options?.reviver);
}

export async function writeJson(destPath: string, content: any) {
  await ensureDir(path.dirname(destPath));
  return fsPromises.writeFile(destPath, JSON.stringify(content, null, 2));
}

export async function ensureDir(dirPath: string) {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

export interface EnsureRmOptions {
  agent?: (destPath: PathLike) => Promise<void>;
}

export async function ensureRm(targetPath: PathLike, options?: EnsureRmOptions) {
  const agentRm = (options && options.agent) || rm;
  try {
    return await agentRm(targetPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

interface FastRmOptions {
  agent?: (destPath: string) => Promise<void>;
  suffix?: string;
}

async function access(targetPath: PathLike, mode?: number) {
  return fsPromises
    .access(targetPath, mode)
    .then(() => true)
    .catch(() => false);
}

/**
 * 快速删除，原理是重命名文件，然后再删除
 * @param targetPath
 * @param options
 * @returns
 */
export async function fastRm(targetPath: string, options?: FastRmOptions) {
  const agentRm = (options && options.agent) || rm;
  if (!(await access(targetPath))) {
    return;
  }
  const suffixStr = options?.suffix || Math.random().toString(16).slice(2, 10);
  const destPath = `${targetPath}_${suffixStr}`;
  await fsPromises.rename(targetPath, destPath);
  agentRm(destPath);
}

export const fsp = {
  readdirSync,
  readFileSync,
  existsSync,
  rmSync,
  createReadStream,
  createWriteStream,
  constants,
  ...fsPromises,
  access,
  readJson,
  writeJson,
};

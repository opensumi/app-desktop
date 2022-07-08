import fs, { PathLike } from 'original-fs';
import { promisify } from 'util';

/**
 * 用于删除包含 asar 的目录，或者删除目录失败的方法
 */
export function rmSync(destPath: string) {
  const stat = fs.lstatSync(destPath);
  if (stat.isDirectory()) {
    fs.rmdirSync(destPath, { recursive: true });
  } else {
    fs.unlinkSync(destPath);
  }
}

const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const lstat = promisify(fs.lstat);

export async function rm(destPath: PathLike) {
  const stat = await lstat(destPath);
  if (stat.isDirectory()) {
    await rmdir(destPath, { recursive: true });
  } else {
    await unlink(destPath);
  }
}
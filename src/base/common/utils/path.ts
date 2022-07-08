import { URI } from '@opensumi/ide-utils/lib/uri';
import { isDev } from './env';

/**
 * 获取软件的 resources 路径
 * tips: 这个方法有一定的局限，比如在 node 进程就会失效，所以在 main 进程初始化的时候，把路径放在了 process.env.resourcesPath
 * 1. mac: /Applications/XXX.app/Contents/Resources/
 * 2. windows: %HOMEPATH%\AppData\
 * 3. dev project: /Users/projects/opensumi/app-desktop
 */
export const getAppResourcePath = () => {
  if (isDev) {
    return URI.file(__dirname).resolve('../..').codeUri.fsPath;
  }
  return process.resourcesPath;
};

export const extensionPath = () => URI.file(process.env.resourcesPath || '').resolve('extensions').codeUri.fsPath;

export const getCandidateExtensionPath = () =>
  URI.file(process.env.resourcesPath || '').resolve('candidate-extensions').codeUri.fsPath;

/**
 * 根据给出的路径和 home 路径，计算缩略显示的路径
 * @param fileUriStringOrPath 指定路径
 * @param homePath home 路径
 * @returns 路径信息
 */
export const getRelativeHomePathInfo = (fileUriStringOrPath: string, homePath: string) => {
  const fileUri = URI.isUriString(fileUriStringOrPath) ? URI.parse(fileUriStringOrPath) : URI.file(fileUriStringOrPath);
  const filePath = fileUri.codeUri.fsPath;
  return {
    displayName: fileUri.displayName,
    fsPath: fileUri.codeUri.fsPath,
    description: filePath.indexOf(homePath) === 0 ? filePath.replace(homePath, '~') : filePath,
  };
};

export const DEFAULT_STORAGE_DIR_NAME = isDev ? '.sumi-dev' : '.sumi';
export const DEFAULT_USER_PREFERENCE_DIR_NAME = isDev ? '.sumi-dev' : '.sumi';
export const DEFAULT_WORKSPACE_PREFERENCE_DIR_NAME = '.kaitian';
export const DEFAULT_EXTENSION_DIR_NAME = (forceDev = false) => (isDev || forceDev ? '.sumi-dev' : '.sumi');

/**
 * Replace whitespace with `\ `
 * transform /Applications/demo tool.app to /Applications/demo\ tool.app
 */
export function formatWhitespaceInPath(p: string) {
  return p.replace(/ /g, '\\ ');
}

// linux 和 macOS 常见的 bin 路径
export const GENERAL_BIN_PATH = '/usr/local/bin';

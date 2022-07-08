import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { app, globalShortcut } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { MainApp } from './app';
import { isWin } from 'base/common/utils';

export function installDevExtension() {
  [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach((extension) => {
    try {
      installExtension(extension);
    } catch (e) {
      console.error(e);
    }
  });
}

export function getValidWorkspace(dirOrFile: string, pwd?: string) {
  if (!dirOrFile) {
    return null;
  }
  if (!pwd) {
    console.log('Use process env PWD:', process.env.PWD);
    pwd = process.env.PWD;
  }

  let workspace: string | null = null;
  if (path.isAbsolute(dirOrFile) && fs.existsSync(dirOrFile)) {
    workspace = dirOrFile;
  } else if (pwd) {
    workspace = path.join(pwd, dirOrFile);

    if (!fs.existsSync(workspace)) {
      return null;
    }
  } else {
    return null;
  }

  return workspace;
}

export function initElectronEvent(mainApp: MainApp) {
  const { win, logger } = mainApp;

  app.on('will-finish-launching', () => {
    // 通过 dock 拖动打开进入这里
    app.on('open-file', (event, path) => {
      event.preventDefault();
      const workspace = getValidWorkspace(path);
      logger.log('open-file event:', workspace);
      if (workspace) {
        const uri = new URI(workspace).withScheme('file');
        win.uris.add(uri.toString());
        mainApp.start();
      }
    });
  });

  app.on('activate', () => {
    mainApp.start();
  });

  // 第二次启动，进入这里
  app.on('second-instance', (event, argvs, cwd) => {
    logger.debug('second-instance event argvs:', argvs, cwd);
    const { argv } = yargs(argvs);
    // cwd 通过 start.sh 启动是 '/', 当通过 MacOS/XX workspace 运行时，就会是一个正确的值
    // 如果是通过命令行打开， argvs: ["/Applications/XXX.app/Contents/MacOS/XX","arg1", ...args]
    if (argvs.length >= 1) {
      const pwd = cwd !== '/' ? cwd : (argv.pwd as string);
      // 有可能用户没有提供 workspace 路径，只提供了参数启动，这个时候 workspace 就应该空
      const workspace = argvs.length > 1 ? getValidWorkspace(argvs[argvs.length - 1], pwd) : '';
      logger.log('second-instance event:', workspace);

      const gotoInfo = argv.goto ? (argv.goto as string) : null;
      if (gotoInfo) {
        mainApp.win.gotoInfos.add(gotoInfo);
        if (!workspace) {
          mainApp.start();
          return;
        }
      }

      if (workspace) {
        win.uris.add(URI.file(workspace).toString());
        mainApp.start();
        return;
      }
    }
    if (isWin) {
      win.openDashboard();
      return;
    }
    // 当运行第二个实例时,将会聚焦到窗口
    const focusWindow = win.recentlyFocusWindow();
    if (!focusWindow) {
      mainApp.start();
      return;
    }
    if (focusWindow.browser.isMinimized()) {
      focusWindow.browser.restore();
    }
    focusWindow.browser.show();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
    app.quit();
  });

  app.on('before-quit', async (e) => {
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    mainApp.stop();
  });

  app.on('quit', () => {
    logger.log('Application quit');
  });

  process.on('uncaughtException', (err) => {
    console.log('====> Error <====');
    console.error(err);
    logger.error(err);
  });

  app.on('render-process-gone', (_event, webContents, details) => {
    logger.error(`render-process-gone ${details.reason}, ${JSON.stringify((webContents as any).history)}`);
  });
}

/**
 * 单例模式
 */
export function requireSingleton() {
  const gotTheLock = app.requestSingleInstanceLock();
  return !gotTheLock;
}

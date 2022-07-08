import os from 'os';
import path from 'path';
import { argv } from 'yargs';
import { app } from 'electron';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { appId } from 'base/common/constants';
import { isDev } from 'base/common/utils/env';
import { MainApp } from './app';
import { initElectronEvent, getValidWorkspace, requireSingleton } from './electron';
import { DEFAULT_STORAGE_DIR_NAME, getVersions } from 'base/common/utils';

const mainApp = new MainApp();
const { logger } = mainApp;

logger.log('============== New Session ==============');
logger.log(getVersions());
logger.log('Application starting...');
const startTime = Date.now();

// set app cache path
if (isDev) {
  app.setPath('userData', path.join(os.homedir(), DEFAULT_STORAGE_DIR_NAME, '.dev'));
}

// windows taskbar 分组需要运行时设置 appId
app.setAppUserModelId(appId);

// 插件开发模式不需要单例模式
if (requireSingleton()) {
  logger.log('Application require singleton mode.');
  app.quit();
} else {
  initElectronEvent(mainApp);

  mainApp.makeReady();

  app.whenReady().then(() => {
    if (isDev) {
      // installDevExtension();
    }

    // 第一次启动 XXX.app 或者 /Applications/XXX.app/Contents/MacOS/XX 或者 xx workspace 会走这里
    logger.debug('Receive args:', process.argv, process.cwd());
    const workspace = getValidWorkspace(process.argv[1]);
    if (workspace) {
      logger.log('App start with workspace:', workspace);
      mainApp.win.uris.add(URI.file(workspace).toString());
    }

    const gotoInfo = argv.goto ? (argv.goto as string) : null;
    if (gotoInfo) {
      mainApp.win.gotoInfos.add(gotoInfo);
    }

    logger.log(`Start to open window, consuming=${Date.now() - startTime}ms`);
    mainApp.start(true);
  });
}

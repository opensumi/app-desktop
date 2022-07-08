import { join } from 'path';
import { Injector } from '@opensumi/di';
import { URI } from '@opensumi/ide-core-common';
import { ElectronAppConfig, ElectronMainApp } from '@opensumi/ide-core-electron-main';
import type { ElectronMainApp as Editor } from '@opensumi/ide-core-electron-main';
import { WebviewElectronMainModule } from '@opensumi/ide-webview/lib/electron-main';
import { APP_URI_SCHEME, generalTrafficLightPosition } from 'base/common/constants';

interface EditorConfig {
  injector: Injector;
}

let editor: Editor;
const editorPath = '../editor/';

export const editorOptions: ElectronAppConfig = {
  browserNodeIntegrated: true,
  browserUrl: URI.file(join(__dirname, editorPath, './browser/index.html')).toString(),
  modules: [WebviewElectronMainModule],
  nodeEntry: join(__dirname, editorPath, './node/index.js'),
  extensionWorkerEntry: join(__dirname, editorPath, './extension/index.worker.js'),
  extensionEntry: join(__dirname, editorPath, './extension/index.js'),
  webviewPreload: join(__dirname, editorPath, './webview/host-preload.js'),
  extensionDir: join(__dirname, '../../extensions'),
  plainWebviewPreload: join(__dirname, editorPath, './webview/plain-preload.js'),
  browserPreload: join(__dirname, editorPath, './browser/preload.js'),
  extensionCandidate: [],
  overrideWebPreferences: {
    allowRunningInsecureContent: true,
    backgroundThrottling: false,
    contextIsolation: false,
  },
  overrideBrowserOptions: {
    trafficLightPosition: generalTrafficLightPosition,
  },
  uriScheme: APP_URI_SCHEME,
};

export function initEditor(config: EditorConfig) {
  editor = new ElectronMainApp({ ...editorOptions, injector: config.injector });
}

export function getEditor() {
  if (!editor) {
    throw new Error('Editor not initialized');
  }

  return editor;
}

import { BrowserWindow, app, dialog, Menu } from 'electron';
import { Injectable, Autowired } from '@opensumi/di';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { DEFAULT_WORKSPACE_SUFFIX_NAME } from '@opensumi/ide-workspace/lib/common';
import { formatLocalize, localize } from '@opensumi/ide-core-common/lib/localize';

import { isWin } from 'base/common/utils/platform';
import { IMainApp } from 'base/common/types/app';
import { IDialogService, IMenuService, IMetaService, IWindowService } from 'base/common/types/services';
import { BaseService } from 'base/common/services/base';

export interface StorageChange {
  path: string;
  data: string;
}

export interface StringKeyToAnyValue {
  [key: string]: any;
}

@Injectable()
export class MenuService extends BaseService implements IMenuService {
  @Autowired(IMetaService)
  private metaService: IMetaService;

  @Autowired(IWindowService)
  private windowService: IWindowService;

  @Autowired(IDialogService)
  private dialogService: IDialogService;

  @Autowired(IMainApp)
  private mainApp: IMainApp;

  /**
   * 这个方法每创建一个窗口都会被调用一次
   */
  initBaseMenu() {
    this.updateMenu();
  }

  updateMenu() {
    const browser = BrowserWindow.getFocusedWindow();
    if (!browser) {
      return;
    }
    const win = this.windowService.winMap.get(browser.id);
    if (!win || win.name === 'editor') {
      return;
    }

    const template = this.buildMenu();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  buildMenu(): any[] {
    return [
      ...(!isWin ? [{
        label: app.name,
        submenu: [
          {
            label: formatLocalize('core.menubar.about', app.name.toUpperCase()),
            click: async () => {
              const currentWindow = BrowserWindow.getFocusedWindow();
              if (currentWindow) {
                const versionInfo = await this.metaService.versionsInfo();
                dialog.showMessageBoxSync(currentWindow, {
                  message: app.name.toUpperCase(),
                  detail: versionInfo || 'unknown',
                });
              }
            },
          },
          {
            type: 'separator',
          },
          {
            label: localize('core.menubar.openDashboard'),
            click: async () => {
              this.windowService.openDashboard();
            },
            accelerator: 'CmdOrCtrl+Shift+H',
          },
          {
            type: 'separator',
          },
          {
            label: localize('core.menubar.hide'),
            accelerator: 'CmdOrCtrl+H',
            role: 'hide',
          },
          {
            label: localize('core.menubar.hideOthers'),
            role: 'hideothers',
          },
          {
            type: 'separator',
          },
          {
            label: formatLocalize('core.menubar.quit', app.name.toUpperCase()),
            role: 'quit',
          },
        ],
      }] : []),
      {
        label: localize('explorer.title'),
        submenu: [
          {
            label: localize('core.menubar.file.openFolder'),
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const browserWindow = BrowserWindow.getFocusedWindow();
              const paths = await this.dialogService.showOpenDialog({
                title: localize('core.menubar.file.openProject'),
                properties: [
                  'openDirectory',
                  'createDirectory',
                ],
              }, browserWindow && browserWindow.id || undefined);

              if (paths && paths.length > 0) {
                this.windowService.openEditor(URI.file(paths[0]).codeUri.fsPath);
              }
            },
          },
          {
            label: localize('core.menubar.file.openWorkspace'),
            click: async () => {
              this.dialogService.showOpenDialog({
                title: localize('core.file.openWorkspace'),
                properties: [
                  'openFile',
                ],
                filters: [{
                  name: localize('workspace.openWorkspaceTitle'),
                  extensions: [DEFAULT_WORKSPACE_SUFFIX_NAME],
                }],
              }).then((paths) => {
                if (paths && paths.length > 0) {
                  this.windowService.openEditor(paths[0]);
                }
              });
            },
          },
          {
            type: 'separator',
          },
          {
            label: localize('core.menubar.windowClose'),
            accelerator: 'CmdOrCtrl+W',
            click: async () => {
              this.windowService.closeDashboard();
            },
          },
        ],
      },
      {
        label: localize('core.edit'),
        submenu: [
          {
            label: localize('core.edit.undo'),
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo',
          },
          {
            label: localize('core.edit.redo'),
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo',
          }, {
            type: 'separator',
          }, {
            label: localize('core.edit.cut'),
            accelerator: 'CmdOrCtrl+X',
            role: 'cut',
          }, {
            label: localize('core.edit.copy'),
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          }, {
            label: localize('core.edit.paste'),
            accelerator: 'CmdOrCtrl+V',
            role: 'paste',
          }, {
            label: localize('core.edit.selectAll'),
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall',
          },
        ],
      },
      {
        label: localize('core.menubar.help'),
        submenu: [
          {
            label: localize('core.menubar.toggleDevTools'),
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.toggleDevTools();
              }
            },
          },
          {
            label: localize('core.menubar.reload'),
            role: 'reload',
          },
        ],
      },
    ];
  }
}

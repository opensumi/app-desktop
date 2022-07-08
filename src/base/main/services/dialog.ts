import { Autowired, Injectable } from '@opensumi/di';
import {
  MessageBoxOptions,
  BrowserWindow,
  dialog,
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxSyncOptions,
} from 'electron';
import { IDialogService, ILoggerService } from 'base/common/types/services';
import { BaseService } from 'base/common/services/base';

@Injectable()
export class DialogService extends BaseService implements IDialogService {
  @Autowired(ILoggerService)
  private logger: ILoggerService;

  getBrowserWindow(winId?: number) {
    if (winId) {
      return BrowserWindow.fromId(winId);
    }
    return null;
  }

  async showOpenDialog(options: OpenDialogOptions, winId?: number) {
    let result: Electron.OpenDialogReturnValue;
    const win = this.getBrowserWindow(winId);
    if (win) {
      result = await dialog.showOpenDialog(win, options);
    } else {
      result = await dialog.showOpenDialog(options);
    }

    if (result.canceled) {
      return;
    }
    return result.filePaths;
  }

  async showSaveDialog(options: SaveDialogOptions, winId?: number) {
    let result: Electron.SaveDialogReturnValue;
    const win = this.getBrowserWindow(winId);
    if (win) {
      result = await dialog.showSaveDialog(win, options);
    } else {
      result = await dialog.showSaveDialog(options);
    }

    if (result.canceled) {
      return;
    }
    return result.filePath;
  }

  showMessageBoxSync(options: MessageBoxSyncOptions, winId?: number) {
    const win = this.getBrowserWindow(winId);
    if (win) {
      return dialog.showMessageBoxSync(win, options);
    }
    return dialog.showMessageBoxSync(options);
  }

  async showMessageBox(options: MessageBoxOptions, winId?: number) {
    const win = this.getBrowserWindow(winId);
    if (win) {
      return dialog.showMessageBox(win, options);
    }
    return dialog.showMessageBox(options);
  }
}

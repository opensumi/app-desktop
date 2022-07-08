import { app, Menu } from 'electron';
import { Injectable, Autowired } from '@opensumi/di';
import { isMac } from 'base/common/utils/platform';
import { IWindowService, IDockService } from 'base/common/types/services';
import { BaseService } from 'base/common/services/base';

@Injectable()
export class DockService extends BaseService implements IDockService {
  @Autowired(IWindowService)
  private win: IWindowService;

  private unsubscribe: () => void;

  async onReady() {
    if (!isMac) {
      return;
    }

    const dockMenu = Menu.buildFromTemplate([
      {
        label: '应用管理',
        click: () => {
          this.win.openDashboard();
        },
      },
    ]);
    app.dock.setMenu(dockMenu);
  }

  async dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

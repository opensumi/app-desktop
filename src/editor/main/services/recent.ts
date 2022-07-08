import { Injector, Injectable, Autowired, INJECTOR_TOKEN } from '@opensumi/di';
import { IMainStorageService, IRecentService } from '../../common/types';
import { Domain } from '@opensumi/ide-core-common';
import {
  ElectronMainApiRegistry,
  ElectronMainContribution,
} from '@opensumi/ide-core-electron-main/lib/bootstrap/types';

@Injectable()
export class RecentService implements IRecentService {
  @Autowired(IMainStorageService)
  private readonly mainStorageService: IMainStorageService;

  async recentWorkspaces() {
    try {
      const data = await this.mainStorageService.getItem('recent');
      console.log('data', data);
      const workspaces = JSON.parse(data.RECENT_WORKSPACES);
      return workspaces;
    } catch (error) {
      return [];
    }
  }
}

@Domain(ElectronMainContribution)
export class RecentContribution implements ElectronMainContribution {
  @Autowired(INJECTOR_TOKEN)
  injector: Injector;

  registerMainApi(registry: ElectronMainApiRegistry) {
    registry.registerMainApi(IRecentService, this.injector.get(IRecentService));
  }
}

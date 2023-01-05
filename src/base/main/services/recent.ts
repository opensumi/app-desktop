import { Injectable, Autowired } from '@opensumi/di';
import { BaseService } from 'base/common/services/base';
import { IMainStorageService, IRecentService } from 'base/common/types/services';

@Injectable()
export class RecentService extends BaseService implements IRecentService {
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

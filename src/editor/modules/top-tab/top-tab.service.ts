import { Injectable, Autowired } from '@opensumi/di';
import { TabbarService, TabbarServiceFactory } from '@opensumi/ide-main-layout/lib/browser/tabbar/tabbar.service';

@Injectable()
export class TopTabService {
  @Autowired(TabbarServiceFactory)
  private tabbarServiceFactory: (side: string) => TabbarService;

  private _leftTabBarService: TabbarService;

  private _rightTabBarService: TabbarService;

  constructor() {
    this.initTabBarService();
  }

  async initTabBarService() {
    this._leftTabBarService = this.tabbarServiceFactory('left');
    this._rightTabBarService = this.tabbarServiceFactory('right');
  }

  get leftTabBarService() {
    return this._leftTabBarService;
  }

  get rightTabBarService() {
    return this._rightTabBarService;
  }
}

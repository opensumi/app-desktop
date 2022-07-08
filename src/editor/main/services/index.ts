import { Injectable } from '@opensumi/di';
import { ElectronMainModule } from '@opensumi/ide-core-electron-main/lib/electron-main-module';
import { IMainStorageService, IRecentService } from '../../common/types';
import { RecentContribution, RecentService } from './recent';
import { MainStorageContribution, MainStorageService } from './storage';

@Injectable()
export class MainModule extends ElectronMainModule {
  providers = [
    {
      token: IMainStorageService,
      useClass: MainStorageService,
    },
    {
      token: IRecentService,
      useClass: RecentService,
    },
    MainStorageContribution,
    RecentContribution,
  ];
}

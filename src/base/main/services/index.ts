import { WindowService } from './window';
import { DialogService } from './dialog';
import { DockService } from './dock';
import { LoggerService } from './logger';
import { MetaService } from './meta';
import { EventService } from './event';
import { MenuService } from './menu';

import {
  ILoggerService,
  IDockService,
  IDialogService,
  IWindowService,
  IMetaService,
  IEventService,
  IMenuService,
} from 'base/common/types/services';
import { IMainStorageService, IRecentService } from 'editor/common/types';
import { RecentService } from 'editor/main/services/recent';
import { MainStorageService } from 'editor/main/services/storage';

export const serviceProviders = [
  { token: ILoggerService, useClass: LoggerService },
  { token: IEventService, useClass: EventService },
  { token: IMenuService, useClass: MenuService },
  { token: IWindowService, useClass: WindowService },
  { token: IDialogService, useClass: DialogService },
  { token: IMetaService, useClass: MetaService },
  { token: IDockService, useClass: DockService },
  { token: IMainStorageService, useClass: MainStorageService },
  { token: IRecentService, useClass: RecentService },
];

// 支持 ipc 远程调用的列表
export { mainApiList } from 'base/common/constants';

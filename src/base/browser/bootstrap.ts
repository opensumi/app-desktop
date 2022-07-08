import { Injector, Provider } from '@opensumi/di';
import { URI } from '@opensumi/ide-utils/lib/uri';

import { mainApiList } from 'base/common/constants';
import {
  EventService,
  IEventService,
} from './services';
import { createElectronMainApi } from './helper/electron';

const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
window.id = Number(urlParams.get('windowId'));
window.webContentsId = Number(urlParams.get('webContentsId'));
window.metadata = { ...window.metadata, ...JSON.parse(urlParams.get('metadata') || '{}') };

// 初始 injector 注入
const mainProviders: Provider[] = [
  ...mainApiList.map((token) => ({ token, useValue: createElectronMainApi(token) })),
  ...[{ token: IEventService, useClass: EventService }],
];
const injector = new Injector(mainProviders);
window.injector = injector; // 注：测试用
window.URI = URI; // 注：测试用

// 监听 metadata 的变动
const eventService: IEventService = injector.get(IEventService);
eventService.on('metadata', (e, metadata) => {
  console.log('reset window.metadata');
  if (metadata) {
    window.metadata = { ...window.metadata, ...metadata };
  }
});


/**
 * 所有窗口启动的基础服务
 * @param options BootstrapOptions
 */
export async function bootstrap() {
  return { injector };
}

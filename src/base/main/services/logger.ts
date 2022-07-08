import { Injectable } from '@opensumi/di';
import { SupportLogNamespace, LogLevel, DebugLog } from '@opensumi/ide-core-common/lib/log';
import { AbstractBaseLoggerService } from 'base/common/services/base-logger';
import { ILoggerService } from 'base/common/types/services';

@Injectable()
export class LoggerService extends AbstractBaseLoggerService implements ILoggerService {

  protected namespace = SupportLogNamespace.Main;

  protected debugLog = new DebugLog(SupportLogNamespace.Main);

  async onReady() {
    if (process.env.SUMI_DEBUG === 'true') {
      process.env.KTLOG_SHOW_DEBUG = 'true';
      this.setLevel(LogLevel.Verbose);
    }

    // 等待 node 进程的日志服务准备好后，再启动日志服务
    this.deferred.resolve();
  }
}

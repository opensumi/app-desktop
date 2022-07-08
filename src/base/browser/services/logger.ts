import { Injectable } from '@opensumi/di';
import { DebugLog, ILogger, LogLevel, SupportLogNamespace } from '@opensumi/ide-core-common/lib/log';
import { AbstractBaseLoggerService } from 'base/common/services/base-logger';

@Injectable()
export class LoggerService extends AbstractBaseLoggerService implements ILogger {

  protected namespace = SupportLogNamespace.Browser;

  protected debugLog = new DebugLog(SupportLogNamespace.Browser);

  constructor() {
    super();
    if (typeof process !== 'undefined') {
      this.pid = process.pid;

      if (process.env.SUMI_DEBUG === 'true') {
        this.setLevel(LogLevel.Verbose);
      }
    }

    this.debug(`${this.namespace} logger is ready!`);
    this.deferred.resolve();
  }
}

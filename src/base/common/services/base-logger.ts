import { Injectable } from '@opensumi/di';
import { format } from '@opensumi/ide-logs/lib/common';
import { Deferred } from '@opensumi/ide-utils';
import { DebugLog, ILogger, LogLevel } from '@opensumi/ide-core-common/lib/log';
import { BaseService } from 'base/common/services/base';
// import

/**
 * 基础日志类，适用于各个进程
 * 注意 各个继承类的 deferred 需要被 resolve
 */
@Injectable()
export abstract class AbstractBaseLoggerService extends BaseService implements ILogger {
  protected pid = -1;

  protected debugLog: DebugLog;

  protected namespace: string;

  protected deferred = new Deferred<void>();

  internalLogService = console;

  constructor() {
    super();

    if (typeof process !== 'undefined') {
      this.pid = process.pid;
    }
  }

  async getLevel() {
    await this.deferred.promise;
    return LogLevel.Info;
  }

  async setLevel(level: LogLevel) {
    await this.deferred.promise;
  }

  async verbose(...args: any[]) {
    this.debugLog.verbose(...args);
    await this.deferred.promise;
    return this.internalLogService.log(this.namespace, format(args), this.pid);
  }

  async debug(...args: any[]) {
    this.debugLog.debug(...args);
    await this.deferred.promise;
    return this.internalLogService.debug(this.namespace, format(args), this.pid);
  }

  async log(...args: any[]) {
    this.debugLog.log(...args);
    await this.deferred.promise;
    return this.internalLogService.log(this.namespace, format(args), this.pid);
  }

  async info(...args: any[]) {
    this.debugLog.log(...args);
    await this.deferred.promise;
    return this.internalLogService.log(this.namespace, format(args), this.pid);
  }

  async warn(...args: any[]) {
    this.debugLog.warn(...args);
    await this.deferred.promise;
    return this.internalLogService.warn(this.namespace, format(args), this.pid);
  }

  async error(...args: any[]) {
    this.debugLog.error(...args);
    await this.deferred.promise;
    return this.internalLogService.error(this.namespace, format(args), this.pid);
  }

  async critical(...args: any[]) {
    await this.deferred.promise;
    return this.internalLogService.log(this.namespace, format(args), this.pid);
  }
}

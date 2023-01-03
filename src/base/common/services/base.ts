import { Deferred } from '@opensumi/ide-utils';

export abstract class BaseService {
  public readyCompletedDeferred = new Deferred<void>();

  async onReady(): Promise<any> {
    // implement this
  }

  async makeReadyCompleted() {
    this.readyCompletedDeferred.resolve();
  }

  async whenReadyCompleted() {
    return this.readyCompletedDeferred.promise;
  }

  async dispose(): Promise<void> {
    // implement this
  }
}

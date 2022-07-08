import { Autowired, Injectable } from '@opensumi/di';
import { Deferred } from '@opensumi/ide-utils/lib/promise-util';
import { IMetaService, ILoggerService } from 'base/common/types/services';
import { BaseService } from 'base/common/services/base';
import { isDev } from 'base/common/utils/env';
import { getVersions } from 'base/common/utils/versions';
import { APP_NAME } from 'base/common/constants';

@Injectable()
export class MetaService extends BaseService implements IMetaService {
  @Autowired(ILoggerService)
  logger: ILoggerService;

  private rpcListenPath: string | null;

  private deferred = new Deferred<boolean>();

  async onReady() {
    this.deferred.resolve(true);
  }

  setRpcListenPath(value: string) {
    this.rpcListenPath = value;
  }

  getDisplayName(): string {
    if (isDev) {
      return `${APP_NAME}-dev`;
    }
    return APP_NAME;
  }

  async meta() {
    await this.deferred.promise;
    return {
      versions: getVersions(),
      rpcListenPath: this.rpcListenPath,
    };
  }

  async versionsInfo() {
    const ver = getVersions();
    return `Type: ${ver.type}
Version: ${ver.clientVersion}
Commit: ${ver.clientCommit.slice(0, 9)}
Framework version: ${ver.frameworkVersion}
Date: ${ver.timestamp && new Date(ver.timestamp).toLocaleString()}
Electron: ${process.versions.electron}
Chrome: ${process.versions.chrome}
Node.js: ${process.versions.node}
Arch: ${process.arch}
V8: ${process.versions.v8}
OS: ${process.platform}
`;
  }
}

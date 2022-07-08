import { IVersionInfo } from 'base/common/types/services';

declare const WP_VERSIONS_INFO: string;

export const devVersionInfo: IVersionInfo = {
  type: 'Development',
  frameworkVersion: 'dev',
  clientCommit: 'dev',
  clientVersion: 'dev',
  timestamp: Date.now(),
};

let _version: IVersionInfo;

export function getVersions(): IVersionInfo {
  if (_version) {
    return _version;
  }
  try {
    _version = JSON.parse(WP_VERSIONS_INFO);
    return _version;
  } catch (error) {
    return devVersionInfo;
  }
}

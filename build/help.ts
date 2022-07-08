import path from 'path';
import childProcess from 'child_process';

type BuildEnv = 'development' | 'production' | 'none';

/**
 * buildEnv 只有两个值 production 和 development，buildType 才是三个值
 * @returns 'production' | 'development'
 */
export function buildEnv(): BuildEnv {
  if (['production', 'development'].includes(process.env.NODE_ENV || '')) {
    return process.env.NODE_ENV as BuildEnv;
  }
  if (['production', 'development'].includes(process.env.BUILD_ENV || '')) {
    return process.env.BUILD_ENV as BuildEnv;
  }
  return 'development';
}

export function isDev() {
  return buildEnv() === 'development';
}

export function isProd() {
  return buildEnv() === 'production';
}

export function isBeta() {
  return [process.env.NODE_ENV, process.env.BUILD_ENV].includes('beta');
}

export function buildType() {
  if (isProd()) {
    return 'production';
  }
  if (isBeta()) {
    return 'beta';
  }
  return 'development';
}

const BUILD_TYPE_DISPLAY = {
  production: 'Release',
  beta: 'Beta',
  development: 'Development',
};

/**
 * version info
 */
export function getVersions() {
  const ktPackageInfo = require('@opensumi/ide-core-electron-main/package.json');
  const frameworkVersion = ktPackageInfo.version;
  let clientCommit = '';
  try {
    clientCommit = childProcess
      .execSync('git rev-parse HEAD', {
        cwd: path.join(__dirname, '../'),
      })
      .toString()
      .trim();
  } catch (error) {
    console.log('获取 commit 异常:', error);
  }

  let clientVersion = require('../package.json').version;

  try {
    const iteration = require('../app/iteration.json');
    clientVersion = iteration.version;
  } catch (error) {
    if (isProd() && isBeta()) {
      console.error('获取 iteration.json 异常', error);
    }
  }

  return {
    type: BUILD_TYPE_DISPLAY[buildType()],
    frameworkVersion,
    clientCommit,
    clientVersion,
    timestamp: Date.now(),
  };
}

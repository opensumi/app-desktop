const useNpmMirror = Boolean(process.env.USE_NPM_MIRROR);

const fse = require('fs-extra');
const path = require('path');
const electronBuilder = require('electron-builder');
const rimraf = require('rimraf');

const DEFAULT_TARGET_PLATFORM = process.platform;
// x64 arm64 全部值见 {electronBuilder.Arch}
const TARGET_ARCH = process.env.TARGET_ARCHES || 'x64';
const rootPackage = require('../package.json');

const rootPath = path.join(__dirname, '..');

// disable code sign
process.env.CSC_IDENTITY_AUTO_DISCOVERY = false;

// use double package.json structure, auto handle node_modules
const buildPackageJson = fse.readJSONSync(path.join(rootPath, 'build/package.json'));
buildPackageJson.version = rootPackage.devDependencies.electron;
fse.writeJSONSync(path.join(rootPath, 'app/package.json'), buildPackageJson);

const targetPlatforms = (process.env.TARGET_PLATFORMS || DEFAULT_TARGET_PLATFORM).split(',').map((str) => str.trim());
const targetArches = TARGET_ARCH.split(',').map((str) => str.trim());

const targets = new Map();
if (targetPlatforms.includes('win32')) {
  targets.set(electronBuilder.Platform.WINDOWS, new Map([[electronBuilder.Arch.x64, ['nsis']]]));
}

if (targetPlatforms.includes('darwin')) {
  const archMap = new Map(targetArches.map((v) => [electronBuilder.Arch[v], ['dmg']]));
  // archMap.set(electronBuilder.Arch.universal, ['dmg']);
  targets.set(electronBuilder.Platform.MAC, archMap);
}

const outputPath = path.join(__dirname, `../out/${DEFAULT_TARGET_PLATFORM}-${TARGET_ARCH}`);
rimraf.sync(outputPath);

electronBuilder.build({
  publish: null,
  targets: targets.size ? targets : undefined,
  config: {
    productName: 'App-Desktop',
    npmArgs: useNpmMirror ? ['--registry=https://registry.npmmirror.com'] : [],
    electronVersion: rootPackage.devDependencies.electron,
    extraResources: [
      {
        from: path.join(__dirname, '../extensions'),
        to: 'extensions',
        filter: ['**/*'],
      },
      {
        from: path.join(__dirname, '../resources'),
        to: 'resources',
        filter: ['**/*'],
      },
    ],
    directories: {
      output: outputPath,
    },
    asar: true,
    asarUnpack: ['node_modules/@opensumi/vscode-ripgrep'],
    mac: {
      icon: 'build/icon/sumi.png',
      artifactName: '${productName}-${version}-${arch}.${ext}',
      target: 'dmg',
    },
    win: {
      artifactName: '${productName}-${version}.${ext}',
      icon: 'build/icon/sumi.ico',
      target: [
        {
          target: 'nsis',
          arch: ['x64'],
        },
      ],
    },
    linux: {
      artifactName: '${productName}-${version}.${ext}',
      icon: 'build/icon/sumi.png',
      target: [
        {
          target: 'deb',
          arch: ['x64'],
        },
      ],
    },
  },
});
